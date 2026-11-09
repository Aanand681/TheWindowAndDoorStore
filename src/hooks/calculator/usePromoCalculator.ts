'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { toCents } from '@/lib/promo-logic';
import { QuotesSubTabType } from '@/components/quotes/QuotesTab';
import { useCalculatorWindows } from '@/hooks/useCalculatorWindows';
import { useCalculatorPricing } from '@/hooks/useCalculatorPricing';
import { useCalculatorSupplyMode } from '@/hooks/calculator/useCalculatorSupplyMode';
import { useCalculatorDataSync } from '@/hooks/calculator/useCalculatorDataSync';
import { useCalculatorBaseState } from '@/hooks/calculator/promo/useCalculatorBaseState';
import { useCalculatorWorkflows } from '@/hooks/calculator/promo/useCalculatorWorkflows';
import { useCalculatorDraftsSync } from '@/hooks/calculator/promo/useCalculatorDraftsSync';
import {
  buildHeaderToolbarProps,
  buildWindowConfigProps,
  buildSummaryProps,
  CalculatorPropsContext,
} from '@/hooks/calculator/promo/ui-props-builder';
import {
  buildReviewWorkflowProps,
  buildPrintInvoiceProps,
} from '@/hooks/calculator/promo/workflow-invoice-props-builder';
import { buildModalProps } from '@/hooks/calculator/promo/modal-props-builder';

export interface UsePromoCalculatorOptions {
  initialReviewQuoteId?: string;
  initialIsEditMode?: boolean;
}

