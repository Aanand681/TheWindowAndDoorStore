"use client"

import React from "react"
import { Paperclip } from "lucide-react"

export interface SealedUnitSummaryAttachedBadgesProps {
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedDoorQuote?: () => void
}

export function SealedUnitSummaryAttachedBadges({
  attachedWindowQuote,
  attachedDoorQuote,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedDoorQuote,
}: SealedUnitSummaryAttachedBadgesProps) {
  const hasAnyAttached = Boolean(attachedWindowQuote || attachedDoorQuote)
  if (!hasAnyAttached) return null

  return (
    <div className="space-y-1.5 pb-1">
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
