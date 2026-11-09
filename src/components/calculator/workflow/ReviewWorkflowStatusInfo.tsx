'use client';

import React from 'react';
import {
  Edit3,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  CheckSquare,
  ClipboardCheck,
  AlertTriangle,
} from 'lucide-react';

export interface ReviewWorkflowStatusInfoProps {
  reviewQuote: any;
  isEditMode: boolean;
  isReviewerOrAdmin: boolean;
  isOdooClerk: boolean;
  user: any;
}

export function ReviewWorkflowStatusInfo({
  reviewQuote,
  isEditMode,
  isReviewerOrAdmin,
  isOdooClerk,
  user,
}: ReviewWorkflowStatusInfoProps) {
  return (
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
            <span className="italic">Note: &ldquo;{reviewQuote.preparerNotes}&rdquo;</span>
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
            <p className="mt-0.5 italic text-foreground/90 font-normal">&ldquo;{reviewQuote.reviewerNotes}&rdquo;</p>
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
  );
}

