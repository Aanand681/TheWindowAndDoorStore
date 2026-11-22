"use client"

import React from "react"
import {
  WorkflowDialogsWrapper,
  OdooActionModalsWrapper,
} from "@/components/calculator/modals"

export interface ReviewActionDialogsProps {
  reviewQuote: any
  reviewActions: any
  user: any
  staffList: any[]
  clerkList: any[]
  showExitReviewForPdfModal?: boolean
  setShowExitReviewForPdfModal?: (show: boolean) => void
  handleExitReviewAndImportPdf?: () => void
}

export function ReviewActionDialogs({
  reviewQuote,
  reviewActions,
  user,
  staffList,
  clerkList,
  showExitReviewForPdfModal = false,
  setShowExitReviewForPdfModal = () => {},
  handleExitReviewAndImportPdf = () => {},
}: ReviewActionDialogsProps) {
  if (!reviewActions) return null

  return (
    <>
      <WorkflowDialogsWrapper
        showReassignModal={reviewActions.showReassignModal}
        setShowReassignModal={reviewActions.setShowReassignModal}
        reviewQuote={reviewQuote}
        user={user}
        staffList={staffList}
        reassignTo={reviewActions.reassignTo}
        setReassignTo={reviewActions.setReassignTo}
        reassignNotes={reviewActions.reassignNotes}
        setReassignNotes={reviewActions.setReassignNotes}
        handleReassignQuote={reviewActions.handleReassignQuote}
        showReturnModal={reviewActions.showReturnModal}
        setShowReturnModal={reviewActions.setShowReturnModal}
        returnNotes={reviewActions.returnNotes}
        setReturnNotes={reviewActions.setReturnNotes}
        submitReturnReviewQuote={reviewActions.submitReturnReviewQuote}
        showExitReviewForPdfModal={showExitReviewForPdfModal}
        setShowExitReviewForPdfModal={setShowExitReviewForPdfModal}
        handleExitReviewAndImportPdf={handleExitReviewAndImportPdf}
        reviewActionLoading={reviewActions.reviewActionLoading}
      />

      <OdooActionModalsWrapper
        showApproveOdooModal={reviewActions.showApproveOdooModal}
        setShowApproveOdooModal={reviewActions.setShowApproveOdooModal}
        showCompleteOdooModal={reviewActions.showCompleteOdooModal}
        setShowCompleteOdooModal={reviewActions.setShowCompleteOdooModal}
        reviewQuote={reviewQuote}
        selectedOdooClerk={reviewActions.selectedOdooClerk}
        setSelectedOdooClerk={reviewActions.setSelectedOdooClerk}
        odooOrderNumberInput={reviewActions.odooOrderNumberInput}
        setOdooOrderNumberInput={reviewActions.setOdooOrderNumberInput}
        reviewActionLoading={reviewActions.reviewActionLoading}
        clerkList={clerkList}
        staffList={staffList}
        confirmApproveReviewQuote={reviewActions.confirmApproveReviewQuote}
        handleCompleteOdooEntry={reviewActions.handleCompleteOdooEntry}
      />
    </>
  )
}
