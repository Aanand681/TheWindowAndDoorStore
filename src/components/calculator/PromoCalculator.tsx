'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Check } from "lucide-react";
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
  const [isComparisonStaging, setIsComparisonStaging] = useState<boolean>(false);
  const [baseSnapshotA, setBaseSnapshotA] = useState<any | null>(null);
  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>('modern');
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5);
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0);

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

  // Supply Only: State
  const [isSupplyOnly, setIsSupplyOnly] = useState<boolean>(false);
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
    setIsComparisonStaging(false);
    setBaseSnapshotA(null);
    resetPricingOverrides();
  };

  const handleToggleSupplyOnly = (isSupply: boolean) => {
    setIsSupplyOnly(isSupply);
    if (isSupply) {
      setTaxTotals((prev: any) => ({
        ...prev,
        isSupplyOnly: true,
        standardLabourCents: 0,
        miscLabourCents: 0,
        finalLabour: 0,
        finalMisc: 0,
      }));
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

    // Reviewer and Clerk lists
    Promise.all([
      fetch(`/api/users?reviewersOnly=true&t=${Date.now()}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch(`/api/users?assignees=true&t=${Date.now()}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    ])
      .then(([reviewers, assignees]) => {
        if (Array.isArray(reviewers)) {
          const eligible = reviewers.filter((d: any) =>
            d.role !== 'SUPERADMIN' && d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
          );
          setStaffList(eligible);
          if (eligible.length > 0) {
            setAssignedReviewer(eligible[0].username);
            setReassignTo(eligible[0].username);
          }
        }
        if (Array.isArray(assignees)) {
          const eligible = assignees.filter((d: any) =>
            d.role !== 'SUPERADMIN' && d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
          );
          setClerkList(eligible);
          const defaultClerk = eligible.find((c: any) => c.department === 'CLERK') || eligible[0];
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
              />
            </div>
          </div>

          {/* Tab 2: Tax & Labour Calculator */}
          <div className={cn("mt-0 outline-none", activeTab !== 'tax' && "hidden")}>
            <TaxCalculatorTab
              key={taxCalcKey}
              windows={windows}
              onWindowsChange={setWindows}
              onCalculated={setTaxTotals}
              savedTaxTotals={reviewQuote?.taxTotals || null}
              readOnly={isReadOnly}
              onOpenPreview={() => setIsPreviewOpen(true)}
              isSupplyOnly={isSupplyOnly}
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
        onApplyOption={handleApplyOption}
        onApplyAndCustomize={handleApplyAndCustomize}
        onKeepOptionB={handleKeepOptionB}
        attachedUpgrade={attachedUpgrade}
        onAttachUpgrade={setAttachedUpgrade}
      />
    </div>
  );
}

export default PromoCalculator;
