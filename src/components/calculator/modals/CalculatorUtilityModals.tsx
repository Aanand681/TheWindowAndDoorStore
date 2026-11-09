'use client';

import React from 'react';
import {
  SavedQuotesModalWrapper,
  AttachQuoteModalWrapper,
  ResetModalWrapper,
} from './index';
import { CalculatorUtilityModalsProps } from './types';

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
}: CalculatorUtilityModalsProps) {
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
      />
    </>
  );
}

