'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Send, Printer } from 'lucide-react';

export interface DoorSummaryActionsProps {
  isAdmin?: boolean;
  canSubmit: boolean;
  onSubmitQuote: () => void;
  onPrintPreview: () => void;
}

export function DoorSummaryActions({
  isAdmin = false,
  canSubmit,
  onSubmitQuote,
  onPrintPreview,
}: DoorSummaryActionsProps) {
  return (
    <div className="space-y-2 pt-2 border-t border-border/50">
      {/* Button 1: Submit / Approve & Assign Quote */}
      <Button
        type="button"
        onClick={onSubmitQuote}
        disabled={!canSubmit}
        className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
      >
        {isAdmin ? (
          <>
            <ShieldCheck className="w-4 h-4" />
            Approve &amp; Assign Quote
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Quote for Review
          </>
        )}
      </Button>

      {/* Button 2: Preview & Print Door Quote */}
      <Button
        type="button"
        onClick={onPrintPreview}
        disabled={!canSubmit}
        className="w-full h-10 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        Preview &amp; Print Door Quote
      </Button>
    </div>
  );
}

