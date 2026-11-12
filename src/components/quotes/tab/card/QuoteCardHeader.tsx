"use client"

import React from "react"
import {
  Clock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  CheckSquare,
  ClipboardCheck,
  Star,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/promo-logic"

interface QuoteCardHeaderProps {
  quote: any
  isClerk: boolean
  canReview: boolean
  pricing: any
  finalTotalCents: number
  handlePreviewQuote: (quote: any) => void
}

export function QuoteCardHeader({
  quote,
  isClerk,
  canReview,
  pricing,
  finalTotalCents,
  handlePreviewQuote,
}: QuoteCardHeaderProps) {
  const isPending = quote.status === "PENDING_REVIEW"
  const isApproved = quote.status === "APPROVED"
  const isModified = quote.status === "MODIFIED"
  const isReturned = quote.status === "RETURNED"

  const createdDate = new Date(quote.createdAt).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="cq-stack-compact cq-header-medium flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div
        className={cn(
          "min-w-0 flex-1 space-y-1.5",
          isClerk && "group cursor-pointer"
        )}
        onClick={isClerk ? () => handlePreviewQuote(quote) : undefined}
        title={isClerk ? "Click to Preview & Print Quote" : undefined}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "font-mono text-base font-bold text-foreground",
              isClerk && "transition-colors group-hover:text-primary"
            )}
          >
            #{quote.quoteNumber}
          </span>
          <span
            className={cn(
              "max-w-[220px] truncate font-semibold text-foreground sm:max-w-md",
              isClerk && "transition-colors group-hover:text-primary"
            )}
            title={quote.customerName}
          >
            {quote.customerName}
          </span>

          {/* Status Badge */}
          {isPending && (
            <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-500">
              <Clock className="h-3 w-3" />
              <span>
                {canReview
                  ? "Pending Review"
                  : quote.assignedTo
                    ? `In Review with ${quote.assignedTo}`
                    : "In Review"}
              </span>
            </span>
          )}
          {isApproved && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
              <CheckCircle2 className="h-3 w-3" />
              <span>
                Approved by {quote.reviewedBy || quote.assignedTo || "Admin"}
              </span>
            </span>
          )}
          {isModified && (
            <span className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-400 shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>
                Modified &amp; Approved by{" "}
                {quote.reviewedBy || quote.assignedTo || "Admin"}
              </span>
            </span>
          )}
          {isReturned && (
            <span className="flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>Returned for Revision</span>
            </span>
          )}
          {/* Odoo Status Badge */}
          {quote.odooAssignedTo &&
            (quote.odooStatus === "COMPLETED" ? (
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 shadow-sm">
                <CheckSquare className="h-3 w-3 text-emerald-500" />
                <span>
                  Entered in Odoo{" "}
                  {quote.odooOrderNumber ? `(#${quote.odooOrderNumber})` : ""}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-500 shadow-sm">
                <ClipboardCheck className="h-3 w-3 text-indigo-500" />
                <span>Odoo Entry Pending ({quote.odooAssignedTo})</span>
              </span>
            ))}

          {quote.isStarred && (
            <span
              className="text-amber-400"
              title="Starred / Protected from auto-flush"
            >
              <Star className="h-3.5 w-3.5 fill-amber-400" />
            </span>
          )}
        </div>

        {/* Metadata line */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
          <span>
            Prepared by:{" "}
            <strong className="text-foreground">{quote.preparedBy}</strong>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {createdDate}
          </span>
          {quote.taxTotals?.regionName && (
            <>
              <span>&bull;</span>
              <span>
                Region:{" "}
                <strong className="text-foreground">
                  {quote.taxTotals.regionName}
                </strong>
              </span>
            </>
          )}
          <span>&bull;</span>
          <span>{quote.windows?.length || 0} Windows</span>
        </div>
      </div>

      {/* Right: Financials / Price Badge */}
      <div className="cq-price-compact flex shrink-0 items-baseline justify-between gap-1 rounded-xl border border-border/40 bg-muted/40 p-2.5 sm:flex-col sm:items-end sm:justify-start sm:border-0 sm:bg-transparent sm:p-0">
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Quote Total
        </span>
        <div className="font-mono text-xl font-black tracking-tight text-foreground sm:text-2xl">
          {formatMoney(finalTotalCents)}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span>Base: {formatMoney(pricing?.basePrice || 0)}</span>
          {(pricing?.effectiveLabour || 0) > 0 && (
            <span>
              &bull; Lab: {formatMoney(pricing?.effectiveLabour || 0)}
            </span>
          )}
          {(pricing?.effectiveJC || 0) > 0 && (
            <span>
              &bull; J&amp;C: {formatMoney(pricing?.effectiveJC || 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
