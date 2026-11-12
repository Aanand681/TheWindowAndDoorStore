"use client"

import React from "react"
import { DoorLineItem } from "@/lib/doors/types"

interface DoorLivePreviewBoxProps {
  previewItem: DoorLineItem
}

export function DoorLivePreviewBox({ previewItem }: DoorLivePreviewBoxProps) {
  return (
    <div className="space-y-1 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Door Base: ${previewItem.inksterBasePrice.toFixed(2)} (Surch +8%: $
          {previewItem.surchargeAmount.toFixed(2)}
          {previewItem.discountPercent > 0
            ? ` | Disc -10%: -$${previewItem.discountAmount.toFixed(2)}`
            : ""}
          ):
        </span>
        <span className="font-mono font-semibold text-foreground">
          ${previewItem.inksterBasePrice.toFixed(2)}/unit
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Unit Labour (${previewItem.unitLabour.toFixed(2)}) + Misc ($
          {previewItem.unitMisc.toFixed(2)}) + Hardware ($
          {previewItem.hardwarePrice.toFixed(2)}):
        </span>
        <span className="font-mono font-semibold text-foreground">
          $
          {(
            previewItem.lineLabourTotal +
            previewItem.lineMiscTotal +
            previewItem.lineHardwareTotal
          ).toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-1 text-xs font-bold">
        <span>Estimated Line Total (Qty: {previewItem.quantity}):</span>
        <span className="font-mono text-sm font-black text-primary">
          ${previewItem.lineGrandTotal.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
