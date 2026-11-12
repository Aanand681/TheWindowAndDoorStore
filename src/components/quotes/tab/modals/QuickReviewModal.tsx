"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ClipboardCheck } from "lucide-react"

interface QuickReviewModalProps {
  selectedQuoteForReview: any
  setSelectedQuoteForReview: (val: any) => void
  reviewerNotes: string
  setReviewerNotes: (val: string) => void
  selectedOdooClerk: string
  setSelectedOdooClerk: (val: string) => void
  reviewingAction: boolean
  handleQuickApprove: (quote: any, newStatus: "APPROVED" | "RETURNED") => void
  staffList: any[]
}

export function QuickReviewModal({
  selectedQuoteForReview,
  setSelectedQuoteForReview,
  reviewerNotes,
  setReviewerNotes,
  selectedOdooClerk,
  setSelectedOdooClerk,
  reviewingAction,
  handleQuickApprove,
  staffList,
}: QuickReviewModalProps) {
  if (!selectedQuoteForReview) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm duration-200 fade-in">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Quick Review: Quote #{selectedQuoteForReview.quoteNumber}
            </h3>
            <p className="text-xs text-muted-foreground">
              Customer: <strong>{selectedQuoteForReview.customerName}</strong>{" "}
              &bull; Prepared by:{" "}
              <strong>{selectedQuoteForReview.preparedBy}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quickNotes" className="text-xs font-semibold">
            Reviewer Instructions / Notes
          </Label>
          <textarea
            id="quickNotes"
            rows={3}
            placeholder="Optional notes or instructions for the preparer..."
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2.5 font-sans text-xs outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="quickOdooAssignee"
            className="flex items-center justify-between text-xs font-semibold text-foreground"
          >
            <span className="flex items-center gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5 text-indigo-500" />
              <span>Assign for Odoo Entry &amp; Physical Filing</span>
            </span>
            <span className="text-[10px] font-semibold text-destructive">
              * Required
            </span>
          </Label>
          <select
            id="quickOdooAssignee"
            value={selectedOdooClerk}
            onChange={(e) => setSelectedOdooClerk(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select Odoo Clerk (Required) --</option>
            {staffList.map((s: any) => {
              const displayName =
                s.name ||
                (s.username
                  ? s.username.charAt(0).toUpperCase() + s.username.slice(1)
                  : "Staff")
              return (
                <option key={s._id || s.username} value={s.username}>
                  {displayName}
                </option>
              )
            })}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedQuoteForReview(null)
              setSelectedOdooClerk("")
            }}
            disabled={reviewingAction}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleQuickApprove(selectedQuoteForReview, "RETURNED")
            }
            disabled={reviewingAction}
            className="cursor-pointer border-destructive/30 font-semibold text-destructive hover:bg-destructive/10"
          >
            Return with Note
          </Button>
          <Button
            size="sm"
            onClick={() =>
              handleQuickApprove(selectedQuoteForReview, "APPROVED")
            }
            disabled={reviewingAction || !selectedOdooClerk}
            className="cursor-pointer bg-emerald-600 font-bold text-white hover:bg-emerald-700"
          >
            {reviewingAction ? "Saving..." : "Approve Quote"}
          </Button>
        </div>
      </div>
    </div>
  )
}
