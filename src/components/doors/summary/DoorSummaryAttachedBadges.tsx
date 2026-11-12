"use client"

import React from "react"
import { Paperclip, CheckCircle2 } from "lucide-react"

export interface DoorSummaryAttachedBadgesProps {
  attachedWindowQuote?: any | null
  attachedSealedUnit?: any | null
  attachedInstallOption?: { enabled: boolean; amountPreTaxCents: number } | null
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedSealedUnit?: () => void
  onRemoveAttachedInstallOption?: () => void
}

export function DoorSummaryAttachedBadges({
  attachedWindowQuote,
  attachedSealedUnit,
  attachedInstallOption,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedSealedUnit,
  onRemoveAttachedInstallOption,
}: DoorSummaryAttachedBadgesProps) {
  const hasAnyAttached = Boolean(
    attachedWindowQuote || attachedSealedUnit || attachedInstallOption?.enabled
  )
  if (!hasAnyAttached) return null

  return (
    <div className="space-y-1.5 pb-1">
      {attachedInstallOption?.enabled && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-2 text-xs text-primary">
          <span className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>
              Option for Installation Attached (+$
              {(attachedInstallOption.amountPreTaxCents / 100).toFixed(2)})
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
