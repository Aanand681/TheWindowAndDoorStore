'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  saveQuoteDraft,
  getActiveAutoSave,
  clearActiveAutoSave,
  getSavedDrafts,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';
import { formatWindowSummarySentence } from '@/hooks/useCalculatorWindows';
import { computeCombinedQuoteFinancials } from '@/lib/calculator/pricing-engine';

export interface UseCalculatorDraftsWorkspace {
  quoteNumber: string;
  setQuoteNumber: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  quoteNotes: string;
  setQuoteNotes: (val: string) => void;
  surchargeRate: number;
  setSurchargeRate: (val: number) => void;
  windows: any[];
  setWindows: (windows: any[]) => void;
  activePromoId: string;
  setActivePromoId: (id: string) => void;
  isSupplyOnly: boolean;
  setIsSupplyOnly: (val: boolean) => void;
  supplyJambId: string;
  setSupplyJambId: (id: string) => void;
  supplyJambRate: string;
  setSupplyJambRate: (rate: string) => void;
  supplyCasingId: string;
  setSupplyCasingId: (id: string) => void;
  supplyCasingRate: string;
  setSupplyCasingRate: (rate: string) => void;
  customJC: string;
  setCustomJC: (val: string) => void;
  customMisc: string;
  setCustomMisc: (val: string) => void;
  customLabour: string;
  setCustomLabour: (val: string) => void;
  includeJCInPromo: boolean;
  setIncludeJCInPromo: (val: boolean) => void;
  includeMiscInPromo: boolean;
  setIncludeMiscInPromo: (val: boolean) => void;
  includeLabourInPromo: boolean;
  setIncludeLabourInPromo: (val: boolean) => void;
  hstRate: number;
  setHstRate: (rate: number) => void;
  attachedUpgrade: any;
  setAttachedUpgrade: (val: any) => void;
  attachedSealedUnit: any;
  setAttachedSealedUnit: (val: any) => void;
  attachedDoorQuote: any;
  setAttachedDoorQuote: (val: any) => void;
  wantsUpgrade: boolean;
  setWantsUpgrade: (val: boolean) => void;
  taxTotals: any;
  setTaxTotals: (val: any) => void;
}

export interface UseCalculatorDraftsFinancials {
  quoteResult: any;
  effectiveMisc: number;
  effectiveLabour: number;
  effectiveJC: number;
  afterDiscount: number;
  total: number;
}

export interface UseCalculatorDraftsParams {
  initialReviewQuoteId?: string | null;
  workspace: UseCalculatorDraftsWorkspace;
  financials: UseCalculatorDraftsFinancials;
  clearAutoSaveTimer: () => void;
  setLastSavedAt: (time: string | null) => void;
}

export interface UseCalculatorDraftsReturn {
  savedDraftsCount: number;
  loadedDraftId: string | null;
  setLoadedDraftId: (id: string | null) => void;
  loadedDraftTaxTotals: any | null;
  setLoadedDraftTaxTotals: (totals: any | null) => void;
  isSavedQuotesOpen: boolean;
  setIsSavedQuotesOpen: (open: boolean) => void;
  initialLoadDone: boolean;
  loadDraftIntoWorkspace: (draft: QuoteDraftItem) => void;
  restoreAutoSaveIntoWorkspace: (recovered: any) => void;
  handleSaveDraft: () => void;
  resetDraftState: () => void;
}

