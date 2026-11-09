'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckSquare,
  Save,
  Send,
  Printer,
} from 'lucide-react';

export interface ReviewWorkflowActionButtonsProps {
  reviewQuote: any;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  canEditCurrentQuote: boolean;
  isReviewerOrAdmin: boolean;
  isOdooClerk: boolean;
  reviewActionLoading: boolean;
  handleSaveQuotePrices: () => void;
  handleCancelEdits: () => void;
  handleResubmitReturnedQuote: () => void;
  handleExitReview: () => void;
  setIsPreviewOpen: (val: boolean) => void;
  setOdooOrderNumberInput: (val: string) => void;
  setShowCompleteOdooModal: (val: boolean) => void;
  handleReturnReviewQuote: () => void;
  handleApproveReviewQuote: () => void;
}

export function ReviewWorkflowActionButtons({
  reviewQuote,
  isEditMode,
  setIsEditMode,
  canEditCurrentQuote,
  isReviewerOrAdmin,
  isOdooClerk,
  reviewActionLoading,
  handleSaveQuotePrices,
  handleCancelEdits,
  handleResubmitReturnedQuote,
  handleExitReview,
  setIsPreviewOpen,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  handleReturnReviewQuote,
  handleApproveReviewQuote,
}: ReviewWorkflowActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
      {/* 1. EDIT QUOTE / SAVE CHANGES */}
      {canEditCurrentQuote && (
        isEditMode ? (
          <Button
            size="sm"
            onClick={handleSaveQuotePrices}
            disabled={reviewActionLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm cursor-pointer transition-all"
            title="Save changes to this quote"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {reviewActionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(true)}
            className="cursor-pointer border-primary/50 text-primary hover:bg-primary/10 font-bold bg-background/80 shadow-sm"
            title="Enter edit mode to make changes"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Quote
          </Button>
        )
      )}

      {/* Returned Quotes Resubmit Action */}
      {reviewQuote.status === 'RETURNED' && !isEditMode && (
        <Button
          size="sm"
          onClick={handleResubmitReturnedQuote}
          disabled={reviewActionLoading}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm cursor-pointer"
          title="Resubmit quote for reviewer approval"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          {reviewActionLoading ? 'Resubmitting...' : 'Resubmit for Review'}
        </Button>
      )}

      {/* 2. APPROVE QUOTE (Reviewer / Admin) */}
      {reviewQuote.status === 'PENDING_REVIEW' && isReviewerOrAdmin && (
        <Button
          size="sm"
          onClick={handleApproveReviewQuote}
          disabled={reviewActionLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
          title="Approve this quote"
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          {reviewActionLoading ? 'Approving...' : 'Approve Quote'}
        </Button>
      )}

      {/* 3. RETURN WITH NOTE (Reviewer / Admin) */}
      {reviewQuote.status === 'PENDING_REVIEW' && isReviewerOrAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReturnReviewQuote}
          disabled={reviewActionLoading}
          className="text-amber-700 dark:text-amber-400 border-amber-400/50 hover:bg-amber-500/10 font-semibold cursor-pointer shadow-sm"
          title="Return quote to preparer with notes"
        >
          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
          Return with Note
        </Button>
      )}

      {/* Approved/Modified Quotes: Quick Preview & Print */}
      {(reviewQuote.status === 'APPROVED' || reviewQuote.status === 'MODIFIED') && !isEditMode && (
        <>
          <Button
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Preview &amp; Print
          </Button>

          {reviewQuote.odooStatus === 'PENDING_ENTRY' && (isReviewerOrAdmin || isOdooClerk) && (
            <Button
              size="sm"
              onClick={() => {
                setOdooOrderNumberInput('');
                setShowCompleteOdooModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 mr-1.5" />
              Mark Entered in Odoo
            </Button>
          )}
        </>
      )}

      {/* Read-Only Banner for non-reviewers when pending */}
      {reviewQuote.status === 'PENDING_REVIEW' && !isReviewerOrAdmin && !isEditMode && (
        <div className="px-3 py-1.5 rounded-lg bg-background/60 border border-border text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>In Review with {reviewQuote.assignedTo || 'Reviewer'} (Read-Only)</span>
        </div>
      )}

      {/* 4. EXIT REVIEW / CANCEL EDITS */}
      {isEditMode ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancelEdits}
          disabled={reviewActionLoading}
          className="cursor-pointer font-bold text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-900/60 dark:hover:bg-rose-950/40 shadow-sm"
          title="Cancel edits and restore original values"
        >
          Cancel Edits
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitReview}
          className="cursor-pointer font-bold text-rose-600 border-rose-400/80 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800/80 dark:hover:bg-rose-950/50 shadow-sm"
          title="Exit review mode and return to quotes list"
        >
          Exit Review
        </Button>
      )}
    </div>
  );
}

