export interface BuildDoorWorkflowPropsParams {
  reviewLoader: any
  reviewActions: any
  user: any
  staffList: any[]
  setShowPreviewModal: (show: boolean) => void
}

export function buildDoorReviewWorkflowProps({
  reviewLoader,
  reviewActions,
  user,
  staffList,
  setShowPreviewModal,
}: BuildDoorWorkflowPropsParams) {
  return {
    reviewQuote: reviewLoader.reviewQuote,
    activeTab: "door" as const,
    isEditMode: reviewLoader.isEditMode,
    setIsEditMode: reviewLoader.setIsEditMode,
    canEditCurrentQuote: reviewLoader.perms.canEditCurrentQuote,
    isReviewerOrAdmin: reviewLoader.perms.isReviewerOrAdmin,
    canApprove: reviewLoader.perms.canApprove,
    isAssignedReviewer: reviewLoader.perms.isAssignedReviewer,
    isOdooClerk: reviewLoader.perms.isOdooClerk,
    user,
    reviewActionLoading: reviewActions.reviewActionLoading,
    handleSaveQuotePrices: reviewActions.handleSaveQuotePrices,
    handleCancelEdits: reviewLoader.handleCancelEdits,
    handleResubmitReturnedQuote: reviewActions.handleResubmitReturnedQuote,
    handleExitReview: reviewLoader.handleExitReview,
    setIsPreviewOpen: setShowPreviewModal,
    setOdooOrderNumberInput: reviewActions.setOdooOrderNumberInput,
    setShowCompleteOdooModal: reviewActions.setShowCompleteOdooModal,
    staffList,
    setReassignTo: reviewActions.setReassignTo,
    setReassignNotes: reviewActions.setReassignNotes,
    setShowReassignModal: reviewActions.setShowReassignModal,
    handleReturnReviewQuote: reviewActions.handleReturnReviewQuote,
    handleApproveReviewQuote: reviewActions.handleApproveReviewQuote,
  }
}
