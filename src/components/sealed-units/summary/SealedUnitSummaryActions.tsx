'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, ShieldCheck, Send, Printer } from 'lucide-react';
import QuoteNotesEditor from '@/components/quotes/QuoteNotesEditor';
import { cn } from '@/lib/utils';

export interface SealedUnitSummaryActionsProps {
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  hasContent: boolean;
  user?: any;
  onOpenSubmitModal?: () => void;
  onPrint: () => void;
}

export function SealedUnitSummaryActions({
  quoteNotes,
  setQuoteNotes,
  hasContent,
  user,
  onOpenSubmitModal,
  onPrint,
}: SealedUnitSummaryActionsProps) {
  const isAdminOrSuperAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  return (
    <>
      {/* Quote Notes Section */}
      <div className="pt-2 border-t border-border/50 space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="sealedUnitNotes"
            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Special Notes &amp; Instructions</span>
          </Label>
          <span className="text-[10px] text-muted-foreground">Printed on PDF quotation</span>
        </div>
        <QuoteNotesEditor
          id="sealedUnitNotes"
          value={quoteNotes}
          onChange={setQuoteNotes}
          placeholder="Enter special site notes, instructions, or employee comments with bold text and bullets..."
        />
      </div>

      {/* Action Buttons: Submit / Approve & Assign, Preview & Print */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        {onOpenSubmitModal && (
          <Button
            type="button"
            variant="default"
            onClick={onOpenSubmitModal}
            disabled={!hasContent}
            className={cn(
              'w-full h-10 text-xs shadow-md font-bold text-white cursor-pointer transition-colors',
              isAdminOrSuperAdmin
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            )}
          >
            {isAdminOrSuperAdmin ? (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" /> Approve &amp; Assign / Submit Quote
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Submit Quote for Review
              </>
            )}
          </Button>
        )}

        <Button
          type="button"
          onClick={onPrint}
          disabled={!hasContent}
          className="w-full h-10 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold gap-2 shadow-sm text-xs sm:text-sm cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Preview &amp; Print Quote</span>
        </Button>
      </div>
    </>
  );
}

