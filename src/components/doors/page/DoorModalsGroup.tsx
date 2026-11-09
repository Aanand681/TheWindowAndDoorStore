'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { SubmitReviewModal } from '@/components/calculator/SubmitReviewModal';
import { SavedQuotesModal } from '@/components/calculator/SavedQuotesModal';
import { AttachQuoteModal } from '@/components/calculator/AttachQuoteModal';
import { QuoteDraftItem } from '@/lib/quote-drafts-storage';
import { QuoteTemplateType } from '@/components/quotes/QuoteInvoice';

const QuotePreviewModal = dynamic(
  () => import('@/components/quotes/QuotePreviewModal'),
  { ssr: false }
);

interface DoorModalsGroupProps {
  showPreviewModal: boolean;
  setShowPreviewModal: (show: boolean) => void;
  showSubmitModal: boolean;
  setShowSubmitModal: (show: boolean) => void;
  showResetModal: boolean;
  setShowResetModal: (show: boolean) => void;
  isSavedQuotesOpen: boolean;
  setIsSavedQuotesOpen: (open: boolean) => void;
  isAttachModalOpen: boolean;
  setIsAttachModalOpen: (open: boolean) => void;
  customerName: string;
  quoteNumber: string;
  lineItems: any[];
  mode: any;
  globalUpcharges: any[];
  regionName?: string;
  isFirstNation: boolean;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  attachedWindowQuote: any;
  setAttachedWindowQuote: (q: any) => void;
  attachedSealedUnit: any;
  setAttachedSealedUnit: (u: any) => void;
  totals: any;
  quoteTemplate: QuoteTemplateType;
  setQuoteTemplate: (t: QuoteTemplateType) => void;
  quoteFontSize: number;
  setQuoteFontSize: (s: number) => void;
  quoteSpacing: number;
  setQuoteSpacing: (s: number) => void;
  user: any;
  adminSubmitMode: 'direct_approve' | 'submit_review';
  setAdminSubmitMode: (m: 'direct_approve' | 'submit_review') => void;
  staffList: any[];
  assignedReviewer: string;
  setAssignedReviewer: (r: string) => void;
  clerkList: any[];
  selectedOdooClerk: string;
  setSelectedOdooClerk: (c: string) => void;
  preparerNotes: string;
  setPreparerNotes: (n: string) => void;
  submittingQuote: boolean;
  onSubmitQuote: () => Promise<void>;
  onLoadQuoteFromDrafts: (draft: QuoteDraftItem) => void;
  onConfirmReset: () => void;
}

export function DoorModalsGroup({
  showPreviewModal,
  setShowPreviewModal,
  showSubmitModal,
  setShowSubmitModal,
  showResetModal,
  setShowResetModal,
  isSavedQuotesOpen,
  setIsSavedQuotesOpen,
  isAttachModalOpen,
  setIsAttachModalOpen,
  customerName,
  quoteNumber,
  lineItems,
  mode,
  globalUpcharges,
  regionName,
  isFirstNation,
  quoteNotes,
  setQuoteNotes,
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  totals,
  quoteTemplate,
  setQuoteTemplate,
  quoteFontSize,
  setQuoteFontSize,
  quoteSpacing,
  setQuoteSpacing,
  user,
  adminSubmitMode,
  setAdminSubmitMode,
  staffList,
  assignedReviewer,
  setAssignedReviewer,
  clerkList,
  selectedOdooClerk,
  setSelectedOdooClerk,
  preparerNotes,
  setPreparerNotes,
  submittingQuote,
  onSubmitQuote,
  onLoadQuoteFromDrafts,
  onConfirmReset,
}: DoorModalsGroupProps) {
  return (
    <>
      {/* 1. Preview Modal */}
      {showPreviewModal && (
        <QuotePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          template={quoteTemplate}
          onTemplateChange={setQuoteTemplate}
          fontSize={quoteFontSize}
          onFontSizeChange={setQuoteFontSize}
          spacing={quoteSpacing}
          onSpacingChange={setQuoteSpacing}
          quoteNotes={quoteNotes}
          onQuoteNotesChange={setQuoteNotes}
          primaryQuoteType="door"
          doors={lineItems}
          doorTotals={totals}
          customerName={customerName}
          quoteNumber={quoteNumber}
          preparedBy={user?.name || user?.username || 'The Window & Door Store'}
          hstRate={isFirstNation ? 8 : 13}
          isSupplyOnly={mode === 'supply_only'}
          regionName={regionName}
          globalUpcharges={globalUpcharges}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
        />
      )}

      {/* 2. Submit Review / Direct Approve Modal */}
      {showSubmitModal && (
        <SubmitReviewModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          user={user}
          adminSubmitMode={adminSubmitMode}
          setAdminSubmitMode={setAdminSubmitMode}
          quoteNumber={quoteNumber}
          customerName={customerName}
          windowsCount={lineItems.length}
          total={totals.grandTotal}
          staffList={staffList}
          clerkList={clerkList}
          assignedReviewer={assignedReviewer}
          setAssignedReviewer={setAssignedReviewer}
          selectedOdooClerk={selectedOdooClerk}
          setSelectedOdooClerk={setSelectedOdooClerk}
          preparerNotes={preparerNotes}
          setPreparerNotes={setPreparerNotes}
          submittingQuote={submittingQuote}
          onSubmit={onSubmitQuote}
        />
      )}

      {/* 3. Saved Quotes Modal */}
      {isSavedQuotesOpen && (
        <SavedQuotesModal
          isOpen={isSavedQuotesOpen}
          onClose={() => setIsSavedQuotesOpen(false)}
          defaultType="door"
          onLoadQuote={onLoadQuoteFromDrafts}
        />
      )}

      {/* 4. Attach Quote Modal */}
      {isAttachModalOpen && (
        <AttachQuoteModal
          isOpen={isAttachModalOpen}
          onClose={() => setIsAttachModalOpen(false)}
          currentQuoteType="door"
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          onAttachWindow={(win) => setAttachedWindowQuote(win)}
          onDetachWindow={() => setAttachedWindowQuote(null)}
          onAttachSealedUnit={(su) => setAttachedSealedUnit(su)}
          onDetachSealedUnit={() => setAttachedSealedUnit(null)}
        />
      )}

      {/* 5. In-App Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-5 rounded-2xl shadow-2xl max-w-sm w-full border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Reset Door Quote?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to clear this workspace and all {lineItems.length} configured door items?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowResetModal(false)}
                className="text-xs cursor-pointer h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onConfirmReset}
                className="text-xs font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer h-8"
              >
                Reset Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
