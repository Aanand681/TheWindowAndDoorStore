'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DoorClosed, FileText, Printer, X } from 'lucide-react';
import QuoteNotesEditor from '@/components/quotes/QuoteNotesEditor';

export interface DoorPrintToolbarProps {
  showNotesEditor: boolean;
  setShowNotesEditor: (show: boolean) => void;
  quoteNotes: string;
  onQuoteNotesChange: (notes: string) => void;
  onPrint: () => void;
  onClose: () => void;
}

export function DoorPrintToolbar({
  showNotesEditor,
  setShowNotesEditor,
  quoteNotes,
  onQuoteNotesChange,
  onPrint,
  onClose,
}: DoorPrintToolbarProps) {
  return (
    <div className="no-print bg-card/90 border-b border-border px-4 sm:px-6 py-2.5 shadow-md shrink-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <DoorClosed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Door Quote Preview &amp; Print
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Official architectural proposal matching window and sealed unit specifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNotesEditor(!showNotesEditor)}
            className="gap-1.5 text-xs h-8 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showNotesEditor ? 'Hide Notes' : 'Edit Special Notes'}</span>
            {quoteNotes && quoteNotes.trim() && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
            )}
          </Button>

          <Button
            type="button"
            onClick={onPrint}
            className="gap-1.5 text-xs h-8 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Quote</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Inline Rich Notes Editor inside Modal */}
      {showNotesEditor && (
        <div className="max-w-5xl mx-auto mt-2.5 pt-2.5 border-t border-border/60 animate-in fade-in duration-150">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-foreground">
              Special Notes &amp; Site Instructions (Supports bold &amp; bullet points)
            </span>
            <button
              type="button"
              onClick={() => setShowNotesEditor(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Close Editor
            </button>
          </div>
          <QuoteNotesEditor
            id="doorQuoteModalNotes"
            value={quoteNotes}
            onChange={onQuoteNotesChange}
            placeholder="Enter special site instructions, door warranty details, or customer notes..."
          />
        </div>
      )}
    </div>
  );
}