export function usePromoCalculator({
  initialReviewQuoteId,
  initialIsEditMode,
}: UsePromoCalculatorOptions = {}) {
  const base = useCalculatorBaseState();
  const windowsContext = useCalculatorWindows();
  const { windows, setWindows } = windowsContext;

  const pricing = useCalculatorPricing({
    surchargeRate: base.surchargeRate,
    labourUpgradeTiers: base.dbLabourUpgradeTiers,
  });

  const supply = useCalculatorSupplyMode({
    taxTotals: pricing.taxTotals,
    setTaxTotals: pricing.setTaxTotals,
    setCustomJC: pricing.setCustomJC,
    setHstRate: pricing.setHstRate,
    setAttachedUpgrade: base.setAttachedUpgrade,
  });

  const { drafts } = useCalculatorDraftsSync({
    initialReviewQuoteId,
    base,
    windows,
    setWindows,
    pricing,
    supply,
  });

  const { comparison, review, handleConfirmReset } = useCalculatorWorkflows({
    base,
    windowsContext,
    pricing,
    supply,
    drafts,
  });

  useEffect(() => {
    pricing.setTaxTotals((prev: any) => {
      if (!prev) return prev;
      if ((prev.attachedUpgrade ?? null) === (base.attachedUpgrade ?? null)) return prev;
      return { ...prev, attachedUpgrade: base.attachedUpgrade ?? null };
    });
  }, [base.attachedUpgrade, pricing.setTaxTotals]);

  const { calculateQuote, setQuoteResult, setCompareOptions } = pricing;
  useEffect(() => {
    if (windows.some((w) => toCents(w.base) > 0)) {
      calculateQuote(windows);
    } else {
      setQuoteResult(null);
      setCompareOptions([]);
    }
  }, [windows, base.surchargeRate, calculateQuote, setQuoteResult, setCompareOptions]);

  const switchTab = (tab: string, sub?: QuotesSubTabType) => {
    const validTab = tab === 'promo' || tab === 'tax' || tab === 'quotes' ? tab : 'promo';
    base.setActiveTab(validTab);
    if (sub) base.setQuotesSubTab(sub);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (validTab === 'promo') {
        url.searchParams.delete('tab');
        url.searchParams.delete('sub');
      } else {
        url.searchParams.set('tab', validTab);
        if (sub) url.searchParams.set('sub', sub);
      }
      window.history.pushState({ tab: validTab, sub }, '', url.toString());
    }
  };

  useCalculatorDataSync({
    initialReviewQuoteId,
    initialIsEditMode,
    reviewQuoteId: review.reviewQuoteId,
    setAvailablePromos: pricing.setAvailablePromos,
    setSurchargeRate: base.setSurchargeRate,
    setDbLabourUpgradeTiers: base.setDbLabourUpgradeTiers,
    setUser: base.setUser,
    setQuoteTemplate: base.setQuoteTemplate,
    setStaffList: review.setStaffList,
    setAssignedReviewer: review.setAssignedReviewer,
    setReassignTo: review.setReassignTo,
    setClerkList: review.setClerkList,
    setSelectedOdooClerk: review.setSelectedOdooClerk,
    setPendingReviewCount: base.setPendingReviewCount,
    handleOpenQuoteFromTab: review.handleOpenQuoteFromTab,
    handleExitReview: review.handleExitReview,
  });

  const customPricing = {
    customJC: pricing.customJC,
    customMisc: pricing.customMisc,
    customLabour: pricing.customLabour,
    includeJCInPromo: pricing.includeJCInPromo,
    includeMiscInPromo: pricing.includeMiscInPromo,
    includeLabourInPromo: pricing.includeLabourInPromo,
    effectiveJC: pricing.effectiveJC,
    effectiveMisc: pricing.effectiveMisc,
    effectiveLabour: pricing.effectiveLabour,
    taxJC: pricing.taxJC,
    taxMisc: pricing.taxMisc,
    taxLabour: pricing.taxLabour,
    beforeTaxDiscount: pricing.beforeTaxDiscount,
    afterDiscount: pricing.afterDiscount,
    upgrade: pricing.upgrade,
    shownUpgrade: pricing.shownUpgrade,
    total: pricing.total,
    firstPayment: pricing.firstPayment,
    secondPayment: pricing.secondPayment,
    hstRate: pricing.hstRate,
  };

  const context: CalculatorPropsContext = {
    base,
    pricing,
    windowsContext,
    supply,
    comparison,
    drafts: {
      ...drafts,
      handleConfirmReset,
    },
    review,
    customPricing,
  };

  const reviewWorkflowProps = buildReviewWorkflowProps({
    base,
    pricing,
    review,
    windowsContext,
    supply,
    customPricing,
  });

  const headerToolbarProps = buildHeaderToolbarProps(context);
  const windowConfigProps = buildWindowConfigProps(context);
  const summaryProps = buildSummaryProps(context);
  const printInvoiceProps = buildPrintInvoiceProps({
    base,
    pricing,
    review,
    windowsContext,
    supply,
    customPricing,
  });
  const modalProps = buildModalProps(context);

  const handleTaxCalculated = useCallback(
    (totals: any) => {
      if (!totals) return;
      pricing.setTaxTotals((prev: any) => {
        if (prev) {
          const isSame =
            prev.subtotal === totals.subtotal &&
            prev.total === totals.total &&
            prev.hst === totals.hst &&
            prev.extras === totals.extras &&
            prev.finalLabour === totals.finalLabour &&
            prev.finalMisc === totals.finalMisc &&
            prev.finalJC === totals.finalJC &&
            prev.jcLabourCents === totals.jcLabourCents &&
            prev.standardLabourCents === totals.standardLabourCents &&
            prev.miscLabourCents === totals.miscLabourCents &&
            prev.isSupplyOnly === totals.isSupplyOnly &&
            prev.isServiceOnly === totals.isServiceOnly &&
            prev.selectedRegionId === totals.selectedRegionId &&
            prev.jambId === totals.jambId &&
            prev.casingId === totals.casingId &&
            prev.selectedJamb?.id === totals.selectedJamb?.id &&
            prev.selectedCasing?.id === totals.selectedCasing?.id &&
            prev.selectedJamb?.rate === totals.selectedJamb?.rate &&
            prev.selectedCasing?.rate === totals.selectedCasing?.rate &&
            (prev.attachedUpgrade ?? null) === (base.attachedUpgrade ?? null);
          if (isSame) return prev;
        }
        return {
          ...totals,
          attachedUpgrade: prev?.attachedUpgrade ?? base.attachedUpgrade ?? null,
        };
      });

      if (totals?.isServiceOnly && !supply.isServiceOnly) {
        supply.setIsServiceOnly(true);
        supply.setIsSupplyOnly(false);
        pricing.setHstRate(13);
      }
    },
    [
      pricing.setTaxTotals,
      pricing.setHstRate,
      supply.isServiceOnly,
      supply.setIsServiceOnly,
      supply.setIsSupplyOnly,
      base.attachedUpgrade,
    ]
  );

  const taxTabProps = useMemo(
    () => ({
      windows,
      onWindowsChange: setWindows,
      onCalculated: handleTaxCalculated,
      savedTaxTotals: review.reviewQuote?.taxTotals || drafts.loadedDraftTaxTotals || null,
      readOnly: review.isReadOnly,
      onOpenPreview: () => base.setIsPreviewOpen(true),
      isSupplyOnly: supply.isSupplyOnly,
      isServiceOnly: supply.isServiceOnly,
      onModeChange: supply.handleModeChange,
    }),
    [
      windows,
      setWindows,
      handleTaxCalculated,
      review.reviewQuote?.taxTotals,
      drafts.loadedDraftTaxTotals,
      review.isReadOnly,
      base.setIsPreviewOpen,
      supply.isSupplyOnly,
      supply.isServiceOnly,
      supply.handleModeChange,
    ]
  );

  const quotesTabProps = useMemo(
    () => ({
      currentUser: base.user,
      onOpenQuote: review.handleOpenQuoteFromTab,
      onQuotesCountChange: base.setPendingReviewCount,
      initialSubTab: base.quotesSubTab,
    }),
    [base.user, review.handleOpenQuoteFromTab, base.setPendingReviewCount, base.quotesSubTab]
  );

  return {
    activeTab: base.activeTab,
    switchTab,
    reviewWorkflowProps,
    headerToolbarProps,
    windowConfigProps,
    summaryProps,
    taxCalcKey: base.taxCalcKey,
    taxTabProps,
    quotesTabProps,
    printInvoiceProps,
    modalProps,
  };
}
