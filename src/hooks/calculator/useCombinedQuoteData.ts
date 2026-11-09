import { useMemo } from 'react';
import { formatDoorSummarySentence } from '@/lib/doors/calculations';
import { formatSealedUnitSummarySentence, getSealedUnitServiceSummaryLabel } from '@/lib/sealed-units-logic';

export interface CombinedQuoteData {
  hasSU: boolean;
  hasDoor: boolean;
  windowBaseCents: number;
  suGlassCents: number;
  suSummarySentence: string;
  isAttachedSUService: boolean;
  doorMaterialsCents: number;
  doorSummarySentence: string;
  doorDiscountCents: number;
  effectiveJCCents: number;
  combinedMiscCents: number;
  combinedLabourCents: number;
  combinedSurchargeCents: number;
  windowDiscountCents: number;
  combinedSubtotalCents: number;
  combinedTaxCents: number;
  combinedTotalCents: number;
  combinedFirstPayment: number;
  combinedSecondPayment: number;
}

export interface UseCombinedQuoteDataParams {
  attachedSealedUnit?: any | null;
  attachedDoorQuote?: any | null;
  quoteResult?: any;
  effectiveMiscCents: number;
  effectiveLabourCents: number;
  effectiveJCCents: number;
  hstRate: number;
}

/**
 * Hook to compute combined financial ledger figures and summary sentences
 * when a Window calculation has an attached Sealed Unit or Door quote.
 */
export function useCombinedQuoteData({
  attachedSealedUnit,
  attachedDoorQuote,
  quoteResult,
  effectiveMiscCents,
  effectiveLabourCents,
  effectiveJCCents,
  hstRate,
}: UseCombinedQuoteDataParams): CombinedQuoteData | null {
  return useMemo(() => {
    if (!attachedSealedUnit && !attachedDoorQuote) return null;

    const hasSU = Boolean(attachedSealedUnit);
    const suTotals = attachedSealedUnit?.totals || {};
    const isAttachedSUService =
      attachedSealedUnit?.sealedUnitMode === 'service_only' ||
      attachedSealedUnit?.data?.sealedUnitMode === 'service_only' ||
      Boolean(suTotals.isServiceOnly);
    const suGlassCents =
      hasSU && !isAttachedSUService ? Math.round((suTotals.glassBefore8PercentTotal || 0) * 100) : 0;
    const suSurchargeCents =
      hasSU && !isAttachedSUService ? Math.round((suTotals.glass8PercentSurchargeTotal || 0) * 100) : 0;
    const suLabourCents = hasSU
      ? Math.round((suTotals.serviceLabourTotal ?? suTotals.unitLabourSum ?? 0) * 100)
      : 0;
    const suMiscCents = hasSU ? Math.round((suTotals.miscTotal || 0) * 100) : 0;

    const hasDoor = Boolean(attachedDoorQuote);
    const doorTotals = attachedDoorQuote?.totals || {};
    const doorRawBaseCents = hasDoor
      ? Math.round(
          ((doorTotals.rawDoorBaseTotal || 0) +
            (doorTotals.stormDoorTotal || 0) +
            (doorTotals.hardwareTotal || 0)) *
            100
        )
      : 0;
    const doorDiscountCents = hasDoor ? Math.round((doorTotals.discountTotal || 0) * 100) : 0;
    const doorMaterialsCents = doorRawBaseCents;
    const doorSurchargeCents = hasDoor ? Math.round((doorTotals.surchargeTotal || 0) * 100) : 0;
    const doorLabourCents = hasDoor
      ? Math.round(((doorTotals.unitLabourTotal || 0) + (doorTotals.upchargesTotal || 0)) * 100)
      : 0;
    const doorMiscCents = hasDoor ? Math.round((doorTotals.miscTotal || 0) * 100) : 0;

    const windowBaseCents = quoteResult?.base || 0;
    const windowSurchargeCents = quoteResult?.surcharge || 0;
    const windowDiscountCents = quoteResult?.promoDiscount || 0;

    const combinedMiscCents = effectiveMiscCents + suMiscCents + doorMiscCents;
    const combinedLabourCents = effectiveLabourCents + suLabourCents + doorLabourCents;
    const combinedSurchargeCents = windowSurchargeCents + suSurchargeCents + doorSurchargeCents;

    const combinedSubtotalCents =
      windowBaseCents -
      windowDiscountCents +
      suGlassCents +
      (doorRawBaseCents - doorDiscountCents) +
      effectiveJCCents +
      combinedMiscCents +
      combinedLabourCents +
      combinedSurchargeCents;

    let combinedTaxCents = 0;
    if (hstRate === 13) {
      combinedTaxCents = Math.round(combinedSubtotalCents * 0.13);
    } else if (hstRate === 8) {
      const materialsCents = Math.max(
        0,
        windowBaseCents -
          windowDiscountCents +
          windowSurchargeCents +
          effectiveJCCents +
          suGlassCents +
          suSurchargeCents +
          (doorRawBaseCents - doorDiscountCents) +
          doorSurchargeCents
      );
      const servicesCents = Math.max(0, combinedLabourCents + combinedMiscCents);
      combinedTaxCents = Math.round(materialsCents * 0.05 + servicesCents * 0.13);
    } else {
      combinedTaxCents = 0;
    }

    const combinedTotalCents = combinedSubtotalCents + combinedTaxCents;
    const combinedFirstPayment = Math.round(combinedTotalCents / 2);
    const combinedSecondPayment = combinedTotalCents - combinedFirstPayment;

    const suLineItems = attachedSealedUnit?.lineItems || [];
    let suSummarySentence = 'Sealed Unit';
    if (isAttachedSUService) {
      suSummarySentence = getSealedUnitServiceSummaryLabel(suLineItems, suTotals.totalSqft);
    } else if (suLineItems.length > 0) {
      suSummarySentence = formatSealedUnitSummarySentence(suLineItems);
    }

    const doorLineItems = attachedDoorQuote?.lineItems || [];
    const doorSummarySentence =
      doorLineItems.length > 0
        ? formatDoorSummarySentence(doorLineItems)
        : `${attachedDoorQuote?.itemCount || 1} Door Unit${(attachedDoorQuote?.itemCount || 1) !== 1 ? 's' : ''}`;

    return {
      hasSU,
      hasDoor,
      windowBaseCents,
      suGlassCents,
      suSummarySentence,
      isAttachedSUService,
      doorMaterialsCents,
      doorSummarySentence,
      doorDiscountCents,
      effectiveJCCents,
      combinedMiscCents,
      combinedLabourCents,
      combinedSurchargeCents,
      windowDiscountCents,
      combinedSubtotalCents,
      combinedTaxCents,
      combinedTotalCents,
      combinedFirstPayment,
      combinedSecondPayment,
    };
  }, [
    attachedSealedUnit,
    attachedDoorQuote,
    quoteResult,
    effectiveMiscCents,
    effectiveLabourCents,
    effectiveJCCents,
    hstRate,
  ]);
}

