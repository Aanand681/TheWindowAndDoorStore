import type { QuotePricingResult } from "./types"

export function computeQuotePricing(quote: any): QuotePricingResult | null {
  if (!quote) return null

  const isDoorQuote =
    quote.quoteType === "door" ||
    (Array.isArray(quote.windows) &&
      quote.windows.some((w: any) => Boolean(w.doorPresetId)))

  const isSealedUnitQuote =
    quote.quoteType === "sealed_unit" ||
    Boolean(quote.taxTotals?.isSealedUnitQuote)

  // 1. Door Quote Handling
  if (isDoorQuote) {
    let rawGrandTotal =
      Number(quote.taxTotals?.grandTotal) ||
      Number(quote.quoteSummaryTotal) ||
      0

    if (rawGrandTotal <= 0) {
      rawGrandTotal =
        Number(quote.initialSnapshot?.taxTotals?.grandTotal) ||
        Number(quote.initialSnapshot?.quoteSummaryTotal) ||
        0
    }

    if (
      rawGrandTotal <= 0 &&
      Array.isArray(quote.windows) &&
      quote.windows.length > 0
    ) {
      const lineSum = quote.windows.reduce(
        (sum: number, w: any) =>
          sum +
          (Number(w.lineTotal) ||
            Number(w.finalUnitPrice || w.inksterBasePrice || 0) *
              (w.quantity || 1)),
        0
      )
      if (lineSum > 0) {
        rawGrandTotal = Math.round(lineSum * 1.13 * 100) / 100
      }
    }

    const totalCents =
      rawGrandTotal > 0 && rawGrandTotal < 100000
        ? Math.round(rawGrandTotal * 100)
        : Math.round(rawGrandTotal)

    const rawSubtotal =
      Number(quote.taxTotals?.subtotalPreTax) ||
      Number(quote.taxTotals?.subtotal) ||
      0
    const subtotalCents = Math.round(rawSubtotal * 100)
    const hstCents = Math.max(0, totalCents - subtotalCents)
    const baseCents = Math.round(
      (Number(quote.taxTotals?.totalPrice) || 0) * 100
    )
    const labourCents = Math.round(
      (Number(quote.taxTotals?.combinedLabour) || 0) * 100
    )
    const miscCents = Math.round(
      (Number(quote.taxTotals?.miscTotal) || 0) * 100
    )
    const surchargeCents = Math.round(
      (Number(quote.taxTotals?.surchargeTotal) || 0) * 100
    )
    const discountCents = Math.round(
      ((Number(quote.taxTotals?.discountTotal) || 0) +
        (Number(quote.taxTotals?.loyaltyDiscount ?? quote.loyaltyDiscount) || 0)) *
        100
    )

    const firstPayment = Math.floor(totalCents / 2)
    const secondPayment = totalCents - firstPayment

    return {
      basePrice: baseCents,
      surcharge: surchargeCents,
      promoDiscount: discountCents,
      effectiveJC: 0,
      effectiveMisc: miscCents,
      effectiveLabour: labourCents,
      includeJCInPromo: false,
      includeMiscInPromo: false,
      includeLabourInPromo: false,
      beforeTaxDiscount: subtotalCents + discountCents,
      afterDiscount: subtotalCents,
      hstRate:
        quote.taxTotals?.hstRate !== undefined ? quote.taxTotals.hstRate : 13,
      hst: hstCents,
      total: totalCents,
      firstPayment,
      secondPayment,
    }
  }

  // 2. Sealed Unit Quote Handling
  if (isSealedUnitQuote) {
    let rawGrandTotal =
      Number(quote.taxTotals?.grandTotal) ||
      Number(quote.quoteSummaryTotal) ||
      0

    if (rawGrandTotal <= 0) {
      rawGrandTotal =
        Number(quote.initialSnapshot?.taxTotals?.grandTotal) ||
        Number(quote.initialSnapshot?.quoteSummaryTotal) ||
        0
    }

    if (
      rawGrandTotal <= 0 &&
      Array.isArray(quote.windows) &&
      quote.windows.length > 0
    ) {
      const lineSum = quote.windows.reduce(
        (sum: number, w: any) =>
          sum +
          (Number(w.lineTotal) ||
            Number(w.finalUnitPrice || 0) * (w.quantity || 1)),
        0
      )
      if (lineSum > 0) {
        rawGrandTotal = Math.round(lineSum * 1.13 * 100) / 100
      }
    }

    const totalCents =
      rawGrandTotal > 0 && rawGrandTotal < 100000
        ? Math.round(rawGrandTotal * 100)
        : Math.round(rawGrandTotal)

    const rawSubtotal =
      Number(quote.taxTotals?.subtotalPreTax) ||
      Number(quote.taxTotals?.subtotal) ||
      0
    const subtotalCents = Math.round(rawSubtotal * 100)
    const hstCents = Math.max(0, totalCents - subtotalCents)
    const glassCents = Math.round(
      (Number(quote.taxTotals?.glassSupplyTotal) || 0) * 100
    )
    const labourCents = Math.round(
      (Number(quote.taxTotals?.combinedLabourTotal) || 0) * 100
    )
    const miscCents = Math.round(
      (Number(quote.taxTotals?.miscTotal) || 0) * 100
    )
    const discountCents = Math.round(
      ((Number(quote.taxTotals?.discountTotal ?? quote.taxTotals?.discount) || 0) +
        (Number(quote.taxTotals?.loyaltyDiscount ?? quote.loyaltyDiscount) || 0)) *
        100
    )

    const firstPayment = Math.floor(totalCents / 2)
    const secondPayment = totalCents - firstPayment

    return {
      basePrice: glassCents,
      surcharge: 0,
      promoDiscount: discountCents,
      effectiveJC: 0,
      effectiveMisc: miscCents,
      effectiveLabour: labourCents,
      includeJCInPromo: false,
      includeMiscInPromo: false,
      includeLabourInPromo: false,
      beforeTaxDiscount: subtotalCents + discountCents,
      afterDiscount: subtotalCents,
      hstRate:
        quote.taxTotals?.hstRate !== undefined ? quote.taxTotals.hstRate : 13,
      hst: hstCents,
      total: totalCents,
      firstPayment,
      secondPayment,
    }
  }

  // 3. Window Quote Handling (Standard or Combined)
  const taxJC = quote.taxTotals
    ? Math.round(
        (quote.taxTotals.finalJC ?? quote.taxTotals.jcTotal ?? 0) * 100
      )
    : 0
  const taxMisc = quote.taxTotals
    ? Math.round(
        (quote.taxTotals.finalMisc ?? quote.taxTotals.miscTotal ?? 0) * 100
      )
    : 0
  const taxLabour = quote.taxTotals
    ? Math.round(
        (quote.taxTotals.finalLabour ?? quote.taxTotals.labourTotal ?? 0) * 100
      )
    : 0

  const effectiveJC =
    quote.customJC !== undefined && String(quote.customJC).trim() !== ""
      ? Math.round(Number(quote.customJC) * 100)
      : taxJC

  const effectiveMisc =
    quote.customMisc !== undefined && String(quote.customMisc).trim() !== ""
      ? Math.round(Number(quote.customMisc) * 100)
      : taxMisc

  const effectiveLabour =
    quote.customLabour !== undefined && String(quote.customLabour).trim() !== ""
      ? Math.round(Number(quote.customLabour) * 100)
      : taxLabour

  const includeJCInPromo = quote.includeJCInPromo !== false
  const includeMiscInPromo = quote.includeMiscInPromo !== false
  const includeLabourInPromo = quote.includeLabourInPromo !== false

  const customMaterialsList = Array.isArray(quote.taxTotals?.customMaterials)
    ? quote.taxTotals.customMaterials
    : Array.isArray(quote.customMaterials)
      ? quote.customMaterials
      : []
  const customMaterialsCents = Math.round(
    (quote.taxTotals?.customMaterialsTotal !== undefined
      ? Number(quote.taxTotals.customMaterialsTotal) || 0
      : customMaterialsList.reduce(
          (acc: number, m: any) => acc + (Number(m?.amount) || 0),
          0
        )) * 100
  )

  const basePrice = quote.quoteResult?.base || 0
  const surcharge = quote.quoteResult?.surcharge || 0
  const basePromoDiscount =
    quote.customDiscount !== undefined && String(quote.customDiscount).trim() !== ""
      ? Math.round((parseFloat(String(quote.customDiscount)) || 0) * 100)
      : quote.quoteResult?.promoDiscount || 0
  const loyaltyDiscount =
    quote.loyaltyDiscount !== undefined && String(quote.loyaltyDiscount).trim() !== ""
      ? Math.round((parseFloat(String(quote.loyaltyDiscount)) || 0) * 100)
      : 0
  const promoDiscount = basePromoDiscount + loyaltyDiscount

  const beforeTaxDiscount =
    basePrice +
    effectiveJC +
    effectiveMisc +
    effectiveLabour +
    surcharge +
    customMaterialsCents

  const afterDiscount = Math.max(0, beforeTaxDiscount - promoDiscount)
  const hstRate =
    quote.hstRate !== undefined
      ? quote.hstRate
      : quote.taxTotals?.hstRate !== undefined
        ? quote.taxTotals.hstRate
        : 13
  let hst = 0
  if (hstRate === 0) {
    hst = 0
  } else if (hstRate === 8) {
    const materialAfterDiscount = Math.max(
      0,
      basePrice - promoDiscount + effectiveJC + customMaterialsCents
    )
    const hstBase = Math.round(afterDiscount * 0.13)
    const materialExemption = Math.round(materialAfterDiscount * 0.08)
    hst = Math.max(0, hstBase - materialExemption)
  } else {
    hst = Math.round(afterDiscount * (hstRate / 100))
  }

  // Calculate window total in cents
  let calculatedTotal = afterDiscount + hst

  // Add attached Door Quote if present
  if (quote.attachedDoorQuote) {
    const doorGrandTotal =
      Number(quote.attachedDoorQuote.totals?.grandTotal) ||
      Number(quote.attachedDoorQuote.grandTotal) ||
      0
    if (doorGrandTotal > 0) {
      calculatedTotal += Math.round(doorGrandTotal * 100)
    }
  }

  // Add attached Sealed Unit Quote if present
  if (quote.attachedSealedUnit) {
    const suGrandTotal =
      Number(quote.attachedSealedUnit.totals?.grandTotal) ||
      Number(quote.attachedSealedUnit.grandTotal) ||
      0
    if (suGrandTotal > 0) {
      calculatedTotal += Math.round(suGrandTotal * 100)
    }
  }

  // Fallback if line items were empty or calculation is zero
  let total = calculatedTotal
  if (total === 0) {
    const rawTotal =
      Number(quote.taxTotals?.grandTotal) ||
      Number(quote.quoteSummaryTotal) ||
      0
    total =
      rawTotal > 0 && rawTotal < 100000
        ? Math.round(rawTotal * 100)
        : Math.round(rawTotal)
  }

  const firstPayment = Math.floor(total / 2)
  const secondPayment = total - firstPayment

  return {
    basePrice,
    surcharge,
    promoDiscount,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    beforeTaxDiscount,
    afterDiscount,
    hstRate,
    hst,
    total,
    firstPayment,
    secondPayment,
  }
}
