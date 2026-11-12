"use client"

import React from "react"
import {
  AppWindow,
  CheckCircle2,
  DoorClosed,
  Layers,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

export interface AttachedQuotesPillsProps {
  attachedWindowQuote?: any | null
  attachedSealedUnit?: any | null
  attachedDoorQuote?: any | null
  onDetachWindow?: () => void
  onDetachSealedUnit?: () => void
  onDetachDoor?: () => void
  onDetach?: () => void
}

export function AttachedQuotesPills({
  attachedWindowQuote,
  attachedSealedUnit,
  attachedDoorQuote,
  onDetachWindow,
  onDetachSealedUnit,
  onDetachDoor,
  onDetach,
}: AttachedQuotesPillsProps) {
  const hasAnyAttached = Boolean(
    attachedWindowQuote || attachedSealedUnit || attachedDoorQuote
  )
  if (!hasAnyAttached) return null

  return (
    <div className="flex flex-col gap-2 border-b border-emerald-500/30 bg-emerald-500/10 p-3 text-xs sm:px-5">
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>Currently Attached to this Quotation:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {attachedWindowQuote && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-card/80 px-2.5 py-1 shadow-xs">
            <AppWindow className="h-3.5 w-3.5 text-primary" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Window #{attachedWindowQuote.quoteNumber}
            </span>
            <span className="text-[11px] text-muted-foreground">
              ( $
              {attachedWindowQuote.totals?.grandTotal
                ? Number(attachedWindowQuote.totals.grandTotal).toFixed(2)
                : "0.00"}
              )
            </span>
            {(onDetachWindow || onDetach) && (
              <button
                type="button"
                onClick={() => {
                  if (onDetachWindow) onDetachWindow()
                  else if (onDetach) onDetach()
                  toast.info("Detached Window Quote")
                }}
                className="cursor-pointer rounded p-0.5 text-destructive hover:bg-destructive/10"
                title="Detach Window Quote"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {attachedSealedUnit && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-card/80 px-2.5 py-1 shadow-xs">
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Sealed Unit #{attachedSealedUnit.quoteNumber}
            </span>
            <span className="text-[11px] text-muted-foreground">
              ( $
              {attachedSealedUnit.totals?.grandTotal
                ? Number(attachedSealedUnit.totals.grandTotal).toFixed(2)
                : "0.00"}
              )
            </span>
            {(onDetachSealedUnit || onDetach) && (
              <button
                type="button"
                onClick={() => {
                  if (onDetachSealedUnit) onDetachSealedUnit()
                  else if (onDetach) onDetach()
                  toast.info("Detached Sealed Unit Quote")
                }}
                className="cursor-pointer rounded p-0.5 text-destructive hover:bg-destructive/10"
                title="Detach Sealed Unit"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {attachedDoorQuote && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-card/80 px-2.5 py-1 shadow-xs">
            <DoorClosed className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Door Quote #{attachedDoorQuote.quoteNumber}
            </span>
            <span className="text-[11px] text-muted-foreground">
              ( $
              {attachedDoorQuote.totals?.grandTotal
                ? Number(attachedDoorQuote.totals.grandTotal).toFixed(2)
                : "0.00"}
              )
            </span>
            {(onDetachDoor || onDetach) && (
              <button
                type="button"
                onClick={() => {
                  if (onDetachDoor) onDetachDoor()
                  else if (onDetach) onDetach()
                  toast.info("Detached Door Quote")
                }}
                className="cursor-pointer rounded p-0.5 text-destructive hover:bg-destructive/10"
                title="Detach Door Quote"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
