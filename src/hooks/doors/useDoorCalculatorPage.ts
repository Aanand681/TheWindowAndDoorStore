'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { DoorQuotingMode, DoorSelectedUpcharge } from '@/lib/doors/types';
import { calculateDoorQuoteTotals } from '@/lib/doors/calculations';
import { QuoteTemplateType } from '@/components/quotes/QuoteInvoice';
import { useDoorSettings } from './useDoorSettings';
import { useDoorItemBuilder } from './useDoorItemBuilder';
import { useDoorTravel } from './useDoorTravel';
import { useDoorDrafts } from './useDoorDrafts';
import { useDoorAutoSave } from './useDoorAutoSave';
import { useDoorReviewSubmit } from './useDoorReviewSubmit';

export function useDoorCalculatorPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  // 1. Settings Hook
  const { presets, upcharges, formula, logistics } = useDoorSettings();

  // 2. Base Quote Customer & Mode State
  const [customerName, setCustomerName] = useState<string>('');
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [mode, setMode] = useState<DoorQuotingMode>('installation');
  const [globalUpcharges, setGlobalUpcharges] = useState<DoorSelectedUpcharge[]>([]);

  // 3. Customer / Notes / Tax / Attached Quotes State
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [isFirstNation, setIsFirstNation] = useState<boolean>(false);
  const [customLabour, setCustomLabour] = useState<string>('');
  const [customMisc, setCustomMisc] = useState<string>('');
  const [attachedWindowQuote, setAttachedWindowQuote] = useState<any | null>(null);
  const [attachedSealedUnit, setAttachedSealedUnit] = useState<any | null>(null);

  // 4. Print / Preview Configuration State
  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>('cards');
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5);
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false);

  // 5. Line Item Builder Hook
  const {
    lineItems,
    setLineItems,
    editingItem,
    setEditingItem,
    handleSaveItem,
    handleEditItem,
    handleDuplicateItem,
    handleDeleteItem,
  } = useDoorItemBuilder();

  // 6. Travel & Logistics Hook
  const {
    travelFeeType,
    setTravelFeeType,
    customTravelFee,
    setCustomTravelFee,
    showOutTownTravel,
    setShowOutTownTravel,
    travelKm,
    setTravelKm,
    crewHours,
    setCrewHours,
    crewSize,
    setCrewSize,
    handleUpdateTravelParams,
  } = useDoorTravel();

  // 7. Calculate Totals using Pure Calculation Engine
  const totals = useMemo(() => {
    return calculateDoorQuoteTotals({
      lineItems,
      mode,
      globalUpcharges,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      hstRate: isFirstNation ? 8 : 13,
      isFirstNation,
      formula,
      logistics,
    });
  }, [
    lineItems,
    mode,
    globalUpcharges,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    isFirstNation,
    formula,
    logistics,
  ]);

  const sharedSyncProps = {
    customerName,
    setCustomerName,
    quoteNumber,
    setQuoteNumber,
    mode,
    setMode,
    lineItems,
    setLineItems,
    globalUpcharges,
    setGlobalUpcharges,
    travelFeeType,
    setTravelFeeType,
    customTravelFee,
    setCustomTravelFee,
    showOutTownTravel,
    setShowOutTownTravel,
    travelKm,
    setTravelKm,
    crewHours,
    setCrewHours,
    crewSize,
    setCrewSize,
    quoteNotes,
    setQuoteNotes,
    isFirstNation,
    setIsFirstNation,
    customLabour,
    setCustomLabour,
    customMisc,
    setCustomMisc,
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedSealedUnit,
    setAttachedSealedUnit,
    totals,
  };

  // 8. Auto-Save Hook
  const { lastSavedAt, setLastSavedAt } = useDoorAutoSave(sharedSyncProps);

  // 9. Drafts & Workspace Reset Hook
  const {
    savedDraftsCount,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    showResetModal,
    setShowResetModal,
    handleExplicitSaveDraft,
    handleLoadQuoteFromDrafts,
    handleConfirmReset,
  } = useDoorDrafts({
    ...sharedSyncProps,
    setEditingItem,
    setLastSavedAt,
  });

  // 10. Submit & Review Workflow Hook
  const {
    showSubmitModal,
    setShowSubmitModal,
    submittingQuote,
    assignedReviewer,
    setAssignedReviewer,
    selectedOdooClerk,
    setSelectedOdooClerk,
    adminSubmitMode,
    setAdminSubmitMode,
    preparerNotes,
    setPreparerNotes,
    staffList,
    clerkList,
    handleSubmitQuote,
  } = useDoorReviewSubmit({
    user,
    isAdmin,
    customerName,
    quoteNumber,
    lineItems,
    mode,
    quoteNotes,
    isFirstNation,
    totals,
  });

  return {
    user,
    isAdmin,
    presets,
    upcharges,
    formula,
    logistics,
    customerName,
    setCustomerName,
    quoteNumber,
    setQuoteNumber,
    mode,
    setMode,
    globalUpcharges,
    setGlobalUpcharges,
    quoteNotes,
    setQuoteNotes,
    isFirstNation,
    setIsFirstNation,
    customLabour,
    setCustomLabour,
    customMisc,
    setCustomMisc,
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedSealedUnit,
    setAttachedSealedUnit,
    quoteTemplate,
    setQuoteTemplate,
    quoteFontSize,
    setQuoteFontSize,
    quoteSpacing,
    setQuoteSpacing,
    showPreviewModal,
    setShowPreviewModal,
    isAttachModalOpen,
    setIsAttachModalOpen,
    lineItems,
    editingItem,
    setEditingItem,
    handleSaveItem,
    handleEditItem,
    handleDuplicateItem,
    handleDeleteItem,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    handleUpdateTravelParams,
    totals,
    lastSavedAt,
    savedDraftsCount,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    showResetModal,
    setShowResetModal,
    handleExplicitSaveDraft,
    handleLoadQuoteFromDrafts,
    handleConfirmReset,
    showSubmitModal,
    setShowSubmitModal,
    submittingQuote,
    assignedReviewer,
    setAssignedReviewer,
    selectedOdooClerk,
    setSelectedOdooClerk,
    adminSubmitMode,
    setAdminSubmitMode,
    preparerNotes,
    setPreparerNotes,
    staffList,
    clerkList,
    handleSubmitQuote,
  };
}
