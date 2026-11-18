"use client"

import React from "react"
import { Paperclip, CheckCircle2 } from "lucide-react"
import { CachedAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface DoorSummaryAttachedBadgesProps {
  attachedWindowQuote?: any | null
  attachedSealedUnit?: any | null
  attachedInstallOption?: CachedAttachedInstallOption | null
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedSealedUnit?: () => void
  onRemoveAttachedInstallOption?: () => void
  dynamicInstallDeltaDollars?: number
  mode?: string
}

export function DoorSummaryAttachedBadges({
  attachedWindowQuote,
  attachedSealedUnit,
  attachedInstallOption,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedSealedUnit,
  onRemoveAttachedInstallOption,
  dynamicInstallDeltaDollars,
  mode,
}: DoorSummaryAttachedBadgesProps) {
  const hasAnyAttached = Boolean(
    attachedWindowQuote || attachedSealedUnit || attachedInstallOption?.enabled
  )
  if (!hasAnyAttached) return null

  const isCurrentlySupply =
    mode !== undefined
      ? mode === "supply_only"
      : attachedInstallOption?.mode !== "install"

  const hwTotal = Number(attachedInstallOption?.hardwareTotal) || 0
  const hardwareSummary =
    hwTotal > 0 ? ` incl. $${hwTotal.toFixed(2)} hardware` : ""

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
                ? `Option for Installation Attached (+$${displayDollars.toFixed(2)}${hardwareSummary})`
                : attachedInstallOption?.hasSupplyJC
                  ? `Option with J&C for Supply Only Attached (-$${displayDollars.toFixed(2)})`
                  : `Option for Supply Only Attached (-$${displayDollars.toFixed(2)})`}
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
            <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
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

      {attachedSealedUnit && (
        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-xs text-blue-800 dark:text-blue-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="h-3.5 w-3.5 text-blue-600" />
            <span>
              Combined Quote: Attached Sealed Unit #
              {attachedSealedUnit.quoteNumber}
            </span>
          </span>
          {onRemoveAttachedSealedUnit && (
            <button
              type="button"
              onClick={onRemoveAttachedSealedUnit}
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
