"use client"

import React from "react"
import { AlertTriangle, MessageSquare, Sparkles } from "lucide-react"
import type { QuotesSubTabType } from "../types"

interface QuoteCardNotesProps {
  quote: any
  isClerk: boolean
  activeTab: QuotesSubTabType
  isModified: boolean
}

export function QuoteCardNotes({
  quote,
  isClerk,
  activeTab,
  isModified,
}: QuoteCardNotesProps) {
  if (isClerk || activeTab === "odoo") return null

  const shouldRender =
    (quote.status === "RETURNED" && quote.reviewerNotes) ||
    (quote.preparerNotes && quote.status !== "RETURNED") ||
    isModified ||
    (quote.reviewChanges && quote.reviewChanges.length > 0)

  if (!shouldRender) return null

  return (
    <div className="space-y-2 pt-1">
      {quote.status === "RETURNED" && quote.reviewerNotes && (
        <div className="flex animate-in items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/15 p-3 text-xs font-medium text-amber-950 shadow-xs fade-in dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-amber-900 dark:text-amber-300">
              Revision Requested by{" "}
              {quote.reviewedBy || quote.assignedTo || "Reviewer"}:
            </span>
            <p className="mt-0.5 font-normal text-foreground/90 italic">
              &quot;{quote.reviewerNotes}&quot;
            </p>
          </div>
        </div>
      )}

      {quote.preparerNotes && quote.status !== "RETURNED" && (
        <div className="flex items-start gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-2.5 text-xs text-muted-foreground italic">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            <strong>Note from {quote.preparedBy}:</strong> &quot;
            {quote.preparerNotes}&quot;
          </span>
        </div>
      )}

      {(isModified ||
        (quote.reviewChanges && quote.reviewChanges.length > 0)) && (
        <div className="animate-in rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950 shadow-xs fade-in dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
          <div className="mb-1.5 flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>
              What {quote.reviewedBy || quote.assignedTo || "Admin"} Edited
              &amp; Approved:
            </span>
          </div>
          {quote.reviewChanges && quote.reviewChanges.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 font-medium text-blue-800 dark:text-blue-200">
              {quote.reviewChanges.map((c: string, idx: number) => (
                <li key={idx} className="leading-snug">
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-700 italic dark:text-blue-300">
              Price or configuration adjustments made during review.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
