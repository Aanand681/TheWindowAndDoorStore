import { QuoteDraftItem } from "@/lib/quote-drafts-storage"
import {
  calculateSealedUnitTotals,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"

export function buildSealedUnitAttachPayload(draft: QuoteDraftItem) {
  const rawData = (draft.data as any) || {}
  const lineItems =
    rawData.lineItems ||
    rawData.windows ||
    (draft as any).lineItems ||
    (draft as any).windows ||
    []
  const isSUSupply = Boolean(rawData.isSupplyOnly || rawData.mode === "supply_only")
  const srcTotals =
    rawData.totals ||
    rawData.taxTotals ||
    (draft as any).taxTotals ||
    (draft as any).totals ||
    {}

  const customMaterialsList = Array.isArray(rawData.customMaterials)
    ? rawData.customMaterials
    : Array.isArray(srcTotals.customMaterialsList)
      ? srcTotals.customMaterialsList
      : Array.isArray(srcTotals.customMaterials)
        ? srcTotals.customMaterials
        : []
  const customMaterialsDollars = Math.round(
    customMaterialsList.reduce((acc: number, m: any) => acc + (Number(m?.amount) || 0), 0) * 100
  ) / 100
  const loyaltyDiscountNum = Math.max(
    0,
    parseFloat(String(srcTotals.loyaltyDiscount ?? rawData.loyaltyDiscount ?? 0)) || 0
  )
  const loyaltyDiscountLabel = String(
    srcTotals.loyaltyDiscountLabel ?? rawData.loyaltyDiscountLabel ?? ""
  )

  const calculatedTotals =
    srcTotals.glassBefore8PercentTotal !== undefined || srcTotals.unitLabourSum !== undefined
      ? {
          ...srcTotals,
          customMaterials: srcTotals.customMaterials ?? customMaterialsList,
          customMaterialsList,
          customMaterialsTotal: srcTotals.customMaterialsTotal ?? customMaterialsDollars,
          loyaltyDiscount: loyaltyDiscountNum,
          loyaltyDiscountLabel,
        }
      : calculateSealedUnitTotals({
          lineItems,
          isInstallation: !isSUSupply && Boolean(rawData.isInstallation),
          travelFeeType: "none", // Deduplicated: attached quotes never duplicate setup/travel fees
          customTravelFee: "0",
          showOutTownTravel: false,
          travelKm: "",
          crewHours: "",
          crewSize: "2",
          hstRate: rawData.hstRate ?? 13,
          globalUpcharges: rawData.globalUpcharges || [],
          customMaterials: customMaterialsList,
          loyaltyDiscount: loyaltyDiscountNum,
          loyaltyDiscountLabel,
        })

  const preservedFullUnitLabour = Number(
    srcTotals.fullUnitLabourSum ?? srcTotals.unitLabourSum ?? calculatedTotals.unitLabourSum ?? 0
  )
  const preservedFullTravel = Number(
    srcTotals.fullTravelAndSetup ?? srcTotals.totalTravelAndSetup ?? calculatedTotals.fullTravelAndSetup ?? 0
  )
  const preservedFullInstallLabour = Number(
    srcTotals.fullInstallLabour ?? calculatedTotals.fullInstallLabour ?? (preservedFullUnitLabour + preservedFullTravel)
  )
  const preservedFullInstallMisc = Number(
    srcTotals.fullInstallMisc ?? srcTotals.miscTotal ?? calculatedTotals.fullInstallMisc ?? 0
  )

  if (isSUSupply) {
    calculatedTotals.unitLabourSum = 0
    calculatedTotals.serviceLabourTotal = 0
    calculatedTotals.combinedLabourTotal = 0
    calculatedTotals.miscTotal = 0
    calculatedTotals.baseSetupFee = 0
    calculatedTotals.totalTravelAndSetup = 0
  }
  calculatedTotals.fullUnitLabourSum = preservedFullUnitLabour
  calculatedTotals.fullTravelAndSetup = preservedFullTravel
  calculatedTotals.fullInstallLabour = preservedFullInstallLabour
  calculatedTotals.fullInstallMisc = preservedFullInstallMisc

  const suExtraLabour = Number(
    calculatedTotals.extraLabour ??
      (Array.isArray(rawData.globalUpcharges)
        ? rawData.globalUpcharges.reduce(
            (acc: number, u: any) =>
              acc + (parseFloat(String(u.price || u.rate || u.total || 0)) || 0),
            0
          )
        : 0)
  )
  calculatedTotals.extraLabour = suExtraLabour

  const isService = rawData.sealedUnitMode === "service_only"
  const summarySentence = isService
    ? getSealedUnitServiceSummaryLabel(lineItems, calculatedTotals.totalSqft)
    : formatSealedUnitSummarySentence(lineItems)

  const pureUnitLabour = Number(
    isService
      ? calculatedTotals.serviceLabourTotal || 0
      : calculatedTotals.unitLabourSum || 0
  )
  const suTravel = isSUSupply ? 0 : Number(srcTotals.totalTravelAndSetup || calculatedTotals.totalTravelAndSetup || 0)
  calculatedTotals.travelAndSetupFee = suTravel
  calculatedTotals.travelBaseSetupFee = isSUSupply ? 0 : Number(srcTotals.baseSetupFee ?? calculatedTotals.baseSetupFee ?? (suTravel > 0 ? 140 : 0))
  calculatedTotals.travelAdditionalFarFee = isSUSupply ? 0 : Number(srcTotals.additionalFarFee ?? calculatedTotals.additionalFarFee ?? 0)
  calculatedTotals.travelVehicleFee = isSUSupply ? 0 : Number(srcTotals.vehicleTravelFee ?? calculatedTotals.vehicleTravelFee ?? 0)
  calculatedTotals.travelCrewFee = isSUSupply ? 0 : Number(srcTotals.crewTravelFee ?? calculatedTotals.crewTravelFee ?? 0)

  let pureLabourTotal = isSUSupply ? 0 : pureUnitLabour + suExtraLabour
  if (!isSUSupply && rawData.customLabour !== undefined && String(rawData.customLabour).trim() !== "") {
    const rawVal = parseFloat(String(rawData.customLabour)) || 0
    pureLabourTotal = suTravel > 0 && rawVal >= suTravel ? Math.round((rawVal - suTravel) * 100) / 100 : rawVal
  }
  calculatedTotals.pureLabourTotal = pureLabourTotal

  return {
    draftId: draft.id,
    rawDraft: draft,
    updatedAt: draft.updatedAt,
    quoteNumber: draft.quoteNumber,
    customerName: draft.customerName,
    itemCount: draft.itemCount,
    type: "sealed_unit",
    lineItems,
    summaryLabel: summarySentence,
    summarySentence,
    totals: calculatedTotals,
    isInstallation: !isSUSupply && Boolean(rawData.isInstallation),
    sealedUnitMode: rawData.sealedUnitMode,
    hstRate: rawData.hstRate ?? 13,
    loyaltyDiscount: loyaltyDiscountNum,
    loyaltyDiscountLabel,
    globalUpcharges: rawData.globalUpcharges || calculatedTotals.globalUpcharges || [],
  }
}
