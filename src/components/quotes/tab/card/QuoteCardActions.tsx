'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Star,
  Trash2,
  Printer,
  Edit3,
  ArrowRight,
  CheckSquare,
} from 'lucide-react';
import type { QuotesSubTabType } from '../types';

interface QuoteCardActionsProps {
  quote: any;
  currentUser: any;
  canReview: boolean;
  isAdmin: boolean;
  canEditApproved: boolean;
  hasOdooAccess: boolean;
  isClerk: boolean;
  activeTab: QuotesSubTabType;
  myUsername?: string;
  staffList: any[];
  onOpenQuote: (quoteId: string, isEdit?: boolean, originSubTab?: QuotesSubTabType) => void;
  handleToggleStar: (id: string, currentStarred: boolean) => void;
  promptDeleteQuote: (id: string, quoteNum: string) => void;
  handlePreviewQuote: (quote: any) => void;
  setSelectedQuoteForReview: (quote: any) => void;
  setReviewerNotes: (val: string) => void;
  setSelectedOdooClerk: (val: string) => void;
  setOdooModalQuote: (quote: any) => void;
  setOdooOrderNum: (val: string) => void;
}

export function QuoteCardActions({
  quote,
  currentUser,
  canReview,
  isAdmin,
  canEditApproved,
  hasOdooAccess,
  isClerk,
  activeTab,
  myUsername,
  staffList,
  onOpenQuote,
  handleToggleStar,
  promptDeleteQuote,
  handlePreviewQuote,
  setSelectedQuoteForReview,
  setReviewerNotes,
  setSelectedOdooClerk,
  setOdooModalQuote,
  setOdooOrderNum,
}: QuoteCardActionsProps) {
  const isPending = quote.status === 'PENDING_REVIEW';
  const isApproved = quote.status === 'APPROVED';
  const isModified = quote.status === 'MODIFIED';
  const isReturned = quote.status === 'RETURNED';

  return (
    <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToggleStar(quote._id, Boolean(quote.isStarred))}
          className="h-8 w-8 text-muted-foreground hover:text-amber-400 cursor-pointer"
          title={
            quote.isStarred
              ? 'Starred (Keep permanently)'
              : 'Star to keep permanently'
          }
        >
          <Star
            className={`w-4 h-4 ${quote.isStarred ? 'fill-amber-400 text-amber-400' : ''}`}
          />
        </Button>

        {(isAdmin || quote.preparedBy === currentUser?.username) && !isClerk && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => promptDeleteQuote(quote._id, quote.quoteNumber)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
            title="Delete quote"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap cq-actions-compact">
        {isApproved || isModified ? (
          <>
            {quote.odooStatus === 'PENDING_ENTRY' &&
              (canReview ||
                hasOdooAccess ||
                quote.odooAssignedTo?.toLowerCase() === myUsername) && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setOdooModalQuote(quote);
                    setOdooOrderNum(quote.odooOrderNumber || '');
                  }}
                  className="gap-1.5 font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs h-8"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-0.5" />
                  <span>Mark Entered in Odoo</span>
                </Button>
              )}

            <Button
              variant="default"
              size="sm"
              onClick={() => handlePreviewQuote(quote)}
              className="gap-1.5 font-bold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-xs h-8"
            >
              <Printer className="w-3.5 h-3.5 mr-0.5" />
              <span>Preview &amp; Print</span>
            </Button>

            {canEditApproved && activeTab !== 'odoo' && !isClerk && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenQuote(quote._id, true, activeTab)}
                className="gap-1 text-xs font-semibold bg-background/80 hover:border-amber-500/50 hover:text-amber-500 cursor-pointer h-8"
              >
                <Edit3 className="w-3 h-3 mr-0.5" />
                <span>Edit</span>
              </Button>
            )}

            {canReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenQuote(quote._id, false, activeTab)}
                className="gap-1 text-xs font-semibold bg-background/80 cursor-pointer h-8"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Button>
            )}
          </>
        ) : (
          <>
            {isPending && canReview && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedQuoteForReview(quote);
                  setReviewerNotes('');
                  const defaultClerk =
                    staffList.find((s: any) => s.department === 'CLERK') || staffList[0];
                  setSelectedOdooClerk(quote.odooAssignedTo || defaultClerk?.username || '');
                }}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold cursor-pointer h-8"
              >
                Quick Approve
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreviewQuote(quote)}
              className="gap-1 bg-background/80 cursor-pointer text-xs h-8"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              <span>Print</span>
            </Button>
            {!isClerk && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onOpenQuote(quote._id, false, activeTab)}
                className="gap-1.5 font-bold shadow-sm cursor-pointer text-xs h-8"
              >
                <span>
                  {isPending
                    ? canReview
                      ? 'Open & Review'
                      : 'View Quote'
                    : isReturned
                      ? 'Revise & Edit'
                      : 'Open in Calculator'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

