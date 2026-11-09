'use client';

import React from 'react';
import type { QuoteTemplateType } from '@/components/quotes/invoice/types';
import {
  StorageFlushModal,
  QuickReviewModal,
  QuoteDeleteModal,
  QuotePreviewModalWrapper,
  ConfirmOdooEntryModal,
} from './modals';

export interface QuotesModalsProps {
  showFlushModal: boolean;
  setShowFlushModal: (val: boolean) => void;
  storageStats: any;
  flushing: boolean;
  handleFlushStorage: () => void;
  selectedQuoteForReview: any;
  setSelectedQuoteForReview: (val: any) => void;
  reviewerNotes: string;
  setReviewerNotes: (val: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (val: string) => void;
  reviewingAction: boolean;
  handleQuickApprove: (quote: any, newStatus: 'APPROVED' | 'RETURNED') => void;
  staffList: any[];
  quoteToDelete: { id: string; quoteNumber: string } | null;
  setQuoteToDelete: (val: any) => void;
  isDeletingQuote: boolean;
  confirmDeleteQuote: () => void;
  previewQuote: any;
  setPreviewQuote: (val: any) => void;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (val: boolean) => void;
  previewTemplate: QuoteTemplateType;
  setPreviewTemplate: (val: QuoteTemplateType) => void;
  previewFontSize: number;
  setPreviewFontSize: (val: number) => void;
  previewSpacing: number;
  setPreviewSpacing: (val: number) => void;
  previewNotes: string;
  setPreviewNotes: (val: string) => void;
  canReview: boolean;
  currentUser: any;
  odooModalQuote: any;
  setOdooModalQuote: (val: any) => void;
  odooOrderNum: string;
  setOdooOrderNum: (val: string) => void;
  markingOdoo: boolean;
  handleConfirmOdooEntry: () => void;
}

export function QuotesModals({
  showFlushModal,
  setShowFlushModal,
  storageStats,
  flushing,
  handleFlushStorage,
  selectedQuoteForReview,
  setSelectedQuoteForReview,
  reviewerNotes,
  setReviewerNotes,
  selectedOdooClerk,
  setSelectedOdooClerk,
  reviewingAction,
  handleQuickApprove,
  staffList,
  quoteToDelete,
  setQuoteToDelete,
  isDeletingQuote,
  confirmDeleteQuote,
  previewQuote,
  setPreviewQuote,
  isPreviewOpen,
  setIsPreviewOpen,
  previewTemplate,
  setPreviewTemplate,
  previewFontSize,
  setPreviewFontSize,
  previewSpacing,
  setPreviewSpacing,
  previewNotes,
  setPreviewNotes,
  canReview,
  currentUser,
  odooModalQuote,
  setOdooModalQuote,
  odooOrderNum,
  setOdooOrderNum,
  markingOdoo,
  handleConfirmOdooEntry,
}: QuotesModalsProps) {
  return (
    <>
      <StorageFlushModal
        showFlushModal={showFlushModal}
        setShowFlushModal={setShowFlushModal}
        storageStats={storageStats}
        flushing={flushing}
        handleFlushStorage={handleFlushStorage}
      />

      <QuickReviewModal
        selectedQuoteForReview={selectedQuoteForReview}
        setSelectedQuoteForReview={setSelectedQuoteForReview}
        reviewerNotes={reviewerNotes}
        setReviewerNotes={setReviewerNotes}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        reviewingAction={reviewingAction}
        handleQuickApprove={handleQuickApprove}
        staffList={staffList}
      />

      <QuoteDeleteModal
        quoteToDelete={quoteToDelete}
        setQuoteToDelete={setQuoteToDelete}
        isDeletingQuote={isDeletingQuote}
        confirmDeleteQuote={confirmDeleteQuote}
      />

      <QuotePreviewModalWrapper
        previewQuote={previewQuote}
        setPreviewQuote={setPreviewQuote}
        isPreviewOpen={isPreviewOpen}
        setIsPreviewOpen={setIsPreviewOpen}
        previewTemplate={previewTemplate}
        setPreviewTemplate={setPreviewTemplate}
        previewFontSize={previewFontSize}
        setPreviewFontSize={setPreviewFontSize}
        previewSpacing={previewSpacing}
        setPreviewSpacing={setPreviewSpacing}
        previewNotes={previewNotes}
        setPreviewNotes={setPreviewNotes}
        canReview={canReview}
        currentUser={currentUser}
      />

      <ConfirmOdooEntryModal
        odooModalQuote={odooModalQuote}
        setOdooModalQuote={setOdooModalQuote}
        odooOrderNum={odooOrderNum}
        setOdooOrderNum={setOdooOrderNum}
        markingOdoo={markingOdoo}
        handleConfirmOdooEntry={handleConfirmOdooEntry}
      />
    </>
  );
}
