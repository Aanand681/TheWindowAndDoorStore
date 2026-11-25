"use client"

import React from "react"
import { ResetModalWrapper } from "@/components/calculator/modals/ResetModalWrapper"
import { SubmitReviewModal } from "@/components/calculator/SubmitReviewModal"
import { SavedQuotesModal } from "@/components/calculator/SavedQuotesModal"
import { AttachQuoteModal } from "@/components/calculator/AttachQuoteModal"
import { UnsavedQuoteConflictModal } from "@/components/shared/UnsavedQuoteConflictModal"
import QuoteInvoice from "@/components/quotes/QuoteInvoice"
import QuotePreviewModal from "@/components/quotes/QuotePreviewModal"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals, SealedUnitTemplateType } from "@/components/sealed-units/types"

export interface SealedUnitsPrintPreviewState {
  isPreviewOpen: boolean
  setIsPreviewOpen: (val: boolean) => void
  quoteTemplate: SealedUnitTemplateType
  setQuoteTemplate: (val: SealedUnitTemplateType) => void
  quoteFontSize: number
  setQuoteFontSize: (val: number) => void
  quoteSpacing: number
  setQuoteSpacing: (val: number) => void
}

interface SealedUnitsModalsGroupProps {
  user: any
  review: {
    showSubmitModal: boolean
    setShowSubmitModal: (val: boolean) => void
    adminSubmitMode: "direct_approve" | "submit_review"
    setAdminSubmitMode: (val: "direct_approve" | "submit_review") => void
    preparerNotes: string
    setPreparerNotes: (val: string) => void
    submittingQuote: boolean
    handleSubmitForReview: () => void
  }
  drafts: {
    quoteNumber: string
    customerName: string
    quoteNotes: string
    setQuoteNotes: (val: string) => void
    showResetModal: boolean
    setShowResetModal: (val: boolean) => void
    handleResetWorkspace: () => void
    isSavedQuotesOpen: boolean
    setIsSavedQuotesOpen: (val: boolean) => void
    isAttachModalOpen: boolean
    setIsAttachModalOpen: (val: boolean) => void
    attachedWindowQuote: any
    attachedDoorQuote: any
    setAttachedWindowQuote: (val: any) => void
    setAttachedDoorQuote: (val: any) => void
    loadDraftIntoWorkspace: (draft: any) => void
    handleSaveDraft?: () => Promise<any> | void
    showConflictModal?: boolean
    setShowConflictModal?: (val: boolean) => void
    pendingDraftToLoad?: any
    handleConflictSaveExistingAndLoad?: () => Promise<void> | void
    handleConflictContinueWithNew?: () => void
    handleConflictCancel?: () => void
  }
  settings: {
    staffList: any[]
    clerkList: any[]
    assignedReviewer: string
    setAssignedReviewer: (val: string) => void
    selectedOdooClerk: string
    setSelectedOdooClerk: (val: string) => void
  }
  preview: SealedUnitsPrintPreviewState
  lineItems: SealedUnitLineItem[]
  totals: SealedUnitTotals
  isInstallation: boolean
  regionName?: string
  hstRate: number
  loyaltyDiscount?: string
  loyaltyDiscountLabel?: string
  isReadOnly?: boolean
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
  regionName,
  hstRate,
  loyaltyDiscount = "",
  loyaltyDiscountLabel = "",
  isReadOnly = false,
}: SealedUnitsModalsGroupProps) {
  const totalSealedUnits = lineItems.reduce(
    (acc, it) => acc + (it.quantity || 1),
    0
  )
  const isSUSupplyOnly = !isInstallation && !totals?.isServiceOnly

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
        quoteType="sealed_unit"
        totalUnits={totalSealedUnits}
        lineCount={lineItems.length}
        windowsCount={totalSealedUnits}
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
      <ResetModalWrapper
        isOpen={drafts.showResetModal}
        onClose={() => drafts.setShowResetModal(false)}
        onConfirm={drafts.handleResetWorkspace}
        onSaveDraftAndReset={
          drafts.handleSaveDraft
            ? async () => {
                const saveFn = drafts.handleSaveDraft
                if (!saveFn) return
                const saved = await saveFn()
                if (saved) {
                  drafts.handleResetWorkspace()
                  drafts.setShowResetModal(false)
                }
              }
            : undefined
        }
        title="Start New Sealed Unit Quote?"
      />

      {/* DEDICATED CLEAN PRINTABLE QUOTE INVOICE */}
      {!preview.isPreviewOpen && (
        <QuoteInvoice
          customerName={drafts.customerName}
          quoteNumber={drafts.quoteNumber}
          preparedBy={user?.name || user?.username || ""}
          primaryQuoteType="sealed_unit"
          sealedUnits={lineItems}
          sealedUnitTotals={totals}
          quoteNotes={drafts.quoteNotes}
          template={preview.quoteTemplate as any}
          fontSize={preview.quoteFontSize}
          spacing={preview.quoteSpacing}
          hstRate={hstRate}
          isSupplyOnly={isSUSupplyOnly}
          loyaltyDiscount={loyaltyDiscount}
          loyaltyDiscountLabel={loyaltyDiscountLabel}
          regionName={regionName}
          attachedWindowQuote={drafts.attachedWindowQuote}
          attachedDoorQuote={drafts.attachedDoorQuote}
          isDualOption={Boolean(readSessionAttachedInstallOption()?.enabled)}
          attachedInstallOption={readSessionAttachedInstallOption()}
          customOptions={readSessionCustomOptions()}
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
        onQuoteNotesChange={isReadOnly ? undefined : drafts.setQuoteNotes}
        primaryQuoteType="sealed_unit"
        sealedUnits={lineItems}
        sealedUnitTotals={totals}
        customerName={drafts.customerName}
        quoteNumber={drafts.quoteNumber}
        preparedBy={user?.name || user?.username || ""}
        hstRate={hstRate}
        isSupplyOnly={isSUSupplyOnly}
        loyaltyDiscount={loyaltyDiscount}
        loyaltyDiscountLabel={loyaltyDiscountLabel}
        regionName={regionName}
        attachedWindowQuote={drafts.attachedWindowQuote}
        attachedDoorQuote={drafts.attachedDoorQuote}
        isDualOption={Boolean(readSessionAttachedInstallOption()?.enabled)}
        attachedInstallOption={readSessionAttachedInstallOption()}
        customOptions={readSessionCustomOptions()}
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

      {/* Unsaved Quote Conflict Dialog */}
      {drafts.showConflictModal && (
        <UnsavedQuoteConflictModal
          isOpen={Boolean(drafts.showConflictModal)}
          onClose={
            drafts.handleConflictCancel ||
            (() => drafts.setShowConflictModal?.(false))
          }
          quoteTypeLabel="Sealed Unit"
          existingQuoteTitle={
            drafts.customerName || drafts.quoteNumber
              ? `#${drafts.quoteNumber || "Draft"} - ${drafts.customerName || "Unnamed"}`
              : "Draft in progress"
          }
          incomingQuoteTitle={
            drafts.pendingDraftToLoad?.quoteNumber
              ? `Sealed Unit Quote #${drafts.pendingDraftToLoad.quoteNumber}`
              : "new sealed unit quote"
          }
          onSaveExistingAndLoad={
            drafts.handleConflictSaveExistingAndLoad || (() => {})
          }
          onContinueWithNew={drafts.handleConflictContinueWithNew || (() => {})}
        />
      )}
    </>
  )
}
