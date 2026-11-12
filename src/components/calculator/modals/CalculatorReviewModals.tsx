"use client"

import React from "react"
import {
  SubmitReviewModalWrapper,
  WorkflowDialogsWrapper,
  OdooActionModalsWrapper,
} from "./index"
import { CalculatorReviewModalsProps } from "./types"

export function CalculatorReviewModals({
  showSubmitModal,
  setShowSubmitModal,
  user,
  adminSubmitMode,
  setAdminSubmitMode,
  quoteNumber,
  customerName,
  windows,
  total,
  staffList,
  clerkList,
  assignedReviewer,
  setAssignedReviewer,
  selectedOdooClerk,
  setSelectedOdooClerk,
  preparerNotes,
  setPreparerNotes,
  submittingQuote,
  handleSubmitForReview,
  showReassignModal,
  setShowReassignModal,
  reviewQuote,
  reassignTo,
  setReassignTo,
  reassignNotes,
  setReassignNotes,
  handleReassignQuote,
  showReturnModal,
  setShowReturnModal,
  returnNotes,
  setReturnNotes,
  submitReturnReviewQuote,
  showExitReviewForPdfModal,
  setShowExitReviewForPdfModal,
  handleExitReviewAndImportPdf,
  reviewActionLoading,
  showApproveOdooModal,
  setShowApproveOdooModal,
  showCompleteOdooModal,
  setShowCompleteOdooModal,
  odooOrderNumberInput,
  setOdooOrderNumberInput,
  confirmApproveReviewQuote,
  handleCompleteOdooEntry,
}: CalculatorReviewModalsProps) {
  const validWindows = windows.filter(
    (w) => Number(w.base) > 0 || Number(w.qty) > 0
  )
  const totalWindowUnits = validWindows.reduce(
    (sum, w) => sum + Math.max(1, Number(w.qty) || 1),
    0
  )
  const windowLineCount = validWindows.length

  return (
    <>
      <SubmitReviewModalWrapper
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        user={user}
        adminSubmitMode={adminSubmitMode}
        setAdminSubmitMode={setAdminSubmitMode}
        quoteNumber={quoteNumber}
        customerName={customerName}
        windowsCount={totalWindowUnits}
        totalUnits={totalWindowUnits}
        lineCount={windowLineCount}
        quoteType="window"
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

      <WorkflowDialogsWrapper
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

      <OdooActionModalsWrapper
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
    </>
  )
}
