"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Send, Printer } from "lucide-react"

export interface DoorSummaryActionsProps {
  isAdmin?: boolean
  canSubmit: boolean
  onSubmitQuote: () => void
  onPrintPreview: () => void
}

export function DoorSummaryActions({
  isAdmin = false,
  canSubmit,
  onSubmitQuote,
  onPrintPreview,
}: DoorSummaryActionsProps) {
  return (
    <div className="space-y-2 border-t border-border/50 pt-2">
      {/* Button 1: Submit / Approve & Assign Quote */}
      <Button
        type="button"
        onClick={onSubmitQuote}
        disabled={!canSubmit}
        className="h-10 w-full cursor-pointer gap-2 bg-emerald-600 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 sm:text-sm"
      >
        {isAdmin ? (
          <>
            <ShieldCheck className="h-4 w-4" />
            Approve &amp; Assign Quote
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Quote for Review
          </>
        )}
      </Button>

      {/* Button 2: Preview & Print Door Quote */}
      <Button
        type="button"
        onClick={onPrintPreview}
        disabled={!canSubmit}
        className="h-10 w-full cursor-pointer gap-2 bg-black text-xs font-bold text-white shadow-sm hover:bg-neutral-800 sm:text-sm dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        <Printer className="h-4 w-4" />
        Preview &amp; Print Door Quote
      </Button>
    </div>
  )
}
