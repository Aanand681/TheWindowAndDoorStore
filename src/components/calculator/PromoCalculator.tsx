'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Check, FolderOpen } from "lucide-react";
import { cn } from '@/lib/utils';
import { toCents, DBPromo, ILabourUpgradeTier } from '@/lib/promo-logic';
import { cachedFetch } from '@/lib/client-cache';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

// App shell and tab components
import { AppHeader } from '@/components/layout/AppHeader';
import TaxCalculatorTab from '@/components/tax/TaxCalculatorTab';
import QuotesTab, { QuotesSubTabType } from '@/components/quotes/QuotesTab';
import QuoteInvoice, { QuoteTemplateType } from '@/components/quotes/QuoteInvoice';
import QuotePreviewModal from '@/components/quotes/QuotePreviewModal';

// Calculator modular sub-components
import { ReviewWorkflowBar } from '@/components/calculator/ReviewWorkflowBar';
import { WindowConfigurationsCard } from '@/components/calculator/WindowConfigurationsCard';
import { SupplyJambCasingCard } from '@/components/calculator/SupplyJambCasingCard';
import { PromoComparisonGrid } from '@/components/calculator/PromoComparisonGrid';
import { QuoteSummaryCard } from '@/components/calculator/QuoteSummaryCard';
import { SubmitReviewModal } from '@/components/calculator/SubmitReviewModal';
import { WorkflowDialogs } from '@/components/calculator/WorkflowDialogs';
import { OdooActionModals } from '@/components/calculator/OdooActionModals';
import { QuoteComparisonModal } from '@/components/calculator/QuoteComparisonModal';
import { SavedQuotesModal } from '@/components/calculator/SavedQuotesModal';
import { AttachSealedUnitModal } from '@/components/calculator/AttachSealedUnitModal';

