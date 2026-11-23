"use client"

import React from "react"
import dynamic from "next/dynamic"
import { ResetModalWrapper } from "@/components/calculator/modals/ResetModalWrapper"
import { SubmitReviewModal } from "@/components/calculator/SubmitReviewModal"
import { SavedQuotesModal } from "@/components/calculator/SavedQuotesModal"
import { AttachQuoteModal } from "@/components/calculator/AttachQuoteModal"
import { UnsavedQuoteConflictModal } from "@/components/shared/UnsavedQuoteConflictModal"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { DoorCalculatorPageState } from "@/hooks/doors"

const QuotePreviewModal = dynamic(
  () => import("@/components/quotes/QuotePreviewModal"),
  { ssr: false }
)

export interface DoorModalsGroupProps {
  page: DoorCalculatorPageState
}

export function DoorModalsGroup({ page }: DoorModalsGroupProps) {
  const totalDoorUnits =
    page.totals.totalUnits ||
    page.lineItems.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0)

  const regionName =
    page.mode === "supply_only" ? undefined : page.selectedRegion?.name

  return (
    <>
      {/* 1. Preview Modal */}
      {page.showPreviewModal && (
        <QuotePreviewModal
          isOpen={page.showPreviewModal}
          onClose={() => page.setShowPreviewModal(false)}
          customerName={page.customerName}
          quoteNumber={page.quoteNumber}
          preparedBy={
            page.user?.name || page.user?.username || "The Window & Door Store"
          }
          doors={page.lineItems}
          doorTotals={page.totals}
          quoteNotes={page.quoteNotes}
          template={page.quoteTemplate}
          fontSize={page.quoteFontSize}
          spacing={page.quoteSpacing}
          onTemplateChange={page.setQuoteTemplate}
          onFontSizeChange={page.setQuoteFontSize}
          onSpacingChange={page.setQuoteSpacing}
          isSupplyOnly={page.mode === "supply_only"}
          regionName={regionName}
          globalUpcharges={page.globalUpcharges}
          hstRate={page.hstRate !== undefined ? page.hstRate : (page.isFirstNation ? 8 : 13)}
          attachedWindowQuote={page.attachedWindowQuote}
          attachedSealedUnit={page.attachedSealedUnit}
          isDualOption={Boolean(readSessionAttachedInstallOption()?.enabled)}
          attachedInstallOption={readSessionAttachedInstallOption()}
          customOptions={readSessionCustomOptions()}
        />
      )}

      {/* 2. Submit / Direct Approve Modal */}
      {page.showSubmitModal && (
        <SubmitReviewModal
          isOpen={page.showSubmitModal}
          onClose={() => page.setShowSubmitModal(false)}
          quoteType="door"
          quoteNumber={page.quoteNumber}
          customerName={page.customerName}
          user={page.user}
          adminSubmitMode={page.adminSubmitMode}
          setAdminSubmitMode={page.setAdminSubmitMode}
          lineCount={page.lineItems.length}
          totalUnits={totalDoorUnits}
          windowsCount={totalDoorUnits}
          total={page.totals.grandTotal}
          staffList={page.staffList}
          clerkList={page.clerkList}
          assignedReviewer={page.assignedReviewer}
          setAssignedReviewer={page.setAssignedReviewer}
          selectedOdooClerk={page.selectedOdooClerk}
          setSelectedOdooClerk={page.setSelectedOdooClerk}
          preparerNotes={page.preparerNotes}
          setPreparerNotes={page.setPreparerNotes}
          submittingQuote={page.submittingQuote}
          onSubmit={page.handleSubmitQuote}
        />
      )}

      {/* 3. Saved Quotes Modal */}
      {page.isSavedQuotesOpen && (
        <SavedQuotesModal
          isOpen={page.isSavedQuotesOpen}
          onClose={() => page.setIsSavedQuotesOpen(false)}
          defaultType="door"
          onLoadQuote={page.handleLoadQuoteFromDrafts}
        />
      )}

      {/* 4. Attach Quote Modal */}
      {page.isAttachModalOpen && (
        <AttachQuoteModal
          isOpen={page.isAttachModalOpen}
          onClose={() => page.setIsAttachModalOpen(false)}
          currentQuoteType="door"
          attachedWindowQuote={page.attachedWindowQuote}
          attachedSealedUnit={page.attachedSealedUnit}
          onAttachWindow={(win) => page.setAttachedWindowQuote(win)}
          onDetachWindow={() => page.setAttachedWindowQuote(null)}
          onAttachSealedUnit={(su) => page.setAttachedSealedUnit(su)}
          onDetachSealedUnit={() => page.setAttachedSealedUnit(null)}
        />
      )}

      {/* 5. In-App Reset Confirmation Dialog */}
      <ResetModalWrapper
        isOpen={page.showResetModal}
        onClose={() => page.setShowResetModal(false)}
        onConfirm={page.handleConfirmReset}
        onSaveDraftAndReset={
          page.handleExplicitSaveDraft
            ? async () => {
                const saved = await page.handleExplicitSaveDraft()
                if (saved) {
                  page.handleConfirmReset()
                  page.setShowResetModal(false)
                }
              }
            : undefined
        }
        title="Start New Door Quote?"
      />

      {/* 6. Unsaved Quote Conflict Dialog */}
      {page.showConflictModal && (
        <UnsavedQuoteConflictModal
          isOpen={Boolean(page.showConflictModal)}
          onClose={page.handleConflictCancel || (() => page.setShowConflictModal?.(false))}
          quoteTypeLabel="Door"
          existingQuoteTitle={
            page.customerName || page.quoteNumber
              ? `#${page.quoteNumber || "Draft"} - ${page.customerName || "Unnamed"}`
              : "Draft in progress"
          }
          incomingQuoteTitle={
            page.pendingDraftToLoad?.quoteNumber
              ? `Door Quote #${page.pendingDraftToLoad.quoteNumber}`
              : "new door quote"
          }
          onSaveExistingAndLoad={page.handleConflictSaveExistingAndLoad || (() => {})}
          onContinueWithNew={page.handleConflictContinueWithNew || (() => {})}
        />
      )}
    </>
  )
}
