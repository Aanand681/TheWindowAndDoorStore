'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  CheckSquare,
  ClipboardCheck,
  Star,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/promo-logic';

interface QuoteCardHeaderProps {
  quote: any;
  isClerk: boolean;
  canReview: boolean;
  pricing: any;
  finalTotalCents: number;
  handlePreviewQuote: (quote: any) => void;
}

export function QuoteCardHeader({
  quote,
  isClerk,
  canReview,
  pricing,
  finalTotalCents,
  handlePreviewQuote,
}: QuoteCardHeaderProps) {
  const isPending = quote.status === 'PENDING_REVIEW';
  const isApproved = quote.status === 'APPROVED';
  const isModified = quote.status === 'MODIFIED';
  const isReturned = quote.status === 'RETURNED';

  const createdDate = new Date(quote.createdAt).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 cq-stack-compact cq-header-medium">
      <div
        className={cn('space-y-1.5 flex-1 min-w-0', isClerk && 'cursor-pointer group')}
        onClick={isClerk ? () => handlePreviewQuote(quote) : undefined}
        title={isClerk ? 'Click to Preview & Print Quote' : undefined}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-mono text-base font-bold text-foreground',
              isClerk && 'group-hover:text-primary transition-colors'
            )}
          >
            #{quote.quoteNumber}
          </span>
          <span
            className={cn(
              'font-semibold text-foreground truncate max-w-[220px] sm:max-w-md',
              isClerk && 'group-hover:text-primary transition-colors'
            )}
            title={quote.customerName}
          >
            {quote.customerName}
          </span>

          {/* Status Badge */}
          {isPending && (
            <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {canReview
                  ? 'Pending Review'
                  : quote.assignedTo
                    ? `In Review with ${quote.assignedTo}`
                    : 'In Review'}
              </span>
            </span>
          )}
          {isApproved && (
            <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Approved by {quote.reviewedBy || quote.assignedTo || 'Admin'}</span>
            </span>
          )}
          {isModified && (
            <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>
                Modified &amp; Approved by {quote.reviewedBy || quote.assignedTo || 'Admin'}
              </span>
            </span>
          )}
          {isReturned && (
            <span className="bg-destructive/15 text-destructive border border-destructive/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Returned for Revision</span>
            </span>
          )}
          {/* Odoo Status Badge */}
          {quote.odooAssignedTo &&
            (quote.odooStatus === 'COMPLETED' ? (
              <span className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <CheckSquare className="w-3 h-3 text-emerald-500" />
                <span>
                  Entered in Odoo {quote.odooOrderNumber ? `(#${quote.odooOrderNumber})` : ''}
                </span>
              </span>
            ) : (
              <span className="bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <ClipboardCheck className="w-3 h-3 text-indigo-500" />
                <span>Odoo Entry Pending ({quote.odooAssignedTo})</span>
              </span>
            ))}

          {quote.isStarred && (
            <span className="text-amber-400" title="Starred / Protected from auto-flush">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </span>
          )}
        </div>

        {/* Metadata line */}
        <div className="text-xs text-muted-foreground flex items-center gap-2.5 flex-wrap">
          <span>
            Prepared by: <strong className="text-foreground">{quote.preparedBy}</strong>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {createdDate}
          </span>
          {quote.taxTotals?.regionName && (
            <>
              <span>&bull;</span>
              <span>
                Region: <strong className="text-foreground">{quote.taxTotals.regionName}</strong>
              </span>
            </>
          )}
          <span>&bull;</span>
          <span>{quote.windows?.length || 0} Windows</span>
        </div>
      </div>

      {/* Right: Financials / Price Badge */}
      <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-1 shrink-0 bg-muted/40 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-border/40 cq-price-compact">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          Quote Total
        </span>
        <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground">
          {formatMoney(finalTotalCents)}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 flex-wrap justify-end">
          <span>Base: {formatMoney(pricing?.basePrice || 0)}</span>
          {(pricing?.effectiveLabour || 0) > 0 && (
            <span>&bull; Lab: {formatMoney(pricing?.effectiveLabour || 0)}</span>
          )}
          {(pricing?.effectiveJC || 0) > 0 && (
            <span>&bull; J&amp;C: {formatMoney(pricing?.effectiveJC || 0)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

