'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { toCents, DBPromo } from '@/lib/promo-logic';
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
  } = useCalculatorPricing({ surchargeRate });

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
    }
  }, [taxTotals?._quoteId]);

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

  const { data: settingsData } = useQuery<{ surchargeRate?: number }>({
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
    if (settingsData && settingsData.surchargeRate !== undefined) {
      setSurchargeRate(settingsData.surchargeRate);
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
        <div className="max-w-[1650px] mx-auto px-4 sm:px-6 pt-4">
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

        {/* Tab Controls */}
        <Tabs value={activeTab} onValueChange={(val) => switchTab(val as any)} className="w-full">
          {activeTab !== 'quotes' && (
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-muted p-1 rounded-full border border-border/50 shadow-sm animate-in fade-in duration-200">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
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
    </div>
  );
}

export default PromoCalculator;
