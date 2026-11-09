'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Save, Printer } from 'lucide-react';
import { SummaryInitialSubmitButton } from './actions/SummaryInitialSubmitButton';
import { SummaryApprovedActions } from './actions/SummaryApprovedActions';
import { SummaryPendingReviewButtons } from './actions/SummaryPendingReviewButtons';

export interface SummaryReviewActionsProps {
  user: any;
  reviewQuote: any;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  canEditApprovedQuote: boolean;
  canEditCurrentQuote: boolean;
  isReviewerOrAdmin: boolean;
  reviewActionLoading: boolean;
  staffList: any[];
  clerkList: any[];
  quoteNumber: string;
  customerName: string;
  assignedReviewer: string;
  setAssignedReviewer: (val: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (val: string) => void;
  setShowSubmitModal: (val: boolean) => void;
  handleResubmitReturnedQuote: () => void;
  handleSaveQuotePrices: () => void;
  handleExitReview: () => void;
  handleCancelEdits: () => void;
  setOdooOrderNumberInput: (val: string) => void;
  setShowCompleteOdooModal: (val: boolean) => void;
  setIsPreviewOpen: (val: boolean) => void;
  handleApproveReviewQuote: () => void;
  setReassignTo: (val: string) => void;
  setReassignNotes: (val: string) => void;
  setShowReassignModal: (val: boolean) => void;
  handleReturnReviewQuote: () => void;
}

export function SummaryReviewActions({
  user,
  reviewQuote,
  isEditMode,
  setIsEditMode,
  canEditApprovedQuote,
  canEditCurrentQuote,
  isReviewerOrAdmin,
  reviewActionLoading,
  staffList,
  clerkList,
  quoteNumber,
  customerName,
  assignedReviewer,
  setAssignedReviewer,
  selectedOdooClerk,
  setSelectedOdooClerk,
  setShowSubmitModal,
  handleResubmitReturnedQuote,
  handleSaveQuotePrices,
  handleExitReview,
  handleCancelEdits,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  setIsPreviewOpen,
  handleApproveReviewQuote,
  setReassignTo,
  setReassignNotes,
  setShowReassignModal,
  handleReturnReviewQuote,
}: SummaryReviewActionsProps) {
  return (
    <div className="mt-4 flex flex-col gap-2.5 w-full">
      {!reviewQuote ? (
        <SummaryInitialSubmitButton
          user={user}
          quoteNumber={quoteNumber}
          customerName={customerName}
          staffList={staffList}
          clerkList={clerkList}
          assignedReviewer={assignedReviewer}
          setAssignedReviewer={setAssignedReviewer}
          selectedOdooClerk={selectedOdooClerk}
          setSelectedOdooClerk={setSelectedOdooClerk}
          setShowSubmitModal={setShowSubmitModal}
        />
      ) : (
        <>
          {reviewQuote.status === 'RETURNED' && (
            <>
              <Button
                variant="default"
                className="w-full h-11 text-sm shadow-md font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors"
                onClick={handleResubmitReturnedQuote}
                disabled={reviewActionLoading}
              >
                <Send className="w-4 h-4 mr-2" />
                {reviewActionLoading ? 'Resubmitting...' : 'Resubmit for Review'}
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/40 cursor-pointer transition-colors"
                onClick={handleSaveQuotePrices}
                disabled={reviewActionLoading}
              >
                <Save className="w-4 h-4 mr-2" /> Save Revisions
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                onClick={handleExitReview}
              >
                Exit Review Mode
              </Button>
            </>
          )}

          {(reviewQuote.status === 'APPROVED' || reviewQuote.status === 'MODIFIED') && (
            <SummaryApprovedActions
              reviewQuote={reviewQuote}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              canEditApprovedQuote={canEditApprovedQuote}
              reviewActionLoading={reviewActionLoading}
              handleSaveQuotePrices={handleSaveQuotePrices}
              handleResubmitReturnedQuote={handleResubmitReturnedQuote}
              handleCancelEdits={handleCancelEdits}
              handleExitReview={handleExitReview}
              setOdooOrderNumberInput={setOdooOrderNumberInput}
              setShowCompleteOdooModal={setShowCompleteOdooModal}
              setIsPreviewOpen={setIsPreviewOpen}
            />
          )}

          {reviewQuote.status === 'PENDING_REVIEW' && (
            <SummaryPendingReviewButtons
              isReviewerOrAdmin={isReviewerOrAdmin}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              canEditCurrentQuote={canEditCurrentQuote}
              reviewActionLoading={reviewActionLoading}
              user={user}
              staffList={staffList}
              setReassignTo={setReassignTo}
              setReassignNotes={setReassignNotes}
              setShowReassignModal={setShowReassignModal}
              handleApproveReviewQuote={handleApproveReviewQuote}
              handleSaveQuotePrices={handleSaveQuotePrices}
              handleReturnReviewQuote={handleReturnReviewQuote}
              handleCancelEdits={handleCancelEdits}
              handleExitReview={handleExitReview}
            />
          )}
        </>
      )}

      <Button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        className="w-full h-10 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        <span>Preview &amp; Print Quote</span>
      </Button>
    </div>
  );
}
