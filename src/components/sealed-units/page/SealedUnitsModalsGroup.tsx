'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmitReviewModal } from '@/components/calculator/SubmitReviewModal';
import { SavedQuotesModal } from '@/components/calculator/SavedQuotesModal';
import { AttachQuoteModal } from '@/components/calculator/AttachQuoteModal';
import QuoteInvoice from '@/components/quotes/QuoteInvoice';
import QuotePreviewModal from '@/components/quotes/QuotePreviewModal';
import { SealedUnitLineItem } from '@/lib/sealed-units-logic';
import { SealedUnitTemplateType } from '@/components/sealed-units';
import { SealedUnitTotals } from '@/components/sealed-units/invoice/types';

export interface SealedUnitsPrintPreviewState {
  isPreviewOpen: boolean;
  setIsPreviewOpen: (val: boolean) => void;
  quoteTemplate: SealedUnitTemplateType;
  setQuoteTemplate: (val: SealedUnitTemplateType) => void;
  quoteFontSize: number;
  setQuoteFontSize: (val: number) => void;
  quoteSpacing: number;
  setQuoteSpacing: (val: number) => void;
}

interface SealedUnitsModalsGroupProps {
  user: any;
  review: {
    showSubmitModal: boolean;
    setShowSubmitModal: (val: boolean) => void;
    adminSubmitMode: 'direct_approve' | 'submit_review';
    setAdminSubmitMode: (val: 'direct_approve' | 'submit_review') => void;
    preparerNotes: string;
    setPreparerNotes: (val: string) => void;
    submittingQuote: boolean;
    handleSubmitForReview: () => void;
  };
  drafts: {
    quoteNumber: string;
    customerName: string;
    quoteNotes: string;
    setQuoteNotes: (val: string) => void;
    showResetModal: boolean;
    setShowResetModal: (val: boolean) => void;
    handleResetWorkspace: () => void;
    isSavedQuotesOpen: boolean;
    setIsSavedQuotesOpen: (val: boolean) => void;
    isAttachModalOpen: boolean;
    setIsAttachModalOpen: (val: boolean) => void;
    attachedWindowQuote: any;
    attachedDoorQuote: any;
    setAttachedWindowQuote: (val: any) => void;
    setAttachedDoorQuote: (val: any) => void;
    loadDraftIntoWorkspace: (draft: any) => void;
  };
  settings: {
    staffList: any[];
    clerkList: any[];
    assignedReviewer: string;
    setAssignedReviewer: (val: string) => void;
    selectedOdooClerk: string;
    setSelectedOdooClerk: (val: string) => void;
  };
  preview: SealedUnitsPrintPreviewState;
  lineItems: SealedUnitLineItem[];
  totals: SealedUnitTotals;
  isInstallation: boolean;
  hstRate: number;
}

export function SealedUnitsModalsGroup({
  user,
  review,
  drafts,
  settings,
  preview,
  lineItems,
  totals,
  isInstallation,
  hstRate,
}: SealedUnitsModalsGroupProps) {
  return (
    <>
      {/* Submit for Review / Direct Approve Modal */}
      <SubmitReviewModal
        isOpen={review.showSubmitModal}
        onClose={() => review.setShowSubmitModal(false)}
        user={user}
        adminSubmitMode={review.adminSubmitMode}
        setAdminSubmitMode={review.setAdminSubmitMode}
        quoteNumber={drafts.quoteNumber}
        customerName={drafts.customerName}
        windowsCount={lineItems.length}
        total={totals.grandTotal}
        staffList={settings.staffList}
        clerkList={settings.clerkList}
        assignedReviewer={settings.assignedReviewer}
        setAssignedReviewer={settings.setAssignedReviewer}
        selectedOdooClerk={settings.selectedOdooClerk}
        setSelectedOdooClerk={settings.setSelectedOdooClerk}
        preparerNotes={review.preparerNotes}
        setPreparerNotes={review.setPreparerNotes}
        submittingQuote={review.submittingQuote}
        onSubmit={review.handleSubmitForReview}
      />

      {/* Custom Designed Reset Confirmation Modal */}
      {drafts.showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-5 rounded-2xl shadow-2xl max-w-sm w-full border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Reset Quote?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to reset all {lineItems.length} sealed unit line items?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => drafts.setShowResetModal(false)}
                className="text-xs cursor-pointer h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={drafts.handleResetWorkspace}
                className="text-xs font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer h-8"
              >
                Reset Quote
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED CLEAN PRINTABLE QUOTE INVOICE */}
      {!preview.isPreviewOpen && (
        <QuoteInvoice
          customerName={drafts.customerName}
          quoteNumber={drafts.quoteNumber}
          preparedBy={user?.name || user?.username || ''}
          primaryQuoteType="sealed_unit"
          sealedUnits={lineItems}
          sealedUnitTotals={totals}
          quoteNotes={drafts.quoteNotes}
          template={preview.quoteTemplate as any}
          fontSize={preview.quoteFontSize}
          spacing={preview.quoteSpacing}
          hstRate={hstRate}
          isSupplyOnly={!isInstallation}
          attachedWindowQuote={drafts.attachedWindowQuote}
          attachedDoorQuote={drafts.attachedDoorQuote}
        />
      )}

      {/* Universal Interactive Print Preview Modal */}
      <QuotePreviewModal
        isOpen={preview.isPreviewOpen}
        onClose={() => preview.setIsPreviewOpen(false)}
        template={preview.quoteTemplate as any}
        onTemplateChange={preview.setQuoteTemplate as any}
        fontSize={preview.quoteFontSize}
        onFontSizeChange={preview.setQuoteFontSize}
        spacing={preview.quoteSpacing}
        onSpacingChange={preview.setQuoteSpacing}
        quoteNotes={drafts.quoteNotes}
        onQuoteNotesChange={drafts.setQuoteNotes}
        primaryQuoteType="sealed_unit"
        sealedUnits={lineItems}
        sealedUnitTotals={totals}
        customerName={drafts.customerName}
        quoteNumber={drafts.quoteNumber}
        preparedBy={user?.name || user?.username || ''}
        hstRate={hstRate}
        isSupplyOnly={!isInstallation}
        attachedWindowQuote={drafts.attachedWindowQuote}
        attachedDoorQuote={drafts.attachedDoorQuote}
      />

      {/* Saved Quotes & Drafts Modal */}
      <SavedQuotesModal
        isOpen={drafts.isSavedQuotesOpen}
        onClose={() => drafts.setIsSavedQuotesOpen(false)}
        defaultType="sealed_unit"
        onLoadQuote={drafts.loadDraftIntoWorkspace}
      />

      {/* Universal Multi-Quote Attachment Modal */}
      <AttachQuoteModal
        isOpen={drafts.isAttachModalOpen}
        onClose={() => drafts.setIsAttachModalOpen(false)}
        currentQuoteType="sealed_unit"
        attachedWindowQuote={drafts.attachedWindowQuote}
        attachedDoorQuote={drafts.attachedDoorQuote}
        onAttachWindow={drafts.setAttachedWindowQuote}
        onDetachWindow={() => drafts.setAttachedWindowQuote(null)}
        onAttachDoor={drafts.setAttachedDoorQuote}
        onDetachDoor={() => drafts.setAttachedDoorQuote(null)}
      />
    </>
  );
}
