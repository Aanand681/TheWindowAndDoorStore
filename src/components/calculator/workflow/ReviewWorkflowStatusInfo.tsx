"use client"

import React from "react"
import {
  Edit3,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  CheckSquare,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react"

export interface ReviewWorkflowStatusInfoProps {
  reviewQuote: any
  isEditMode: boolean
  isReviewerOrAdmin: boolean
  isOdooClerk: boolean
  user: any
}

export function ReviewWorkflowStatusInfo({
  reviewQuote,
  isEditMode,
  isReviewerOrAdmin,
  isOdooClerk,
  user,
}: ReviewWorkflowStatusInfoProps) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        {isEditMode ? (
          <span className="flex animate-pulse items-center gap-1 rounded-full bg-amber-600 px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-sm">
            <Edit3 className="h-3.5 w-3.5" /> Edit Mode Active (Unlocked)
          </span>
        ) : (
          <>
            {reviewQuote.status === "APPROVED" && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5" /> Quote Approved (View
                Only)
              </span>
            )}
            {reviewQuote.status === "MODIFIED" && (
              <span className="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Modified &amp; Approved
                (View Only)
              </span>
            )}
            {reviewQuote.status === "RETURNED" && (
              <span className="flex items-center gap-1 rounded-full bg-destructive px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                <AlertCircle className="h-3.5 w-3.5" /> Returned for Revision
                (Editable)
              </span>
            )}
            {reviewQuote.status === "PENDING_REVIEW" && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                <Clock className="h-3.5 w-3.5" />{" "}
                {isReviewerOrAdmin
                  ? "Review Mode Active"
                  : reviewQuote.assignedTo
                    ? `In Review with ${reviewQuote.assignedTo} (Read-Only)`
                    : "In Review (Read-Only)"}
              </span>
            )}
          </>
        )}

        {/* Odoo Status Badge */}
        {reviewQuote.odooAssignedTo &&
          (reviewQuote.odooStatus === "COMPLETED" ? (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 shadow-sm dark:text-emerald-400">
              <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                Entered in Odoo{" "}
                {reviewQuote.odooOrderNumber
                  ? `(#${reviewQuote.odooOrderNumber})`
                  : ""}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-600 shadow-sm dark:text-indigo-400">
              <ClipboardCheck className="h-3.5 w-3.5 text-indigo-500" />
              <span>Odoo Entry Pending ({reviewQuote.odooAssignedTo})</span>
            </span>
          ))}

        <h2 className="text-lg font-extrabold text-foreground">
          Quote #{reviewQuote.quoteNumber} for {reviewQuote.customerName}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>
          Prepared by:{" "}
          <strong className="text-foreground">{reviewQuote.preparedBy}</strong>
        </span>
        {reviewQuote.assignedTo && (
          <>
            <span>&bull;</span>
            <span>
              Assigned to:{" "}
              <strong className="text-foreground">
                {reviewQuote.assignedTo}
              </strong>
            </span>
          </>
        )}
        {reviewQuote.preparerNotes && (
          <>
            <span>&bull;</span>
            <span className="italic">
              Note: &ldquo;{reviewQuote.preparerNotes}&rdquo;
            </span>
          </>
        )}
      </div>

      {/* Show Revision Instructions if Returned */}
      {reviewQuote.status === "RETURNED" && reviewQuote.reviewerNotes && (
        <div className="mt-2 flex animate-in items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/15 p-3 text-xs font-medium text-amber-950 shadow-xs fade-in dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <strong className="text-amber-900 dark:text-amber-300">
              Revision requested by{" "}
              {reviewQuote.reviewedBy || reviewQuote.assignedTo || "Reviewer"}:
            </strong>
            <p className="mt-0.5 font-normal text-foreground/90 italic">
              &ldquo;{reviewQuote.reviewerNotes}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Show Changes Log if Modified (Hidden for Odoo clerk) */}
      {reviewQuote.status === "MODIFIED" &&
        !isOdooClerk &&
        user?.department !== "CLERK" && (
          <div className="mt-2 animate-in rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-medium text-blue-950 shadow-xs fade-in dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
            <div className="mb-1.5 flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>
                What{" "}
                {reviewQuote.reviewedBy || reviewQuote.assignedTo || "Admin"}{" "}
                Edited &amp; Approved:
              </span>
            </div>
            {reviewQuote.reviewChanges &&
            reviewQuote.reviewChanges.length > 0 ? (
              <ul className="mt-1 list-disc space-y-1 pl-5 font-medium text-blue-800 dark:text-blue-200">
                {reviewQuote.reviewChanges.map((c: string, idx: number) => (
                  <li key={idx} className="leading-snug">
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-0.5 text-blue-700 italic dark:text-blue-300">
                Price or specification adjustments made during review.
              </p>
            )}
          </div>
        )}
    </div>
  )
}
