'use client';

import React from 'react';
import { toast } from 'sonner';

export interface CalculatorPropsContext {
  base: any;
  pricing: any;
  windowsContext: any;
  supply: any;
  comparison: any;
  drafts: any;
  review: any;
  customPricing: any;
}

export function buildHeaderToolbarProps(ctx: CalculatorPropsContext) {
  const { base, pricing, drafts, comparison } = ctx;
  return {
    activeTab: base.activeTab,
    isComparisonStaging: comparison.isComparisonStaging,
    hasCompareOptions: pricing.compareOptions.length > 0,
    hasAttachedQuotes: Boolean(base.attachedSealedUnit || base.attachedDoorQuote),
    lastSavedAt: drafts.lastSavedAt,
    savedDraftsCount: drafts.savedDraftsCount,
    onOpenCompareModal: () => base.setIsCompareModalOpen(true),
    onRevertToBase: comparison.handleRevertToBase,
    onKeepOptionB: comparison.handleKeepOptionB,
    onOpenAttachModal: () => base.setIsAttachModalOpen(true),
    onSaveDraft: drafts.handleSaveDraft,
    onOpenSavedQuotes: () => drafts.setIsSavedQuotesOpen(true),
  };
}

export function buildWindowConfigProps(ctx: CalculatorPropsContext) {
  const { base, pricing, windowsContext, supply, drafts, comparison, review } = ctx;
  return {
    windows: windowsContext.windows,
    surchargeRate: base.surchargeRate,
    quoteNumber: base.quoteNumber,
    setQuoteNumber: base.setQuoteNumber,
    customerName: base.customerName,
    setCustomerName: base.setCustomerName,
    fileInputRef: windowsContext.fileInputRef,
    handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) =>
      windowsContext.handlePdfUpload(e, {
        onSetCustomerName: base.setCustomerName,
        onSetQuoteNumber: base.setQuoteNumber,
        onResetCalculator: () => {
          pricing.resetPricingOverrides();
          base.setAttachedSealedUnit(null);
          base.setAttachedDoorQuote(null);
          base.setAttachedUpgrade(null);
          pricing.setWantsUpgrade(false);
          supply.resetSupplyMode();
          drafts.resetDraftState();
        },
      }),
    handlePdfImportClick: review.handlePdfImportClick,
    isReadOnly: review.isReadOnly,
    onResetQuote: () => base.setShowResetModal(true),
    handleWindowChange: windowsContext.handleWindowChange,
    handleRemoveWindow: (id: string) => windowsContext.handleRemoveWindow(id, () => pricing.setLockedPromoId(null)),
    handleAddWindow: () => windowsContext.handleAddWindow(() => pricing.setLockedPromoId(null)),
    windowEndRef: windowsContext.windowEndRef,
    isSupplyOnly: supply.isSupplyOnly,
    setIsSupplyOnly: supply.handleToggleSupplyOnly,
    onOpenCompareModal: () => base.setIsCompareModalOpen(true),
    attachedUpgrade: base.attachedUpgrade,
    onRemoveAttachedUpgrade: () => {
      base.setAttachedUpgrade(null);
      toast.info('Removed optional upgrade offer from quote.');
    },
    attachedSealedUnit: base.attachedSealedUnit,
    attachedDoorQuote: base.attachedDoorQuote,
    onOpenAttachSealedUnitModal: () => base.setIsAttachModalOpen(true),
    onRemoveAttachedSealedUnit: () => {
      base.setAttachedSealedUnit(null);
      toast.info('Detached sealed units from quote.');
    },
    onRemoveAttachedDoorQuote: () => {
      base.setAttachedDoorQuote(null);
      toast.info('Detached door quote from quote.');
    },
    onSaveDraft: drafts.handleSaveDraft,
    onOpenSavedQuotes: () => drafts.setIsSavedQuotesOpen(true),
    savedDraftsCount: drafts.savedDraftsCount,
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
    onSupplyJCCalculated: supply.handleSupplyJCCalculated,
    compareOptions: pricing.compareOptions,
    activePromoId: pricing.activePromoId,
    setActivePromoId: pricing.setActivePromoId,
    setLockedPromoId: pricing.setLockedPromoId,
  };
}

