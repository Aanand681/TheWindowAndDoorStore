"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Share2, Save, AlertCircle, Edit3 } from "lucide-react"

export interface SummaryPendingReviewButtonsProps {
  isReviewerOrAdmin: boolean
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  canEditCurrentQuote: boolean
  reviewActionLoading: boolean
  user: any
  staffList: any[]
  setReassignTo: (val: string) => void
  setReassignNotes: (val: string) => void
  setShowReassignModal: (val: boolean) => void
  handleApproveReviewQuote: () => void
  handleSaveQuotePrices: () => void
  handleReturnReviewQuote: () => void
  handleCancelEdits: () => void
  handleExitReview: () => void
}

export function SummaryPendingReviewButtons({
  isReviewerOrAdmin,
  isEditMode,
  setIsEditMode,
  canEditCurrentQuote,
  reviewActionLoading,
  user,
  staffList,
  setReassignTo,
  setReassignNotes,
  setShowReassignModal,
  handleApproveReviewQuote,
  handleSaveQuotePrices,
  handleReturnReviewQuote,
  handleCancelEdits,
  handleExitReview,
}: SummaryPendingReviewButtonsProps) {
  if (isReviewerOrAdmin) {
    return (
      <>
        <Button
          variant="default"
          className="h-11 w-full cursor-pointer bg-emerald-600 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-700"
          onClick={handleApproveReviewQuote}
          disabled={reviewActionLoading}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {reviewActionLoading ? "Approving..." : "Approve & Save Changes"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const other = staffList.find(
              (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
            )
            setReassignTo(other ? other.username : "")
            setReassignNotes("")
            setShowReassignModal(true)
          }}
          disabled={reviewActionLoading}
          className="h-10 w-full cursor-pointer border-primary/40 text-xs font-semibold text-primary shadow-sm hover:bg-primary/10"
        >
          <Share2 className="mr-1.5 h-4 w-4" />
          Forward / Reassign Quote
        </Button>
        <Button
          variant="outline"
          className="h-10 w-full cursor-pointer border-emerald-500/40 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          onClick={handleSaveQuotePrices}
          disabled={reviewActionLoading}
        >
          <Save className="mr-2 h-4 w-4" /> Save Updated Prices (No Status
          Change)
        </Button>
        <Button
          variant="outline"
          className="h-10 w-full cursor-pointer border-destructive/30 text-xs font-semibold text-destructive hover:bg-destructive/10"
          onClick={handleReturnReviewQuote}
          disabled={reviewActionLoading}
        >
          <AlertCircle className="mr-2 h-4 w-4" /> Return with Note
        </Button>
      </>
    )
  }

  return (
    <div className="space-y-2">
      {isEditMode ? (
        <>
          <Button
            variant="default"
            className="h-11 w-full cursor-pointer bg-amber-600 text-sm font-bold text-white shadow-md transition-colors hover:bg-amber-700"
            onClick={handleSaveQuotePrices}
            disabled={reviewActionLoading}
          >
            <Save className="mr-2 h-4 w-4" /> Save Revisions
          </Button>
          <Button
            variant="outline"
            className="h-10 w-full text-xs font-semibold text-muted-foreground hover:bg-muted"
            onClick={handleCancelEdits}
          >
            Cancel Edits
          </Button>
        </>
      ) : (
        <>
          {canEditCurrentQuote && (
            <Button
              variant="outline"
              className="h-10 w-full cursor-pointer border-primary/50 text-xs font-bold text-primary hover:bg-primary/10"
              onClick={() => setIsEditMode(true)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Edit Quote Details
            </Button>
          )}
          <Button
            variant="outline"
            className="h-10 w-full text-xs font-semibold text-muted-foreground hover:bg-muted"
            onClick={handleExitReview}
          >
            Exit Review Mode
          </Button>
        </>
      )}
    </div>
  )
}
