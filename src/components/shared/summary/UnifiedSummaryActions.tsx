"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Send, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UnifiedSummaryActionsProps {
  isAdmin?: boolean
  canSubmit: boolean
  isReviewMode?: boolean
  onSubmitQuote?: () => void
  onPrintPreview: () => void
  adminSubmitLabel?: string
  nonAdminClassName?: string
}

export function UnifiedSummaryActions({
  isAdmin = false,
  canSubmit,
  isReviewMode = false,
  onSubmitQuote,
  onPrintPreview,
  adminSubmitLabel = "Approve & Assign Quote",
  nonAdminClassName = "bg-emerald-600 hover:bg-emerald-700",
}: UnifiedSummaryActionsProps) {
  return (
    <div className="space-y-2 border-t border-border/50 pt-2">
      {onSubmitQuote && !isReviewMode && (
        <Button
          type="button"
          onClick={onSubmitQuote}
          disabled={!canSubmit}
          className={cn(
            "h-10 w-full cursor-pointer gap-2 text-xs font-bold text-white shadow-sm sm:text-sm",
            isAdmin ? "bg-emerald-600 hover:bg-emerald-700" : nonAdminClassName
          )}
        >
          {isAdmin ? (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>{adminSubmitLabel}</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Quote for Review</span>
            </>
          )}
        </Button>
      )}

      <Button
        type="button"
        onClick={onPrintPreview}
        disabled={!canSubmit}
        className="h-10 w-full cursor-pointer gap-2 bg-black text-xs font-bold text-white shadow-sm transition-colors hover:bg-neutral-800 sm:text-sm dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        <Printer className="h-4 w-4" />
        <span>Preview Quote</span>
      </Button>
    </div>
  )
}
