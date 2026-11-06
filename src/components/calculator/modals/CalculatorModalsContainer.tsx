'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { toCents } from '@/lib/promo-logic';
import { WorkflowDialogs } from '@/components/calculator/WorkflowDialogs';

// Dynamically imported heavy modals (code-split to minimize initial bundle size)
const QuotePreviewModal = dynamic(() => import('@/components/quotes/QuotePreviewModal'), { ssr: false });
const SubmitReviewModal = dynamic(
  () => import('@/components/calculator/SubmitReviewModal').then((m) => m.SubmitReviewModal),
  { ssr: false }
);
const OdooActionModals = dynamic(
  () => import('@/components/calculator/OdooActionModals').then((m) => m.OdooActionModals),
  { ssr: false }
);
const QuoteComparisonModal = dynamic(
  () => import('@/components/calculator/QuoteComparisonModal').then((m) => m.QuoteComparisonModal),
  { ssr: false }
);
const SavedQuotesModal = dynamic(
  () => import('@/components/calculator/SavedQuotesModal').then((m) => m.SavedQuotesModal),
  { ssr: false }
);
const AttachQuoteModal = dynamic(
  () => import('@/components/calculator/AttachQuoteModal').then((m) => m.AttachQuoteModal),
  { ssr: false }
);

export interface CalculatorModalsContainerProps {
  // Quote Preview Modal
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  quoteTemplate: any;
  setQuoteTemplate: (tpl: any) => void;
  quoteFontSize: number;
  setQuoteFontSize: (size: number) => void;
  quoteSpacing: number;
  setQuoteSpacing: (spacing: number) => void;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  isReadOnly: boolean;
  preparedBy: string;
  customerName: string;
  quoteNumber: string;
  windows: any[];
  taxTotals: any;
  quoteResult: any;
  availablePromos: any[];
  activePromoId: string;
  basePrice: number;
  surcharge: number;
  wantsUpgrade: boolean;
  shownUpgrade: number;
  hstRate: number;
  total: number;
  beforeTaxDiscount: number;
  afterDiscount: number;
  firstPayment: number;
  secondPayment: number;
  includeLabourInPromo: boolean;
  includeMiscInPromo: boolean;
  includeJCInPromo: boolean;
  effectiveJC: number;
  effectiveMisc: number;
  effectiveLabour: number;
  attachedUpgrade: any;
  attachedSealedUnit: any;
  attachedDoorQuote: any;
  isSupplyOnly: boolean;

