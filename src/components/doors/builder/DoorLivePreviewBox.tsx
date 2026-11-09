'use client';

import React from 'react';
import { DoorLineItem } from '@/lib/doors/types';

interface DoorLivePreviewBoxProps {
  previewItem: DoorLineItem;
}

export function DoorLivePreviewBox({ previewItem }: DoorLivePreviewBoxProps) {
  return (
    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1">
      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
        <span>
          Door Base: ${previewItem.inksterBasePrice.toFixed(2)} (Surch +8%: ${previewItem.surchargeAmount.toFixed(2)}
          {previewItem.discountPercent > 0 ? ` | Disc -10%: -$${previewItem.discountAmount.toFixed(2)}` : ''}):
        </span>
        <span className="font-mono font-semibold text-foreground">
          ${previewItem.inksterBasePrice.toFixed(2)}/unit
        </span>
      </div>

      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
        <span>
          Unit Labour (${previewItem.unitLabour.toFixed(2)}) + Misc (${previewItem.unitMisc.toFixed(2)}) + Hardware (${previewItem.hardwarePrice.toFixed(2)}):
        </span>
        <span className="font-mono font-semibold text-foreground">
          ${(previewItem.lineLabourTotal + previewItem.lineMiscTotal + previewItem.lineHardwareTotal).toFixed(2)}
        </span>
      </div>

      <div className="pt-1 border-t border-border/40 flex items-center justify-between text-xs font-bold">
        <span>Estimated Line Total (Qty: {previewItem.quantity}):</span>
        <span className="text-sm font-mono text-primary font-black">
          ${previewItem.lineGrandTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

