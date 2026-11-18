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
  Share2,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

export interface ReviewWorkflowActionButtonsProps {
  reviewQuote: any
  user?: any
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  canEditCurrentQuote: boolean
  isReviewerOrAdmin: boolean
  canApprove?: boolean
  isOdooClerk: boolean
  reviewActionLoading: boolean
  handleSaveQuotePrices: () => void
  handleCancelEdits: () => void
  handleResubmitReturnedQuote: () => void
  handleExitReview: () => void
  setIsPreviewOpen: (val: boolean) => void
  setOdooOrderNumberInput: (val: string) => void
  setShowCompleteOdooModal: (val: boolean) => void
  staffList?: any[]
  setReassignTo?: (val: string) => void
  setReassignNotes?: (val: string) => void
  setShowReassignModal?: (val: boolean) => void
  handleReturnReviewQuote: () => void
  handleApproveReviewQuote: () => void
}

export function ReviewWorkflowActionButtons({
  reviewQuote,
  user,
  isEditMode,
  setIsEditMode,
  canEditCurrentQuote,
  isReviewerOrAdmin,
  canApprove = false,
  isOdooClerk,
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

      {/* 2. APPROVE QUOTE (Strictly Admin / canApprove) */}
      {reviewQuote.status === "PENDING_REVIEW" &&
        !isEditMode &&
        isReviewerOrAdmin &&
        canApprove && (
          <Button
            size="sm"
            onClick={handleApproveReviewQuote}
            disabled={reviewActionLoading}
            className="cursor-pointer bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700"
            title="Approve this quote (Admin)"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {reviewActionLoading ? "Approving..." : "Approve Quote"}
          </Button>
        )}

      {/* 2B. FORWARD TO ADMIN (Peer Reviewer without final approval rights) */}
      {reviewQuote.status === "PENDING_REVIEW" &&
        !isEditMode &&
        isReviewerOrAdmin &&
        !canApprove &&
        setShowReassignModal && (
          <Button
            size="sm"
            onClick={() => {
              const adminStaff =
                staffList?.find(
                  (s: any) =>
                    s.role === "ADMIN" ||
                    s.role === "SUPERADMIN" ||
                    s.department === "ADMIN"
                ) || staffList?.[0]
              setReassignTo?.(adminStaff ? adminStaff.username : "Admin")
              setReassignNotes?.(
                "Reviewed and verified. Forwarded to Admin for final approval."
              )
              setShowReassignModal(true)
            }}
            disabled={reviewActionLoading}
            className="cursor-pointer bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary/90"
            title="Forward reviewed quote to Admin for final approval"
          >
            <Share2 className="mr-1.5 h-4 w-4" />
            Forward / Reassign Quote
          </Button>
        )}

      {/* 3. RETURN WITH NOTE (Reviewer / Admin) */}
      {reviewQuote.status === "PENDING_REVIEW" &&
        !isEditMode &&
        isReviewerOrAdmin && (
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

      {/* Read-Only Banner / Recall Action for preparer or non-reviewers when pending */}
      {reviewQuote.status === "PENDING_REVIEW" &&
        !isEditMode &&
        (reviewQuote.preparedBy?.toLowerCase() ===
          user?.username?.toLowerCase() ||
          !isReviewerOrAdmin) && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>
                In Review with {reviewQuote.assignedTo || "Reviewer"} (Read-Only)
              </span>
            </div>
            {reviewQuote.preparedBy?.toLowerCase() ===
              user?.username?.toLowerCase() && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (
                    !confirm(
                      "Withdraw this quote from review to make revisions? It will be unlocked for editing."
                    )
                  )
                    return
                  try {
                    const res = await fetch(`/api/quotes/${reviewQuote._id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        status: "RETURNED",
                        reviewerNotes: `Withdrawn by preparer (${user?.username || "preparer"}) for revision.`,
                      }),
                    })
                    if (!res.ok) {
                      const err = await res.json()
                      throw new Error(err.error || "Failed to recall quote")
                    }
                    toast.success(
                      "Quote recalled from review. Unlocked for editing."
                    )
                    setIsEditMode(true)
                    window.location.reload()
                  } catch (err: any) {
                    toast.error(err.message || "Failed to recall quote")
                  }
                }}
                className="cursor-pointer border-amber-500/50 bg-amber-500/10 font-bold text-amber-600 shadow-sm hover:bg-amber-500/20 dark:text-amber-400"
                title="Withdraw quote from review to make revisions"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Recall &amp; Edit
              </Button>
            )}
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
