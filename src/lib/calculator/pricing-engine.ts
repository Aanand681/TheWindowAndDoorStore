/**
 * Pure Calculation Engine for Quotes, Drafts, and Attached Quotations.
 * Single source of truth across PromoCalculator, AutoSave, Drafts, and Review Workflows.
 * 100% Stateless & Pure — Safe to unit test and verify.
 */

export interface CombinedPricingParams {
  quoteResult?: {
    base?: number;
    surcharge?: number;
    promoDiscount?: number;
  } | null;
  afterDiscount?: number; // cents
  total?: number; // cents
  attachedSealedUnit?: any | null;
  attachedDoorQuote?: any | null;
  effectiveJC?: number; // cents
  effectiveMisc?: number; // cents
  effectiveLabour?: number; // cents
  hstRate?: number; // 13 or 8 (First Nation exempt) or 0
}

export interface CombinedPricingResult {
  // Dollar amounts (used for auto-save and draft records)
  subtotalDollars: number;
  grandTotalDollars: number;

  // Cents amounts (exact financial accounting)
  combinedSubtotalCents: number;
  combinedTaxCents: number;
  combinedTotalCents: number;

  // Breakdown components (cents)
  windowBaseCents: number;
  windowSurchargeCents: number;
  windowDiscountCents: number;

  suGlassCents: number;
  suSurchargeCents: number;
  suLabourCents: number;
  suMiscCents: number;

  doorMaterialsCents: number;
  doorSurchargeCents: number;
  doorLabourCents: number;
  doorMiscCents: number;

  combinedMiscCents: number;
  combinedLabourCents: number;
  combinedSurchargeCents: number;
}

/**
 * Computes exact unified financials across windows, attached sealed units, and attached doors.
 * Correctly accounts for:
 * - Pure glass base vs 8% handling surcharge
 * - Door hardware, storm doors, and 10% non-storm door discounts
 * - Deduplication of site travel / setup fees
 * - First Nation 8% Point-of-Sale Exemption (5% GST on materials, 13% on labour)
 */
