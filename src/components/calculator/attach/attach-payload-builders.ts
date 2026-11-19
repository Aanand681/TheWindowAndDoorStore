import { QuoteDraftItem } from "@/lib/quote-drafts-storage"
import {
  calculateSealedUnitTotals,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"
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
  const lineItems = rawData.lineItems || (draft as any).windows || []
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
      hstRate: rawData.isFirstNation ? 8 : (rawData.hstRate ?? 13),
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
  const surchargeTotal =
    srcTotals.surchargeTotal ??
    srcTotals.surcharge ??
    Math.round((rawDoorBase + stormDoorTotal) * 0.08 * 100) / 100
  const discountTotal = srcTotals.discountTotal ?? srcTotals.discount ?? 0

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
  const pureLabourTotal = isDoorSupply ? 0 : rawPureLabour
  const unitLabourTotal = isDoorSupply ? 0 : Number(srcTotals.unitLabourTotal || 0)
  const upchargesTotal = isDoorSupply ? 0 : Number(srcTotals.upchargesTotal || 0)
  const miscTotal = isDoorSupply ? 0 : Number(srcTotals.miscTotal ?? srcTotals.misc ?? 0)

  const subtotalPreTax = Math.round(
    ((rawDoorBase + stormDoorTotal + hardwareTotal) +
      surchargeTotal +
      pureLabourTotal +
      miscTotal -
      discountTotal) *
      100
  ) / 100

  const hstRate = rawData.isFirstNation ? 8 : (srcTotals.hstRate ?? 13)
  let tax = 0
  if (hstRate === 13) {
    tax = Math.round(subtotalPreTax * 0.13 * 100) / 100
  } else if (hstRate === 8) {
    const mats = Math.max(0, (rawDoorBase + stormDoorTotal + hardwareTotal) - discountTotal)
    const hBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    const ex = Math.round(mats * 0.08 * 100) / 100
    tax = Math.max(0, Math.round((hBase - ex) * 100) / 100)
  }
  const grandTotal = Math.round((subtotalPreTax + tax) * 100) / 100

  return {
    draftId: draft.id,
    rawDraft: draft,
    quoteNumber: draft.quoteNumber,
    customerName: draft.customerName,
    itemCount: draft.itemCount,
    type: "door",
    lineItems,
    summaryLabel: doorSentence,
    summarySentence: doorSentence,
    discountLabel:
      rawData.discountLabel || (draft as any).discountLabel || "Door Discount",
    totals: {
      grandTotal,
      subtotalPreTax,
      rawDoorBaseTotal: rawDoorBase,
      totalPrice: rawDoorBase + stormDoorTotal,
      stormDoorTotal,
      hardwareTotal,
      materialsTotal: rawDoorBase + stormDoorTotal + hardwareTotal,
      combinedLabourTotal: pureLabourTotal,
      doorPureLabourTotal: pureLabourTotal,
      miscTotal,
      surchargeTotal,
      discountTotal,
      hstAmount: tax,
      depositAmount: Math.round(grandTotal * 0.5 * 100) / 100,
      unitLabourTotal,
      upchargesTotal,
      baseSetupFee: 0,
      totalTravelAndSetup: 0,
    },
    taxTotals: {
      ...srcTotals,
      subtotalPreTax,
      grandTotal,
      combinedLabourTotal: pureLabourTotal,
      baseSetupFee: 0,
      totalTravelAndSetup: 0,
    },
    isInstallation: !isDoorSupply,
    globalUpcharges: rawData.globalUpcharges || [],
    hstRate,
  }
}

export function buildSealedUnitAttachPayload(draft: QuoteDraftItem) {
  const rawData = (draft.data as any) || {}
  const lineItems = rawData.lineItems || (draft as any).lineItems || []
  const isSUSupply = Boolean(rawData.isSupplyOnly || rawData.mode === "supply_only")
  const calculatedTotals =
    rawData.totals ||
    calculateSealedUnitTotals({
      lineItems,
      isInstallation: !isSUSupply && Boolean(rawData.isInstallation),
      travelFeeType: "none", // Deduplicated: attached quotes never duplicate setup/travel fees
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "",
      crewHours: "",
      crewSize: "2",
      hstRate: rawData.hstRate ?? 13,
    })

  if (isSUSupply) {
    calculatedTotals.unitLabourSum = 0
    calculatedTotals.serviceLabourTotal = 0
    calculatedTotals.combinedLabourTotal = 0
    calculatedTotals.miscTotal = 0
    calculatedTotals.baseSetupFee = 0
    calculatedTotals.totalTravelAndSetup = 0
  }

  const isService = rawData.sealedUnitMode === "service_only"
  const summarySentence = isService
    ? getSealedUnitServiceSummaryLabel(lineItems, calculatedTotals.totalSqft)
    : formatSealedUnitSummarySentence(lineItems)

  return {
    draftId: draft.id,
    rawDraft: draft,
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
  }
}

