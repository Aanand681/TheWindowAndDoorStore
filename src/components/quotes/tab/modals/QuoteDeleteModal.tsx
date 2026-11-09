'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface QuoteDeleteModalProps {
  quoteToDelete: { id: string; quoteNumber: string } | null;
  setQuoteToDelete: (val: any) => void;
  isDeletingQuote: boolean;
  confirmDeleteQuote: () => void;
}

export function QuoteDeleteModal({
  quoteToDelete,
  setQuoteToDelete,
  isDeletingQuote,
  confirmDeleteQuote,
}: QuoteDeleteModalProps) {
  if (!quoteToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">
              Delete Quote #{quoteToDelete.quoteNumber}?
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              This action cannot be undone and will permanently remove this quote.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuoteToDelete(null)}
            disabled={isDeletingQuote}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={confirmDeleteQuote}
            disabled={isDeletingQuote}
            className="font-bold cursor-pointer"
          >
            {isDeletingQuote ? 'Deleting...' : 'Delete Quote'}
          </Button>
        </div>
      </div>
    </div>
  );
}

