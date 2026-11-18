"use client"

import React from "react"
import { Paperclip, CheckCircle2 } from "lucide-react"
import { CachedAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface SealedUnitSummaryAttachedBadgesProps {
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  attachedInstallOption?: CachedAttachedInstallOption | null
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedDoorQuote?: () => void
  onRemoveAttachedInstallOption?: () => void
  dynamicInstallDeltaDollars?: number
  isService?: boolean
  mode?: string
}

export function SealedUnitSummaryAttachedBadges({
  attachedWindowQuote,
  attachedDoorQuote,
  attachedInstallOption,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedDoorQuote,
  onRemoveAttachedInstallOption,
  dynamicInstallDeltaDollars,
  mode,
}: SealedUnitSummaryAttachedBadgesProps) {
  const hasAnyAttached = Boolean(
    attachedWindowQuote || attachedDoorQuote || attachedInstallOption?.enabled
  )
  if (!hasAnyAttached) return null

  const isCurrentlySupply =
    mode !== undefined
      ? mode === "supply_only"
      : attachedInstallOption?.mode !== "install"

  const displayDollars =
    dynamicInstallDeltaDollars && dynamicInstallDeltaDollars > 0
      ? dynamicInstallDeltaDollars
      : attachedInstallOption?.amountPreTaxCents &&
          attachedInstallOption.amountPreTaxCents > 0
        ? attachedInstallOption.amountPreTaxCents / 100
        : 0

  return (
    <div className="space-y-1.5 pb-1">
      {attachedInstallOption?.enabled && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-2 text-xs text-primary">
          <span className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>
              {isCurrentlySupply
                ? "Option for Installation Attached (+$"
                : attachedInstallOption?.hasSupplyJC
                  ? "Option with J&C for Supply Only Attached (-$"
                  : "Option for Supply Only Attached (-$"}
              {displayDollars.toFixed(2)})
            </span>
          </span>
          {onRemoveAttachedInstallOption && (
            <button
              type="button"
              onClick={onRemoveAttachedInstallOption}
              className="cursor-pointer text-[11px] font-bold text-destructive hover:underline"
            >
              Detach
            </button>
          )}
        </div>
      )}

      {attachedWindowQuote && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-800 dark:text-emerald-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              Combined Quote: Attached Window #{attachedWindowQuote.quoteNumber}
            </span>
          </span>
          {onRemoveAttachedWindowQuote && (
            <button
              type="button"
              onClick={onRemoveAttachedWindowQuote}
              className="cursor-pointer text-[11px] font-bold text-destructive hover:underline"
            >
              Detach
            </button>
          )}
        </div>
      )}

      {attachedDoorQuote && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-900 dark:text-amber-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              Combined Quote: Attached Door #{attachedDoorQuote.quoteNumber}
            </span>
          </span>
          {onRemoveAttachedDoorQuote && (
            <button
              type="button"
              onClick={onRemoveAttachedDoorQuote}
              className="cursor-pointer text-[11px] font-bold text-destructive hover:underline"
            >
              Detach
            </button>
          )}
        </div>
      )}
    </div>
  )
}
