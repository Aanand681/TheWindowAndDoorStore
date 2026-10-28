'use client';

import { useState, useCallback } from 'react';
import {
  DBPromo,
  toCents,
  calculatePromo,
  calculateUpgrade,
  ILabourUpgradeTier,
} from '@/lib/promo-logic';
import { UIWindowItem } from './useCalculatorWindows';

export interface UseCalculatorPricingProps {
  surchargeRate: number;
  labourUpgradeTiers?: ILabourUpgradeTier[];
}

export function useCalculatorPricing({ surchargeRate, labourUpgradeTiers }: UseCalculatorPricingProps) {
  const [availablePromos, setAvailablePromos] = useState<DBPromo[]>([]);
  const [activePromoId, setActivePromoId] = useState<string>('none');
  const [lockedPromoId, setLockedPromoId] = useState<string | null>(null);
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [compareOptions, setCompareOptions] = useState<any[]>([]);

  // Additional costs & tax totals
  const [taxTotals, setTaxTotals] = useState<any>(null);
  const [customJC, setCustomJC] = useState<string>('');
  const [customMisc, setCustomMisc] = useState<string>('');
  const [customLabour, setCustomLabour] = useState<string>('');
  const [includeJCInPromo, setIncludeJCInPromo] = useState<boolean>(true);
  const [includeMiscInPromo, setIncludeMiscInPromo] = useState<boolean>(true);
  const [includeLabourInPromo, setIncludeLabourInPromo] = useState<boolean>(true);
  const [wantsUpgrade, setWantsUpgrade] = useState<boolean>(false);
  const [hstRate, setHstRate] = useState<number>(13);

  // Effective extra cost amounts
  const taxJC = taxTotals?.jcLabourCents !== undefined
    ? taxTotals.jcLabourCents
    : Math.round(Number(taxTotals?.finalJC ?? taxTotals?.jcTotal ?? taxTotals?.jc ?? 0) * 100);

  const taxMisc = taxTotals?.miscLabourCents !== undefined
    ? taxTotals.miscLabourCents
    : Math.round(Number(taxTotals?.finalMisc ?? taxTotals?.miscTotal ?? 0) * 100);

  const taxLabour = taxTotals?.standardLabourCents !== undefined
    ? taxTotals.standardLabourCents
    : Math.round(Number(taxTotals?.finalLabour ?? taxTotals?.labourTotal ?? taxTotals?.labourWindows ?? 0) * 100);

  const effectiveJC = customJC !== '' ? toCents(customJC) : taxJC;
  const effectiveMisc = customMisc !== '' ? toCents(customMisc) : taxMisc;
  const effectiveLabour = customLabour !== '' ? toCents(customLabour) : taxLabour;

  const calculateQuote = useCallback((windows: UIWindowItem[]) => {
    const validWindows = windows.map(w => ({
      id: w.id,
      qty: Math.max(1, Number(w.qty) || 1),
      base: toCents(w.base),
      argon: toCents(w.argon),
      solar: toCents(w.solar),
      triple: toCents(w.triple),
      w: w.w || '',
      h: w.h || '',
      color: w.color || 'White',
    }));

    const extraDiscountableCents =
      (includeJCInPromo ? effectiveJC : 0) +
      (includeMiscInPromo ? effectiveMisc : 0) +
      (includeLabourInPromo ? effectiveLabour : 0);

    const options = availablePromos.map(p => calculatePromo(p, validWindows, surchargeRate));
    setCompareOptions(options);

    const validOptions = options.filter(o => o.promoId !== 'none');
    const lowest = validOptions.length > 0
      ? validOptions.reduce((prev, curr) => (curr.promoDiscount > prev.promoDiscount ? curr : prev))
      : null;

    const selectedId = (lockedPromoId && options.some(o => o.promoId === lockedPromoId))
      ? lockedPromoId
      : (lowest ? lowest.promoId : 'none');

    setActivePromoId(selectedId);
    const selectedOption = options.find(o => o.promoId === selectedId) || options.find(o => o.promoId === 'none');
    setQuoteResult(selectedOption || null);
  }, [availablePromos, surchargeRate, includeJCInPromo, includeMiscInPromo, includeLabourInPromo, effectiveJC, effectiveMisc, effectiveLabour, lockedPromoId]);

  const beforeTaxDiscount = quoteResult
    ? (quoteResult.base + quoteResult.surcharge
        + (includeJCInPromo ? effectiveJC : 0)
        + (includeMiscInPromo ? effectiveMisc : 0)
        + (includeLabourInPromo ? effectiveLabour : 0)
        + (!includeJCInPromo ? effectiveJC : 0)
        + (!includeMiscInPromo ? effectiveMisc : 0)
        + (!includeLabourInPromo ? effectiveLabour : 0))
    : 0;

  const afterDiscount = Math.max(0, beforeTaxDiscount - (quoteResult?.promoDiscount || 0));
  const upgrade = calculateUpgrade(afterDiscount, labourUpgradeTiers);
  const shownUpgrade = wantsUpgrade ? upgrade.charge : 0;

  const materialAfterDiscount = quoteResult
    ? Math.max(0, (quoteResult.base + quoteResult.surcharge - (quoteResult?.promoDiscount || 0)) + effectiveJC)
    : 0;
  const serviceAfterDiscount = Math.max(0, afterDiscount - materialAfterDiscount);

  let hst = 0;
  if (hstRate === 13) {
    hst = Math.round(afterDiscount * 0.13);
  } else if (hstRate === 8) {
    // 8% Provincial Point-of-Sale Exemption (First Nations):
    // 5% GST on materials (8% provincial exempt), 13% HST on labour and services
    const materialTax = Math.round(materialAfterDiscount * 0.05);
    const serviceTax = Math.round(serviceAfterDiscount * 0.13);
    hst = materialTax + serviceTax;
  }

  const total = afterDiscount + hst;
  const firstPayment = Math.floor(total / 2);
  const secondPayment = total - firstPayment;

  const resetPricingOverrides = () => {
    setCustomJC('');
    setCustomMisc('');
    setCustomLabour('');
    setIncludeJCInPromo(true);
    setIncludeMiscInPromo(true);
    setIncludeLabourInPromo(true);
    setLockedPromoId(null);
    setActivePromoId('none');
    setTaxTotals(null);
  };

  return {
    availablePromos,
    setAvailablePromos,
    activePromoId,
    setActivePromoId,
    lockedPromoId,
    setLockedPromoId,
    quoteResult,
    setQuoteResult,
    compareOptions,
    setCompareOptions,
    taxTotals,
    setTaxTotals,
    customJC,
    setCustomJC,
    customMisc,
    setCustomMisc,
    customLabour,
    setCustomLabour,
    includeJCInPromo,
    setIncludeJCInPromo,
    includeMiscInPromo,
    setIncludeMiscInPromo,
    includeLabourInPromo,
    setIncludeLabourInPromo,
    wantsUpgrade,
    setWantsUpgrade,
    hstRate,
    setHstRate,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    taxJC,
    taxMisc,
    taxLabour,
    beforeTaxDiscount,
    afterDiscount,
    upgrade,
    shownUpgrade,
    total,
    firstPayment,
    secondPayment,
    calculateQuote,
    resetPricingOverrides,
  };
}