// Drafts & Auto-Recovery Storage
import {
  saveQuoteDraft,
  saveActiveAutoSave,
  getActiveAutoSave,
  clearActiveAutoSave,
  getSavedDrafts,
  isAutoSaveAlreadySaved,
  QuoteDraftItem,
  ActiveAutoSaveDraft,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';

// Custom Hooks
import { useCalculatorWindows, generateId, UIWindowItem } from '@/hooks/useCalculatorWindows';
import { useCalculatorPricing } from '@/hooks/useCalculatorPricing';
import { useCalculatorReviewActions } from '@/hooks/useCalculatorReviewActions';

export { generateId, type UIWindowItem };

export interface PromoCalculatorProps {
  initialReviewQuoteId?: string;
  initialIsEditMode?: boolean;
}

export function PromoCalculator({ initialReviewQuoteId, initialIsEditMode }: PromoCalculatorProps = {}) {
  const router = useRouter();

  // Primary Quote Info
  const [quoteNumber, setQuoteNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [surchargeRate, setSurchargeRate] = useState<number>(8);
  const [user, setUser] = useState<any>(null);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);

  // Tab & Navigation State
  const [activeTab, setActiveTab] = useState<'promo' | 'tax' | 'quotes'>('promo');
  const [quotesSubTab, setQuotesSubTab] = useState<QuotesSubTabType>('review');
  const [taxCalcKey, setTaxCalcKey] = useState(0);

  // Invoice & Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [appliedOption, setAppliedOption] = useState<'A' | 'B'>('A');
  const [baseWindowsA, setBaseWindowsA] = useState<UIWindowItem[] | null>(null);
  const [attachedUpgrade, setAttachedUpgrade] = useState<{ title: string; amountPreTaxCents: number } | null>(null);
  const [attachedSealedUnit, setAttachedSealedUnit] = useState<any | null>(null);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isComparisonStaging, setIsComparisonStaging] = useState<boolean>(false);
  const [baseSnapshotA, setBaseSnapshotA] = useState<any | null>(null);
  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>('cards');
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5);
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0);

  // Saved Drafts & Auto-Recovery State
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState(false);
  const [savedDraftsCount, setSavedDraftsCount] = useState(0);
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);
  const [activeAutoSaveDraft, setActiveAutoSaveDraft] = useState<ActiveAutoSaveDraft | null>(null);
  const [autoSaveRestoredOrDismissed, setAutoSaveRestoredOrDismissed] = useState(false);
  const lastSavedSnapshotRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Window Items & PDF Parser Hook
  const {
    windows,
    setWindows,
    fileInputRef,
    windowEndRef,
    handleAddWindow,
    handleRemoveWindow,
    handleWindowChange,
    handlePdfUpload,
    summaryWindowGroups,
  } = useCalculatorWindows();

  // Supply Only & Service Only State
  const [isSupplyOnly, setIsSupplyOnly] = useState<boolean>(false);
  const [isServiceOnly, setIsServiceOnly] = useState<boolean>(false);
  const [supplyJambId, setSupplyJambId] = useState<string>('none');
  const [supplyJambName, setSupplyJambName] = useState<string>('');
  const [supplyJambRate, setSupplyJambRate] = useState<string>('');
  const [supplyCasingId, setSupplyCasingId] = useState<string>('none');
  const [supplyCasingName, setSupplyCasingName] = useState<string>('');
  const [supplyCasingRate, setSupplyCasingRate] = useState<string>('');
  const [dbLabourUpgradeTiers, setDbLabourUpgradeTiers] = useState<ILabourUpgradeTier[] | undefined>(undefined);

  // Pricing & Promos Hook
  const {
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
  } = useCalculatorPricing({ surchargeRate, labourUpgradeTiers: dbLabourUpgradeTiers });

  const resetCalculatorDefaults = () => {
    setWindows([{ id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' }]);
    setCustomerName('');
    setQuoteNumber('');
    setQuoteNotes('');
    setSurchargeRate(8);
    setIsSupplyOnly(false);
    setSupplyJambId('none');
    setSupplyJambName('');
    setSupplyJambRate('');
    setSupplyCasingId('none');
    setSupplyCasingName('');
    setSupplyCasingRate('');
    setAppliedOption('A');
    setBaseWindowsA(null);
    setAttachedUpgrade(null);
    setAttachedSealedUnit(null);
    setIsComparisonStaging(false);
    setBaseSnapshotA(null);
    resetPricingOverrides();
    setLoadedDraftId(null);
    clearActiveAutoSave('window');
    setActiveAutoSaveDraft(null);
    setAutoSaveRestoredOrDismissed(true);
  };

  const loadDraftIntoWorkspace = useCallback(
    (draft: QuoteDraftItem) => {
      if (draft.type === 'sealed_unit') {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
          autoSaveTimerRef.current = null;
        }
        clearActiveAutoSave('window');
        router.push(`/sealed-units?loadDraftId=${draft.id}`);
        return;
      }

      const d = draft.data as any;
      if (!d) return;

      setLoadedDraftId(draft.id);
      if (d.quoteNumber) setQuoteNumber(d.quoteNumber);
      if (d.customerName !== undefined) setCustomerName(d.customerName);
      if (d.quoteNotes !== undefined) setQuoteNotes(d.quoteNotes);
      if (d.surchargeRate !== undefined) setSurchargeRate(d.surchargeRate);
      if (Array.isArray(d.windows) && d.windows.length > 0) setWindows(d.windows);
      if (d.activePromoId) setActivePromoId(d.activePromoId);
      if (d.isSupplyOnly !== undefined) setIsSupplyOnly(d.isSupplyOnly);
      if (d.supplyJambId !== undefined) setSupplyJambId(d.supplyJambId);
      if (d.supplyJambRate !== undefined) setSupplyJambRate(d.supplyJambRate);
      if (d.supplyCasingId !== undefined) setSupplyCasingId(d.supplyCasingId);
      if (d.supplyCasingRate !== undefined) setSupplyCasingRate(d.supplyCasingRate);
      if (d.customJC !== undefined) setCustomJC(d.customJC !== '' && d.customJC !== null ? String(d.customJC) : '');
      if (d.customMisc !== undefined) setCustomMisc(d.customMisc !== '' && d.customMisc !== null ? String(d.customMisc) : '');
      if (d.customLabour !== undefined) setCustomLabour(d.customLabour !== '' && d.customLabour !== null ? String(d.customLabour) : '');
      if (d.includeJCInPromo !== undefined) setIncludeJCInPromo(d.includeJCInPromo);
      if (d.includeMiscInPromo !== undefined) setIncludeMiscInPromo(d.includeMiscInPromo);
      if (d.includeLabourInPromo !== undefined) setIncludeLabourInPromo(d.includeLabourInPromo);
      if (d.hstRate !== undefined) setHstRate(d.hstRate);
      if (d.attachedUpgrade !== undefined) setAttachedUpgrade(d.attachedUpgrade);
      if (d.attachedSealedUnit !== undefined) setAttachedSealedUnit(d.attachedSealedUnit);
      else setAttachedSealedUnit(null);

      clearActiveAutoSave('window');
      setActiveAutoSaveDraft(null);
      setAutoSaveRestoredOrDismissed(true);
      lastSavedSnapshotRef.current = JSON.stringify({
        quoteNumber: d.quoteNumber || '',
        customerName: (d.customerName || '').trim(),
        windows: d.windows || [],
        surchargeRate: d.surchargeRate || 8,
        activePromoId: d.activePromoId || 'none',
        isSupplyOnly: Boolean(d.isSupplyOnly),
        customJC: d.customJC || '',
        customMisc: d.customMisc || '',
        customLabour: d.customLabour || '',
      });
      toast.success(`Loaded Window Quote #${draft.quoteNumber}`);
    },
    [
      router,
      setQuoteNumber,
      setCustomerName,
      setQuoteNotes,
      setSurchargeRate,
      setWindows,
      setActivePromoId,
      setIsSupplyOnly,
      setSupplyJambId,
      setSupplyJambRate,
      setSupplyCasingId,
      setSupplyCasingRate,
      setCustomJC,
      setCustomMisc,
      setCustomLabour,
      setIncludeJCInPromo,
      setIncludeMiscInPromo,
      setIncludeLabourInPromo,
      setHstRate,
      setAttachedUpgrade,
    ]
  );

  const handleSaveDraft = useCallback(() => {
    const effectiveQuoteNumber = quoteNumber.trim() || Math.floor(100000 + Math.random() * 900000).toString();
    if (!quoteNumber.trim()) {
      setQuoteNumber(effectiveQuoteNumber);
    }

    const paintedCount = windows.filter((w) => w.color === 'Painted').length;
    const summaryTypeDesc =
      windows.length > 0
        ? paintedCount > 0
          ? `${windows.length} Windows (${paintedCount} Painted)`
          : `${windows.length} Windows (White)`
        : '0 Windows';

    // Calculate dollar totals matching the quote summary card
    let draftSubtotalDollars = 0;
    let draftGrandTotalDollars = 0;

    if (attachedSealedUnit && quoteResult) {
      const suTotals = attachedSealedUnit.totals || {};
      const isAttachedSUService =
        attachedSealedUnit.sealedUnitMode === 'service_only' ||
        attachedSealedUnit.data?.sealedUnitMode === 'service_only' ||
        Boolean(suTotals.isServiceOnly);
      const suGlassCents = isAttachedSUService ? 0 : Math.round((suTotals.glassBefore8PercentTotal || 0) * 100);
      const suSurchargeCents = isAttachedSUService ? 0 : Math.round((suTotals.glass8PercentSurchargeTotal || 0) * 100);
      const suLabourCents = Math.round((suTotals.serviceLabourTotal ?? suTotals.combinedLabourTotal ?? 0) * 100);
      const suMiscCents = Math.round((suTotals.miscTotal || 0) * 100);

      const windowBaseCents = quoteResult.base || 0;
      const windowSurchargeCents = quoteResult.surcharge || 0;
      const windowDiscountCents = quoteResult.promoDiscount || 0;

      const combinedMiscCents = effectiveMisc + suMiscCents;
      const combinedLabourCents = effectiveLabour + suLabourCents;
      const combinedSurchargeCents = windowSurchargeCents + suSurchargeCents;

      const combinedSubtotalCents =
        windowBaseCents +
        suGlassCents +
        effectiveJC +
        combinedMiscCents +
        combinedLabourCents +
        combinedSurchargeCents -
        windowDiscountCents;

      let combinedTaxCents = 0;
      if (hstRate === 13) {
        combinedTaxCents = Math.round(combinedSubtotalCents * 0.13);
      } else if (hstRate === 8) {
        const materialsCents = Math.max(
          0,
          windowBaseCents + windowSurchargeCents - windowDiscountCents + effectiveJC + suGlassCents + suSurchargeCents
        );
        const servicesCents = Math.max(0, combinedLabourCents + combinedMiscCents);
        combinedTaxCents = Math.round(materialsCents * 0.05 + servicesCents * 0.13);
      }

      const combinedTotalCents = combinedSubtotalCents + combinedTaxCents;
      draftSubtotalDollars = Math.round(combinedSubtotalCents) / 100;
      draftGrandTotalDollars = Math.round(combinedTotalCents) / 100;
    } else {
      draftSubtotalDollars = Math.round(afterDiscount || 0) / 100;
      draftGrandTotalDollars = Math.round(total || 0) / 100;
    }

    const savedDraft = saveQuoteDraft({
      id: loadedDraftId || undefined,
      type: 'window',
      quoteNumber: effectiveQuoteNumber,
      customerName: customerName.trim() || 'Unnamed Customer',
      itemCount: windows.length,
      subtotal: draftSubtotalDollars,
      grandTotal: draftGrandTotalDollars,
      summaryLabel: summaryTypeDesc,
      data: {
        quoteNumber: effectiveQuoteNumber,
        customerName: customerName.trim(),
        quoteNotes,
        surchargeRate,
        windows,
        activePromoId,
        isSupplyOnly,
        supplyJambId,
        supplyJambRate,
        supplyCasingId,
        supplyCasingRate,
        customJC: customJC !== '' ? parseFloat(customJC) : undefined,
        customMisc: customMisc !== '' ? parseFloat(customMisc) : undefined,
        customLabour: customLabour !== '' ? parseFloat(customLabour) : undefined,
        includeJCInPromo,
        includeMiscInPromo,
        includeLabourInPromo,
        hstRate,
        attachedUpgrade,
        attachedSealedUnit,
        subtotal: draftSubtotalDollars,
        grandTotal: draftGrandTotalDollars,
        itemCount: windows.length,
      },
    });

    setLoadedDraftId(savedDraft.id);

    // Cancel any pending debounced auto-saver immediately
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // Mark as fully saved so auto-save won't falsely flag it as unsaved
    clearActiveAutoSave('window');
    setActiveAutoSaveDraft(null);
    setAutoSaveRestoredOrDismissed(true);
    lastSavedSnapshotRef.current = JSON.stringify({
      quoteNumber: effectiveQuoteNumber,
      customerName: customerName.trim(),
      windows,
      surchargeRate,
      activePromoId,
      isSupplyOnly,
      customJC,
      customMisc,
      customLabour,
    });

    toast.success(`Quote #${effectiveQuoteNumber} saved to drafts!`);
  }, [
    quoteNumber,
    customerName,
    windows,
    afterDiscount,
    total,
    quoteNotes,
    surchargeRate,
    activePromoId,
    isSupplyOnly,
    supplyJambId,
    supplyJambRate,
    supplyCasingId,
    supplyCasingRate,
    customJC,
    customMisc,
    customLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    hstRate,
    attachedUpgrade,
    attachedSealedUnit,
    quoteResult,
    effectiveMisc,
    effectiveLabour,
    effectiveJC,
    loadedDraftId,
    setQuoteNumber,
  ]);

  // Saved drafts count sync
  useEffect(() => {
    const updateCount = () => {
      const all = getSavedDrafts();
      setSavedDraftsCount(all.filter((d) => d.type === 'window').length);
    };
    updateCount();
    window.addEventListener(DRAFT_CHANGE_EVENT, updateCount);
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, updateCount);
  }, []);

  // Check URL query param and auto-save on mount
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
          return;
        }
      }
    }

    if (!initialReviewQuoteId) {
      const recovered = getActiveAutoSave('window');
      if (recovered && recovered.data && (recovered.itemCount > 0 || recovered.customerName)) {
        // Crucial Check: If quote is already in saved drafts, it is NOT unsaved!
        if (isAutoSaveAlreadySaved('window', recovered)) {
          clearActiveAutoSave('window');
          setActiveAutoSaveDraft(null);
        } else {
          setActiveAutoSaveDraft(recovered);
        }
      }
    }
  }, [initialReviewQuoteId, loadDraftIntoWorkspace]);

  // Debounced auto-save effect
  useEffect(() => {
    if (initialReviewQuoteId) return;

    const validWindows = windows.filter(
      (w) => (w.base && parseFloat(w.base) > 0) || (w.w && w.w.trim() !== '') || (w.h && w.h.trim() !== '')
    );
    const hasContent = validWindows.length > 0 || customerName.trim() !== '';

    if (!hasContent) {
      clearActiveAutoSave('window');
      return;
    }

    // Check if state is identical to last explicitly saved or loaded snapshot
    const currentSnapshot = JSON.stringify({
      quoteNumber: quoteNumber.trim(),
      customerName: customerName.trim(),
      windows,
      surchargeRate,
      activePromoId,
      isSupplyOnly,
      customJC,
      customMisc,
      customLabour,
    });

    if (currentSnapshot === lastSavedSnapshotRef.current) {
      // Current workspace matches saved state exactly: not unsaved!
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      let autoSubtotalDollars = Math.round(afterDiscount || 0) / 100;
      let autoGrandTotalDollars = Math.round(total || 0) / 100;

      if (attachedSealedUnit && quoteResult) {
        const suTotals = attachedSealedUnit.totals || {};
        const isAttachedSUService =
          attachedSealedUnit.sealedUnitMode === 'service_only' ||
          attachedSealedUnit.data?.sealedUnitMode === 'service_only' ||
          Boolean(suTotals.isServiceOnly);
        const suGlassCents = isAttachedSUService ? 0 : Math.round((suTotals.glassBefore8PercentTotal || 0) * 100);
        const suSurchargeCents = isAttachedSUService ? 0 : Math.round((suTotals.glass8PercentSurchargeTotal || 0) * 100);
        const suLabourCents = Math.round((suTotals.serviceLabourTotal ?? suTotals.combinedLabourTotal ?? 0) * 100);
        const suMiscCents = Math.round((suTotals.miscTotal || 0) * 100);

        const windowBaseCents = quoteResult.base || 0;
        const windowSurchargeCents = quoteResult.surcharge || 0;
        const windowDiscountCents = quoteResult.promoDiscount || 0;

        const combinedMiscCents = effectiveMisc + suMiscCents;
        const combinedLabourCents = effectiveLabour + suLabourCents;
        const combinedSurchargeCents = windowSurchargeCents + suSurchargeCents;

        const combinedSubtotalCents =
          windowBaseCents +
          suGlassCents +
          effectiveJC +
          combinedMiscCents +
          combinedLabourCents +
          combinedSurchargeCents -
          windowDiscountCents;

        let combinedTaxCents = 0;
        if (hstRate === 13) {
          combinedTaxCents = Math.round(combinedSubtotalCents * 0.13);
        } else if (hstRate === 8) {
          const materialsCents = Math.max(
            0,
            windowBaseCents + windowSurchargeCents - windowDiscountCents + effectiveJC + suGlassCents + suSurchargeCents
          );
          const servicesCents = Math.max(0, combinedLabourCents + combinedMiscCents);
          combinedTaxCents = Math.round(materialsCents * 0.05 + servicesCents * 0.13);
        }

        const combinedTotalCents = combinedSubtotalCents + combinedTaxCents;
        autoSubtotalDollars = Math.round(combinedSubtotalCents) / 100;
        autoGrandTotalDollars = Math.round(combinedTotalCents) / 100;
      }

      saveActiveAutoSave('window', {
        quoteNumber: quoteNumber || 'Draft',
        customerName: customerName || '',
        itemCount: validWindows.length,
        grandTotal: autoGrandTotalDollars,
        summaryLabel: `${validWindows.length} Windows`,
        data: {
          quoteNumber,
          customerName,
          quoteNotes,
          surchargeRate,
          windows,
          activePromoId,
          isSupplyOnly,
          supplyJambId,
          supplyJambRate,
          supplyCasingId,
          supplyCasingRate,
          customJC: customJC !== '' ? parseFloat(customJC) : undefined,
          customMisc: customMisc !== '' ? parseFloat(customMisc) : undefined,
          customLabour: customLabour !== '' ? parseFloat(customLabour) : undefined,
          includeJCInPromo,
          includeMiscInPromo,
          includeLabourInPromo,
          hstRate,
          attachedUpgrade,
          attachedSealedUnit,
          subtotal: autoSubtotalDollars,
          grandTotal: autoGrandTotalDollars,
          itemCount: windows.length,
        },
      });
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    windows,
    customerName,
    quoteNumber,
    quoteNotes,
    surchargeRate,
    activePromoId,
    isSupplyOnly,
    supplyJambId,
    supplyJambRate,
    supplyCasingId,
    supplyCasingRate,
    customJC,
    customMisc,
    customLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    hstRate,
    attachedUpgrade,
    attachedSealedUnit,
    quoteResult,
    effectiveMisc,
    effectiveLabour,
    effectiveJC,
    afterDiscount,
    total,
    initialReviewQuoteId,
  ]);

  const handleToggleSupplyOnly = (isSupply: boolean) => {
    setIsSupplyOnly(isSupply);
    if (isSupply) {
      setIsServiceOnly(false);
      setCustomJC('');
      setSupplyJambId('none');
      setSupplyCasingId('none');
      setSupplyJambName('');
      setSupplyJambRate('');
      setSupplyCasingName('');
      setSupplyCasingRate('');
      setTaxTotals((prev: any) => {
        if (!prev) return { isSupplyOnly: true, isServiceOnly: false, jc: 0, finalJC: 0, jcLabourCents: 0 };
        return {
          ...prev,
          isSupplyOnly: true,
          isServiceOnly: false,
          standardLabourCents: 0,
          miscLabourCents: 0,
          finalLabour: 0,
          finalMisc: 0,
          jc: 0,
          finalJC: 0,
          jcLabourCents: 0,
          selectedJamb: null,
          selectedCasing: null,
          jambId: 'none',
          casingId: 'none',
          jambRate: 0,
          casingRate: 0,
          jambTot: 0,
          casingTot: 0,
        };
      });
    } else {
      setCustomJC('');
      setSupplyJambId('none');
      setSupplyCasingId('none');
      setTaxTotals((prev: any) => {
        if (!prev) return prev;
        const next = { ...prev };
        delete next.isSupplyOnly;
        return next;
      });
    }
  };

  const handleModeChange = (mode: 'installation' | 'supply_only' | 'service_only') => {
    if (mode === 'supply_only') {
      handleToggleSupplyOnly(true);
    } else if (mode === 'service_only') {
      setIsSupplyOnly(false);
      setIsServiceOnly(true);
      setHstRate(13); // Fixed 13% on service work (no 8% rebate)
      setTaxTotals((prev: any) => {
        if (!prev) return { isSupplyOnly: false, isServiceOnly: true, jc: 0, finalJC: 0 };
        return { ...prev, isSupplyOnly: false, isServiceOnly: true };
      });
    } else {
      setIsServiceOnly(false);
      handleToggleSupplyOnly(false);
    }
  };

  const handleSupplyJCCalculated = useCallback((data: {
    linearFeet: number;
    jambTotCents: number;
    casingTotCents: number;
    jcTotalCents: number;
    selectedJamb: any;
    selectedCasing: any;
  }) => {
    if (!isSupplyOnly) return;
    const dollars = data.jcTotalCents > 0 ? (data.jcTotalCents / 100).toFixed(2) : '';
    setCustomJC(dollars);
    setTaxTotals((prev: any) => {
      if (
        prev?.isSupplyOnly &&
        prev?.jcLabourCents === data.jcTotalCents &&
        prev?.ln === data.linearFeet &&
        prev?.selectedJamb?.id === data.selectedJamb?.id &&
        prev?.selectedCasing?.id === data.selectedCasing?.id
      ) {
        return prev;
      }
      return {
        ...prev,
        isSupplyOnly: true,
        standardLabourCents: 0,
        miscLabourCents: 0,
        finalLabour: 0,
        finalMisc: 0,
        ln: data.linearFeet,
        jc: data.jcTotalCents / 100,
        finalJC: data.jcTotalCents / 100,
        jcLabourCents: data.jcTotalCents,
        selectedJamb: data.selectedJamb,
        selectedCasing: data.selectedCasing,
      };
    });
  }, [isSupplyOnly, setCustomJC, setTaxTotals]);

  // Restore Supply Only state when opening a saved/reviewed quote
  useEffect(() => {
    if (taxTotals?.isSupplyOnly) {
      setIsSupplyOnly(true);
      if (taxTotals.selectedJamb) {
        setSupplyJambId(taxTotals.selectedJamb.id || 'none');
        if (taxTotals.selectedJamb.id === 'custom') {
          setSupplyJambName(taxTotals.selectedJamb.name || '');
          setSupplyJambRate(String(taxTotals.selectedJamb.rate || ''));
        }
      }
      if (taxTotals.selectedCasing) {
        setSupplyCasingId(taxTotals.selectedCasing.id || 'none');
        if (taxTotals.selectedCasing.id === 'custom') {
          setSupplyCasingName(taxTotals.selectedCasing.name || '');
          setSupplyCasingRate(String(taxTotals.selectedCasing.rate || ''));
        }
      }
      if (taxTotals.attachedUpgrade) {
        setAttachedUpgrade(taxTotals.attachedUpgrade);
      }
    }
  }, [taxTotals?._quoteId]);

  // Sync attached upgrade offer into taxTotals for persistence
  useEffect(() => {
    setTaxTotals((prev: any) => {
      if (prev?.attachedUpgrade === attachedUpgrade) return prev;
      return {
        ...prev,
        attachedUpgrade,
      };
    });
  }, [attachedUpgrade, setTaxTotals]);

  // Phase 3 Hybrid Mode: Revert back to Base Snapshot A
  const handleRevertToBase = useCallback(() => {
    if (baseSnapshotA) {
      setWindows(baseSnapshotA.windows);
      setSurchargeRate(baseSnapshotA.surchargeRate);
      setIsSupplyOnly(baseSnapshotA.isSupplyOnly);
      setSupplyJambId(baseSnapshotA.supplyJambId);
      setSupplyJambName(baseSnapshotA.supplyJambName);
      setSupplyJambRate(baseSnapshotA.supplyJambRate);
      setSupplyCasingId(baseSnapshotA.supplyCasingId);
      setSupplyCasingName(baseSnapshotA.supplyCasingName);
      setSupplyCasingRate(baseSnapshotA.supplyCasingRate);
      setTaxTotals(baseSnapshotA.taxTotals);
      setCustomJC(baseSnapshotA.customJC);
      setCustomMisc(baseSnapshotA.customMisc);
      setCustomLabour(baseSnapshotA.customLabour);
      setActivePromoId(baseSnapshotA.activePromoId);
      setHstRate(baseSnapshotA.hstRate);
      setCustomerName(baseSnapshotA.customerName);
      setQuoteNumber(baseSnapshotA.quoteNumber);
    } else if (baseWindowsA && baseWindowsA.length > 0) {
      setWindows(baseWindowsA);
    }
    setIsComparisonStaging(false);
    setAppliedOption('A');
    setBaseSnapshotA(null);
    setLockedPromoId(null);
    toast.info('Reverted to Base Quote (Option A).');
  }, [baseSnapshotA, baseWindowsA, setWindows, setSurchargeRate, setTaxTotals, setCustomJC, setCustomMisc, setCustomLabour, setActivePromoId, setHstRate, setCustomerName, setQuoteNumber, setLockedPromoId]);

  // Phase 3 Hybrid Mode: Commit Option B as the new primary quote
  const handleKeepOptionB = useCallback(() => {
    setIsComparisonStaging(false);
    setAppliedOption('A');
    setBaseSnapshotA(null);
    setBaseWindowsA(null);
    toast.success('Kept Option B as the active quote.');
  }, []);

  // Helper to snapshot Base Quote A state
  const captureSnapshotA = useCallback(() => {
    const activeJId = isSupplyOnly ? supplyJambId : (taxTotals?.selectedJamb?.id || taxTotals?.jambId || 'none');
    const activeJName = isSupplyOnly ? supplyJambName : (taxTotals?.selectedJamb?.name || taxTotals?.jambName || '');
    const activeJRate = isSupplyOnly ? supplyJambRate : String(taxTotals?.selectedJamb?.rate || taxTotals?.jambRate || '');
    const activeCId = isSupplyOnly ? supplyCasingId : (taxTotals?.selectedCasing?.id || taxTotals?.casingId || 'none');
    const activeCName = isSupplyOnly ? supplyCasingName : (taxTotals?.selectedCasing?.name || taxTotals?.casingName || '');
    const activeCRate = isSupplyOnly ? supplyCasingRate : String(taxTotals?.selectedCasing?.rate || taxTotals?.casingRate || '');

    return {
      windows: [...windows],
      surchargeRate,
      isSupplyOnly,
      supplyJambId: activeJId,
      supplyJambName: activeJName,
      supplyJambRate: activeJRate,
      supplyCasingId: activeCId,
      supplyCasingName: activeCName,
      supplyCasingRate: activeCRate,
      taxTotals: taxTotals ? JSON.parse(JSON.stringify(taxTotals)) : null,
      customJC,
      customMisc,
      customLabour,
      activePromoId,
      hstRate,
      customerName,
      quoteNumber,
      quoteResult,
      afterDiscount,
      total,
      firstPayment,
      secondPayment,
    };
  }, [
    windows,
    surchargeRate,
    isSupplyOnly,
    supplyJambId,
    supplyJambName,
    supplyJambRate,
    supplyCasingId,
    supplyCasingName,
    supplyCasingRate,
    taxTotals,
    customJC,
    customMisc,
    customLabour,
    activePromoId,
    hstRate,
    customerName,
    quoteNumber,
    quoteResult,
    afterDiscount,
    total,
    firstPayment,
    secondPayment,
  ]);

  // Phase 3 Hybrid Mode: Apply Option B & enter full workspace staging
  const handleApplyAndCustomize = useCallback(
    (
      optionWindows: UIWindowItem[],
      meta?: { customerName?: string; quoteNumber?: string },
      overrides?: {
        jambId?: string;
        jambRate?: string;
        casingId?: string;
        casingRate?: string;
        extraLabour?: string;
      }
    ) => {
      if (!baseSnapshotA) {
        setBaseSnapshotA(captureSnapshotA());
      }
      setBaseWindowsA(windows);
      setIsComparisonStaging(true);
      setAppliedOption('B');

      // Apply Option B windows
      setWindows(optionWindows);
      if (meta?.customerName && !customerName) setCustomerName(meta.customerName);
      if (meta?.quoteNumber && !quoteNumber) setQuoteNumber(meta.quoteNumber);

      // Apply in-modal overrides if provided
      if (overrides) {
        if (overrides.jambId && overrides.jambId !== 'inherit') {
          setSupplyJambId(overrides.jambId);
          if (overrides.jambRate) setSupplyJambRate(overrides.jambRate);
        }
        if (overrides.casingId && overrides.casingId !== 'inherit') {
          setSupplyCasingId(overrides.casingId);
          if (overrides.casingRate) setSupplyCasingRate(overrides.casingRate);
        }
        if (overrides.extraLabour && Number(overrides.extraLabour) > 0) {
          setCustomLabour(String(Number(customLabour || 0) + Number(overrides.extraLabour)));
        }
      }

      setLockedPromoId(null);
      toast.success('Loaded Option B into calculator. Base Quote A is safely preserved.');
    },
    [
      baseSnapshotA,
      captureSnapshotA,
      windows,
      customerName,
      quoteNumber,
      customLabour,
      setWindows,
      setCustomerName,
      setQuoteNumber,
      setLockedPromoId,
    ]
  );

  // Phase 3: Dual PDF Upgrade two-way swapping
  const handleApplyOption = useCallback(
    (
      target: 'A' | 'B',
      optionWindows: UIWindowItem[],
      meta?: { customerName?: string; quoteNumber?: string },
      overrides?: {
        jambId?: string;
        jambRate?: string;
        casingId?: string;
        casingRate?: string;
        extraLabour?: string;
      }
    ) => {
      if (target === 'B') {
        if (!baseSnapshotA) {
          setBaseSnapshotA(captureSnapshotA());
        }
        setBaseWindowsA(windows);
        setWindows(optionWindows);
        setAppliedOption('B');
        if (meta?.customerName && !customerName) {
          setCustomerName(meta.customerName);
        }
        if (meta?.quoteNumber && !quoteNumber) {
          setQuoteNumber(meta.quoteNumber);
        }
        if (overrides) {
          if (overrides.jambId && overrides.jambId !== 'inherit') {
            setSupplyJambId(overrides.jambId);
            if (overrides.jambRate) setSupplyJambRate(overrides.jambRate);
          }
          if (overrides.casingId && overrides.casingId !== 'inherit') {
            setSupplyCasingId(overrides.casingId);
            if (overrides.casingRate) setSupplyCasingRate(overrides.casingRate);
          }
          if (overrides.extraLabour && Number(overrides.extraLabour) > 0) {
            setCustomLabour(String(Number(customLabour || 0) + Number(overrides.extraLabour)));
          }
        }
        setLockedPromoId(null);
        toast.success('Applied Option B to quote.');
      } else {
        handleRevertToBase();
      }
    },
    [baseSnapshotA, captureSnapshotA, windows, customerName, quoteNumber, customLabour, setWindows, setCustomerName, setQuoteNumber, setLockedPromoId, handleRevertToBase]
  );

  // Review & Approval Workflows Hook
  const {
    reviewQuoteId,
    setReviewQuoteId,
    reviewQuote,
    setReviewQuote,
    isEditMode,
    setIsEditMode,
    setOriginalSnapshot,
    reviewActionLoading,
    showSubmitModal,
    setShowSubmitModal,
    assignedReviewer,
    setAssignedReviewer,
    preparerNotes,
    setPreparerNotes,
    submittingQuote,
    staffList,
    setStaffList,
    clerkList,
    setClerkList,
    adminSubmitMode,
    setAdminSubmitMode,
    showReassignModal,
    setShowReassignModal,
    reassignTo,
    setReassignTo,
    reassignNotes,
    setReassignNotes,
    showReturnModal,
    setShowReturnModal,
    returnNotes,
    setReturnNotes,
    showApproveOdooModal,
    setShowApproveOdooModal,
    selectedOdooClerk,
    setSelectedOdooClerk,
    showCompleteOdooModal,
    setShowCompleteOdooModal,
    odooOrderNumberInput,
    setOdooOrderNumberInput,
    showExitReviewForPdfModal,
    setShowExitReviewForPdfModal,
    isReviewerOrAdmin,
    isOdooClerk,
    canEditCurrentQuote,
    canEditApprovedQuote,
    isReadOnly,
    handleOpenQuoteFromTab,
    handleSubmitForReview,
    handleSaveQuotePrices,
    handleCancelEdits,
    handleExitReview,
    handleApproveReviewQuote,
    confirmApproveReviewQuote,
    handleCompleteOdooEntry,
    handleReturnReviewQuote,
    submitReturnReviewQuote,
    handlePdfImportClick,
    handleExitReviewAndImportPdf,
    handleResubmitReturnedQuote,
    handleReassignQuote,
  } = useCalculatorReviewActions({
    user,
    quoteNumber,
    setQuoteNumber,
    customerName,
    setCustomerName,
    quoteNotes,
    setQuoteNotes,
    surchargeRate,
    setSurchargeRate,
    windows,
    setWindows,
    taxTotals,
    setTaxTotals,
    quoteResult,
    activePromoId,
    setActivePromoId,
    setLockedPromoId,
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
    total,
    quotesSubTab,
    setQuotesSubTab,
    setActiveTab,
    fileInputRef,
    resetCalculatorDefaults,
  });

  // Calculate quote automatically on window / surcharge change
  useEffect(() => {
    if (windows.some(w => toCents(w.base) > 0)) {
      calculateQuote(windows);
    } else {
      setQuoteResult(null);
      setCompareOptions([]);
    }
  }, [windows, surchargeRate, calculateQuote, setQuoteResult, setCompareOptions]);

  // Tab switching helper
  const switchTab = (tab: string, sub?: QuotesSubTabType) => {
    const validTab = (tab === 'promo' || tab === 'tax' || tab === 'quotes') ? tab : 'promo';
    setActiveTab(validTab);
    if (sub) setQuotesSubTab(sub);
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

  // TanStack Query for Promos and Settings
  const { data: promosData } = useQuery<DBPromo[]>({
    queryKey: ['promos', 'active'],
    queryFn: async () => {
      const res = await fetch('/api/promos?active=true');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const { data: settingsData } = useQuery<{ surchargeRate?: number; labourUpgradeTiers?: ILabourUpgradeTier[] }>({
    queryKey: ['settings', 'global'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (Array.isArray(promosData) && promosData.length > 0) {
      setAvailablePromos(promosData);
    }
  }, [promosData, setAvailablePromos]);

  useEffect(() => {
    if (settingsData) {
      if (settingsData.surchargeRate !== undefined) {
        setSurchargeRate(settingsData.surchargeRate);
      }
      if (Array.isArray(settingsData.labourUpgradeTiers) && settingsData.labourUpgradeTiers.length > 0) {
        setDbLabourUpgradeTiers(settingsData.labourUpgradeTiers);
      }
    }
  }, [settingsData, setSurchargeRate]);

  // Initial Data Fetching (User Profile & Reviewer/Clerk lists)
  useEffect(() => {
    cachedFetch<any>('/api/profile')
      .then(data => {
        if (data) {
          setUser(data);
          if (data.favoriteTemplate && ['modern', 'executive', 'cards'].includes(data.favoriteTemplate)) {
            setQuoteTemplate(data.favoriteTemplate);
          }
        }
      })
      .catch(err => {
        if (err?.message?.includes('401')) router.replace('/login');
      });

    // Reviewer and Clerk lists: employees can assign to ANY employee (sales, estimators, clerks, managers, admins)
    Promise.all([
      fetch(`/api/users?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch(`/api/users?assignees=true&t=${Date.now()}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    ])
      .then(([allUsers, assignees]) => {
        const eligible = Array.isArray(allUsers) ? allUsers.filter((d: any) =>
          d.role !== 'SUPERADMIN' && d.role !== 'superadmin' &&
          d.username?.toLowerCase() !== 'cheeku' &&
          !d.username?.toLowerCase().includes('superadmin')
        ) : [];
        setStaffList(eligible);
        if (eligible.length > 0) {
          setAssignedReviewer(eligible[0].username);
          setReassignTo(eligible[0].username);
        }
        if (Array.isArray(assignees)) {
          const eligibleClerks = assignees.filter((d: any) =>
            d.role !== 'SUPERADMIN' && d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
          );
          setClerkList(eligibleClerks);
          const defaultClerk = eligibleClerks.find((c: any) => c.department === 'CLERK') || eligibleClerks[0];
          if (defaultClerk) setSelectedOdooClerk(defaultClerk.username);
        }
      })
      .catch(console.error);

    // Initial Quote ID if provided via props
    if (initialReviewQuoteId) {
      handleOpenQuoteFromTab(initialReviewQuoteId, initialIsEditMode);
    }

    // Window events for quote sync
    const handleQuoteDeleted = (e: any) => {
      if (e.detail?.quoteId && reviewQuoteId === e.detail.quoteId) {
        toast.warning(`Quote #${e.detail?.quoteNumber || ''} was deleted.`);
        handleExitReview();
      }
    };
    window.addEventListener('quote-deleted', handleQuoteDeleted);

    const refreshPendingCount = () => {
      fetch('/api/quotes?countOnly=true')
        .then(res => res.json())
        .then(data => {
          const count = data.totalActionableCount ?? data.pendingReviewCount;
          if (count !== undefined) setPendingReviewCount(count);
        })
        .catch(console.error);
    };
    window.addEventListener('quote-count-updated', refreshPendingCount);
    window.addEventListener('focus', refreshPendingCount);
    refreshPendingCount();

    return () => {
      window.removeEventListener('quote-deleted', handleQuoteDeleted);
      window.removeEventListener('quote-count-updated', refreshPendingCount);
      window.removeEventListener('focus', refreshPendingCount);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div>
        <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
          <AppHeader currentPath="/calculator" />
        </div>
      </div>

      <div className="flex-1 max-w-[1650px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Sticky Review / Approval Bar */}
        <ReviewWorkflowBar
          reviewQuote={reviewQuote}
          activeTab={activeTab}
          isEditMode={isEditMode}
          canEditCurrentQuote={canEditCurrentQuote}
          isReviewerOrAdmin={isReviewerOrAdmin}
          isOdooClerk={isOdooClerk}
          user={user}
          reviewActionLoading={reviewActionLoading}
          setIsEditMode={setIsEditMode}
          handleSaveQuotePrices={handleSaveQuotePrices}
          handleCancelEdits={handleCancelEdits}
          handleResubmitReturnedQuote={handleResubmitReturnedQuote}
          handleExitReview={handleExitReview}
          setIsPreviewOpen={setIsPreviewOpen}
          setOdooOrderNumberInput={setOdooOrderNumberInput}
          setShowCompleteOdooModal={setShowCompleteOdooModal}
          staffList={staffList}
          setReassignTo={setReassignTo}
          setReassignNotes={setReassignNotes}
          setShowReassignModal={setShowReassignModal}
          handleReturnReviewQuote={handleReturnReviewQuote}
          handleApproveReviewQuote={handleApproveReviewQuote}
        />

        {/* Unsaved Draft Recovery Notification (Ultra-Slim Minimal Space) */}
        {activeAutoSaveDraft && !autoSaveRestoredOrDismissed && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg py-1 px-3 flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              <div className="text-xs text-foreground truncate">
                <span className="font-semibold text-amber-700 dark:text-amber-400 mr-1">Unsaved Session:</span>
                <span className="text-muted-foreground">{activeAutoSaveDraft.customerName || 'Customer'} (#{activeAutoSaveDraft.quoteNumber || 'Draft'} · {activeAutoSaveDraft.itemCount} items · ${activeAutoSaveDraft.grandTotal ? activeAutoSaveDraft.grandTotal.toFixed(2) : '0.00'})</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  loadDraftIntoWorkspace({
                    id: 'autosave',
                    type: 'window',
                    quoteNumber: activeAutoSaveDraft.quoteNumber,
                    customerName: activeAutoSaveDraft.customerName,
                    createdAt: activeAutoSaveDraft.timestamp,
                    updatedAt: activeAutoSaveDraft.timestamp,
                    itemCount: activeAutoSaveDraft.itemCount,
                    subtotal: (activeAutoSaveDraft.data as any).subtotal || 0,
                    grandTotal: activeAutoSaveDraft.grandTotal,
                    summaryLabel: activeAutoSaveDraft.summaryLabel,
                    data: activeAutoSaveDraft.data,
                  });
                }}
                className="h-5 px-2 text-[10px] font-bold cursor-pointer bg-amber-600 hover:bg-amber-700 text-white"
              >
                Resume
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearActiveAutoSave('window');
                  setActiveAutoSaveDraft(null);
                  setAutoSaveRestoredOrDismissed(true);
                }}
                className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Phase 3 Hybrid: Staging Mode Banner */}
        {isComparisonStaging && (
          <div className="bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/15 border border-amber-500/40 rounded-2xl p-3.5 px-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-amber-950 font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Comparison Staging Mode: Option B (Upgraded Quote)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                    Live Editing
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Base Quote A is preserved. Customize crew, distance, jambs, or promo on Option B, then view the live comparison.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsCompareModalOpen(true)}
                className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Comparison &amp; Delta</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevertToBase}
                className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert to Base (Option A)</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleKeepOptionB}
                className="h-8 text-xs font-bold gap-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Keep Option B</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <Tabs value={activeTab} onValueChange={(val) => switchTab(val as any)} className="w-full">
          {activeTab !== 'quotes' && (
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-4 sm:mb-5 bg-muted p-1 rounded-full border border-border/50 shadow-sm animate-in fade-in duration-200">
              <TabsTrigger value="promo" className="rounded-full text-xs sm:text-sm font-semibold cursor-pointer">
                Promo Calculator
              </TabsTrigger>
              <TabsTrigger value="tax" className="rounded-full text-xs sm:text-sm font-semibold cursor-pointer">
                Tax &amp; Labour Calculator
              </TabsTrigger>
            </TabsList>
          )}

          {/* Tab 1: Promo Calculator */}
          <div className={cn("mt-0 outline-none", activeTab !== 'promo' && "hidden")}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                <WindowConfigurationsCard
                  windows={windows}
                  surchargeRate={surchargeRate}
                  quoteNumber={quoteNumber}
                  setQuoteNumber={setQuoteNumber}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  fileInputRef={fileInputRef}
                  handlePdfUpload={(e) =>
                    handlePdfUpload(e, {
                      onSetCustomerName: setCustomerName,
                      onSetQuoteNumber: setQuoteNumber,
                      onResetCalculator: resetPricingOverrides,
                    })
                  }
                  handlePdfImportClick={handlePdfImportClick}
                  isReadOnly={isReadOnly}
                  handleWindowChange={handleWindowChange}
                  handleRemoveWindow={(id) => handleRemoveWindow(id, () => setLockedPromoId(null))}
                  handleAddWindow={() => handleAddWindow(() => setLockedPromoId(null))}
                  windowEndRef={windowEndRef}
                  isSupplyOnly={isSupplyOnly}
                  setIsSupplyOnly={handleToggleSupplyOnly}
                  onOpenCompareModal={() => setIsCompareModalOpen(true)}
                  attachedUpgrade={attachedUpgrade}
                  onRemoveAttachedUpgrade={() => {
                    setAttachedUpgrade(null);
                    toast.info('Removed optional upgrade offer from quote.');
                  }}
                  attachedSealedUnit={attachedSealedUnit}
                  onOpenAttachSealedUnitModal={() => setIsAttachModalOpen(true)}
                  onRemoveAttachedSealedUnit={() => {
                    setAttachedSealedUnit(null);
                    toast.info('Detached sealed units from quote.');
                  }}
                  onSaveDraft={handleSaveDraft}
                  onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
                  savedDraftsCount={savedDraftsCount}
                />

                {isSupplyOnly && (
                  <SupplyJambCasingCard
                    windows={windows}
                    isReadOnly={isReadOnly}
                    jambId={supplyJambId}
                    setJambId={setSupplyJambId}
                    jambName={supplyJambName}
                    setJambName={setSupplyJambName}
                    jambRate={supplyJambRate}
                    setJambRate={setSupplyJambRate}
                    casingId={supplyCasingId}
                    setCasingId={setSupplyCasingId}
                    casingName={supplyCasingName}
                    setCasingName={setSupplyCasingName}
                    casingRate={supplyCasingRate}
                    setCasingRate={setSupplyCasingRate}
                    onJCCalculated={handleSupplyJCCalculated}
                  />
                )}

                <PromoComparisonGrid
                  compareOptions={compareOptions}
                  activePromoId={activePromoId}
                  setActivePromoId={setActivePromoId}
                  setLockedPromoId={setLockedPromoId}
                />
              </div>

              {/* Sidebar - Calculation Results */}
              <QuoteSummaryCard
                quoteResult={quoteResult}
                summaryWindowGroups={summaryWindowGroups}
                surchargeRate={surchargeRate}
                taxTotals={taxTotals}
                taxJC={taxJC}
                taxMisc={taxMisc}
                taxLabour={taxLabour}
                customJC={customJC}
                setCustomJC={setCustomJC}
                customMisc={customMisc}
                setCustomMisc={setCustomMisc}
                customLabour={customLabour}
                setCustomLabour={setCustomLabour}
                includeJCInPromo={includeJCInPromo}
                setIncludeJCInPromo={setIncludeJCInPromo}
                includeMiscInPromo={includeMiscInPromo}
                setIncludeMiscInPromo={setIncludeMiscInPromo}
                includeLabourInPromo={includeLabourInPromo}
                setIncludeLabourInPromo={setIncludeLabourInPromo}
                wantsUpgrade={wantsUpgrade}
                setWantsUpgrade={setWantsUpgrade}
                upgrade={upgrade}
                shownUpgrade={shownUpgrade}
                beforeTaxDiscount={beforeTaxDiscount}
                afterDiscount={afterDiscount}
                hstRate={hstRate}
                setHstRate={setHstRate}
                total={total}
                firstPayment={firstPayment}
                secondPayment={secondPayment}
                quoteNotes={quoteNotes}
                setQuoteNotes={setQuoteNotes}
                isReadOnly={isReadOnly}
                user={user}
                reviewQuote={reviewQuote}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                canEditApprovedQuote={canEditApprovedQuote}
                canEditCurrentQuote={canEditCurrentQuote}
                isReviewerOrAdmin={isReviewerOrAdmin}
                reviewActionLoading={reviewActionLoading}
                staffList={staffList}
                clerkList={clerkList}
                quoteNumber={quoteNumber}
                customerName={customerName}
                assignedReviewer={assignedReviewer}
                setAssignedReviewer={setAssignedReviewer}
                selectedOdooClerk={selectedOdooClerk}
                setSelectedOdooClerk={setSelectedOdooClerk}
                setShowSubmitModal={setShowSubmitModal}
                handleResubmitReturnedQuote={handleResubmitReturnedQuote}
                handleSaveQuotePrices={handleSaveQuotePrices}
                handleExitReview={handleExitReview}
                handleCancelEdits={handleCancelEdits}
                setOdooOrderNumberInput={setOdooOrderNumberInput}
                setShowCompleteOdooModal={setShowCompleteOdooModal}
                setIsPreviewOpen={setIsPreviewOpen}
                handleApproveReviewQuote={handleApproveReviewQuote}
                setReassignTo={setReassignTo}
                setReassignNotes={setReassignNotes}
                setShowReassignModal={setShowReassignModal}
                handleReturnReviewQuote={handleReturnReviewQuote}
                isSupplyOnly={isSupplyOnly}
                attachedSealedUnit={attachedSealedUnit}
                onOpenAttachSealedUnitModal={() => setIsAttachModalOpen(true)}
                onRemoveAttachedSealedUnit={() => {
                  setAttachedSealedUnit(null);
                  toast.info('Detached sealed units from quote.');
                }}
                onSaveDraft={handleSaveDraft}
                onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
              />
            </div>
          </div>

          {/* Tab 2: Tax & Labour Calculator */}
          <div className={cn("mt-0 outline-none", activeTab !== 'tax' && "hidden")}>
            <TaxCalculatorTab
              key={taxCalcKey}
              windows={windows}
              onWindowsChange={setWindows}
              onCalculated={(totals) => {
                setTaxTotals(totals);
                if (totals?.isServiceOnly) {
                  setIsServiceOnly(true);
                  setIsSupplyOnly(false);
                  setHstRate(13);
                } else if (totals?.isSupplyOnly) {
                  setIsSupplyOnly(true);
                  setIsServiceOnly(false);
                }
              }}
              savedTaxTotals={reviewQuote?.taxTotals || null}
              readOnly={isReadOnly}
              onOpenPreview={() => setIsPreviewOpen(true)}
              isSupplyOnly={isSupplyOnly}
              isServiceOnly={isServiceOnly}
              onModeChange={handleModeChange}
              summarySlot={
                <QuoteSummaryCard
                  quoteResult={quoteResult}
                  summaryWindowGroups={summaryWindowGroups}
                  surchargeRate={surchargeRate}
                  taxTotals={taxTotals}
                  taxJC={taxJC}
                  taxMisc={taxMisc}
                  taxLabour={taxLabour}
                  customJC={customJC}
                  setCustomJC={setCustomJC}
                  customMisc={customMisc}
                  setCustomMisc={setCustomMisc}
                  customLabour={customLabour}
                  setCustomLabour={setCustomLabour}
                  includeJCInPromo={includeJCInPromo}
                  setIncludeJCInPromo={setIncludeJCInPromo}
                  includeMiscInPromo={includeMiscInPromo}
                  setIncludeMiscInPromo={setIncludeMiscInPromo}
                  includeLabourInPromo={includeLabourInPromo}
                  setIncludeLabourInPromo={setIncludeLabourInPromo}
                  wantsUpgrade={wantsUpgrade}
                  setWantsUpgrade={setWantsUpgrade}
                  upgrade={upgrade}
                  shownUpgrade={shownUpgrade}
                  beforeTaxDiscount={beforeTaxDiscount}
                  afterDiscount={afterDiscount}
                  hstRate={hstRate}
                  setHstRate={setHstRate}
                  total={total}
                  firstPayment={firstPayment}
                  secondPayment={secondPayment}
                  quoteNotes={quoteNotes}
                  setQuoteNotes={setQuoteNotes}
                  isReadOnly={isReadOnly}
                  user={user}
                  reviewQuote={reviewQuote}
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                  canEditApprovedQuote={canEditApprovedQuote}
                  canEditCurrentQuote={canEditCurrentQuote}
                  isReviewerOrAdmin={isReviewerOrAdmin}
                  reviewActionLoading={reviewActionLoading}
                  staffList={staffList}
                  clerkList={clerkList}
                  quoteNumber={quoteNumber}
                  customerName={customerName}
                  assignedReviewer={assignedReviewer}
                  setAssignedReviewer={setAssignedReviewer}
                  selectedOdooClerk={selectedOdooClerk}
                  setSelectedOdooClerk={setSelectedOdooClerk}
                  setShowSubmitModal={setShowSubmitModal}
                  handleResubmitReturnedQuote={handleResubmitReturnedQuote}
                  handleSaveQuotePrices={handleSaveQuotePrices}
                  handleExitReview={handleExitReview}
                  handleCancelEdits={handleCancelEdits}
                  setOdooOrderNumberInput={setOdooOrderNumberInput}
                  setShowCompleteOdooModal={setShowCompleteOdooModal}
                  setIsPreviewOpen={setIsPreviewOpen}
                  handleApproveReviewQuote={handleApproveReviewQuote}
                  setReassignTo={setReassignTo}
                  setReassignNotes={setReassignNotes}
                  setShowReassignModal={setShowReassignModal}
                  handleReturnReviewQuote={handleReturnReviewQuote}
                  isSupplyOnly={isSupplyOnly}
                  attachedSealedUnit={attachedSealedUnit}
                  onOpenAttachSealedUnitModal={() => setIsAttachModalOpen(true)}
                  onRemoveAttachedSealedUnit={() => {
                    setAttachedSealedUnit(null);
                    toast.info('Detached sealed units from quote.');
                  }}
                  onSaveDraft={handleSaveDraft}
                  onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
                />
              }
            />
          </div>

          {/* Tab 3: Quotes List & Bin */}
          <div className={cn("mt-0 outline-none", activeTab !== 'quotes' && "hidden")}>
            <QuotesTab
              currentUser={user}
              onOpenQuote={handleOpenQuoteFromTab}
              onQuotesCountChange={setPendingReviewCount}
              initialSubTab={quotesSubTab}
            />
          </div>
        </Tabs>
      </div>

      {/* Hidden Invoice Template for PDF print */}
      {!isPreviewOpen && (
        <QuoteInvoice
          customerName={customerName}
          quoteNumber={quoteNumber}
          windows={windows}
          taxTotals={taxTotals}
          quoteResult={quoteResult}
          activePromo={quoteResult && quoteResult.promoDiscount > 0 ? {
            name: availablePromos.find(p => p._id === activePromoId || (p as any).id === activePromoId)?.name || 'Custom Promo',
            discount: quoteResult.promoDiscount,
          } : null}
          basePrice={quoteResult?.base || 0}
          surcharge={quoteResult?.surcharge || 0}
          wantsUpgrade={wantsUpgrade}
          shownUpgrade={shownUpgrade}
          hstRate={hstRate}
          total={total}
          beforeTaxDiscount={beforeTaxDiscount}
          afterDiscount={afterDiscount}
          firstPayment={firstPayment}
          secondPayment={secondPayment}
          regionName={taxTotals?.regionName || taxTotals?.city}
          includeLabourInPromo={includeLabourInPromo}
          includeMiscInPromo={includeMiscInPromo}
          includeJCInPromo={includeJCInPromo}
          effectiveJC={effectiveJC}
          effectiveMisc={effectiveMisc}
          effectiveLabour={effectiveLabour}
          template={quoteTemplate}
          fontSize={quoteFontSize}
          spacing={quoteSpacing}
          quoteNotes={quoteNotes}
          preparedBy={reviewQuote?.preparedBy || user?.username || ''}
          attachedUpgrade={attachedUpgrade}
          attachedSealedUnit={attachedSealedUnit}
          isSupplyOnly={isSupplyOnly}
        />
      )}

      {/* Quote Preview Modal */}
      <QuotePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={quoteTemplate}
        onTemplateChange={setQuoteTemplate}
        fontSize={quoteFontSize}
        onFontSizeChange={setQuoteFontSize}
        spacing={quoteSpacing}
        onSpacingChange={setQuoteSpacing}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={isReadOnly ? undefined : setQuoteNotes}
        preparedBy={reviewQuote?.preparedBy || user?.username || ''}
        customerName={customerName}
        quoteNumber={quoteNumber}
        windows={windows}
        taxTotals={taxTotals}
        quoteResult={quoteResult}
        activePromo={quoteResult && quoteResult.promoDiscount > 0 ? {
          name: availablePromos.find(p => p._id === activePromoId || (p as any).id === activePromoId)?.name || 'Custom Promo',
          discount: quoteResult.promoDiscount,
        } : null}
        basePrice={quoteResult?.base || 0}
        surcharge={quoteResult?.surcharge || 0}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        hstRate={hstRate}
        total={total}
        beforeTaxDiscount={beforeTaxDiscount}
        afterDiscount={afterDiscount}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        regionName={taxTotals?.regionName || taxTotals?.city}
        includeLabourInPromo={includeLabourInPromo}
        includeMiscInPromo={includeMiscInPromo}
        includeJCInPromo={includeJCInPromo}
        effectiveJC={effectiveJC}
        effectiveMisc={effectiveMisc}
        effectiveLabour={effectiveLabour}
        attachedUpgrade={attachedUpgrade}
        attachedSealedUnit={attachedSealedUnit}
        isSupplyOnly={isSupplyOnly}
      />

      {/* Submit for Review / Direct Approve Modal */}
      <SubmitReviewModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        user={user}
        adminSubmitMode={adminSubmitMode}
        setAdminSubmitMode={setAdminSubmitMode}
        quoteNumber={quoteNumber}
        customerName={customerName}
        windowsCount={windows.filter(w => Number(w.base) > 0 || Number(w.qty) > 0).length}
        total={total}
        staffList={staffList}
        clerkList={clerkList}
        assignedReviewer={assignedReviewer}
        setAssignedReviewer={setAssignedReviewer}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        preparerNotes={preparerNotes}
        setPreparerNotes={setPreparerNotes}
        submittingQuote={submittingQuote}
        onSubmit={handleSubmitForReview}
      />

      {/* Workflow Dialogs (Reassign, Return, Exit Review for PDF) */}
      <WorkflowDialogs
        showReassignModal={showReassignModal}
        setShowReassignModal={setShowReassignModal}
        reviewQuote={reviewQuote}
        user={user}
        staffList={staffList}
        reassignTo={reassignTo}
        setReassignTo={setReassignTo}
        reassignNotes={reassignNotes}
        setReassignNotes={setReassignNotes}
        handleReassignQuote={handleReassignQuote}
        showReturnModal={showReturnModal}
        setShowReturnModal={setShowReturnModal}
        returnNotes={returnNotes}
        setReturnNotes={setReturnNotes}
        submitReturnReviewQuote={submitReturnReviewQuote}
        showExitReviewForPdfModal={showExitReviewForPdfModal}
        setShowExitReviewForPdfModal={setShowExitReviewForPdfModal}
        handleExitReviewAndImportPdf={handleExitReviewAndImportPdf}
        reviewActionLoading={reviewActionLoading}
      />

      {/* Odoo Action Modals (Approve & Assign Clerk, Confirm SO#) */}
      <OdooActionModals
        showApproveOdooModal={showApproveOdooModal}
        setShowApproveOdooModal={setShowApproveOdooModal}
        showCompleteOdooModal={showCompleteOdooModal}
        setShowCompleteOdooModal={setShowCompleteOdooModal}
        reviewQuote={reviewQuote}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        odooOrderNumberInput={odooOrderNumberInput}
        setOdooOrderNumberInput={setOdooOrderNumberInput}
        reviewActionLoading={reviewActionLoading}
        clerkList={clerkList}
        staffList={staffList}
        confirmApproveReviewQuote={confirmApproveReviewQuote}
        handleCompleteOdooEntry={handleCompleteOdooEntry}
      />

      {/* Phase 3: Dual PDF Upgrade & Option Comparison Modal */}
      <QuoteComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        currentWindows={baseSnapshotA ? baseSnapshotA.windows : (appliedOption === 'B' && baseWindowsA ? baseWindowsA : windows)}
        customerName={baseSnapshotA ? baseSnapshotA.customerName : customerName}
        quoteNumber={baseSnapshotA ? baseSnapshotA.quoteNumber : quoteNumber}
        surchargeRate={baseSnapshotA ? baseSnapshotA.surchargeRate : surchargeRate}
        isSupplyOnly={baseSnapshotA ? baseSnapshotA.isSupplyOnly : isSupplyOnly}
        supplyJambId={baseSnapshotA ? baseSnapshotA.supplyJambId : (isSupplyOnly ? supplyJambId : (taxTotals?.selectedJamb?.id || taxTotals?.jambId || 'none'))}
        supplyJambName={baseSnapshotA ? baseSnapshotA.supplyJambName : (isSupplyOnly ? supplyJambName : (taxTotals?.selectedJamb?.name || taxTotals?.jambName || ''))}
        supplyJambRate={baseSnapshotA ? baseSnapshotA.supplyJambRate : (isSupplyOnly ? supplyJambRate : String(taxTotals?.selectedJamb?.rate || taxTotals?.jambRate || ''))}
        supplyCasingId={baseSnapshotA ? baseSnapshotA.supplyCasingId : (isSupplyOnly ? supplyCasingId : (taxTotals?.selectedCasing?.id || taxTotals?.casingId || 'none'))}
        supplyCasingName={baseSnapshotA ? baseSnapshotA.supplyCasingName : (isSupplyOnly ? supplyCasingName : (taxTotals?.selectedCasing?.name || taxTotals?.casingName || ''))}
        supplyCasingRate={baseSnapshotA ? baseSnapshotA.supplyCasingRate : (isSupplyOnly ? supplyCasingRate : String(taxTotals?.selectedCasing?.rate || taxTotals?.casingRate || ''))}
        effectiveJC={baseSnapshotA ? (baseSnapshotA.taxTotals?.jcLabourCents ?? (baseSnapshotA.customJC ? toCents(baseSnapshotA.customJC) : 0)) : effectiveJC}
        effectiveMisc={baseSnapshotA ? (baseSnapshotA.taxTotals?.miscLabourCents ?? (baseSnapshotA.customMisc ? toCents(baseSnapshotA.customMisc) : 0)) : effectiveMisc}
        effectiveLabour={baseSnapshotA ? (baseSnapshotA.taxTotals?.standardLabourCents ?? (baseSnapshotA.customLabour ? toCents(baseSnapshotA.customLabour) : 0)) : effectiveLabour}
        availablePromos={availablePromos}
        activePromoId={baseSnapshotA ? baseSnapshotA.activePromoId : activePromoId}
        hstRate={baseSnapshotA ? baseSnapshotA.hstRate : hstRate}
        quoteResultA={baseSnapshotA ? baseSnapshotA.quoteResult : quoteResult}
        afterDiscountA={baseSnapshotA ? baseSnapshotA.afterDiscount : afterDiscount}
        totalA={baseSnapshotA ? baseSnapshotA.total : total}
        firstPaymentA={baseSnapshotA ? baseSnapshotA.firstPayment : firstPayment}
        secondPaymentA={baseSnapshotA ? baseSnapshotA.secondPayment : secondPayment}
        appliedOption={appliedOption}
        isComparisonStaging={isComparisonStaging}
        stagedOptionB={
          isComparisonStaging && baseSnapshotA
            ? {
                windows,
                quoteResult,
                afterDiscount,
                total,
                firstPayment,
                secondPayment,
                effectiveJC: isSupplyOnly ? (customJC ? toCents(customJC) : 0) : effectiveJC,
                effectiveMisc: isSupplyOnly ? 0 : effectiveMisc,
                effectiveLabour: isSupplyOnly ? 0 : effectiveLabour,
                activePromoId,
                supplyJambId: isSupplyOnly ? supplyJambId : (taxTotals?.selectedJamb?.id || taxTotals?.jambId),
                supplyJambName: isSupplyOnly ? supplyJambName : (taxTotals?.selectedJamb?.name || taxTotals?.jambName),
                supplyJambRate: isSupplyOnly ? supplyJambRate : String(taxTotals?.selectedJamb?.rate || taxTotals?.jambRate || ''),
                supplyCasingId: isSupplyOnly ? supplyCasingId : (taxTotals?.selectedCasing?.id || taxTotals?.casingId),
                supplyCasingName: isSupplyOnly ? supplyCasingName : (taxTotals?.selectedCasing?.name || taxTotals?.casingName),
                supplyCasingRate: isSupplyOnly ? supplyCasingRate : String(taxTotals?.selectedCasing?.rate || taxTotals?.casingRate || ''),
                customerName,
                quoteNumber,
              }
            : undefined
        }
        onApplyOption={handleApplyOption}
        onApplyAndCustomize={handleApplyAndCustomize}
        onKeepOptionB={handleKeepOptionB}
        attachedUpgrade={attachedUpgrade}
        onAttachUpgrade={setAttachedUpgrade}
      />

      <SavedQuotesModal
        isOpen={isSavedQuotesOpen}
        onClose={() => setIsSavedQuotesOpen(false)}
        defaultType="window"
        onLoadQuote={loadDraftIntoWorkspace}
      />

      <AttachSealedUnitModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        attachedSealedUnit={attachedSealedUnit}
        onAttach={(su) => setAttachedSealedUnit(su)}
        onDetach={() => setAttachedSealedUnit(null)}
      />
    </div>
  );
}

export default PromoCalculator;
