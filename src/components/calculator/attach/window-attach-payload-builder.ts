import { QuoteDraftItem } from "@/lib/quote-drafts-storage"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"

export function buildWindowAttachPayload(draft: QuoteDraftItem) {
  const rawData = (draft.data as any) || {}
  const windows = rawData.windows || (draft as any).windows || []
  const rawRate = Number(rawData.surchargeRate ?? 8)
  const decimalRate = rawRate > 1 ? rawRate / 100 : rawRate

  let baseDollars = Number(
    rawData.effectiveBase ??
      (rawData.quoteResult?.base
        ? rawData.quoteResult.base / 100
        : rawData.subtotal || draft.subtotal || 0)
  )
  if (baseDollars === 0 && windows.length > 0) {
    baseDollars = windows.reduce((acc: number, w: any) => {
      const q = Math.max(1, Number(w.qty || w.quantity) || 1)
      const itemBase =
        (parseFloat(String(w.base || 0)) || 0) +
        (parseFloat(String(w.argon || 0)) || 0) +
        (parseFloat(String(w.solar || 0)) || 0) +
        (parseFloat(String(w.triple || 0)) || 0)
      return acc + itemBase * q
    }, 0)
  }

  let surchargeDollars: number
  if (
    rawData.effectiveSurcharge !== undefined &&
    rawData.effectiveSurcharge !== null &&
    Number(rawData.effectiveSurcharge) <= baseDollars
  ) {
    surchargeDollars = Number(rawData.effectiveSurcharge)
  } else if (rawData.quoteResult?.surcharge && rawData.quoteResult.surcharge / 100 <= baseDollars) {
    surchargeDollars = rawData.quoteResult.surcharge / 100
  } else {
    surchargeDollars = Math.round(baseDollars * decimalRate * 100) / 100
  }

  const windowExtras = Number(rawData.taxTotals?.extras ?? rawData.taxTotals?.totalTravelAndSetup ?? 0)

  // Deduplicate setup/travel fees: pure window labour is labourWindows (or finalLabour minus extras)
  const pureWindowLabour = Number(
    rawData.taxTotals?.labourWindows ??
      (rawData.taxTotals?.finalLabour !== undefined
        ? Math.max(0, Number(rawData.taxTotals.finalLabour) - windowExtras)
        : undefined)
  )

  let labourDollars = 0
  if (rawData.customLabour !== undefined && String(rawData.customLabour).trim() !== "") {
    const rawVal = parseFloat(String(rawData.customLabour)) || 0
    labourDollars = windowExtras > 0 && rawVal >= windowExtras ? Math.round((rawVal - windowExtras) * 100) / 100 : rawVal
  } else if (pureWindowLabour !== undefined && !isNaN(pureWindowLabour)) {
    labourDollars = pureWindowLabour
  } else if (rawData.taxTotals?.finalLabour !== undefined) {
    labourDollars = Number(rawData.taxTotals.finalLabour) || 0
  } else if (rawData.taxTotals?.labourTotal !== undefined) {
    labourDollars = Number(rawData.taxTotals.labourTotal) || 0
  } else if (rawData.taxTotals?.standardLabourCents !== undefined) {
    labourDollars = Number(rawData.taxTotals.standardLabourCents) / 100
  } else if (rawData.effectiveLabour !== undefined) {
    const eff = Number(rawData.effectiveLabour)
    labourDollars = eff > 1000 ? eff / 100 : eff
  }

  let miscDollars = 0
  if (rawData.customMisc !== undefined && String(rawData.customMisc).trim() !== "") {
    miscDollars = parseFloat(String(rawData.customMisc)) || 0
  } else if (rawData.taxTotals?.finalMisc !== undefined) {
    miscDollars = Number(rawData.taxTotals.finalMisc) || 0
  } else if (rawData.taxTotals?.miscTotal !== undefined) {
    miscDollars = Number(rawData.taxTotals.miscTotal) || 0
  } else if (rawData.taxTotals?.miscLabourCents !== undefined) {
    miscDollars = Number(rawData.taxTotals.miscLabourCents) / 100
  } else if (rawData.effectiveMisc !== undefined) {
    const eff = Number(rawData.effectiveMisc)
    miscDollars = eff > 1000 ? eff / 100 : eff
  }

  let jcDollars = 0
  if (rawData.customJC !== undefined && String(rawData.customJC).trim() !== "") {
    jcDollars = parseFloat(String(rawData.customJC)) || 0
  } else if (rawData.taxTotals?.finalJC !== undefined && Number(rawData.taxTotals.finalJC) > 0) {
    jcDollars = Number(rawData.taxTotals.finalJC) || 0
  } else if (rawData.taxTotals?.jcTotal !== undefined && Number(rawData.taxTotals.jcTotal) > 0) {
    jcDollars = Number(rawData.taxTotals.jcTotal) || 0
  } else if (rawData.taxTotals?.jcLabourCents !== undefined && Number(rawData.taxTotals.jcLabourCents) > 0) {
    jcDollars = Number(rawData.taxTotals.jcLabourCents) / 100
  } else if (rawData.effectiveJC !== undefined && Number(rawData.effectiveJC) > 0) {
    const eff = Number(rawData.effectiveJC)
    jcDollars = eff > 1000 ? eff / 100 : eff
  } else {
    const jRate = Number(rawData.supplyJambRate || rawData.taxTotals?.selectedJamb?.total || rawData.taxTotals?.selectedJamb?.rate || 0)
    const cRate = Number(rawData.supplyCasingRate || rawData.taxTotals?.selectedCasing?.total || rawData.taxTotals?.selectedCasing?.rate || 0)
    jcDollars = jRate + cRate
  }

  const customMaterialsList = Array.isArray(rawData.taxTotals?.customMaterials)
    ? rawData.taxTotals.customMaterials
    : Array.isArray(rawData.customMaterials)
      ? rawData.customMaterials
      : []
  const customMaterialsDollars = customMaterialsList.reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0)

  const customDiscountDollars =
    rawData.customDiscount !== undefined && String(rawData.customDiscount).trim() !== ""
      ? parseFloat(String(rawData.customDiscount)) || 0
      : (draft as any).customDiscount !== undefined && String((draft as any).customDiscount).trim() !== ""
        ? parseFloat(String((draft as any).customDiscount)) || 0
        : 0

  const promoDiscountDollars =
    (rawData.quoteResult?.promoDiscount ? rawData.quoteResult.promoDiscount / 100 : 0) ||
    rawData.promoDiscount ||
    0

  const resolvedWindowDiscount = customDiscountDollars > 0 ? customDiscountDollars : promoDiscountDollars
  const promoName = rawData.taxTotals?.discountLabel || rawData.discountLabel || rawData.quoteResult?.discountLabel || rawData.quoteResult?.promoName || rawData.activePromoName || ""
  const hasJamb = Boolean(rawData.taxTotals?.selectedJamb && (Number(rawData.taxTotals.selectedJamb.total) > 0 || Number(rawData.taxTotals.selectedJamb.rate) > 0))
  const hasCasing = Boolean(rawData.taxTotals?.selectedCasing && (Number(rawData.taxTotals.selectedCasing.total) > 0 || Number(rawData.taxTotals.selectedCasing.rate) > 0))
  const jcLabel = hasJamb && hasCasing ? "Jambs & Casing" : hasJamb ? "Jambs Only" : hasCasing ? "Casing Only" : "Jambs & Casing"
  const windowSentence = formatWindowSummarySentence(windows)
  const finalSentence = windowSentence !== "0 Windows" ? windowSentence : draft.summaryLabel || "Windows & Glazing"

  return {
    draftId: draft.id,
    rawDraft: draft,
    updatedAt: draft.updatedAt,
    quoteNumber: draft.quoteNumber,
    customerName: draft.customerName,
    itemCount: draft.itemCount,
    type: "window",
    windows,
    summaryLabel: finalSentence,
    summarySentence: finalSentence,
    jcLabel: jcDollars > 0 ? jcLabel : "",
    promoName: resolvedWindowDiscount > 0 ? promoName || "Window Discount" : "",
    discountLabel: promoName || "Window Discount",
    customDiscount: customDiscountDollars > 0 ? String(customDiscountDollars) : "",
    loyaltyDiscount: rawData.loyaltyDiscount || (draft as any).loyaltyDiscount || "",
    loyaltyDiscountLabel: rawData.loyaltyDiscountLabel || (draft as any).loyaltyDiscountLabel || "",
    totals: {
      subtotal: draft.subtotal,
      grandTotal: draft.grandTotal,
      base: baseDollars,
      surcharge: surchargeDollars,
      labour: labourDollars,
      travelAndSetupFee: windowExtras,
      fullLabour: Number(rawData.taxTotals?.finalLabour || labourDollars),
      misc: miscDollars,
      jc: jcDollars,
      customMaterials: customMaterialsDollars,
      customMaterialsList,
      discount: resolvedWindowDiscount,
      promoDiscount: resolvedWindowDiscount,
      loyaltyDiscount: Number(rawData.loyaltyDiscount || (draft as any).loyaltyDiscount || 0),
    },
    taxTotals: rawData.taxTotals,
    quoteResult: rawData.quoteResult,
    surchargeRate: decimalRate,
    hstRate: rawData.hstRate ?? 13,
    isSupplyOnly: Boolean(rawData.isSupplyOnly),
  }
}
