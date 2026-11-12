"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckSquare,
  Save,
  Send,
  Printer,
} from "lucide-react"

export interface ReviewWorkflowActionButtonsProps {
  reviewQuote: any
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  canEditCurrentQuote: boolean
  isReviewerOrAdmin: boolean
  isOdooClerk: boolean
  reviewActionLoading: boolean
  handleSaveQuotePrices: () => void
  handleCancelEdits: () => void
  handleResubmitReturnedQuote: () => void
  handleExitReview: () => void
  setIsPreviewOpen: (val: boolean) => void
  setOdooOrderNumberInput: (val: string) => void
  setShowCompleteOdooModal: (val: boolean) => void
  handleReturnReviewQuote: () => void
  handleApproveReviewQuote: () => void
}

export function ReviewWorkflowActionButtons({
  reviewQuote,
  isEditMode,
  setIsEditMode,
  canEditCurrentQuote,
  isReviewerOrAdmin,
  isOdooClerk,
  reviewActionLoading,
  handleSaveQuotePrices,
  handleCancelEdits,
  handleResubmitReturnedQuote,
  handleExitReview,
  setIsPreviewOpen,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  handleReturnReviewQuote,
  handleApproveReviewQuote,
}: ReviewWorkflowActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
      {/* 1. EDIT QUOTE / SAVE CHANGES */}
      {canEditCurrentQuote &&
        (isEditMode ? (
          <Button
            size="sm"
            onClick={handleSaveQuotePrices}
            disabled={reviewActionLoading}
            className="cursor-pointer bg-emerald-600 font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
            title="Save changes to this quote"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {reviewActionLoading ? "Saving..." : "Save Changes"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(true)}
            className="cursor-pointer border-primary/50 bg-background/80 font-bold text-primary shadow-sm hover:bg-primary/10"
            title="Enter edit mode to make changes"
          >
            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
            Edit Quote
          </Button>
        ))}

      {/* Returned Quotes Resubmit Action */}
      {reviewQuote.status === "RETURNED" && !isEditMode && (
        <Button
          size="sm"
          onClick={handleResubmitReturnedQuote}
          disabled={reviewActionLoading}
          className="cursor-pointer bg-amber-600 font-bold text-white shadow-sm hover:bg-amber-700"
          title="Resubmit quote for reviewer approval"
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {reviewActionLoading ? "Resubmitting..." : "Resubmit for Review"}
        </Button>
      )}

      {/* 2. APPROVE QUOTE (Reviewer / Admin) */}
      {reviewQuote.status === "PENDING_REVIEW" && isReviewerOrAdmin && (
        <Button
          size="sm"
          onClick={handleApproveReviewQuote}
          disabled={reviewActionLoading}
          className="cursor-pointer bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700"
          title="Approve this quote"
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          {reviewActionLoading ? "Approving..." : "Approve Quote"}
        </Button>
      )}

      {/* 3. RETURN WITH NOTE (Reviewer / Admin) */}
      {reviewQuote.status === "PENDING_REVIEW" && isReviewerOrAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReturnReviewQuote}
          disabled={reviewActionLoading}
          className="cursor-pointer border-amber-400/50 font-semibold text-amber-700 shadow-sm hover:bg-amber-500/10 dark:text-amber-400"
          title="Return quote to preparer with notes"
        >
          <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
          Return with Note
        </Button>
      )}

      {/* Approved/Modified Quotes: Quick Preview & Print */}
      {(reviewQuote.status === "APPROVED" ||
        reviewQuote.status === "MODIFIED") &&
        !isEditMode && (
          <>
            <Button
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="cursor-pointer bg-primary font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              Preview &amp; Print
            </Button>

            {reviewQuote.odooStatus === "PENDING_ENTRY" &&
              (isReviewerOrAdmin || isOdooClerk) && (
                <Button
                  size="sm"
                  onClick={() => {
                    setOdooOrderNumberInput("")
                    setShowCompleteOdooModal(true)
                  }}
                  className="cursor-pointer bg-indigo-600 font-bold text-white shadow-md hover:bg-indigo-700"
                >
                  <CheckSquare className="mr-1.5 h-4 w-4" />
                  Mark Entered in Odoo
                </Button>
              )}
          </>
        )}

      {/* Read-Only Banner for non-reviewers when pending */}
      {reviewQuote.status === "PENDING_REVIEW" &&
        !isReviewerOrAdmin &&
        !isEditMode && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>
              In Review with {reviewQuote.assignedTo || "Reviewer"} (Read-Only)
            </span>
          </div>
        )}

      {/* 4. EXIT REVIEW / CANCEL EDITS */}
      {isEditMode ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancelEdits}
          disabled={reviewActionLoading}
          className="cursor-pointer border-rose-300 font-bold text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
          title="Cancel edits and restore original values"
        >
          Cancel Edits
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitReview}
          className="cursor-pointer border-rose-400/80 font-bold text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-800/80 dark:text-rose-400 dark:hover:bg-rose-950/50"
          title="Exit review mode and return to quotes list"
        >
          Exit Review
        </Button>
      )}
    </div>
  )
}
