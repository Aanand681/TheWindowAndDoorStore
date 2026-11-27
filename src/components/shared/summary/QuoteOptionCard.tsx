"use client"

import React from "react"
import { Sparkles, X } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"

export interface QuoteOptionCardProps {
  title: string
  subtitle?: string
  amountPreTaxCents: number
  onRemove?: () => void
  removeTitle?: string
  extraActions?: React.ReactNode
}

/**
 * Shared option row card used by both Custom Quote Options and attached
 * Dual/Triple Pane comparison upgrade options so they share identical visual layout.
 */
export function QuoteOptionCard({
  title,
  subtitle = "Optional Quote Option • Not added to base total",
  amountPreTaxCents,
  onRemove,
  removeTitle = "Remove option",
  extraActions,
}: QuoteOptionCardProps) {
  const isNegative = amountPreTaxCents < 0
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-start gap-2.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 space-y-0.5">
          <div className="font-semibold text-foreground">{title}</div>
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">
          {isNegative ? "-" : "+"}
          {formatMoney(Math.abs(amountPreTaxCents))}
        </span>
        {(extraActions || onRemove) && (
          <div className="flex items-center gap-1">
            {extraActions}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                title={removeTitle}
                className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
