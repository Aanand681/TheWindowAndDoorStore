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
      travelFeeType: rawData.travelFeeType || "none",
      customTravelFee: rawData.customTravelFee || "0",
      showOutTownTravel: Boolean(rawData.showOutTownTravel),
      travelKm: rawData.travelKm || "0",
      crewHours: rawData.crewHours || "0",
      crewSize: rawData.crewSize || "2",
      hstRate: rawData.isFirstNation ? 8 : (rawData.hstRate ?? 13),
      logistics: DEFAULT_DOOR_LOGISTICS,
      formula: DEFAULT_DOOR_FORMULA,
    })
  }

  const rawDoorBase =
    srcTotals.rawDoorBaseTotal ??
    srcTotals.totalPrice ??
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
  const combinedLabourTotal =
    srcTotals.combinedLabourTotal ??
    srcTotals.combinedLabour ??
    (srcTotals.unitLabourTotal || 0) + (srcTotals.upchargesTotal || 0)
  const miscTotal = srcTotals.miscTotal ?? srcTotals.misc ?? 0
  const subtotalPreTax =
    srcTotals.subtotalPreTax ??
    srcTotals.subtotal ??
    rawDoorBase +
      stormDoorTotal +
      hardwareTotal +
      surchargeTotal +
      combinedLabourTotal +
      miscTotal -
      discountTotal
  const grandTotal = srcTotals.grandTotal ?? draft.grandTotal ?? subtotalPreTax

  return {
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
      combinedLabourTotal,
      miscTotal,
      surchargeTotal,
      discountTotal,
      hstAmount:
        srcTotals.hstAmount ?? Math.max(0, grandTotal - subtotalPreTax),
      depositAmount:
        srcTotals.depositAmount ?? Math.round(grandTotal * 0.5 * 100) / 100,
      unitLabourTotal: srcTotals.unitLabourTotal,
      upchargesTotal: srcTotals.upchargesTotal,
    },
    taxTotals: srcTotals,
    isInstallation:
      rawData.mode === "installation" || rawData.isInstallation === true,
    globalUpcharges: rawData.globalUpcharges || [],
    hstRate: rawData.isFirstNation ? 8 : (srcTotals.hstRate ?? 13),
  }
}

export function buildSealedUnitAttachPayload(draft: QuoteDraftItem) {
  const rawData = (draft.data as any) || {}
  const lineItems = rawData.lineItems || (draft as any).lineItems || []
  const calculatedTotals =
    rawData.totals ||
    calculateSealedUnitTotals({
      lineItems,
      isInstallation: Boolean(rawData.isInstallation),
      travelFeeType: rawData.travelFeeType || "none",
      customTravelFee: rawData.customTravelFee,
      showOutTownTravel: Boolean(rawData.showOutTownTravel),
      travelKm: rawData.travelKm,
      crewHours: rawData.crewHours,
      crewSize: rawData.crewSize || "2",
      hstRate: rawData.hstRate ?? 13,
    })

  const isService = rawData.sealedUnitMode === "service_only"
  const summarySentence = isService
    ? getSealedUnitServiceSummaryLabel(lineItems, calculatedTotals.totalSqft)
    : formatSealedUnitSummarySentence(lineItems)

  return {
    quoteNumber: draft.quoteNumber,
    customerName: draft.customerName,
    itemCount: draft.itemCount,
    type: "sealed_unit",
    lineItems,
    summaryLabel: summarySentence,
    summarySentence,
    totals: calculatedTotals,
    isInstallation: Boolean(rawData.isInstallation),
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
  if (
    rawData.effectiveSurcharge !== undefined &&
    rawData.effectiveSurcharge !== null &&
    Number(rawData.effectiveSurcharge) <= baseDollars
  ) {
    surchargeDollars = Number(rawData.effectiveSurcharge)
  } else if (
    rawData.quoteResult?.surcharge &&
    rawData.quoteResult.surcharge / 100 <= baseDollars
  ) {
    surchargeDollars = rawData.quoteResult.surcharge / 100
  } else {
    surchargeDollars = Math.round(baseDollars * decimalRate * 100) / 100
  }

  const labourDollars =
    rawData.effectiveLabour ??
    (rawData.customLabour !== undefined
      ? rawData.customLabour
      : Number(
          rawData.taxTotals?.finalLabour ?? rawData.taxTotals?.labourTotal ?? 0
        ))
  const miscDollars =
    rawData.effectiveMisc ??
    (rawData.customMisc !== undefined
      ? rawData.customMisc
      : Number(
          rawData.taxTotals?.finalMisc ?? rawData.taxTotals?.miscTotal ?? 0
        ))
  const jcDollars =
    rawData.effectiveJC ??
    (rawData.customJC !== undefined
      ? rawData.customJC
      : Number(rawData.taxTotals?.finalJC ?? rawData.taxTotals?.jcTotal ?? 0))
  const promoDiscountDollars =
    (rawData.quoteResult?.promoDiscount
      ? rawData.quoteResult.promoDiscount / 100
      : 0) ||
    rawData.promoDiscount ||
    0
  const promoName =
    rawData.quoteResult?.promoName || rawData.activePromoName || ""
  const hasJamb = Boolean(
    rawData.taxTotals?.selectedJamb &&
      (Number(rawData.taxTotals.selectedJamb.total) > 0 ||
        Number(rawData.taxTotals.selectedJamb.rate) > 0)
  )
  const hasCasing = Boolean(
    rawData.taxTotals?.selectedCasing &&
      (Number(rawData.taxTotals.selectedCasing.total) > 0 ||
        Number(rawData.taxTotals.selectedCasing.rate) > 0)
  )
  const jcLabel =
    hasJamb && hasCasing
      ? "Jambs & Casing"
      : hasJamb
        ? "Jambs Only"
        : hasCasing
          ? "Casing Only"
          : "Jambs & Casing"

  const windowSentence = formatWindowSummarySentence(rawData.windows || [])
  const finalSentence =
    windowSentence !== "0 Windows"
      ? windowSentence
      : draft.summaryLabel || "Windows & Glazing"

  return {
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
