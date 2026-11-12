"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Save, RotateCcw, Check, Loader2 } from "lucide-react"

interface PromoOrderAlertProps {
  savingOrder: boolean
  onSaveOrder: () => void
  onDiscardChanges: () => void
}

export function PromoOrderAlert({
  savingOrder,
  onSaveOrder,
  onDiscardChanges,
}: PromoOrderAlertProps) {
  return (
    <div className="mb-6 flex flex-col items-center justify-between gap-3 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-4 shadow-md sm:flex-row">
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-amber-500/20 p-2 text-amber-500">
          <Save className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">
            You have rearranged the promo sequence!
          </div>
          <div className="text-xs text-muted-foreground">
            Click &quot;Save Order&quot; to permanently store this order and
            update the promo calculator.
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDiscardChanges}
          disabled={savingOrder}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Discard
        </Button>
        <Button
          size="sm"
          onClick={onSaveOrder}
          disabled={savingOrder}
          className="bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700"
        >
          {savingOrder ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" /> Save Order
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
