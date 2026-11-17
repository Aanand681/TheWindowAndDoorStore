"use client"

import React from "react"
import { ReviewWorkflowStatusInfo } from "./workflow/ReviewWorkflowStatusInfo"
import { ReviewWorkflowActionButtons } from "./workflow/ReviewWorkflowActionButtons"

export interface ReviewWorkflowBarProps {
  reviewQuote: any
  activeTab: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  canEditCurrentQuote: boolean
  isReviewerOrAdmin: boolean
  canApprove?: boolean
  isOdooClerk: boolean
  user: any
  reviewActionLoading: boolean
  handleSaveQuotePrices: () => void
  handleCancelEdits: () => void
  handleResubmitReturnedQuote: () => void
  handleExitReview: () => void
  setIsPreviewOpen: (val: boolean) => void
  setOdooOrderNumberInput: (val: string) => void
  setShowCompleteOdooModal: (val: boolean) => void
  staffList: any[]
  setReassignTo: (val: string) => void
  setReassignNotes: (val: string) => void
  setShowReassignModal: (val: boolean) => void
  handleReturnReviewQuote: () => void
  handleApproveReviewQuote: () => void
}

export function ReviewWorkflowBar({
  reviewQuote,
  activeTab,
  isEditMode,
  setIsEditMode,
  canEditCurrentQuote,
  isReviewerOrAdmin,
  canApprove = false,
  isOdooClerk,
  user,
  reviewActionLoading,
  handleSaveQuotePrices,
  handleCancelEdits,
  handleResubmitReturnedQuote,
  handleExitReview,
  setIsPreviewOpen,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  staffList,
  setReassignTo,
  setReassignNotes,
  setShowReassignModal,
  handleReturnReviewQuote,
  handleApproveReviewQuote,
}: ReviewWorkflowBarProps) {
  if (!reviewQuote || activeTab === "quotes") return null

  return (
    <div
      className={`flex animate-in flex-col items-start justify-between gap-4 rounded-2xl border-2 p-4 shadow-xl fade-in slide-in-from-top-2 md:flex-row md:items-center ${
        reviewQuote.status === "APPROVED"
          ? "border-emerald-500/50 bg-emerald-500/15"
          : reviewQuote.status === "MODIFIED"
            ? "border-blue-500/50 bg-blue-500/15"
            : reviewQuote.status === "RETURNED"
              ? "border-destructive/50 bg-destructive/15"
              : "border-amber-500/50 bg-amber-500/15"
      }`}
    >
      <ReviewWorkflowStatusInfo
        reviewQuote={reviewQuote}
        isEditMode={isEditMode}
        isReviewerOrAdmin={isReviewerOrAdmin}
        isOdooClerk={isOdooClerk}
        user={user}
      />
      <ReviewWorkflowActionButtons
        reviewQuote={reviewQuote}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        canEditCurrentQuote={canEditCurrentQuote}
        isReviewerOrAdmin={isReviewerOrAdmin}
        canApprove={canApprove}
        isOdooClerk={isOdooClerk}
        reviewActionLoading={reviewActionLoading}
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
    </div>
  )
}

export default ReviewWorkflowBar
