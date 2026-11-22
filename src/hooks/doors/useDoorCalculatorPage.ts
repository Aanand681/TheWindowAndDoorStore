"use client"

import { useState, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { DoorQuotingMode, DoorSelectedUpcharge } from "@/lib/doors/types"
import { calculateDoorQuoteTotals } from "@/lib/doors/calculations"
import { QuoteTemplateType } from "@/components/quotes/QuoteInvoice"
import { useDoorSettings } from "./useDoorSettings"
import { useDoorItemBuilder } from "./useDoorItemBuilder"
import { useDoorTravel } from "./useDoorTravel"
import { useDoorDrafts } from "./useDoorDrafts"
import { useDoorAutoSave } from "./useDoorAutoSave"
import { useDoorReviewSubmit } from "./useDoorReviewSubmit"
import { useDoorReviewLoader } from "./door-review-loader"
import { useDoorReviewActions } from "./door-review-actions"
import { useDoorAttachedSync } from "./useDoorAttachedSync"

export interface UseDoorCalculatorPageOptions {
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export type DoorCalculatorPageState = ReturnType<typeof useDoorCalculatorPage>

export function useDoorCalculatorPage(
  options: UseDoorCalculatorPageOptions = {}
) {
  const { data: session } = useSession()
  const user = session?.user as any
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN"

  // 1. Settings Hook
  const { presets, upcharges, formula, logistics } = useDoorSettings()

  // 2. Base Quote Customer & Mode State
  const [customerName, setCustomerName] = useState<string>("")
  const [quoteNumber, setQuoteNumber] = useState<string>("")
  const [mode, setMode] = useState<DoorQuotingMode>("installation")
  const [globalUpcharges, setGlobalUpcharges] = useState<
    DoorSelectedUpcharge[]
  >([])

  // 3. Customer / Notes / Tax / Attached Quotes State
  const [quoteNotes, setQuoteNotes] = useState<string>("")
  const [isFirstNation, setIsFirstNation] = useState<boolean>(false)
  const [hstRate, setHstRateState] = useState<number>(13)

  const setHstRate = useCallback((rate: number) => {
    setHstRateState(rate)
    setIsFirstNation(rate === 8)
  }, [])

  const handleToggleFirstNation = useCallback((val: boolean) => {
    setIsFirstNation(val)
    setHstRateState(val ? 8 : 13)
  }, [])
  const [customLabour, setCustomLabour] = useState<string>("")
  const [customMisc, setCustomMisc] = useState<string>("")
  const [customDiscount, setCustomDiscount] = useState<string>("")
  const [attachedWindowQuote, setAttachedWindowQuote] = useState<any | null>(
    null
  )
  const [attachedSealedUnit, setAttachedSealedUnit] = useState<any | null>(null)

  // 4. Print / Preview Configuration State
  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>("cards")
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5)
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0)
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false)

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
  } = useDoorItemBuilder()

  // 6. Travel & Logistics Hook
  const {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    selectedRegion,
    regionsLoading,
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
  } = useDoorTravel()

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
      hstRate,
      isFirstNation,
      formula,
      logistics,
      customDiscount,
    })
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
    hstRate,
    isFirstNation,
    formula,
    logistics,
    customDiscount,
  ])

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
    selectedRegionId,
    setSelectedRegionId,
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
    setIsFirstNation: handleToggleFirstNation,
    hstRate,
    setHstRate,
    customLabour,
    setCustomLabour,
    customMisc,
    setCustomMisc,
    customDiscount,
    setCustomDiscount,
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedSealedUnit,
    setAttachedSealedUnit,
    totals,
  }

  // 8. Auto-Save Hook
  const { lastSavedAt, setLastSavedAt } = useDoorAutoSave(sharedSyncProps)

  // 9. Drafts & Workspace Reset Hook
  const {
    savedDraftsCount,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    showResetModal,
    setShowResetModal,
    showConflictModal,
    setShowConflictModal,
    pendingDraftToLoad,
    handleConflictSaveExistingAndLoad,
    handleConflictContinueWithNew,
    handleConflictCancel,
    handleExplicitSaveDraft,
    handleLoadQuoteFromDrafts,
    handleConfirmReset,
  } = useDoorDrafts({
    ...sharedSyncProps,
    setEditingItem,
    setLastSavedAt,
  })

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
    attachedWindowQuote,
    attachedSealedUnit,
    selectedRegionId,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
  })

  // 11. Review Mode & Workflow Hooks
  const reviewLoader = useDoorReviewLoader({
    user,
    presets,
    formula,
    setCustomerName,
    setQuoteNumber,
    setQuoteNotes,
    setMode,
    setLineItems,
    setGlobalUpcharges,
    setSelectedRegionId,
    setTravelFeeType,
    setCustomTravelFee,
    setShowOutTownTravel,
    setTravelKm,
    setCrewHours,
    setCrewSize,
    setIsFirstNation: handleToggleFirstNation,
    setHstRate,
    setCustomLabour,
    setCustomMisc,
    setAttachedWindowQuote,
    setAttachedSealedUnit,
    onConfirmReset: handleConfirmReset,
    initialReviewQuoteId: options.initialReviewQuoteId,
    initialIsEditMode: options.initialIsEditMode,
    originSubTab: options.originSubTab,
  })

  // Auto-sync attached child quotes (windows & sealed units) when edited in other tabs
  useDoorAttachedSync({
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedSealedUnit,
    setAttachedSealedUnit,
    enabled: !reviewLoader.reviewQuote,
  })

  const reviewActions = useDoorReviewActions({
    user,
    reviewQuoteId: reviewLoader.reviewQuoteId,
    reviewQuote: reviewLoader.reviewQuote,
    setReviewQuote: reviewLoader.setReviewQuote,
    setOriginalSnapshot: reviewLoader.setOriginalSnapshot,
    setIsEditMode: reviewLoader.setIsEditMode,
    handleExitReview: reviewLoader.handleExitReview,
    customerName,
    quoteNumber,
    quoteNotes,
    mode,
    lineItems,
    totals,
    globalUpcharges,
    selectedRegionId,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    isFirstNation,
    hstRate,
    customLabour,
    customMisc,
    attachedWindowQuote,
    attachedSealedUnit,
    staffList,
    clerkList,
  })

  const reviewWorkflowProps = {
    reviewQuote: reviewLoader.reviewQuote,
    activeTab: "door",
    isEditMode: reviewLoader.isEditMode,
    setIsEditMode: reviewLoader.setIsEditMode,
    canEditCurrentQuote: reviewLoader.perms.canEditCurrentQuote,
    isReviewerOrAdmin: reviewLoader.perms.isReviewerOrAdmin,
    canApprove: reviewLoader.perms.canApprove,
    isAssignedReviewer: reviewLoader.perms.isAssignedReviewer,
    isOdooClerk: reviewLoader.perms.isOdooClerk,
    user,
    reviewActionLoading: reviewActions.reviewActionLoading,
    handleSaveQuotePrices: reviewActions.handleSaveQuotePrices,
    handleCancelEdits: reviewLoader.handleCancelEdits,
    handleResubmitReturnedQuote: reviewActions.handleResubmitReturnedQuote,
    handleExitReview: reviewLoader.handleExitReview,
    setIsPreviewOpen: setShowPreviewModal,
    setOdooOrderNumberInput: reviewActions.setOdooOrderNumberInput,
    setShowCompleteOdooModal: reviewActions.setShowCompleteOdooModal,
    staffList,
    setReassignTo: reviewActions.setReassignTo,
    setReassignNotes: reviewActions.setReassignNotes,
    setShowReassignModal: reviewActions.setShowReassignModal,
    handleReturnReviewQuote: reviewActions.handleReturnReviewQuote,
    handleApproveReviewQuote: reviewActions.handleApproveReviewQuote,
  }

  return {
    reviewQuote: reviewLoader.reviewQuote,
    isEditMode: reviewLoader.isEditMode,
    isReadOnly: reviewLoader.perms.isReadOnly,
    reviewWorkflowProps,
    reviewLoader,
    reviewActions,
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
    setIsFirstNation: handleToggleFirstNation,
    hstRate,
    setHstRate,
    customLabour,
    setCustomLabour,
    customMisc,
    setCustomMisc,
    customDiscount,
    setCustomDiscount,
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
    setLineItems,
    editingItem,
    setEditingItem,
    handleSaveItem,
    handleEditItem,
    handleDuplicateItem,
    handleDeleteItem,
    regions,
    selectedRegionId,
    setSelectedRegionId,
    selectedRegion,
    regionsLoading,
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
    showConflictModal,
    setShowConflictModal,
    pendingDraftToLoad,
    handleConflictSaveExistingAndLoad,
    handleConflictContinueWithNew,
    handleConflictCancel,
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
  }
}