export function useCalculatorDrafts({
  initialReviewQuoteId,
  workspace,
  financials,
  clearAutoSaveTimer,
  setLastSavedAt,
}: UseCalculatorDraftsParams): UseCalculatorDraftsReturn {
  const router = useRouter();

  const [savedDraftsCount, setSavedDraftsCount] = useState(0);
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);
  const [loadedDraftTaxTotals, setLoadedDraftTaxTotals] = useState<any | null>(null);
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const restoreAutoSaveIntoWorkspace = useCallback(
    (recovered: any) => {
      const d = recovered?.data;
      if (!d) return;

      if (d.quoteNumber) workspace.setQuoteNumber(d.quoteNumber);
      if (d.customerName !== undefined) workspace.setCustomerName(d.customerName);
      if (d.quoteNotes !== undefined) workspace.setQuoteNotes(d.quoteNotes);
      if (d.surchargeRate !== undefined) workspace.setSurchargeRate(d.surchargeRate);
      if (Array.isArray(d.windows) && d.windows.length > 0) workspace.setWindows(d.windows);
      if (d.activePromoId) workspace.setActivePromoId(d.activePromoId);
      if (d.isSupplyOnly !== undefined) workspace.setIsSupplyOnly(d.isSupplyOnly);
      if (d.supplyJambId !== undefined) workspace.setSupplyJambId(d.supplyJambId);
      if (d.supplyJambRate !== undefined) workspace.setSupplyJambRate(d.supplyJambRate);
      if (d.supplyCasingId !== undefined) workspace.setSupplyCasingId(d.supplyCasingId);
      if (d.supplyCasingRate !== undefined) workspace.setSupplyCasingRate(d.supplyCasingRate);
      if (d.customJC !== undefined) workspace.setCustomJC(d.customJC !== '' && d.customJC !== null ? String(d.customJC) : '');
      if (d.customMisc !== undefined) workspace.setCustomMisc(d.customMisc !== '' && d.customMisc !== null ? String(d.customMisc) : '');
      if (d.customLabour !== undefined) workspace.setCustomLabour(d.customLabour !== '' && d.customLabour !== null ? String(d.customLabour) : '');
      if (d.includeJCInPromo !== undefined) workspace.setIncludeJCInPromo(d.includeJCInPromo);
      if (d.includeMiscInPromo !== undefined) workspace.setIncludeMiscInPromo(d.includeMiscInPromo);
      if (d.includeLabourInPromo !== undefined) workspace.setIncludeLabourInPromo(d.includeLabourInPromo);
      if (d.hstRate !== undefined) workspace.setHstRate(d.hstRate);
      if (d.attachedUpgrade !== undefined) workspace.setAttachedUpgrade(d.attachedUpgrade);
      if (d.attachedSealedUnit !== undefined) workspace.setAttachedSealedUnit(d.attachedSealedUnit);
      if (d.attachedDoorQuote !== undefined) workspace.setAttachedDoorQuote(d.attachedDoorQuote);
      if (d.wantsUpgrade !== undefined) workspace.setWantsUpgrade(Boolean(d.wantsUpgrade));
      if (d.taxTotals) {
        workspace.setTaxTotals(d.taxTotals);
        setLoadedDraftTaxTotals(d.taxTotals);
      }

      if (recovered.timestamp) {
        setLastSavedAt(new Date(recovered.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    },
    [workspace, setLastSavedAt]
  );

  const loadDraftIntoWorkspace = useCallback(
    (draft: QuoteDraftItem) => {
      if (draft.type === 'sealed_unit') {
        clearAutoSaveTimer();
        clearActiveAutoSave('window');
        router.push(`/sealed-units?loadDraftId=${draft.id}`);
        return;
      }

      const d = draft.data as any;
      if (!d) return;

      setLoadedDraftId(draft.id);
      if (d.quoteNumber) workspace.setQuoteNumber(d.quoteNumber);
      if (d.customerName !== undefined) workspace.setCustomerName(d.customerName);
      if (d.quoteNotes !== undefined) workspace.setQuoteNotes(d.quoteNotes);
      if (d.surchargeRate !== undefined) workspace.setSurchargeRate(d.surchargeRate);
      if (Array.isArray(d.windows) && d.windows.length > 0) workspace.setWindows(d.windows);
      if (d.activePromoId) workspace.setActivePromoId(d.activePromoId);
      if (d.isSupplyOnly !== undefined) workspace.setIsSupplyOnly(d.isSupplyOnly);
      if (d.supplyJambId !== undefined) workspace.setSupplyJambId(d.supplyJambId);
      if (d.supplyJambRate !== undefined) workspace.setSupplyJambRate(d.supplyJambRate);
      if (d.supplyCasingId !== undefined) workspace.setSupplyCasingId(d.supplyCasingId);
      if (d.supplyCasingRate !== undefined) workspace.setSupplyCasingRate(d.supplyCasingRate);
      if (d.customJC !== undefined) workspace.setCustomJC(d.customJC !== '' && d.customJC !== null ? String(d.customJC) : '');
      if (d.customMisc !== undefined) workspace.setCustomMisc(d.customMisc !== '' && d.customMisc !== null ? String(d.customMisc) : '');
      if (d.customLabour !== undefined) workspace.setCustomLabour(d.customLabour !== '' && d.customLabour !== null ? String(d.customLabour) : '');
      if (d.includeJCInPromo !== undefined) workspace.setIncludeJCInPromo(d.includeJCInPromo);
      if (d.includeMiscInPromo !== undefined) workspace.setIncludeMiscInPromo(d.includeMiscInPromo);
      if (d.includeLabourInPromo !== undefined) workspace.setIncludeLabourInPromo(d.includeLabourInPromo);
      if (d.hstRate !== undefined) workspace.setHstRate(d.hstRate);
      if (d.attachedUpgrade !== undefined) workspace.setAttachedUpgrade(d.attachedUpgrade);
      if (d.attachedSealedUnit !== undefined) workspace.setAttachedSealedUnit(d.attachedSealedUnit);
      else workspace.setAttachedSealedUnit(null);
      if (d.attachedDoorQuote !== undefined) workspace.setAttachedDoorQuote(d.attachedDoorQuote);
      else workspace.setAttachedDoorQuote(null);
      if (d.wantsUpgrade !== undefined) workspace.setWantsUpgrade(Boolean(d.wantsUpgrade));
      if (d.taxTotals) {
        workspace.setTaxTotals(d.taxTotals);
        setLoadedDraftTaxTotals(d.taxTotals);
      }

      clearActiveAutoSave('window');
      toast.success(`Loaded Window Quote #${draft.quoteNumber}`);
    },
    [router, workspace, clearAutoSaveTimer]
  );

  const handleSaveDraft = useCallback(() => {
    const validWindows = workspace.windows.filter(
      (w) =>
        (w.base && parseFloat(w.base) > 0) ||
        (w.w && parseFloat(w.w) > 0) ||
        (w.h && parseFloat(w.h) > 0)
    );
    const hasValidAttachedQuote = Boolean(
      (workspace.attachedSealedUnit &&
        ((workspace.attachedSealedUnit.itemCount || 0) > 0 ||
          (workspace.attachedSealedUnit.totals?.grandTotal || 0) > 0)) ||
      (workspace.attachedDoorQuote &&
        ((workspace.attachedDoorQuote.itemCount || 0) > 0 ||
          (workspace.attachedDoorQuote.totals?.grandTotal || 0) > 0))
    );

    if (validWindows.length === 0 && !hasValidAttachedQuote) {
      toast.error('Please enter window sizes or pricing before saving a draft.');
      return;
    }

    const effectiveQuoteNumber =
      workspace.quoteNumber.trim() || Math.floor(100000 + Math.random() * 900000).toString();
    if (!workspace.quoteNumber.trim()) {
      workspace.setQuoteNumber(effectiveQuoteNumber);
    }

    const summaryTypeDesc = formatWindowSummarySentence(workspace.windows);

    const calcFinancials = computeCombinedQuoteFinancials({
      quoteResult: financials.quoteResult,
      afterDiscount: financials.afterDiscount,
      total: financials.total,
      attachedSealedUnit: workspace.attachedSealedUnit,
      attachedDoorQuote: workspace.attachedDoorQuote,
      effectiveJC: financials.effectiveJC,
      effectiveMisc: financials.effectiveMisc,
      effectiveLabour: financials.effectiveLabour,
      hstRate: workspace.hstRate,
    });
    const draftSubtotalDollars = calcFinancials.subtotalDollars;
    const draftGrandTotalDollars = calcFinancials.grandTotalDollars;

    const savedDraft = saveQuoteDraft({
      id: loadedDraftId || undefined,
      type: 'window',
      quoteNumber: effectiveQuoteNumber,
      customerName: workspace.customerName.trim() || 'Unnamed Customer',
      itemCount: workspace.windows.length,
      subtotal: draftSubtotalDollars,
      grandTotal: draftGrandTotalDollars,
      summaryLabel: summaryTypeDesc,
      data: {
        quoteNumber: effectiveQuoteNumber,
        customerName: workspace.customerName.trim(),
        quoteNotes: workspace.quoteNotes,
        surchargeRate: workspace.surchargeRate,
        windows: workspace.windows,
        activePromoId: workspace.activePromoId,
        isSupplyOnly: workspace.isSupplyOnly,
        supplyJambId: workspace.supplyJambId,
        supplyJambRate: workspace.supplyJambRate,
        supplyCasingId: workspace.supplyCasingId,
        supplyCasingRate: workspace.supplyCasingRate,
        customJC: workspace.customJC !== '' ? parseFloat(workspace.customJC) : undefined,
        customMisc: workspace.customMisc !== '' ? parseFloat(workspace.customMisc) : undefined,
        customLabour: workspace.customLabour !== '' ? parseFloat(workspace.customLabour) : undefined,
        includeJCInPromo: workspace.includeJCInPromo,
        includeMiscInPromo: workspace.includeMiscInPromo,
        includeLabourInPromo: workspace.includeLabourInPromo,
        hstRate: workspace.hstRate,
        attachedUpgrade: workspace.attachedUpgrade,
        attachedSealedUnit: workspace.attachedSealedUnit,
        attachedDoorQuote: workspace.attachedDoorQuote,
        wantsUpgrade: workspace.wantsUpgrade,
        effectiveBase: (financials.quoteResult?.base || 0) / 100,
        effectiveSurcharge: (financials.quoteResult?.surcharge || 0) / 100,
        effectiveLabour: financials.effectiveLabour / 100,
        effectiveMisc: financials.effectiveMisc / 100,
        effectiveJC: financials.effectiveJC / 100,
        taxTotals: workspace.taxTotals,
        quoteResult: financials.quoteResult,
        subtotal: draftSubtotalDollars,
        grandTotal: draftGrandTotalDollars,
        itemCount: workspace.windows.length,
      },
    });

    setLoadedDraftId(savedDraft.id);
    clearAutoSaveTimer();
    clearActiveAutoSave('window');
    toast.success(`Quote #${effectiveQuoteNumber} saved to drafts!`);
  }, [workspace, financials, loadedDraftId, clearAutoSaveTimer]);

  const resetDraftState = useCallback(() => {
    setLoadedDraftId(null);
    setLoadedDraftTaxTotals(null);
    clearActiveAutoSave('window');
    setLastSavedAt(null);
  }, [setLastSavedAt]);

  // Sync saved drafts count
  useEffect(() => {
    const updateCount = () => {
      const all = getSavedDrafts();
      setSavedDraftsCount(all.filter((d) => d.type === 'window').length);
    };
    updateCount();
    window.addEventListener(DRAFT_CHANGE_EVENT, updateCount);
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, updateCount);
  }, []);

  // Mount effect: Load draft from URL or restore auto-save
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get('loadDraftId');
      if (draftId) {
        const allDrafts = getSavedDrafts();
        const match = allDrafts.find((d) => d.id === draftId);
        if (match && match.type === 'window') {
          loadDraftIntoWorkspace(match);
          window.history.replaceState({}, '', '/calculator');
          setInitialLoadDone(true);
          return;
        }
      }
    }

    if (!initialReviewQuoteId) {
      const recovered = getActiveAutoSave('window');
      if (recovered && recovered.data && (recovered.itemCount > 0 || recovered.customerName)) {
        restoreAutoSaveIntoWorkspace(recovered);
      }
    }
    setInitialLoadDone(true);
  }, [initialReviewQuoteId, loadDraftIntoWorkspace, restoreAutoSaveIntoWorkspace]);

  return {
    savedDraftsCount,
    loadedDraftId,
    setLoadedDraftId,
    loadedDraftTaxTotals,
    setLoadedDraftTaxTotals,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    initialLoadDone,
    loadDraftIntoWorkspace,
    restoreAutoSaveIntoWorkspace,
    handleSaveDraft,
    resetDraftState,
  };
}

