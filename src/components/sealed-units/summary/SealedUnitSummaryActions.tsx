"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Send, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SealedUnitSummaryActionsProps {
  quoteNotes?: string
  setQuoteNotes?: (notes: string) => void
  hasContent: boolean
  user?: any
  onOpenSubmitModal?: () => void
  onPrint: () => void
}

export function SealedUnitSummaryActions({
  hasContent,
  user,
  onOpenSubmitModal,
  onPrint,
}: SealedUnitSummaryActionsProps) {
  const isAdminOrSuperAdmin =
    user?.role === "ADMIN" || user?.role === "SUPERADMIN"

  return (
    <div className="space-y-2 border-t border-border/40 pt-2">
      {onOpenSubmitModal && (
        <Button
          type="button"
          variant="default"
          onClick={onOpenSubmitModal}
          disabled={!hasContent}
          className={cn(
            "h-10 w-full cursor-pointer text-xs font-bold text-white shadow-md transition-colors",
            isAdminOrSuperAdmin
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-amber-600 hover:bg-amber-700"
          )}
        >
          {isAdminOrSuperAdmin ? (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" /> Approve &amp; Assign /
              Submit Quote
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Submit Quote for Review
            </>
          )}
        </Button>
      )}

      <Button
        type="button"
        onClick={onPrint}
        disabled={!hasContent}
        className="h-10 w-full cursor-pointer gap-2 bg-black text-xs font-bold text-white shadow-sm transition-colors hover:bg-neutral-800 sm:text-sm dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        <Printer className="h-4 w-4" />
        <span>Preview &amp; Print Quote</span>
      </Button>
    </div>
  )
}
