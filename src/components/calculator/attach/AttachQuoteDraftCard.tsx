'use client';

import React from 'react';
import { AppWindow, Calendar, CheckCircle2, DoorClosed, Layers, Paperclip, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteDraftItem } from '@/lib/quote-drafts-storage';

export interface AttachQuoteDraftCardProps {
  draft: QuoteDraftItem;
  isAttached: boolean;
  onAttachItem: (draft: QuoteDraftItem) => void;
}

export function AttachQuoteDraftCard({
  draft,
  isAttached,
  onAttachItem,
}: AttachQuoteDraftCardProps) {
  const isDoor = draft.type === 'door';
  const isSealedUnit = draft.type === 'sealed_unit';

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isAttached
          ? 'border-emerald-500/60 bg-emerald-500/5 shadow-xs'
          : 'border-border/70 hover:border-border hover:bg-muted/30 bg-card'
      }`}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-foreground">
            #{draft.quoteNumber || 'Untitled'}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isDoor
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                : isSealedUnit
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                : 'bg-primary/10 text-primary border border-primary/30'
            }`}
          >
            {isDoor ? (
              <>
                <DoorClosed className="w-3 h-3" /> Door Quote
              </>
            ) : isSealedUnit ? (
              <>
                <Layers className="w-3 h-3" /> Sealed Units
              </>
            ) : (
              <>
                <AppWindow className="w-3 h-3" /> Window Quote
              </>
            )}
          </span>

          {isAttached && (
            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Attached
            </span>
          )}
        </div>

        <div className="text-xs text-foreground font-semibold flex items-center gap-3">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-muted-foreground" />
            {draft.customerName || 'No customer name'}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDate(draft.updatedAt)}
          </span>
        </div>

        <div className="text-[11px] text-muted-foreground truncate max-w-md">
          {draft.summaryLabel || `${draft.itemCount || 0} items`}
        </div>
      </div>

      <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
        <div className="text-right">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Total</div>
          <div className="font-mono font-black text-base text-foreground">
            ${draft.grandTotal ? draft.grandTotal.toFixed(2) : '0.00'}
          </div>
        </div>

        <Button
          type="button"
          variant={isAttached ? 'outline' : 'default'}
          size="sm"
          onClick={() => onAttachItem(draft)}
          className={`h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-xs ${
            isAttached
              ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-500/10'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          <Paperclip className="w-3.5 h-3.5" />
          <span>{isAttached ? 'Re-attach / Update' : 'Attach Quote'}</span>
        </Button>
      </div>
    </div>
  );
}

