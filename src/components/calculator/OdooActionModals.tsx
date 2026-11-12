"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ClipboardCheck, CheckSquare } from "lucide-react"

export interface OdooActionModalsProps {
  showApproveOdooModal: boolean
  setShowApproveOdooModal: (val: boolean) => void
  showCompleteOdooModal: boolean
  setShowCompleteOdooModal: (val: boolean) => void
  reviewQuote: any
  selectedOdooClerk: string
  setSelectedOdooClerk: (val: string) => void
  odooOrderNumberInput: string
  setOdooOrderNumberInput: (val: string) => void
  reviewActionLoading: boolean
  clerkList: any[]
  staffList: any[]
  confirmApproveReviewQuote: () => void
  handleCompleteOdooEntry: () => void
}

export function OdooActionModals({
  showApproveOdooModal,
  setShowApproveOdooModal,
  showCompleteOdooModal,
  setShowCompleteOdooModal,
  reviewQuote,
  selectedOdooClerk,
  setSelectedOdooClerk,
  odooOrderNumberInput,
  setOdooOrderNumberInput,
  reviewActionLoading,
  clerkList,
  staffList,
  confirmApproveReviewQuote,
  handleCompleteOdooEntry,
}: OdooActionModalsProps) {
  if (!reviewQuote) return null

  return (
    <>
      {/* Approve Quote & Optional Odoo Assignment Modal */}
      {showApproveOdooModal && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  Approve Quote #{reviewQuote.quoteNumber}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Customer:{" "}
                  <strong className="text-foreground">
                    {reviewQuote.customerName}
                  </strong>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Approve this quote and assign an employee to enter the order
                into Odoo software and prepare the physical file.
              </p>

              <div className="space-y-1.5">
                <Label
                  htmlFor="odooAssigneeSelect"
                  className="flex items-center justify-between text-xs font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Assign for Odoo Entry (Required)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-destructive">
                    * Required
                  </span>
                </Label>
                <select
                  id="odooAssigneeSelect"
                  value={selectedOdooClerk}
                  onChange={(e) => setSelectedOdooClerk(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-input bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select Odoo Clerk (Required) --</option>
                  {(clerkList.length > 0 ? clerkList : staffList).map(
                    (member: any) => {
                      const displayName =
                        member.name ||
                        (member.username
                          ? member.username.charAt(0).toUpperCase() +
                            member.username.slice(1)
                          : "Staff")
                      return (
                        <option
                          key={member._id || member.username}
                          value={member.username}
                        >
                          {displayName}
                        </option>
                      )
                    }
                  )}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  The assigned clerk will receive an instant notification and
                  view-only access to preview and print the quote.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApproveOdooModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmApproveReviewQuote}
                disabled={reviewActionLoading || !selectedOdooClerk}
                className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                {reviewActionLoading
                  ? "Approving..."
                  : `Approve & Assign to ${selectedOdooClerk || "Clerk"}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Odoo Entry Modal */}
      {showCompleteOdooModal && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-indigo-500/15 p-2.5 text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Mark Entered in Odoo</h3>
                <p className="text-xs text-muted-foreground">
                  Quote #{reviewQuote.quoteNumber} • {reviewQuote.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Confirm that this quote has been entered into Odoo. This will
                notify the review team and mark the order file as processed.
              </p>

              <div className="space-y-1.5">
                <Label
                  htmlFor="odooOrderNumInput"
                  className="flex items-center justify-between text-xs font-semibold"
                >
                  <span>Odoo Sales Order #</span>
                  <span className="text-[10px] font-semibold text-destructive">
                    * Required &amp; Unique
                  </span>
                </Label>
                <Input
                  id="odooOrderNumInput"
                  placeholder="e.g. SO-10492 or PO-9912"
                  value={odooOrderNumberInput}
                  onChange={(e) => setOdooOrderNumberInput(e.target.value)}
                  className="bg-background font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompleteOdooModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCompleteOdooEntry}
                disabled={reviewActionLoading || !odooOrderNumberInput.trim()}
                className="bg-indigo-600 font-bold text-white hover:bg-indigo-700"
              >
                {reviewActionLoading ? "Saving..." : "Confirm Odoo Entry"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OdooActionModals
