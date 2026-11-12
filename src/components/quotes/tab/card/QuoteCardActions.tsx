"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Star,
  Trash2,
  Printer,
  Edit3,
  ArrowRight,
  CheckSquare,
} from "lucide-react"
import type { QuotesSubTabType } from "../types"

interface QuoteCardActionsProps {
  quote: any
  currentUser: any
  canReview: boolean
  isAdmin: boolean
  canEditApproved: boolean
  hasOdooAccess: boolean
  isClerk: boolean
  activeTab: QuotesSubTabType
  myUsername?: string
  staffList: any[]
  onOpenQuote: (
    quoteId: string,
    isEdit?: boolean,
    originSubTab?: QuotesSubTabType
  ) => void
  handleToggleStar: (id: string, currentStarred: boolean) => void
  promptDeleteQuote: (id: string, quoteNum: string) => void
  handlePreviewQuote: (quote: any) => void
  setSelectedQuoteForReview: (quote: any) => void
  setReviewerNotes: (val: string) => void
  setSelectedOdooClerk: (val: string) => void
  setOdooModalQuote: (quote: any) => void
  setOdooOrderNum: (val: string) => void
}

export function QuoteCardActions({
  quote,
  currentUser,
  canReview,
  isAdmin,
  canEditApproved,
  hasOdooAccess,
  isClerk,
  activeTab,
  myUsername,
  staffList,
  onOpenQuote,
  handleToggleStar,
  promptDeleteQuote,
  handlePreviewQuote,
  setSelectedQuoteForReview,
  setReviewerNotes,
  setSelectedOdooClerk,
  setOdooModalQuote,
  setOdooOrderNum,
}: QuoteCardActionsProps) {
  const isPending = quote.status === "PENDING_REVIEW"
  const isApproved = quote.status === "APPROVED"
  const isModified = quote.status === "MODIFIED"
  const isReturned = quote.status === "RETURNED"

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border/50 pt-3">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToggleStar(quote._id, Boolean(quote.isStarred))}
          className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-amber-400"
          title={
            quote.isStarred
              ? "Starred (Keep permanently)"
              : "Star to keep permanently"
          }
        >
          <Star
            className={`h-4 w-4 ${quote.isStarred ? "fill-amber-400 text-amber-400" : ""}`}
          />
        </Button>

        {(isAdmin || quote.preparedBy === currentUser?.username) &&
          !isClerk && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => promptDeleteQuote(quote._id, quote.quoteNumber)}
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive"
              title="Delete quote"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
      </div>

      <div className="cq-actions-compact flex flex-wrap items-center gap-2">
        {isApproved || isModified ? (
          <>
            {quote.odooStatus === "PENDING_ENTRY" &&
              (canReview ||
                hasOdooAccess ||
                quote.odooAssignedTo?.toLowerCase() === myUsername) && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setOdooModalQuote(quote)
                    setOdooOrderNum(quote.odooOrderNumber || "")
                  }}
                  className="h-8 cursor-pointer gap-1.5 bg-emerald-600 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <CheckSquare className="mr-0.5 h-3.5 w-3.5" />
                  <span>Mark Entered in Odoo</span>
                </Button>
              )}

            <Button
              variant="default"
              size="sm"
              onClick={() => handlePreviewQuote(quote)}
              className="h-8 cursor-pointer gap-1.5 bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Printer className="mr-0.5 h-3.5 w-3.5" />
              <span>Preview &amp; Print</span>
            </Button>

            {canEditApproved && activeTab !== "odoo" && !isClerk && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenQuote(quote._id, true, activeTab)}
                className="h-8 cursor-pointer gap-1 bg-background/80 text-xs font-semibold hover:border-amber-500/50 hover:text-amber-500"
              >
                <Edit3 className="mr-0.5 h-3 w-3" />
                <span>Edit</span>
              </Button>
            )}

            {canReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenQuote(quote._id, false, activeTab)}
                className="h-8 cursor-pointer gap-1 bg-background/80 text-xs font-semibold"
              >
                <span>View Details</span>
                <ArrowRight className="ml-0.5 h-3 w-3" />
              </Button>
            )}
          </>
        ) : (
          <>
            {isPending && canReview && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedQuoteForReview(quote)
                  setReviewerNotes("")
                  const defaultClerk =
                    staffList.find((s: any) => s.department === "CLERK") ||
                    staffList[0]
                  setSelectedOdooClerk(
                    quote.odooAssignedTo || defaultClerk?.username || ""
                  )
                }}
                className="h-8 cursor-pointer border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20"
              >
                Quick Approve
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreviewQuote(quote)}
              className="h-8 cursor-pointer gap-1 bg-background/80 text-xs"
            >
              <Printer className="mr-1 h-3.5 w-3.5" />
              <span>Print</span>
            </Button>
            {!isClerk && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onOpenQuote(quote._id, false, activeTab)}
                className="h-8 cursor-pointer gap-1.5 text-xs font-bold shadow-sm"
              >
                <span>
                  {isPending
                    ? canReview
                      ? "Open & Review"
                      : "View Quote"
                    : isReturned
                      ? "Revise & Edit"
                      : "Open in Calculator"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