export function buildSummaryProps(ctx: CalculatorPropsContext) {
  const { base, pricing, windowsContext, supply, drafts, review, customPricing } = ctx;
  return {
    quoteResult: pricing.quoteResult,
    summaryWindowGroups: windowsContext.summaryWindowGroups,
    surchargeRate: base.surchargeRate,
    taxTotals: pricing.taxTotals,
    taxJC: customPricing.taxJC,
    taxMisc: customPricing.taxMisc,
    taxLabour: customPricing.taxLabour,
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
    wantsUpgrade: pricing.wantsUpgrade,
    setWantsUpgrade: pricing.setWantsUpgrade,
    upgrade: customPricing.upgrade,
    shownUpgrade: customPricing.shownUpgrade,
    beforeTaxDiscount: customPricing.beforeTaxDiscount,
    afterDiscount: customPricing.afterDiscount,
    hstRate: customPricing.hstRate,
    setHstRate: pricing.setHstRate,
    total: customPricing.total,
    firstPayment: customPricing.firstPayment,
    secondPayment: customPricing.secondPayment,
    quoteNotes: base.quoteNotes,
    setQuoteNotes: base.setQuoteNotes,
    isReadOnly: review.isReadOnly,
    user: base.user,
    reviewQuote: review.reviewQuote,
    isEditMode: review.isEditMode,
    setIsEditMode: review.setIsEditMode,
    canEditApprovedQuote: review.canEditApprovedQuote,
    canEditCurrentQuote: review.canEditCurrentQuote,
    isReviewerOrAdmin: review.isReviewerOrAdmin,
    reviewActionLoading: review.reviewActionLoading,
    staffList: review.staffList,
    clerkList: review.clerkList,
    quoteNumber: base.quoteNumber,
    customerName: base.customerName,
    assignedReviewer: review.assignedReviewer,
    setAssignedReviewer: review.setAssignedReviewer,
    selectedOdooClerk: review.selectedOdooClerk,
    setSelectedOdooClerk: review.setSelectedOdooClerk,
    setShowSubmitModal: review.setShowSubmitModal,
    handleResubmitReturnedQuote: review.handleResubmitReturnedQuote,
    handleSaveQuotePrices: review.handleSaveQuotePrices,
    handleExitReview: review.handleExitReview,
    handleCancelEdits: review.handleCancelEdits,
    setOdooOrderNumberInput: review.setOdooOrderNumberInput,
    setShowCompleteOdooModal: review.setShowCompleteOdooModal,
    setIsPreviewOpen: base.setIsPreviewOpen,
    handleApproveReviewQuote: review.handleApproveReviewQuote,
    setReassignTo: review.setReassignTo,
    setReassignNotes: review.setReassignNotes,
    setShowReassignModal: review.setShowReassignModal,
    handleReturnReviewQuote: review.handleReturnReviewQuote,
    isSupplyOnly: supply.isSupplyOnly,
    setIsSupplyOnly: supply.handleToggleSupplyOnly,
    attachedSealedUnit: base.attachedSealedUnit,
    attachedDoorQuote: base.attachedDoorQuote,
    attachedUpgrade: base.attachedUpgrade,
    onOpenAttachSealedUnitModal: () => base.setIsAttachModalOpen(true),
    onRemoveAttachedSealedUnit: () => {
      base.setAttachedSealedUnit(null);
      toast.info('Detached sealed units from quote.');
    },
    onRemoveAttachedDoorQuote: () => {
      base.setAttachedDoorQuote(null);
      toast.info('Detached door quote from quote.');
    },
    onRemoveAttachedUpgrade: () => {
      base.setAttachedUpgrade(null);
      toast.info('Detached upgrade option from quote.');
    },
    onSaveDraft: drafts.handleSaveDraft,
    onOpenSavedQuotes: () => drafts.setIsSavedQuotesOpen(true),
  };
}

