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

  const calculatedTotals =
    srcTotals.glassBefore8PercentTotal !== undefined || srcTotals.unitLabourSum !== undefined
      ? { ...srcTotals }
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
        })

  if (isSUSupply) {
    calculatedTotals.unitLabourSum = 0
    calculatedTotals.serviceLabourTotal = 0
    calculatedTotals.combinedLabourTotal = 0
    calculatedTotals.miscTotal = 0
    calculatedTotals.baseSetupFee = 0
    calculatedTotals.totalTravelAndSetup = 0
  }

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
    globalUpcharges: rawData.globalUpcharges || calculatedTotals.globalUpcharges || [],
  }
}
