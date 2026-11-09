'use client';

import React from 'react';
import { AppWindow, CheckCircle2, DoorClosed, Layers, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export interface AttachedQuotesPillsProps {
  attachedWindowQuote?: any | null;
  attachedSealedUnit?: any | null;
  attachedDoorQuote?: any | null;
  onDetachWindow?: () => void;
  onDetachSealedUnit?: () => void;
  onDetachDoor?: () => void;
  onDetach?: () => void;
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
  const hasAnyAttached = Boolean(attachedWindowQuote || attachedSealedUnit || attachedDoorQuote);
  if (!hasAnyAttached) return null;

  return (
    <div className="p-3 sm:px-5 bg-emerald-500/10 border-b border-emerald-500/30 flex flex-col gap-2 text-xs">
      <div className="font-semibold text-foreground flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Currently Attached to this Quotation:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {attachedWindowQuote && (
          <div className="flex items-center gap-2 bg-card/80 border border-emerald-500/40 rounded-lg px-2.5 py-1 shadow-xs">
            <AppWindow className="w-3.5 h-3.5 text-primary" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Window #{attachedWindowQuote.quoteNumber}
            </span>
            <span className="text-[11px] text-muted-foreground">
              (
              $
              {attachedWindowQuote.totals?.grandTotal
                ? Number(attachedWindowQuote.totals.grandTotal).toFixed(2)
                : '0.00'}
              )
            </span>
            {(onDetachWindow || onDetach) && (
              <button
                type="button"
                onClick={() => {
                  if (onDetachWindow) onDetachWindow();
                  else if (onDetach) onDetach();
                  toast.info('Detached Window Quote');
                }}
                className="text-destructive hover:bg-destructive/10 p-0.5 rounded cursor-pointer"
                title="Detach Window Quote"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {attachedSealedUnit && (
          <div className="flex items-center gap-2 bg-card/80 border border-emerald-500/40 rounded-lg px-2.5 py-1 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Sealed Unit #{attachedSealedUnit.quoteNumber}
            </span>
            <span className="text-[11px] text-muted-foreground">
              (
              $
              {attachedSealedUnit.totals?.grandTotal
                ? Number(attachedSealedUnit.totals.grandTotal).toFixed(2)
                : '0.00'}
              )
            </span>
            {(onDetachSealedUnit || onDetach) && (
              <button
                type="button"
                onClick={() => {
                  if (onDetachSealedUnit) onDetachSealedUnit();
                  else if (onDetach) onDetach();
                  toast.info('Detached Sealed Unit Quote');
                }}
                className="text-destructive hover:bg-destructive/10 p-0.5 rounded cursor-pointer"
                title="Detach Sealed Unit"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {attachedDoorQuote && (
          <div className="flex items-center gap-2 bg-card/80 border border-emerald-500/40 rounded-lg px-2.5 py-1 shadow-xs">
            <DoorClosed className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Door Quote #{attachedDoorQuote.quoteNumber}
            </span>
            <span className="text-[11px] text-muted-foreground">
              (
              $
              {attachedDoorQuote.totals?.grandTotal
                ? Number(attachedDoorQuote.totals.grandTotal).toFixed(2)
                : '0.00'}
              )
            </span>
            {(onDetachDoor || onDetach) && (
              <button
                type="button"
                onClick={() => {
                  if (onDetachDoor) onDetachDoor();
                  else if (onDetach) onDetach();
                  toast.info('Detached Door Quote');
                }}
                className="text-destructive hover:bg-destructive/10 p-0.5 rounded cursor-pointer"
                title="Detach Door Quote"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

