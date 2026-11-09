'use client';

import { toast } from 'sonner';
import { generateId } from '@/hooks/useCalculatorWindows';
import { useCalculatorComparison } from '@/hooks/calculator/useCalculatorComparison';
import { useCalculatorReviewActions } from '@/hooks/useCalculatorReviewActions';

export function useCalculatorWorkflows(p: {
  base: any;
  windowsContext: any;
  pricing: any;
  supply: any;
  drafts: any;
}) {
  const { base, windowsContext, pricing, supply, drafts } = p;
  const { windows, setWindows, fileInputRef } = windowsContext;

  const comparison = useCalculatorComparison({
    windows,
    setWindows,
    surchargeRate: base.surchargeRate,
    setSurchargeRate: base.setSurchargeRate,
    isSupplyOnly: supply.isSupplyOnly,
    setIsSupplyOnly: supply.handleToggleSupplyOnly,
    supplyJambId: supply.supplyJambId,
    setSupplyJambId: supply.setSupplyJambId,
    supplyJambName: supply.supplyJambName,
    setSupplyJambName: supply.setSupplyJambName,
    supplyJambRate: supply.supplyJambRate,
    setSupplyJambRate: supply.setSupplyJambRate,
    supplyCasingId: supply.supplyCasingId,
    setSupplyCasingId: supply.setSupplyCasingId,
    supplyCasingName: supply.supplyCasingName,
    setSupplyCasingName: supply.setSupplyCasingName,
    supplyCasingRate: supply.supplyCasingRate,
    setSupplyCasingRate: supply.setSupplyCasingRate,
    taxTotals: pricing.taxTotals,
    setTaxTotals: pricing.setTaxTotals,
    customJC: pricing.customJC,
    setCustomJC: pricing.setCustomJC,
    customMisc: pricing.customMisc,
    setCustomMisc: pricing.setCustomMisc,
    customLabour: pricing.customLabour,
    setCustomLabour: pricing.setCustomLabour,
    activePromoId: pricing.activePromoId,
    setActivePromoId: pricing.setActivePromoId,
    setLockedPromoId: pricing.setLockedPromoId,
    hstRate: pricing.hstRate,
    setHstRate: pricing.setHstRate,
    customerName: base.customerName,
    setCustomerName: base.setCustomerName,
    quoteNumber: base.quoteNumber,
    setQuoteNumber: base.setQuoteNumber,
    quoteResult: pricing.quoteResult,
    afterDiscount: pricing.afterDiscount,
    total: pricing.total,
    firstPayment: pricing.firstPayment,
    secondPayment: pricing.secondPayment,
  });

  const resetCalculatorDefaults = () => {
    setWindows([{ id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' }]);
    base.setCustomerName('');
    base.setQuoteNumber('');
    base.setQuoteNotes('');
    base.setSurchargeRate(8);
    supply.resetSupplyMode();
    comparison.setAppliedOption('A');
    comparison.setBaseWindowsA(null);
    base.setAttachedUpgrade(null);
    base.setAttachedSealedUnit(null);
    base.setAttachedDoorQuote(null);
    comparison.setIsComparisonStaging(false);
    comparison.setBaseSnapshotA(null);
    pricing.resetPricingOverrides();
    drafts.resetDraftState();
  };

  const handleConfirmReset = () => {
    resetCalculatorDefaults();
    base.setShowResetModal(false);
    toast.success('Window quote reset. Workspace is fresh and ready.');
  };

  const review = useCalculatorReviewActions({
    user: base.user,
    quoteNumber: base.quoteNumber,
    setQuoteNumber: base.setQuoteNumber,
    customerName: base.customerName,
    setCustomerName: base.setCustomerName,
    quoteNotes: base.quoteNotes,
    setQuoteNotes: base.setQuoteNotes,
    surchargeRate: base.surchargeRate,
    setSurchargeRate: base.setSurchargeRate,
    windows,
    setWindows,
    taxTotals: pricing.taxTotals,
    setTaxTotals: pricing.setTaxTotals,
    quoteResult: pricing.quoteResult,
    activePromoId: pricing.activePromoId,
    setActivePromoId: pricing.setActivePromoId,
    setLockedPromoId: pricing.setLockedPromoId,
    customJC: pricing.customJC,
    setCustomJC: pricing.setCustomJC,
    customMisc: pricing.customMisc,
    setCustomMisc: pricing.setCustomMisc,
    customLabour: pricing.customLabour,
    setCustomLabour: pricing.setCustomLabour,
    includeJCInPromo: pricing.includeJCInPromo,
    setIncludeJCInPromo: pricing.setIncludeJCInPromo,
    includeMiscInPromo: pricing.includeMiscInPromo,
    setIncludeMiscInPromo: pricing.setIncludeMiscInPromo,
    includeLabourInPromo: pricing.includeLabourInPromo,
    setIncludeLabourInPromo: pricing.setIncludeLabourInPromo,
    total: pricing.total,
    attachedUpgrade: base.attachedUpgrade,
    setAttachedUpgrade: base.setAttachedUpgrade,
    attachedDoorQuote: base.attachedDoorQuote,
    setAttachedDoorQuote: base.setAttachedDoorQuote,
    attachedSealedUnit: base.attachedSealedUnit,
    setAttachedSealedUnit: base.setAttachedSealedUnit,
    wantsUpgrade: pricing.wantsUpgrade,
    setWantsUpgrade: pricing.setWantsUpgrade,
    isSupplyOnly: supply.isSupplyOnly,
    setIsSupplyOnly: supply.handleToggleSupplyOnly,
    isServiceOnly: supply.isServiceOnly,
    setIsServiceOnly: supply.setIsServiceOnly,
    quotesSubTab: base.quotesSubTab,
    setQuotesSubTab: base.setQuotesSubTab,
    setActiveTab: base.setActiveTab,
    fileInputRef,
    resetCalculatorDefaults,
  });

  return {
    comparison,
    review,
    resetCalculatorDefaults,
    handleConfirmReset,
  };
}

