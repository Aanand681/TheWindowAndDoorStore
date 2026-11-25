import { QuoteDraftItem } from "@/lib/quote-drafts-storage"
import {
  formatDoorSummarySentence,
  calculateDoorQuoteTotals,
} from "@/lib/doors/calculations"
import {
  DEFAULT_DOOR_LOGISTICS,
  DEFAULT_DOOR_FORMULA,
} from "@/lib/doors/constants"

export function buildDoorAttachPayload(draft: QuoteDraftItem) {
  const rawData = (draft.data as any) || {}
  const lineItems =
    rawData.lineItems ||
    rawData.windows ||
    (draft as any).lineItems ||
    (draft as any).windows ||
    []
  const doorSentence = formatDoorSummarySentence(lineItems)
  let srcTotals =
    rawData.totals ||
    rawData.taxTotals ||
    (draft as any).taxTotals ||
    (draft as any).data?.totals ||
    (draft as any).data?.taxTotals ||
    {}

  // If door totals are missing, empty, or have 0 base price despite having line items:
  if (
    !srcTotals.rawDoorBaseTotal &&
    !srcTotals.totalPrice &&
    !srcTotals.subtotalPreTax &&
    lineItems.length > 0
  ) {
    const normalizedItems = lineItems.map((item: any) => {
      const q = Math.max(1, Number(item.quantity) || 1)
      const basePrice = Number(
        item.inksterBasePrice ??
          item.finalUnitPrice ??
          item.unitPrice ??
          item.basePrice ??
          (item.lineTotal ? item.lineTotal / q : 0)
      )
      const surcharge = Number(
        item.surchargeAmount ?? (basePrice > 0 ? basePrice * 0.08 : 0)
      )
      return {
        ...item,
        quantity: q,
        inksterBasePrice: basePrice,
        surchargeAmount: surcharge,
        discountAmount: Number(item.discountAmount ?? 0),
        category: item.category || "entry",
        lineHardwareTotal: Number(
          item.lineHardwareTotal ?? item.hardwarePrice ?? 0
        ),
        unitLabour: Number(item.unitLabour ?? 0),
        upchargesTotal: Number(item.upchargesTotal ?? 0),
        lineMiscTotal: Number(item.lineMiscTotal ?? item.unitMisc ?? 0),
      }
    })

    srcTotals = calculateDoorQuoteTotals({
      lineItems: normalizedItems,
      mode:
        rawData.mode ||
        (rawData.isSupplyOnly ? "supply_only" : "installation"),
      travelFeeType: "none", // Deduplicated: attached quotes never duplicate setup/travel fees
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "0",
      crewHours: "0",
      crewSize: "2",
      hstRate: rawData.hstRate !== undefined ? rawData.hstRate : (rawData.isFirstNation ? 8 : 13),
      logistics: DEFAULT_DOOR_LOGISTICS,
      formula: DEFAULT_DOOR_FORMULA,
    })
  }

  const isDoorSupply =
    rawData.mode === "supply_only" ||
    Boolean(rawData.isSupplyOnly) ||
    Boolean(srcTotals.isSupplyOnly)

  const rawDoorBase =
    srcTotals.rawDoorBaseTotal ??
    (srcTotals.totalPrice !== undefined
      ? srcTotals.totalPrice - (srcTotals.stormDoorTotal || 0)
      : undefined) ??
    srcTotals.materialsTotal ??
    draft.subtotal ??
    0
  const stormDoorTotal = srcTotals.stormDoorTotal ?? 0
  const hardwareTotal = srcTotals.hardwareTotal ?? 0
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
  const surchargeTotal =
    srcTotals.surchargeTotal ??
    srcTotals.surcharge ??
    Math.round((rawDoorBase + stormDoorTotal) * 0.08 * 100) / 100
  const discountTotal = srcTotals.discountTotal ?? srcTotals.discount ?? 0

  const doorTravel = isDoorSupply ? 0 : Number(srcTotals.totalTravelAndSetup || 0)

  // Deduplicate setup and travel: attached door labour is strictly unitLabour + upcharges (0 in supply mode)
  const rawPureLabour =
    srcTotals.doorPureLabourTotal !== undefined
      ? Number(srcTotals.doorPureLabourTotal)
      : srcTotals.unitLabourTotal !== undefined || srcTotals.upchargesTotal !== undefined
        ? Number(srcTotals.unitLabourTotal || 0) + Number(srcTotals.upchargesTotal || 0)
        : Math.max(
            0,
            Number(srcTotals.combinedLabourTotal ?? srcTotals.combinedLabour ?? 0) -
              Number(srcTotals.baseSetupFee || 0) -
              Number(srcTotals.totalTravelAndSetup || 0)
          )

  let pureLabourTotal = isDoorSupply ? 0 : rawPureLabour
  if (!isDoorSupply && rawData.customLabour !== undefined && String(rawData.customLabour).trim() !== "") {
    const rawVal = parseFloat(String(rawData.customLabour)) || 0
    pureLabourTotal = doorTravel > 0 && rawVal >= doorTravel ? Math.round((rawVal - doorTravel) * 100) / 100 : rawVal
  }
  const unitLabourTotal = isDoorSupply ? 0 : Number(srcTotals.unitLabourTotal || 0)
  const upchargesTotal = isDoorSupply ? 0 : Number(srcTotals.upchargesTotal || 0)
  const miscTotal = isDoorSupply ? 0 : Number(srcTotals.miscTotal ?? srcTotals.misc ?? 0)

  const subtotalPreTax = Math.round(
    ((rawDoorBase + stormDoorTotal + hardwareTotal + customMaterialsDollars) +
      surchargeTotal +
      pureLabourTotal +
      miscTotal -
      discountTotal) *
      100
  ) / 100

  const hstRate =
    rawData.hstRate !== undefined
      ? rawData.hstRate
      : srcTotals.hstRate !== undefined
        ? srcTotals.hstRate
        : rawData.isFirstNation
          ? 8
          : 13
  let tax = 0
  if (hstRate === 13) {
    tax = Math.round(subtotalPreTax * 0.13 * 100) / 100
  } else if (hstRate === 8) {
    const mats = Math.max(0, (rawDoorBase + stormDoorTotal + hardwareTotal + customMaterialsDollars) - discountTotal)
    const hBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    const ex = Math.round(mats * 0.08 * 100) / 100
    tax = Math.max(0, Math.round((hBase - ex) * 100) / 100)
  }
  const grandTotal = Math.round((subtotalPreTax + tax) * 100) / 100

  return {
    draftId: draft.id,
    rawDraft: draft,
    updatedAt: draft.updatedAt,
    quoteNumber: draft.quoteNumber,
    customerName: draft.customerName,
    itemCount: draft.itemCount,
    type: "door",
    lineItems,
    summaryLabel: doorSentence,
    summarySentence: doorSentence,
    discountLabel:
      rawData.discountLabel || (draft as any).discountLabel || "Door Discount",
    loyaltyDiscount: rawData.loyaltyDiscount || (draft as any).loyaltyDiscount || "",
    loyaltyDiscountLabel: rawData.loyaltyDiscountLabel || (draft as any).loyaltyDiscountLabel || "",
    customMaterials: customMaterialsList,
    totals: {
      grandTotal,
      subtotalPreTax,
      rawDoorBaseTotal: rawDoorBase,
      totalPrice: rawDoorBase + stormDoorTotal,
      stormDoorTotal,
      hardwareTotal,
      customMaterials: customMaterialsList,
      customMaterialsList,
      customMaterialsTotal: customMaterialsDollars,
      materialsTotal: rawDoorBase + stormDoorTotal + hardwareTotal + customMaterialsDollars,
      combinedLabourTotal: pureLabourTotal,
      doorPureLabourTotal: pureLabourTotal,
      miscTotal,
      surchargeTotal,
      discountTotal,
      loyaltyDiscount: Number(rawData.loyaltyDiscount || (draft as any).loyaltyDiscount || 0),
      loyaltyDiscountLabel: rawData.loyaltyDiscountLabel || (draft as any).loyaltyDiscountLabel || "",
      hstAmount: tax,
      depositAmount: Math.round(grandTotal * 0.5 * 100) / 100,
      unitLabourTotal,
      upchargesTotal,
      baseSetupFee: 0,
      totalTravelAndSetup: 0,
      travelAndSetupFee: doorTravel,
    },
    taxTotals: {
      ...srcTotals,
      subtotalPreTax,
      grandTotal,
      combinedLabourTotal: pureLabourTotal,
      baseSetupFee: 0,
      totalTravelAndSetup: 0,
      travelAndSetupFee: doorTravel,
    },
    isInstallation: !isDoorSupply,
    globalUpcharges: rawData.globalUpcharges || [],
    hstRate,
  }
}
