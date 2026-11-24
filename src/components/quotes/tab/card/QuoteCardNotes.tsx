"use client"

import React, { useState } from "react"
import {
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { QuotesSubTabType } from "../types"
import { formatReviewerName } from "@/lib/format-reviewer"
import { parseDiffItem, calculateNetDiffDelta } from "@/lib/format-quote-diff"

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
  const [isExpanded, setIsExpanded] = useState(false)

  if (isClerk || activeTab === "odoo") return null

  const isReturned = quote.status === "RETURNED"
  const hasReviewChanges =
    !isReturned &&
    Array.isArray(quote.reviewChanges) &&
    quote.reviewChanges.length > 0
  const shouldRender =
    (isReturned && quote.reviewerNotes) ||
    (quote.preparerNotes && !isReturned) ||
    (!isReturned && isModified) ||
    hasReviewChanges

  if (!shouldRender) return null

  const reviewerName = formatReviewerName(
    quote.reviewedBy || quote.lastEditedBy || quote.assignedTo
  )
  const netDelta = calculateNetDiffDelta(quote)
  const changesList: string[] = hasReviewChanges ? quote.reviewChanges : []
  const changeCount = changesList.length

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
    <div className="space-y-1.5 pt-0.5">
      {quote.status === "RETURNED" && quote.reviewerNotes && (
        <div className="flex animate-in items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/15 p-3 text-xs font-medium text-amber-950 shadow-xs fade-in dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-amber-900 dark:text-amber-300">
              Revision Requested by {reviewerName}:
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

      {!isReturned && (isModified || hasReviewChanges) && (
        <div className="animate-in fade-in duration-150">
          {!isExpanded ? (
            /* COMPACT 1-LINE SLIM STRIP (Default) */
            <div className="flex items-center justify-between rounded-lg bg-blue-50/80 px-2.5 py-1.5 text-xs text-blue-950 dark:bg-blue-950/40 dark:text-blue-100 border border-blue-200/70 dark:border-blue-800/40">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">
                  What <strong>{reviewerName}</strong> Edited
                  {changeCount > 0 && (
                    <span className="text-muted-foreground ml-1 font-normal">
                      ({changeCount} {changeCount === 1 ? "item" : "items"})
                    </span>
                  )}
                </span>
                {netDelta && (
                  <span className="ml-1 inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    {netDelta}
                  </span>
                )}
              </div>
              {changeCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="ml-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer shrink-0"
                >
                  <span>Details</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            /* EXPANDED BREAKDOWN WITH RICH ICONS AND DELTA PILLS */
            <div className="rounded-xl border border-blue-200 bg-blue-50/90 p-3 text-xs text-blue-950 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/60 dark:border-blue-800/60">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>What {reviewerName} Edited:</span>
                  {netDelta && (
                    <span className="ml-1 inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {netDelta} Net
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <span>Collapse</span>
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-1.5 pt-0.5">
                {changesList.map((rawChange, idx) => {
                  const item = parseDiffItem(rawChange)
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 rounded-lg bg-background/60 px-2.5 py-1.5 border border-border/50 text-foreground"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {renderBadgeIcon(item.type)}
                        <span className="truncate text-xs">{item.text}</span>
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
