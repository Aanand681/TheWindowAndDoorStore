"use client"

export interface WorkflowInvoiceContext {
  base: any
  pricing: any
  review: any
  windowsContext: any
  supply: any
  customPricing: {
    customJC: string
    customMisc: string
    customLabour: string
    includeJCInPromo: boolean
    includeMiscInPromo: boolean
    includeLabourInPromo: boolean
    effectiveJC: number
    effectiveMisc: number
    effectiveLabour: number
    taxJC: number
    taxMisc: number
    taxLabour: number
    beforeTaxDiscount: number
    afterDiscount: number
    upgrade: any
    shownUpgrade: any
    total: number
    firstPayment: number
    secondPayment: number
    hstRate: number
  }
}

export function buildReviewWorkflowProps(ctx: WorkflowInvoiceContext) {
  const { base, review } = ctx
  return {
    reviewQuote: review.reviewQuote,
    activeTab: base.activeTab,
    isEditMode: review.isEditMode,
    canEditCurrentQuote: review.canEditCurrentQuote,
    isReviewerOrAdmin: review.isReviewerOrAdmin,
    isOdooClerk: review.isOdooClerk,
    user: base.user,
    reviewActionLoading: review.reviewActionLoading,
    setIsEditMode: review.setIsEditMode,
    handleSaveQuotePrices: review.handleSaveQuotePrices,
    handleCancelEdits: review.handleCancelEdits,
    handleResubmitReturnedQuote: review.handleResubmitReturnedQuote,
    handleExitReview: review.handleExitReview,
    setIsPreviewOpen: base.setIsPreviewOpen,
    setOdooOrderNumberInput: review.setOdooOrderNumberInput,
    setShowCompleteOdooModal: review.setShowCompleteOdooModal,
    staffList: review.staffList,
    setReassignTo: review.setReassignTo,
    setReassignNotes: review.setReassignNotes,
    setShowReassignModal: review.setShowReassignModal,
    handleReturnReviewQuote: review.handleReturnReviewQuote,
    handleApproveReviewQuote: review.handleApproveReviewQuote,
  }
}

export function buildPrintInvoiceProps(ctx: WorkflowInvoiceContext) {
  const { base, pricing, review, windowsContext, supply, customPricing } = ctx
  return {
    isPreviewOpen: base.isPreviewOpen,
    customerName: base.customerName,
    quoteNumber: base.quoteNumber,
    windows: windowsContext.windows,
    taxTotals: pricing.taxTotals,
    quoteResult: pricing.quoteResult,
    availablePromos: pricing.availablePromos,
    activePromoId: pricing.activePromoId,
    wantsUpgrade: pricing.wantsUpgrade,
    shownUpgrade: customPricing.shownUpgrade,
    hstRate: customPricing.hstRate,
    total: customPricing.total,
    beforeTaxDiscount: customPricing.beforeTaxDiscount,
    afterDiscount: customPricing.afterDiscount,
    firstPayment: customPricing.firstPayment,
    secondPayment: customPricing.secondPayment,
    includeLabourInPromo: customPricing.includeLabourInPromo,
    includeMiscInPromo: customPricing.includeMiscInPromo,
    includeJCInPromo: customPricing.includeJCInPromo,
    effectiveJC: customPricing.effectiveJC,
    effectiveMisc: customPricing.effectiveMisc,
    effectiveLabour: customPricing.effectiveLabour,
    template: base.quoteTemplate,
    fontSize: base.quoteFontSize,
    spacing: base.quoteSpacing,
    quoteNotes: base.quoteNotes,
    preparedBy: review.reviewQuote?.preparedBy || base.user?.username || "",
    attachedUpgrade: base.attachedUpgrade,
    attachedSealedUnit: base.attachedSealedUnit,
    attachedDoorQuote: base.attachedDoorQuote,
    isSupplyOnly: supply.isSupplyOnly,
  }
}