export function buildWindowAttachPayload(draft: QuoteDraftItem) {
  const rawData = (draft.data as any) || {}
  const rawRate = Number(rawData.surchargeRate ?? 8)
  const decimalRate = rawRate > 1 ? rawRate / 100 : rawRate
  const baseDollars = Number(
    rawData.effectiveBase ??
      (rawData.quoteResult?.base
        ? rawData.quoteResult.base / 100
        : rawData.subtotal || draft.subtotal || 0)
  )

  let surchargeDollars: number
  if (rawData.effectiveSurcharge !== undefined && rawData.effectiveSurcharge !== null && Number(rawData.effectiveSurcharge) <= baseDollars) {
    surchargeDollars = Number(rawData.effectiveSurcharge)
  } else if (rawData.quoteResult?.surcharge && rawData.quoteResult.surcharge / 100 <= baseDollars) {
    surchargeDollars = rawData.quoteResult.surcharge / 100
  } else {
    surchargeDollars = Math.round(baseDollars * decimalRate * 100) / 100
  }

  const labourDollars = rawData.effectiveLabour ?? (rawData.customLabour !== undefined ? rawData.customLabour : Number(rawData.taxTotals?.finalLabour ?? rawData.taxTotals?.labourTotal ?? 0))
  const miscDollars = rawData.effectiveMisc ?? (rawData.customMisc !== undefined ? rawData.customMisc : Number(rawData.taxTotals?.finalMisc ?? rawData.taxTotals?.miscTotal ?? 0))
  const jcDollars = rawData.effectiveJC ?? (rawData.customJC !== undefined ? rawData.customJC : Number(rawData.taxTotals?.finalJC ?? rawData.taxTotals?.jcTotal ?? 0))
  const promoDiscountDollars = (rawData.quoteResult?.promoDiscount ? rawData.quoteResult.promoDiscount / 100 : 0) || rawData.promoDiscount || 0
  const promoName = rawData.quoteResult?.promoName || rawData.activePromoName || ""
  const hasJamb = Boolean(rawData.taxTotals?.selectedJamb && (Number(rawData.taxTotals.selectedJamb.total) > 0 || Number(rawData.taxTotals.selectedJamb.rate) > 0))
  const hasCasing = Boolean(rawData.taxTotals?.selectedCasing && (Number(rawData.taxTotals.selectedCasing.total) > 0 || Number(rawData.taxTotals.selectedCasing.rate) > 0))
  const jcLabel = hasJamb && hasCasing ? "Jambs & Casing" : hasJamb ? "Jambs Only" : hasCasing ? "Casing Only" : "Jambs & Casing"
  const windowSentence = formatWindowSummarySentence(rawData.windows || [])
  const finalSentence = windowSentence !== "0 Windows" ? windowSentence : draft.summaryLabel || "Windows & Glazing"

  return {
    draftId: draft.id,
    rawDraft: draft,
    quoteNumber: draft.quoteNumber,
    customerName: draft.customerName,
    itemCount: draft.itemCount,
    type: "window",
    windows: rawData.windows || [],
    summaryLabel: finalSentence,
    summarySentence: finalSentence,
    jcLabel: jcDollars > 0 ? jcLabel : "",
    promoName: promoDiscountDollars > 0 ? promoName : "",
    totals: {
      subtotal: draft.subtotal,
      grandTotal: draft.grandTotal,
      base: baseDollars,
      surcharge: surchargeDollars,
      labour: labourDollars,
      misc: miscDollars,
      jc: jcDollars,
      promoDiscount: promoDiscountDollars,
    },
    taxTotals: rawData.taxTotals,
    quoteResult: rawData.quoteResult,
    surchargeRate: decimalRate,
    hstRate: rawData.hstRate ?? 13,
    isSupplyOnly: Boolean(rawData.isSupplyOnly),
  }
}
