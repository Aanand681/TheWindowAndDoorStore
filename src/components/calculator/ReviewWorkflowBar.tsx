'use client';

import React from 'react';
import { ReviewWorkflowStatusInfo } from './workflow/ReviewWorkflowStatusInfo';
import { ReviewWorkflowActionButtons } from './workflow/ReviewWorkflowActionButtons';

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
  staffList: _staffList,
  setReassignTo: _setReassignTo,
  setReassignNotes: _setReassignNotes,
  setShowReassignModal: _setShowReassignModal,
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
      <ReviewWorkflowStatusInfo
        reviewQuote={reviewQuote}
        isEditMode={isEditMode}
        isReviewerOrAdmin={isReviewerOrAdmin}
        isOdooClerk={isOdooClerk}
        user={user}
      />
      <ReviewWorkflowActionButtons
        reviewQuote={reviewQuote}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        canEditCurrentQuote={canEditCurrentQuote}
        isReviewerOrAdmin={isReviewerOrAdmin}
        isOdooClerk={isOdooClerk}
        reviewActionLoading={reviewActionLoading}
        handleSaveQuotePrices={handleSaveQuotePrices}
        handleCancelEdits={handleCancelEdits}
        handleResubmitReturnedQuote={handleResubmitReturnedQuote}
        handleExitReview={handleExitReview}
        setIsPreviewOpen={setIsPreviewOpen}
        setOdooOrderNumberInput={setOdooOrderNumberInput}
        setShowCompleteOdooModal={setShowCompleteOdooModal}
        handleReturnReviewQuote={handleReturnReviewQuote}
        handleApproveReviewQuote={handleApproveReviewQuote}
      />
    </div>
  );
}

export default ReviewWorkflowBar;
