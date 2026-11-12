"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Share2, RotateCcw, AlertCircle } from "lucide-react"

export interface WorkflowStaffItem {
  _id?: string
  username: string
  name?: string
  department?: string
}

interface WorkflowDialogsProps {
  // Reassign Modal Props
  showReassignModal: boolean
  setShowReassignModal: (show: boolean) => void
  reviewQuote: any
  user: { username?: string; role?: string } | null
  staffList: WorkflowStaffItem[]
  reassignTo: string
  setReassignTo: (val: string) => void
  reassignNotes: string
  setReassignNotes: (val: string) => void
  handleReassignQuote: () => Promise<void> | void

  // Return Modal Props
  showReturnModal: boolean
  setShowReturnModal: (show: boolean) => void
  returnNotes: string
  setReturnNotes: (val: string) => void
  submitReturnReviewQuote: () => Promise<void> | void

  // Exit Review for PDF Modal Props
  showExitReviewForPdfModal: boolean
  setShowExitReviewForPdfModal: (show: boolean) => void
  handleExitReviewAndImportPdf: () => void

  // Shared
  reviewActionLoading: boolean
}

export function WorkflowDialogs({
  showReassignModal,
  setShowReassignModal,
  reviewQuote,
  user,
  staffList,
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
}: WorkflowDialogsProps) {
  const eligibleStaff = staffList.filter(
    (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
  )

  return (
    <>
      {/* Forward / Reassign Quote Modal */}
      {showReassignModal && reviewQuote && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-primary/20 p-2.5 text-primary">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Forward / Reassign Quote</h3>
                <p className="text-xs text-muted-foreground">
                  Reassign Quote #{reviewQuote.quoteNumber} (originally prepared
                  by{" "}
                  <strong className="text-foreground">
                    {reviewQuote.preparedBy}
                  </strong>
                  )
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="reassignSelect"
                  className="text-xs font-semibold"
                >
                  Forward to Staff Member
                </Label>
                <span className="text-[10px] font-medium text-muted-foreground">
                  Self excluded
                </span>
              </div>
              {eligibleStaff.length > 0 ? (
                <select
                  id="reassignSelect"
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                  className="flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {eligibleStaff.map((s) => {
                    const displayName =
                      s.name ||
                      (s.username
                        ? s.username.charAt(0).toUpperCase() +
                          s.username.slice(1)
                        : "Staff")
                    return (
                      <option key={s._id || s.username} value={s.username}>
                        {displayName}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  No other staff available to reassign.
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reassignNotesInput" className="text-xs">
                Transfer Comments / Hand-off Notes (Optional)
              </Label>
              <textarea
                id="reassignNotesInput"
                rows={3}
                placeholder="e.g. Luke checked window specs, forwarding for final margin approval..."
                value={reassignNotes}
                onChange={(e) => setReassignNotes(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReassignModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReassignQuote}
                disabled={reviewActionLoading || !reassignTo}
                className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              >
                {reviewActionLoading
                  ? "Forwarding..."
                  : `Forward to ${reassignTo}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Return Quote Modal */}
      {showReturnModal && reviewQuote && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-destructive/15 p-2.5 text-destructive">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Return Quote for Revision</h3>
                <p className="text-xs text-muted-foreground">
                  Returning Quote #{reviewQuote.quoteNumber} to{" "}
                  <strong className="text-foreground">
                    {reviewQuote.preparedBy}
                  </strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="returnNotesInput"
                className="text-xs font-semibold"
              >
                Revision Instructions{" "}
                <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="returnNotesInput"
                rows={4}
                autoFocus
                placeholder="e.g. Please recalculate window #2 with triple-pane glass, verify jamb depth, or check travel surcharge..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-destructive"
              />
              <p className="text-[11px] text-muted-foreground">
                This note will be logged on the quote and sent directly to{" "}
                {reviewQuote.preparedBy}.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReturnModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={submitReturnReviewQuote}
                disabled={reviewActionLoading || !returnNotes.trim()}
                className="bg-destructive font-bold text-white hover:bg-destructive/90"
              >
                {reviewActionLoading
                  ? "Returning..."
                  : `Return to ${reviewQuote.preparedBy}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Exit Review Mode Before Importing PDF */}
      {showExitReviewForPdfModal && reviewQuote && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Exit Review Mode?</h3>
                <p className="text-xs text-muted-foreground">
                  Active quote review in progress
                </p>
              </div>
            </div>

            <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground">
              <p>
                You are currently reviewing{" "}
                <strong className="text-foreground">
                  Quote #{reviewQuote.quoteNumber}
                </strong>{" "}
                for{" "}
                <strong className="text-foreground">
                  {reviewQuote.customerName}
                </strong>
                .
              </p>
              <p>
                Importing a new manufacturer PDF will exit review mode and
                replace the current window line items with the new PDF contents.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitReviewForPdfModal(false)}
              >
                Stay in Review Mode
              </Button>
              <Button
                size="sm"
                onClick={handleExitReviewAndImportPdf}
                className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              >
                Exit &amp; Import PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