  // Submit Review Modal
  showSubmitModal: boolean;
  setShowSubmitModal: (show: boolean) => void;
  user: any;
  adminSubmitMode: 'direct_approve' | 'submit_review';
  setAdminSubmitMode: (mode: 'direct_approve' | 'submit_review') => void;
  staffList: any[];
  clerkList: any[];
  assignedReviewer: string;
  setAssignedReviewer: (reviewer: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (clerk: string) => void;
  preparerNotes: string;
  setPreparerNotes: (notes: string) => void;
  submittingQuote: boolean;
  handleSubmitForReview: () => void;

  // Workflow Dialogs
  showReassignModal: boolean;
  setShowReassignModal: (show: boolean) => void;
  reviewQuote: any;
  reassignTo: string;
  setReassignTo: (user: string) => void;
  reassignNotes: string;
  setReassignNotes: (notes: string) => void;
  handleReassignQuote: () => void;
  showReturnModal: boolean;
  setShowReturnModal: (show: boolean) => void;
  returnNotes: string;
  setReturnNotes: (notes: string) => void;
  submitReturnReviewQuote: () => void;
  showExitReviewForPdfModal: boolean;
  setShowExitReviewForPdfModal: (show: boolean) => void;
  handleExitReviewAndImportPdf: () => void;
  reviewActionLoading: boolean;

  // Odoo Action Modals
  showApproveOdooModal: boolean;
  setShowApproveOdooModal: (show: boolean) => void;
  showCompleteOdooModal: boolean;
  setShowCompleteOdooModal: (show: boolean) => void;
  odooOrderNumberInput: string;
  setOdooOrderNumberInput: (val: string) => void;
  confirmApproveReviewQuote: () => void;
  handleCompleteOdooEntry: () => void;

  // Quote Comparison Modal
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  baseSnapshotA: any;
  appliedOption: 'A' | 'B';
  baseWindowsA: any;
  surchargeRate: number;
  supplyJambId: string;
  supplyJambName: string;
  supplyJambRate: string;
  supplyCasingId: string;
  supplyCasingName: string;
  supplyCasingRate: string;
  customJC: string;
  isComparisonStaging: boolean;
  handleApplyOption: (
    target: 'A' | 'B',
    windows: any[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: {
      jambId?: string;
      jambRate?: string;
      casingId?: string;
      casingRate?: string;
      extraLabour?: string;
    }
  ) => void;
  handleApplyAndCustomize?: (
    windows: any[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: {
      jambId?: string;
      jambRate?: string;
      casingId?: string;
      casingRate?: string;
      extraLabour?: string;
    }
  ) => void;
  handleKeepOptionB?: () => void;
  setAttachedUpgrade: (val: any) => void;

  // Saved Quotes Modal
  isSavedQuotesOpen: boolean;
  setIsSavedQuotesOpen: (open: boolean) => void;
  loadDraftIntoWorkspace: (draft: any) => void;

  // Attach Quote Modal
  isAttachModalOpen: boolean;
  setIsAttachModalOpen: (open: boolean) => void;
  setAttachedSealedUnit: (su: any) => void;
  setAttachedDoorQuote: (door: any) => void;

  // Reset Confirmation Modal
  showResetModal: boolean;
  setShowResetModal: (show: boolean) => void;
  handleConfirmReset: () => void;
}

export function CalculatorModalsContainer({
  // Preview
  isPreviewOpen,
  setIsPreviewOpen,
  quoteTemplate,
  setQuoteTemplate,
  quoteFontSize,
  setQuoteFontSize,
  quoteSpacing,
  setQuoteSpacing,
  quoteNotes,
  setQuoteNotes,
  isReadOnly,
  preparedBy,
  customerName,
  quoteNumber,
  windows,
  taxTotals,
  quoteResult,
  availablePromos,
  activePromoId,
  basePrice,
  surcharge,
  wantsUpgrade,
  shownUpgrade,
  hstRate,
  total,
  beforeTaxDiscount,
  afterDiscount,
  firstPayment,
  secondPayment,
  includeLabourInPromo,
  includeMiscInPromo,
  includeJCInPromo,
  effectiveJC,
  effectiveMisc,
  effectiveLabour,
  attachedUpgrade,
  attachedSealedUnit,
  attachedDoorQuote,
  isSupplyOnly,

  // Submit Review
  showSubmitModal,
  setShowSubmitModal,
  user,
  adminSubmitMode,
  setAdminSubmitMode,
  staffList,
  clerkList,
  assignedReviewer,
  setAssignedReviewer,
  selectedOdooClerk,
  setSelectedOdooClerk,
  preparerNotes,
  setPreparerNotes,
  submittingQuote,
  handleSubmitForReview,

  // Workflow Dialogs
  showReassignModal,
  setShowReassignModal,
  reviewQuote,
  reassignTo,
  setReassignTo,
  reassignNotes,
  setReassignNotes,
  handleReassignQuote,
  showReturnModal,
  setShowReturnModal,
  returnNotes,
  setReturnNotes,
  submitReturnReviewQuote,
  showExitReviewForPdfModal,
  setShowExitReviewForPdfModal,
  handleExitReviewAndImportPdf,
  reviewActionLoading,

  // Odoo Actions
  showApproveOdooModal,
  setShowApproveOdooModal,
  showCompleteOdooModal,
  setShowCompleteOdooModal,
  odooOrderNumberInput,
  setOdooOrderNumberInput,
  confirmApproveReviewQuote,
  handleCompleteOdooEntry,

  // Comparison
  isCompareModalOpen,
  setIsCompareModalOpen,
  baseSnapshotA,
  appliedOption,
  baseWindowsA,
  surchargeRate,
  supplyJambId,
  supplyJambName,
  supplyJambRate,
  supplyCasingId,
  supplyCasingName,
  supplyCasingRate,
  customJC,
  isComparisonStaging,
  handleApplyOption,
  handleApplyAndCustomize,
  handleKeepOptionB,
  setAttachedUpgrade,

  // Saved Quotes
  isSavedQuotesOpen,
  setIsSavedQuotesOpen,
  loadDraftIntoWorkspace,

  // Attach Quote
  isAttachModalOpen,
  setIsAttachModalOpen,
  setAttachedSealedUnit,
  setAttachedDoorQuote,

  // Reset Modal
  showResetModal,
  setShowResetModal,
  handleConfirmReset,
}: CalculatorModalsContainerProps) {
  return (
    <>
      {/* Quote Preview Modal */}
      <QuotePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={quoteTemplate}
        onTemplateChange={setQuoteTemplate}
        fontSize={quoteFontSize}
        onFontSizeChange={setQuoteFontSize}
        spacing={quoteSpacing}
        onSpacingChange={setQuoteSpacing}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={isReadOnly ? undefined : setQuoteNotes}
        preparedBy={preparedBy}
        customerName={customerName}
        quoteNumber={quoteNumber}
        windows={windows}
        taxTotals={taxTotals}
        quoteResult={quoteResult}
        activePromo={
          quoteResult && quoteResult.promoDiscount > 0
            ? {
                name:
                  availablePromos.find(
                    (p) => p._id === activePromoId || (p as any).id === activePromoId
                  )?.name || 'Custom Promo',
                discount: quoteResult.promoDiscount,
              }
            : null
        }
        basePrice={basePrice}
        surcharge={surcharge}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        hstRate={hstRate}
        total={total}
        beforeTaxDiscount={beforeTaxDiscount}
        afterDiscount={afterDiscount}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        regionName={taxTotals?.regionName || taxTotals?.city}
        includeLabourInPromo={includeLabourInPromo}
        includeMiscInPromo={includeMiscInPromo}
        includeJCInPromo={includeJCInPromo}
        effectiveJC={effectiveJC}
        effectiveMisc={effectiveMisc}
        effectiveLabour={effectiveLabour}
        attachedUpgrade={attachedUpgrade}
        attachedSealedUnit={attachedSealedUnit}
        attachedDoorQuote={attachedDoorQuote}
        isSupplyOnly={isSupplyOnly}
      />

      {/* Submit for Review / Direct Approve Modal */}
      <SubmitReviewModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        user={user}
        adminSubmitMode={adminSubmitMode}
        setAdminSubmitMode={setAdminSubmitMode}
        quoteNumber={quoteNumber}
        customerName={customerName}
        windowsCount={windows.filter((w) => Number(w.base) > 0 || Number(w.qty) > 0).length}
        total={total}
        staffList={staffList}
        clerkList={clerkList}
        assignedReviewer={assignedReviewer}
        setAssignedReviewer={setAssignedReviewer}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        preparerNotes={preparerNotes}
        setPreparerNotes={setPreparerNotes}
        submittingQuote={submittingQuote}
        onSubmit={handleSubmitForReview}
      />

      {/* Workflow Dialogs (Reassign, Return, Exit Review for PDF) */}
      <WorkflowDialogs
        showReassignModal={showReassignModal}
        setShowReassignModal={setShowReassignModal}
        reviewQuote={reviewQuote}
        user={user}
        staffList={staffList}
        reassignTo={reassignTo}
        setReassignTo={setReassignTo}
        reassignNotes={reassignNotes}
        setReassignNotes={setReassignNotes}
        handleReassignQuote={handleReassignQuote}
        showReturnModal={showReturnModal}
        setShowReturnModal={setShowReturnModal}
        returnNotes={returnNotes}
        setReturnNotes={setReturnNotes}
        submitReturnReviewQuote={submitReturnReviewQuote}
        showExitReviewForPdfModal={showExitReviewForPdfModal}
        setShowExitReviewForPdfModal={setShowExitReviewForPdfModal}
        handleExitReviewAndImportPdf={handleExitReviewAndImportPdf}
        reviewActionLoading={reviewActionLoading}
      />

      {/* Odoo Action Modals (Approve & Assign Clerk, Confirm SO#) */}
      <OdooActionModals
        showApproveOdooModal={showApproveOdooModal}
        setShowApproveOdooModal={setShowApproveOdooModal}
        showCompleteOdooModal={showCompleteOdooModal}
        setShowCompleteOdooModal={setShowCompleteOdooModal}
        reviewQuote={reviewQuote}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        odooOrderNumberInput={odooOrderNumberInput}
        setOdooOrderNumberInput={setOdooOrderNumberInput}
        reviewActionLoading={reviewActionLoading}
        clerkList={clerkList}
        staffList={staffList}
        confirmApproveReviewQuote={confirmApproveReviewQuote}
        handleCompleteOdooEntry={handleCompleteOdooEntry}
      />

      {/* Quote Comparison Modal */}
      <QuoteComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        currentWindows={
          baseSnapshotA
            ? baseSnapshotA.windows
            : appliedOption === 'B' && baseWindowsA
            ? baseWindowsA
            : windows
        }
        customerName={baseSnapshotA ? baseSnapshotA.customerName : customerName}
        quoteNumber={baseSnapshotA ? baseSnapshotA.quoteNumber : quoteNumber}
        surchargeRate={baseSnapshotA ? baseSnapshotA.surchargeRate : surchargeRate}
        isSupplyOnly={baseSnapshotA ? baseSnapshotA.isSupplyOnly : isSupplyOnly}
        supplyJambId={
          baseSnapshotA
            ? baseSnapshotA.supplyJambId
            : isSupplyOnly
            ? supplyJambId
            : taxTotals?.selectedJamb?.id || taxTotals?.jambId || 'none'
        }
        supplyJambName={
          baseSnapshotA
            ? baseSnapshotA.supplyJambName
            : isSupplyOnly
            ? supplyJambName
            : taxTotals?.selectedJamb?.name || taxTotals?.jambName || ''
        }
        supplyJambRate={
          baseSnapshotA
            ? baseSnapshotA.supplyJambRate
            : isSupplyOnly
            ? supplyJambRate
            : String(taxTotals?.selectedJamb?.rate || taxTotals?.jambRate || '')
        }
        supplyCasingId={
          baseSnapshotA
            ? baseSnapshotA.supplyCasingId
            : isSupplyOnly
            ? supplyCasingId
            : taxTotals?.selectedCasing?.id || taxTotals?.casingId || 'none'
        }
        supplyCasingName={
          baseSnapshotA
            ? baseSnapshotA.supplyCasingName
            : isSupplyOnly
            ? supplyCasingName
            : taxTotals?.selectedCasing?.name || taxTotals?.casingName || ''
        }
        supplyCasingRate={
          baseSnapshotA
            ? baseSnapshotA.supplyCasingRate
            : isSupplyOnly
            ? supplyCasingRate
            : String(taxTotals?.selectedCasing?.rate || taxTotals?.casingRate || '')
        }
        effectiveJC={
          baseSnapshotA
            ? baseSnapshotA.taxTotals?.jcLabourCents ??
              (baseSnapshotA.customJC ? toCents(baseSnapshotA.customJC) : 0)
            : effectiveJC
        }
        effectiveMisc={
          baseSnapshotA
            ? baseSnapshotA.taxTotals?.miscLabourCents ??
              (baseSnapshotA.customMisc ? toCents(baseSnapshotA.customMisc) : 0)
            : effectiveMisc
        }
        effectiveLabour={
          baseSnapshotA
            ? baseSnapshotA.taxTotals?.standardLabourCents ??
              (baseSnapshotA.customLabour ? toCents(baseSnapshotA.customLabour) : 0)
            : effectiveLabour
        }
        availablePromos={availablePromos}
        activePromoId={baseSnapshotA ? baseSnapshotA.activePromoId : activePromoId}
        hstRate={baseSnapshotA ? baseSnapshotA.hstRate : hstRate}
        quoteResultA={baseSnapshotA ? baseSnapshotA.quoteResult : quoteResult}
        afterDiscountA={baseSnapshotA ? baseSnapshotA.afterDiscount : afterDiscount}
        totalA={baseSnapshotA ? baseSnapshotA.total : total}
        firstPaymentA={baseSnapshotA ? baseSnapshotA.firstPayment : firstPayment}
        secondPaymentA={baseSnapshotA ? baseSnapshotA.secondPayment : secondPayment}
        appliedOption={appliedOption}
        isComparisonStaging={isComparisonStaging}
        stagedOptionB={
          isComparisonStaging && baseSnapshotA
            ? {
                windows,
                quoteResult,
                afterDiscount,
                total,
                firstPayment,
                secondPayment,
                effectiveJC: isSupplyOnly ? (customJC ? toCents(customJC) : 0) : effectiveJC,
                effectiveMisc: isSupplyOnly ? 0 : effectiveMisc,
                effectiveLabour: isSupplyOnly ? 0 : effectiveLabour,
                activePromoId,
                supplyJambId: isSupplyOnly
                  ? supplyJambId
                  : taxTotals?.selectedJamb?.id || taxTotals?.jambId,
                supplyJambName: isSupplyOnly
                  ? supplyJambName
                  : taxTotals?.selectedJamb?.name || taxTotals?.jambName,
                supplyJambRate: isSupplyOnly
                  ? supplyJambRate
                  : String(taxTotals?.selectedJamb?.rate || taxTotals?.jambRate || ''),
                supplyCasingId: isSupplyOnly
                  ? supplyCasingId
                  : taxTotals?.selectedCasing?.id || taxTotals?.casingId,
                supplyCasingName: isSupplyOnly
                  ? supplyCasingName
                  : taxTotals?.selectedCasing?.name || taxTotals?.casingName,
                supplyCasingRate: isSupplyOnly
                  ? supplyCasingRate
                  : String(taxTotals?.selectedCasing?.rate || taxTotals?.casingRate || ''),
                customerName,
                quoteNumber,
              }
            : undefined
        }
        onApplyOption={handleApplyOption}
        onApplyAndCustomize={handleApplyAndCustomize}
        onKeepOptionB={handleKeepOptionB}
        attachedUpgrade={attachedUpgrade}
        onAttachUpgrade={setAttachedUpgrade}
      />

      {/* Saved Quotes Modal */}
      <SavedQuotesModal
        isOpen={isSavedQuotesOpen}
        onClose={() => setIsSavedQuotesOpen(false)}
        defaultType="window"
        onLoadQuote={loadDraftIntoWorkspace}
      />

      {/* Attach Quote Modal */}
      <AttachQuoteModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        currentQuoteType="window"
        attachedSealedUnit={attachedSealedUnit}
        attachedDoorQuote={attachedDoorQuote}
        onAttachSealedUnit={(su) => setAttachedSealedUnit(su)}
        onDetachSealedUnit={() => setAttachedSealedUnit(null)}
        onAttachDoor={(door) => setAttachedDoorQuote(door)}
        onDetachDoor={() => setAttachedDoorQuote(null)}
      />

      {/* Custom In-App Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-5 rounded-2xl shadow-2xl max-w-sm w-full border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Reset Window Quote?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to clear this workspace and all window configurations and
                  pricing overrides?
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
                onClick={handleConfirmReset}
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
