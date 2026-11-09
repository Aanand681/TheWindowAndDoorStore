'use client';

import React from 'react';
import { Paperclip } from 'lucide-react';

export interface DoorSummaryAttachedBadgesProps {
  attachedWindowQuote?: any | null;
  attachedSealedUnit?: any | null;
  onRemoveAttachedWindowQuote?: () => void;
  onRemoveAttachedSealedUnit?: () => void;
}

export function DoorSummaryAttachedBadges({
  attachedWindowQuote,
  attachedSealedUnit,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedSealedUnit,
}: DoorSummaryAttachedBadgesProps) {
  const hasAnyAttached = Boolean(attachedWindowQuote || attachedSealedUnit);
  if (!hasAnyAttached) return null;

  return (
    <div className="space-y-1.5 pb-1">
      {attachedWindowQuote && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
            <span>Combined Quote: Attached Window #{attachedWindowQuote.quoteNumber}</span>
          </span>
          {onRemoveAttachedWindowQuote && (
            <button
              type="button"
              onClick={onRemoveAttachedWindowQuote}
              className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
            >
              Detach
            </button>
          )}
        </div>
      )}

      {attachedSealedUnit && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-800 dark:text-blue-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
            <span>Combined Quote: Attached Sealed Unit #{attachedSealedUnit.quoteNumber}</span>
          </span>
          {onRemoveAttachedSealedUnit && (
            <button
              type="button"
              onClick={onRemoveAttachedSealedUnit}
              className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
            >
              Detach
            </button>
          )}
        </div>
      )}
    </div>
  );
}

