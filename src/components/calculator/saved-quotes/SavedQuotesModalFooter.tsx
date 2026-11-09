'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteType } from '@/lib/quote-drafts-storage';

interface SavedQuotesModalFooterProps {
  totalDraftsCount: number;
  selectedTab: QuoteType | 'all';
  isConfirmingDeleteAll: boolean;
  setIsConfirmingDeleteAll: (val: boolean) => void;
  handleDeleteAll: () => void;
  onClose: () => void;
}

export function SavedQuotesModalFooter({
  totalDraftsCount,
  selectedTab,
  isConfirmingDeleteAll,
  setIsConfirmingDeleteAll,
  handleDeleteAll,
  onClose,
}: SavedQuotesModalFooterProps) {
  return (
    <div className="p-3.5 sm:p-4 border-t border-border/70 bg-muted/20 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground">
          {totalDraftsCount} total saved {totalDraftsCount === 1 ? 'quote' : 'quotes'}
        </div>

        {totalDraftsCount > 0 && (
          <>
            {isConfirmingDeleteAll ? (
              <div className="flex items-center gap-1.5 bg-destructive/10 px-2 py-1 rounded-lg border border-destructive/30">
                <span className="text-xs font-bold text-destructive">
                  Delete all {selectedTab === 'all' ? 'quotes' : selectedTab === 'window' ? 'window quotes' : 'sealed unit quotes'}?
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteAll}
                  className="h-6 px-2 text-xs font-bold cursor-pointer"
                >
                  Yes, Delete All
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsConfirmingDeleteAll(false)}
                  className="h-6 px-1.5 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmingDeleteAll(true)}
                className="h-7 px-2 text-xs font-semibold text-destructive/80 hover:text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
                title="Delete all saved quotes"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All</span>
              </Button>
            )}
          </>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        className="h-8 text-xs font-semibold cursor-pointer ml-auto"
      >
        Close
      </Button>
    </div>
  );
}

