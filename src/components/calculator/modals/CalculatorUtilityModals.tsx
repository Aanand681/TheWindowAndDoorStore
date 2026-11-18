"use client"

import React from "react"
import {
  SavedQuotesModalWrapper,
  AttachQuoteModalWrapper,
  ResetModalWrapper,
} from "./index"
import { UnsavedQuoteConflictModal } from "@/components/shared/UnsavedQuoteConflictModal"
import { CalculatorUtilityModalsProps } from "./types"

export function CalculatorUtilityModals({
  isSavedQuotesOpen,
  setIsSavedQuotesOpen,
  loadDraftIntoWorkspace,
  isAttachModalOpen,
  setIsAttachModalOpen,
  attachedSealedUnit,
  attachedDoorQuote,
  setAttachedSealedUnit,
  setAttachedDoorQuote,
  showResetModal,
  setShowResetModal,
  handleConfirmReset,
  handleSaveDraft,
  showConflictModal,
  setShowConflictModal,
  pendingDraftToLoad,
  onConflictSaveExistingAndLoad,
  onConflictContinueWithNew,
  onConflictCancel,
  customerName,
  quoteNumber,
}: CalculatorUtilityModalsProps) {
  const handleSaveDraftAndReset = async () => {
    if (handleSaveDraft) {
      const saved = await handleSaveDraft()
      // Only reset workspace if the quote was successfully saved to MongoDB
      if (saved) {
        handleConfirmReset()
        setShowResetModal(false)
      }
    } else {
      handleConfirmReset()
      setShowResetModal(false)
    }
  }

  return (
    <>
      <SavedQuotesModalWrapper
        isOpen={isSavedQuotesOpen}
        onClose={() => setIsSavedQuotesOpen(false)}
        defaultType="window"
        onLoadQuote={loadDraftIntoWorkspace}
      />

      <AttachQuoteModalWrapper
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

      <ResetModalWrapper
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
        onSaveDraftAndReset={handleSaveDraftAndReset}
      />

      {showConflictModal && (
        <UnsavedQuoteConflictModal
          isOpen={Boolean(showConflictModal)}
          onClose={onConflictCancel || (() => setShowConflictModal?.(false))}
          quoteTypeLabel="Window"
          existingQuoteTitle={
            customerName || quoteNumber
              ? `#${quoteNumber || "Draft"} - ${customerName || "Unnamed"}`
              : "Draft in progress"
          }
          incomingQuoteTitle={
            pendingDraftToLoad?.quoteNumber
              ? `Window Quote #${pendingDraftToLoad.quoteNumber}`
              : "new window quote"
          }
          onSaveExistingAndLoad={onConflictSaveExistingAndLoad || (() => {})}
          onContinueWithNew={onConflictContinueWithNew || (() => {})}
        />
      )}
    </>
  )
}