export function computeCombinedQuoteFinancials(params: CombinedPricingParams): CombinedPricingResult {
  const {
    quoteResult,
    afterDiscount = 0,
    total = 0,
    attachedSealedUnit,
    attachedDoorQuote,
    effectiveJC = 0,
    effectiveMisc = 0,
    effectiveLabour = 0,
    hstRate = 13,
  } = params;

  let autoSubtotalDollars = Math.round(afterDiscount || 0) / 100;
  let autoGrandTotalDollars = Math.round(total || 0) / 100;

  const hasAttachedSU = Boolean(attachedSealedUnit && (quoteResult || attachedSealedUnit.totals));
  const hasAttachedDoor = Boolean(attachedDoorQuote);

  let suGlassCents = 0;
  let suSurchargeCents = 0;
  let suLabourCents = 0;
  let suMiscCents = 0;

  if (hasAttachedSU) {
    const suTotals = attachedSealedUnit?.totals || {};
    const isAttachedSUService =
      attachedSealedUnit?.sealedUnitMode === 'service_only' ||
      attachedSealedUnit?.data?.sealedUnitMode === 'service_only' ||
      Boolean(suTotals.isServiceOnly);
    suGlassCents = !isAttachedSUService ? Math.round((suTotals.glassBefore8PercentTotal || 0) * 100) : 0;
    suSurchargeCents = !isAttachedSUService ? Math.round((suTotals.glass8PercentSurchargeTotal || 0) * 100) : 0;
    suLabourCents = Math.round(
      (suTotals.serviceLabourTotal ?? suTotals.unitLabourSum ?? suTotals.combinedLabourTotal ?? 0) * 100
    );
    suMiscCents = Math.round((suTotals.miscTotal || 0) * 100);
  }

  let doorMaterialsCents = 0;
  let doorSurchargeCents = 0;
  let doorLabourCents = 0;
  let doorMiscCents = 0;

  if (hasAttachedDoor) {
    const doorTotals = attachedDoorQuote?.totals || {};
    const doorRawBaseCents = Math.round(
      ((doorTotals.rawDoorBaseTotal || 0) + (doorTotals.stormDoorTotal || 0) + (doorTotals.hardwareTotal || 0)) * 100
    );
    const doorDiscountCents = Math.round((doorTotals.discountTotal || 0) * 100);
    doorMaterialsCents = Math.max(0, doorRawBaseCents - doorDiscountCents);
    doorSurchargeCents = Math.round((doorTotals.surchargeTotal || 0) * 100);
    const hasExplicitUnitLabour =
      doorTotals.unitLabourTotal !== undefined || doorTotals.upchargesTotal !== undefined;
    doorLabourCents = Math.round(
      (hasExplicitUnitLabour
        ? (doorTotals.unitLabourTotal || 0) + (doorTotals.upchargesTotal || 0)
        : doorTotals.combinedLabourTotal || 0) * 100
    );
    doorMiscCents = Math.round((doorTotals.miscTotal || 0) * 100);
  }

  const windowBaseCents = quoteResult?.base || 0;
  const windowSurchargeCents = quoteResult?.surcharge || 0;
  const windowDiscountCents = quoteResult?.promoDiscount || 0;

  const combinedMiscCents = effectiveMisc + suMiscCents + doorMiscCents;
  const combinedLabourCents = effectiveLabour + suLabourCents + doorLabourCents;
  const combinedSurchargeCents = windowSurchargeCents + suSurchargeCents + doorSurchargeCents;

  if (hasAttachedSU || hasAttachedDoor) {
    const combinedSubtotalCents =
      (windowBaseCents - windowDiscountCents) +
      suGlassCents +
      doorMaterialsCents +
      effectiveJC +
      combinedMiscCents +
      combinedLabourCents +
      combinedSurchargeCents;

    let combinedTaxCents = 0;
    if (hstRate === 13) {
      combinedTaxCents = Math.round(combinedSubtotalCents * 0.13);
    } else if (hstRate === 8) {
      const materialsCents = Math.max(
        0,
        (windowBaseCents - windowDiscountCents) +
          windowSurchargeCents +
          effectiveJC +
          suGlassCents +
          suSurchargeCents +
          doorMaterialsCents +
          doorSurchargeCents
      );
      const servicesCents = Math.max(0, combinedLabourCents + combinedMiscCents);
      combinedTaxCents = Math.round(materialsCents * 0.05 + servicesCents * 0.13);
    } else {
      combinedTaxCents = 0;
    }

    const combinedTotalCents = combinedSubtotalCents + combinedTaxCents;
    autoSubtotalDollars = Math.round(combinedSubtotalCents) / 100;
    autoGrandTotalDollars = Math.round(combinedTotalCents) / 100;

    return {
      subtotalDollars: autoSubtotalDollars,
      grandTotalDollars: autoGrandTotalDollars,
      combinedSubtotalCents,
      combinedTaxCents,
      combinedTotalCents,
      windowBaseCents,
      windowSurchargeCents,
      windowDiscountCents,
      suGlassCents,
      suSurchargeCents,
      suLabourCents,
      suMiscCents,
      doorMaterialsCents,
      doorSurchargeCents,
      doorLabourCents,
      doorMiscCents,
      combinedMiscCents,
      combinedLabourCents,
      combinedSurchargeCents,
    };
  }

  // Standalone window quote fallback
  const computedStandaloneSubtotal =
    (windowBaseCents - windowDiscountCents) +
    effectiveJC +
    combinedMiscCents +
    combinedLabourCents +
    combinedSurchargeCents;

  const subtotalCents = afterDiscount > 0 ? Math.round(afterDiscount) : computedStandaloneSubtotal;

  let taxCents = 0;
  if (total > 0 && afterDiscount > 0) {
    taxCents = Math.max(0, Math.round(total) - subtotalCents);
  } else if (hstRate === 13) {
    taxCents = Math.round(subtotalCents * 0.13);
  } else if (hstRate === 8) {
    const materialsCents = Math.max(0, (windowBaseCents - windowDiscountCents) + windowSurchargeCents + effectiveJC);
    const servicesCents = Math.max(0, combinedLabourCents + combinedMiscCents);
    taxCents = Math.round(materialsCents * 0.05 + servicesCents * 0.13);
  }

  const totalCents = total > 0 ? Math.round(total) : (subtotalCents + taxCents);
  const subtotalDollars = Math.round(subtotalCents) / 100;
  const grandTotalDollars = Math.round(totalCents) / 100;

  return {
    subtotalDollars,
    grandTotalDollars,
    combinedSubtotalCents: subtotalCents,
    combinedTaxCents: taxCents,
    combinedTotalCents: totalCents,
    windowBaseCents,
    windowSurchargeCents,
    windowDiscountCents,
    suGlassCents: 0,
    suSurchargeCents: 0,
    suLabourCents: 0,
    suMiscCents: 0,
    doorMaterialsCents: 0,
    doorSurchargeCents: 0,
    doorLabourCents: 0,
    doorMiscCents: 0,
    combinedMiscCents: effectiveMisc,
    combinedLabourCents: effectiveLabour,
    combinedSurchargeCents: windowSurchargeCents,
  };
}
