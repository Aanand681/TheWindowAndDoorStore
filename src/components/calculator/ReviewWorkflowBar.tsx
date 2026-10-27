'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Edit3,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  CheckSquare,
  ClipboardCheck,
  AlertTriangle,
  Save,
  Send,
  Printer,
} from 'lucide-react';

export interface ReviewWorkflowBarProps {
  reviewQuote: any;
  activeTab: string;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  canEditCurrentQuote: boolean;
  isReviewerOrAdmin: boolean;
  isOdooClerk: boolean;
  user: any;
  reviewActionLoading: boolean;
  handleSaveQuotePrices: () => void;
  handleCancelEdits: () => void;
  handleResubmitReturnedQuote: () => void;
  handleExitReview: () => void;
  setIsPreviewOpen: (val: boolean) => void;
  setOdooOrderNumberInput: (val: string) => void;
  setShowCompleteOdooModal: (val: boolean) => void;
  staffList: any[];
  setReassignTo: (val: string) => void;
  setReassignNotes: (val: string) => void;
  setShowReassignModal: (val: boolean) => void;
  handleReturnReviewQuote: () => void;
  handleApproveReviewQuote: () => void;
}

export function ReviewWorkflowBar({
  reviewQuote,
  activeTab,
  isEditMode,
  setIsEditMode,
  canEditCurrentQuote,
  isReviewerOrAdmin,
  isOdooClerk,
  user,
  reviewActionLoading,
  handleSaveQuotePrices,
  handleCancelEdits,
  handleResubmitReturnedQuote,
  handleExitReview,
  setIsPreviewOpen,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  staffList,
  setReassignTo,
  setReassignNotes,
  setShowReassignModal,
  handleReturnReviewQuote,
  handleApproveReviewQuote,
}: ReviewWorkflowBarProps) {
  if (!reviewQuote || activeTab === 'quotes') return null;

  return (
    <div
      className={`p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 border-2 ${
        reviewQuote.status === 'APPROVED'
          ? 'bg-emerald-500/15 border-emerald-500/50'
          : reviewQuote.status === 'MODIFIED'
          ? 'bg-blue-500/15 border-blue-500/50'
          : reviewQuote.status === 'RETURNED'
          ? 'bg-destructive/15 border-destructive/50'
          : 'bg-amber-500/15 border-amber-500/50'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {isEditMode ? (
            <span className="bg-amber-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
              <Edit3 className="w-3.5 h-3.5" /> Edit Mode Active (Unlocked)
            </span>
          ) : (
            <>
              {reviewQuote.status === 'APPROVED' && (
                <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Quote Approved (View Only)
                </span>
              )}
              {reviewQuote.status === 'MODIFIED' && (
                <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Modified &amp; Approved (View Only)
                </span>
              )}
              {reviewQuote.status === 'RETURNED' && (
                <span className="bg-destructive text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" /> Returned for Revision (Editable)
                </span>
              )}
              {reviewQuote.status === 'PENDING_REVIEW' && (
                <span className="bg-amber-500 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Clock className="w-3.5 h-3.5" />{' '}
                  {isReviewerOrAdmin
                    ? 'Review Mode Active'
                    : reviewQuote.assignedTo
                    ? `In Review with ${reviewQuote.assignedTo} (Read-Only)`
                    : 'In Review (Read-Only)'}
                </span>
              )}
            </>
          )}

          {/* Odoo Status Badge */}
          {reviewQuote.odooAssignedTo &&
            (reviewQuote.odooStatus === 'COMPLETED' ? (
              <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  Entered in Odoo {reviewQuote.odooOrderNumber ? `(#${reviewQuote.odooOrderNumber})` : ''}
                </span>
              </span>
            ) : (
              <span className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Odoo Entry Pending ({reviewQuote.odooAssignedTo})</span>
              </span>
            ))}

          <h2 className="font-extrabold text-lg text-foreground">
            Quote #{reviewQuote.quoteNumber} for {reviewQuote.customerName}
          </h2>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
          <span>
            Prepared by: <strong className="text-foreground">{reviewQuote.preparedBy}</strong>
          </span>
          {reviewQuote.assignedTo && (
            <>
              <span>&bull;</span>
              <span>
                Assigned to: <strong className="text-foreground">{reviewQuote.assignedTo}</strong>
              </span>
            </>
          )}
          {reviewQuote.preparerNotes && (
            <>
              <span>&bull;</span>
              <span className="italic">Note: "{reviewQuote.preparerNotes}"</span>
            </>
          )}
        </div>

        {/* Show Revision Instructions if Returned */}
        {reviewQuote.status === 'RETURNED' && reviewQuote.reviewerNotes && (
          <div className="text-xs bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-500/35 p-3 rounded-xl font-medium mt-2 shadow-xs flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 dark:text-amber-300">
                Revision requested by {reviewQuote.reviewedBy || reviewQuote.assignedTo || 'Reviewer'}:
              </strong>
              <p className="mt-0.5 italic text-foreground/90 font-normal">"{reviewQuote.reviewerNotes}"</p>
            </div>
          </div>
        )}

        {/* Show Changes Log if Modified (Hidden for Odoo clerk) */}
        {reviewQuote.status === 'MODIFIED' && !isOdooClerk && user?.department !== 'CLERK' && (
          <div className="text-xs bg-blue-50 text-blue-950 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-800 p-3 rounded-xl font-medium mt-2 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 mb-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>What {reviewQuote.reviewedBy || reviewQuote.assignedTo || 'Admin'} Edited &amp; Approved:</span>
            </div>
            {reviewQuote.reviewChanges && reviewQuote.reviewChanges.length > 0 ? (
              <ul className="list-disc pl-5 mt-1 space-y-1 text-blue-800 dark:text-blue-200 font-medium">
                {reviewQuote.reviewChanges.map((c: string, idx: number) => (
                  <li key={idx} className="leading-snug">
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-blue-700 dark:text-blue-300 italic mt-0.5">
                Price or specification adjustments made during review.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
        {/* 1. EDIT QUOTE / SAVE CHANGES (In-place transform) */}
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

            {/* Mark Entered in Odoo Action for Clerk */}
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

        {/* 4. EXIT REVIEW / CANCEL EDITS (Bold Red) */}
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
    </div>
  );
}

export default ReviewWorkflowBar;
