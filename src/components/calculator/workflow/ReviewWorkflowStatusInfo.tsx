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
import { formatReviewerName } from "@/lib/format-reviewer"
import { parseDiffItem, calculateNetDiffDelta } from "@/lib/format-quote-diff"

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
  const netDelta = calculateNetDiffDelta(reviewQuote)
  const reviewerName = formatReviewerName(
    reviewQuote.reviewedBy ||
      reviewQuote.lastEditedBy ||
      reviewQuote.assignedTo
  )

  const renderBadgeIcon = (type: "added" | "updated" | "removed" | "info") => {
    if (type === "added") {
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold ring-1 ring-emerald-500/30">
          +
        </span>
      )
    }
    if (type === "updated") {
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold ring-1 ring-amber-500/30">
          ~
        </span>
      )
    }
    if (type === "removed") {
      return (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive text-[10px] font-bold ring-1 ring-destructive/30">
          -
        </span>
      )
    }
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
        •
      </span>
    )
  }

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
                    ? `In Review with ${formatReviewerName(reviewQuote.assignedTo)} (Read-Only)`
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
                {formatReviewerName(reviewQuote.assignedTo)}
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
              Revision requested by {reviewerName}:
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
          <div className="mt-2 animate-in rounded-xl border border-blue-200 bg-blue-50/90 p-3 text-xs font-medium text-blue-950 shadow-xs fade-in dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-1.5 dark:border-blue-800/60 font-bold text-blue-900 dark:text-blue-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>What {reviewerName} Edited &amp; Approved:</span>
              </div>
              {netDelta && (
                <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {netDelta} Net
                </span>
              )}
            </div>
            {reviewQuote.reviewChanges &&
            reviewQuote.reviewChanges.length > 0 ? (
              <div className="space-y-1.5 pt-0.5">
                {reviewQuote.reviewChanges.map((c: string, idx: number) => {
                  const item = parseDiffItem(c)
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 rounded-lg bg-background/60 px-2.5 py-1.5 border border-border/50 text-foreground"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {renderBadgeIcon(item.type)}
                        <span className="text-xs">{item.text}</span>
                      </div>
                      {item.delta && (
                        <span className="inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {item.delta}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
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
