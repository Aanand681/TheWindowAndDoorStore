"use client"

import React from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/promo-logic"
import { AttachedUpgradeOption } from "./types"

export interface ComparisonFooterActionsProps {
  attachedUpgrade?: AttachedUpgradeOption | null
  onClose: () => void
  [key: string]: any
}

export function ComparisonFooterActions({
  attachedUpgrade,
  onClose,
}: ComparisonFooterActionsProps) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-border/60 bg-muted/20 p-4 sm:flex-row sm:px-6">
      <div className="flex w-full items-center gap-2 sm:w-auto">
        {attachedUpgrade ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Option attached to quote PDF: &ldquo;{attachedUpgrade.title}&rdquo; (
              {attachedUpgrade.amountPreTaxCents < 0 ? "-" : "+"}
              {formatMoney(Math.abs(attachedUpgrade.amountPreTaxCents))})
            </span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Compare options and attach the price difference card to your customer quote PDF.
          </span>
        )}
      </div>

      <div className="flex w-full items-center justify-end sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-8 cursor-pointer px-4 text-xs font-semibold"
        >
          Close
        </Button>
      </div>
    </div>
  )
}
