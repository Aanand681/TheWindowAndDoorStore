"use client"

import React from "react"
import { SubmitReviewModalWrapper } from "./SubmitReviewModalWrapper"
import { ReviewActionDialogs } from "./ReviewActionDialogs"
import { CalculatorReviewModalsProps } from "./types"

export function CalculatorReviewModals(props: CalculatorReviewModalsProps) {
  const {
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
    reviewQuote,
    reviewActions,
  } = props

  const validWindows = (windows || []).filter(
    (w) => Number(w.base) > 0 || Number(w.qty) > 0
  )
  const totalWindowUnits = validWindows.reduce(
    (sum, w) => sum + Math.max(1, Number(w.qty) || 1),
    0
  )
  const windowLineCount = validWindows.length

  const activeReviewActions = reviewActions || props

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

      <ReviewActionDialogs
        reviewQuote={reviewQuote}
        reviewActions={activeReviewActions}
        user={user}
        staffList={staffList}
        clerkList={clerkList}
        showExitReviewForPdfModal={props.showExitReviewForPdfModal}
        setShowExitReviewForPdfModal={props.setShowExitReviewForPdfModal}
        handleExitReviewAndImportPdf={props.handleExitReviewAndImportPdf}
      />
    </>
  )
}
