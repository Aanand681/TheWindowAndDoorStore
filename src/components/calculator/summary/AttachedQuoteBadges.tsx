import React from 'react';
import { Paperclip, Sparkles } from 'lucide-react';
import { formatMoney } from '@/lib/promo-logic';

export interface AttachedQuoteBadgesProps {
  attachedSealedUnit?: any | null;
  onRemoveAttachedSealedUnit?: () => void;
  attachedDoorQuote?: any | null;
  onRemoveAttachedDoorQuote?: () => void;
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null;
  onRemoveAttachedUpgrade?: () => void;
}

export function AttachedQuoteBadges({
  attachedSealedUnit,
  onRemoveAttachedSealedUnit,
  attachedDoorQuote,
  onRemoveAttachedDoorQuote,
  attachedUpgrade,
  onRemoveAttachedUpgrade,
}: AttachedQuoteBadgesProps) {
  if (!attachedSealedUnit && !attachedDoorQuote && !attachedUpgrade) return null;

  return (
    <>
      {/* Attached Comparison Upgrade Badge */}
      {attachedUpgrade && attachedUpgrade.amountPreTaxCents > 0 && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 mb-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Attached Upgrade: {attachedUpgrade.title} (+{formatMoney(attachedUpgrade.amountPreTaxCents)})
            </span>
          </span>
          {onRemoveAttachedUpgrade && (
            <button
              type="button"
              onClick={onRemoveAttachedUpgrade}
              className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
            >
              Detach
            </button>
          )}
        </div>
      )}

      {/* Attached Sealed Unit Badge */}
      {attachedSealedUnit && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 mb-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
            <span>Combined Quote: Attached #{attachedSealedUnit.quoteNumber}</span>
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

      {/* Attached Door Quote Badge */}
      {attachedDoorQuote && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 mb-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="w-3.5 h-3.5 text-amber-600" />
            <span>Combined Quote: Attached Door #{attachedDoorQuote.quoteNumber}</span>
          </span>
          {onRemoveAttachedDoorQuote && (
            <button
              type="button"
              onClick={onRemoveAttachedDoorQuote}
              className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
            >
              Detach
            </button>
          )}
        </div>
      )}
    </>
  );
}

