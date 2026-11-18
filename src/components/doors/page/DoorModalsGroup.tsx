"use client"

import React from "react"
import dynamic from "next/dynamic"
import { ResetModalWrapper } from "@/components/calculator/modals/ResetModalWrapper"
import { SubmitReviewModal } from "@/components/calculator/SubmitReviewModal"
import { SavedQuotesModal } from "@/components/calculator/SavedQuotesModal"
import { AttachQuoteModal } from "@/components/calculator/AttachQuoteModal"
import { UnsavedQuoteConflictModal } from "@/components/shared/UnsavedQuoteConflictModal"
import { QuoteDraftItem } from "@/lib/quote-drafts-storage"
import { QuoteTemplateType } from "@/components/quotes/QuoteInvoice"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

const QuotePreviewModal = dynamic(
  () => import("@/components/quotes/QuotePreviewModal"),
  { ssr: false }
)

interface DoorModalsGroupProps {
  showPreviewModal: boolean
  setShowPreviewModal: (show: boolean) => void
  showSubmitModal: boolean
  setShowSubmitModal: (show: boolean) => void
  showResetModal: boolean
  setShowResetModal: (show: boolean) => void
  isSavedQuotesOpen: boolean
  setIsSavedQuotesOpen: (open: boolean) => void
  isAttachModalOpen: boolean
  setIsAttachModalOpen: (open: boolean) => void
  customerName: string
  quoteNumber: string
  lineItems: any[]
  mode: any
  globalUpcharges: any[]
  regionName?: string
  isFirstNation: boolean
  quoteNotes: string
  setQuoteNotes: (notes: string) => void
  attachedWindowQuote: any
  setAttachedWindowQuote: (q: any) => void
  attachedSealedUnit: any
  setAttachedSealedUnit: (u: any) => void
  totals: any
  quoteTemplate: QuoteTemplateType
  setQuoteTemplate: (t: QuoteTemplateType) => void
  quoteFontSize: number
  setQuoteFontSize: (s: number) => void
  quoteSpacing: number
  setQuoteSpacing: (s: number) => void
  user: any
  adminSubmitMode: "direct_approve" | "submit_review"
  setAdminSubmitMode: (m: "direct_approve" | "submit_review") => void
  staffList: any[]
  assignedReviewer: string
  setAssignedReviewer: (r: string) => void
  clerkList: any[]
  selectedOdooClerk: string
  setSelectedOdooClerk: (c: string) => void
  preparerNotes: string
  setPreparerNotes: (n: string) => void
  submittingQuote: boolean
  onSubmitQuote: () => Promise<void>
  onLoadQuoteFromDrafts: (draft: QuoteDraftItem) => void
  onConfirmReset: () => void
  onSaveDraft?: () => Promise<any> | void
  showConflictModal?: boolean
  setShowConflictModal?: (show: boolean) => void
  pendingDraftToLoad?: QuoteDraftItem | null
  onConflictSaveExistingAndLoad?: () => Promise<void> | void
  onConflictContinueWithNew?: () => void
  onConflictCancel?: () => void
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
  onSaveDraft,
  showConflictModal,
  setShowConflictModal,
  pendingDraftToLoad,
  onConflictSaveExistingAndLoad,
  onConflictContinueWithNew,
  onConflictCancel,
}: DoorModalsGroupProps) {
  const totalDoorUnits =
    totals.totalUnits ||
    lineItems.reduce((acc, it) => acc + (it.quantity || 1), 0)

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
          preparedBy={user?.name || user?.username || "The Window & Door Store"}
          hstRate={isFirstNation ? 8 : 13}
          isSupplyOnly={mode === "supply_only"}
          regionName={regionName}
          globalUpcharges={globalUpcharges}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          isDualOption={Boolean(readSessionAttachedInstallOption()?.enabled)}
          attachedInstallOption={readSessionAttachedInstallOption()}
          customOptions={readSessionCustomOptions()}
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
          quoteType="door"
          totalUnits={totalDoorUnits}
          lineCount={lineItems.length}
          windowsCount={totalDoorUnits}
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
      <ResetModalWrapper
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={onConfirmReset}
        onSaveDraftAndReset={
          onSaveDraft
            ? async () => {
                const saved = await onSaveDraft()
                if (saved) {
                  onConfirmReset()
                  setShowResetModal(false)
                }
              }
            : undefined
        }
        title="Start New Door Quote?"
      />

      {/* 6. Unsaved Quote Conflict Dialog */}
      {showConflictModal && (
        <UnsavedQuoteConflictModal
          isOpen={Boolean(showConflictModal)}
          onClose={onConflictCancel || (() => setShowConflictModal?.(false))}
          quoteTypeLabel="Door"
          existingQuoteTitle={
            customerName || quoteNumber
              ? `#${quoteNumber || "Draft"} - ${customerName || "Unnamed"}`
              : "Draft in progress"
          }
          incomingQuoteTitle={
            pendingDraftToLoad?.quoteNumber
              ? `Door Quote #${pendingDraftToLoad.quoteNumber}`
              : "new door quote"
          }
          onSaveExistingAndLoad={onConflictSaveExistingAndLoad || (() => {})}
          onContinueWithNew={onConflictContinueWithNew || (() => {})}
        />
      )}
    </>
  )
}
