'use client';

import React from 'react';
import {
  AlertTriangle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { QuotesSubTabType } from '../types';

interface QuoteCardNotesProps {
  quote: any;
  isClerk: boolean;
  activeTab: QuotesSubTabType;
  isModified: boolean;
}

export function QuoteCardNotes({
  quote,
  isClerk,
  activeTab,
  isModified,
}: QuoteCardNotesProps) {
  if (isClerk || activeTab === 'odoo') return null;

  const shouldRender =
    (quote.status === 'RETURNED' && quote.reviewerNotes) ||
    (quote.preparerNotes && quote.status !== 'RETURNED') ||
    isModified ||
    (quote.reviewChanges && quote.reviewChanges.length > 0);

  if (!shouldRender) return null;

  return (
    <div className="space-y-2 pt-1">
      {quote.status === 'RETURNED' && quote.reviewerNotes && (
        <div className="text-xs bg-amber-500/15 border border-amber-500/35 text-amber-950 dark:text-amber-200 p-3 rounded-xl font-medium flex items-start gap-2 shadow-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-amber-900 dark:text-amber-300">
              Revision Requested by {quote.reviewedBy || quote.assignedTo || 'Reviewer'}:
            </span>
            <p className="mt-0.5 italic text-foreground/90 font-normal">
              &quot;{quote.reviewerNotes}&quot;
            </p>
          </div>
        </div>
      )}

      {quote.preparerNotes && quote.status !== 'RETURNED' && (
        <div className="text-xs bg-muted/40 p-2.5 rounded-xl border border-border/60 text-muted-foreground italic flex items-start gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Note from {quote.preparedBy}:</strong> &quot;{quote.preparerNotes}&quot;
          </span>
        </div>
      )}

      {(isModified || (quote.reviewChanges && quote.reviewChanges.length > 0)) && (
        <div className="text-xs bg-blue-50 text-blue-950 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-800 p-3 rounded-xl shadow-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>
              What {quote.reviewedBy || quote.assignedTo || 'Admin'} Edited &amp; Approved:
            </span>
          </div>
          {quote.reviewChanges && quote.reviewChanges.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-200 font-medium">
              {quote.reviewChanges.map((c: string, idx: number) => (
                <li key={idx} className="leading-snug">
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-700 dark:text-blue-300 italic">
              Price or configuration adjustments made during review.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

