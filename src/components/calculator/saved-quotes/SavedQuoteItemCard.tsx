'use client';

import React from 'react';
import {
  Calendar,
  Layers,
  Component,
  ArrowRight,
  User,
  Trash2,
  DoorClosed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteDraftItem } from '@/lib/quote-drafts-storage';

interface SavedQuoteItemCardProps {
  draft: QuoteDraftItem;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  onDelete: (id: string, quoteNumber: string) => void;
  onLoadQuote: (draft: QuoteDraftItem) => void;
  onClose: () => void;
}

function formatDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function SavedQuoteItemCard({
  draft,
  confirmDeleteId,
  setConfirmDeleteId,
  onDelete,
  onLoadQuote,
  onClose,
}: SavedQuoteItemCardProps) {
  const isConfirmingDelete = confirmDeleteId === draft.id;
  const displayGrandTotal =
    draft.grandTotal > 50000 && draft.type === 'window'
      ? draft.grandTotal / 100
      : (draft.grandTotal || 0);

  return (
    <div className="group relative bg-card hover:bg-muted/30 border border-border/70 hover:border-primary/40 rounded-xl p-3.5 sm:p-4 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      {/* Left Info */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {draft.type === 'window' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Component className="w-3 h-3" />
              <span>Window Quote</span>
            </span>
          ) : draft.type === 'sealed_unit' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Layers className="w-3 h-3" />
              <span>Sealed Unit Quote</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <DoorClosed className="w-3 h-3" />
              <span>Door Quote</span>
            </span>
          )}

          <span className="font-mono text-xs font-bold text-foreground">
            #{draft.quoteNumber}
          </span>

          <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-auto sm:ml-0">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(draft.updatedAt || draft.createdAt)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">
            {draft.customerName || 'Unnamed Customer'}
          </span>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="truncate">{draft.summaryLabel}</span>
          <span>•</span>
          <span className="font-medium text-foreground">{draft.itemCount} items</span>
        </div>
      </div>

      {/* Right: Financials & Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:border-l sm:border-border/60 sm:pl-4 shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            Total Amount
          </div>
          <div className="font-mono font-black text-base sm:text-lg text-primary">
            ${displayGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 bg-destructive/10 p-1 rounded-lg border border-destructive/30">
              <span className="text-[11px] font-semibold text-destructive px-1.5">Delete?</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onDelete(draft.id, draft.quoteNumber)}
                className="h-7 px-2 text-xs font-bold cursor-pointer"
              >
                Yes
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDeleteId(null)}
                className="h-7 px-2 text-xs cursor-pointer"
              >
                No
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDeleteId(draft.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Delete draft"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              onLoadQuote(draft);
              onClose();
            }}
            className="h-8 px-3 text-xs font-bold gap-1.5 shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <span>Load Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

