import type { QuotePricingResult } from './types';

export function computeQuotePricing(quote: any): QuotePricingResult | null {
  if (!quote) return null;
  const taxJC = quote.taxTotals
    ? Math.round((quote.taxTotals.finalJC ?? quote.taxTotals.jcTotal ?? 0) * 100)
    : 0;
  const taxMisc = quote.taxTotals
    ? Math.round((quote.taxTotals.finalMisc ?? quote.taxTotals.miscTotal ?? 0) * 100)
    : 0;
  const taxLabour = quote.taxTotals
    ? Math.round((quote.taxTotals.finalLabour ?? quote.taxTotals.labourTotal ?? 0) * 100)
    : 0;

  const effectiveJC =
    quote.customJC !== undefined && String(quote.customJC).trim() !== ''
      ? Math.round(Number(quote.customJC) * 100)
      : taxJC;

  const effectiveMisc =
    quote.customMisc !== undefined && String(quote.customMisc).trim() !== ''
      ? Math.round(Number(quote.customMisc) * 100)
      : taxMisc;

  const effectiveLabour =
    quote.customLabour !== undefined && String(quote.customLabour).trim() !== ''
      ? Math.round(Number(quote.customLabour) * 100)
      : taxLabour;

  const includeJCInPromo = quote.includeJCInPromo !== false;
  const includeMiscInPromo = quote.includeMiscInPromo !== false;
  const includeLabourInPromo = quote.includeLabourInPromo !== false;

  const basePrice = quote.quoteResult?.base || 0;
  const surcharge = quote.quoteResult?.surcharge || 0;
  const promoDiscount = quote.quoteResult?.promoDiscount || 0;

  const beforeTaxDiscount =
    basePrice +
    (includeJCInPromo ? effectiveJC : 0) +
    (includeMiscInPromo ? effectiveMisc : 0) +
    (includeLabourInPromo ? effectiveLabour : 0) +
    surcharge;

  const afterDiscount = Math.max(0, beforeTaxDiscount - promoDiscount);
  const hstRate = quote.taxTotals?.hstRate !== undefined ? quote.taxTotals.hstRate : 13;
  const hst = hstRate > 0 ? Math.round(afterDiscount * (hstRate / 100)) : 0;
  const total = quote.quoteSummaryTotal || afterDiscount + hst;
  const firstPayment = Math.floor(total / 2);
  const secondPayment = total - firstPayment;

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
  };
}

