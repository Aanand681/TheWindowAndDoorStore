"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { calculateSealedUnitTotals } from "@/lib/sealed-units/calculations"
import { SealedUnitTemplateType } from "@/components/sealed-units"
import {
  useSealedUnitsSettings,
  useSealedUnitsTravel,
  useSealedUnitsItemBuilder,
  useSealedUnitsDrafts,
  useSealedUnitsReviewSubmit,
  useSealedUnitsReviewLoader,
  useSealedUnitsReviewActions,
  WorkspaceSetters,
} from "@/hooks/sealed-units"
import { useSealedUnitsAttachedSync } from "@/hooks/sealed-units/useSealedUnitsAttachedSync"
import { createWorkspaceSetters } from "./sealed-units-workspace-setters"
import {
  validateAndOpenPrint,
  validateAndOpenSubmit,
  startNewSealedUnitQuote,
} from "./sealed-units-page-handlers"

export interface UseSealedUnitsCalculatorPageOptions {
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export function useSealedUnitsCalculatorPage(
  options: UseSealedUnitsCalculatorPageOptions = {}
) {
  const { data: session } = useSession()
  const user = session?.user as any

  // 1. Settings & Staff Lists Hook
  const settings = useSealedUnitsSettings()

  // 2. Base Line Items & Travel/Service Hook
  const [lineItems, setLineItems] = useState<SealedUnitLineItem[]>([])
  const travel = useSealedUnitsTravel()

  // 3. Print & Interactive Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false)
  const [quoteTemplate, setQuoteTemplate] =
    useState<SealedUnitTemplateType>("window_style")
  const [quoteFontSize, setQuoteFontSize] = useState<number>(8.5)
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0)

  // 4. Financial Calculations
  const totals = useMemo(() => {
    const calc = calculateSealedUnitTotals({
      lineItems,
      ...travel.formInputs,
      labour: settings.labour,
    })
    return {
      ...calc,
      isInstallation: travel.isInstallation,
      isServiceOnly: travel.isServiceOnly,
      globalUpcharges: travel.globalUpcharges,
    }
  }, [
    lineItems,
    travel.formInputs,
    travel.isInstallation,
    travel.isServiceOnly,
    settings.labour,
  ])

  // 5. Item Builder Hook
  const builder = useSealedUnitsItemBuilder({
    combos: settings.combos,
    formula: settings.formula,
    labour: settings.labour,
    thicknessBreaks: settings.thicknessBreaks,
    grills: settings.grills,
    setLineItems,
  })

  // 6. Drafts & Auto-Recovery Hook
  const drafts = useSealedUnitsDrafts({
    lineItems,
    setLineItems,
    formInputs: {
      ...travel.formInputs,
      regionName: travel.selectedRegion?.name,
    },
    formSetters: travel.formSetters,
    totals,
    regions: travel.regions,
  })

  // 7. Workspace Setters for Review Loader
  const workspaceSetters = useMemo<WorkspaceSetters>(
    () => createWorkspaceSetters(drafts, travel, setLineItems),
    [drafts, travel]
  )

  // 8. Review Mode & Workflow Hooks
  const reviewLoader = useSealedUnitsReviewLoader({
    user,
    setters: workspaceSetters,
    onConfirmReset: drafts.handleResetWorkspace,
    initialReviewQuoteId: options.initialReviewQuoteId,
    initialIsEditMode: options.initialIsEditMode,
    originSubTab: options.originSubTab,
  })

  // Auto-sync attached child quotes (windows & doors) when edited in other tabs
  useSealedUnitsAttachedSync({
    attachedWindowQuote: drafts.attachedWindowQuote,
    setAttachedWindowQuote: drafts.setAttachedWindowQuote,
    attachedDoorQuote: drafts.attachedDoorQuote,
    setAttachedDoorQuote: drafts.setAttachedDoorQuote,
    enabled: !reviewLoader.reviewQuote,
  })

  const reviewActions = useSealedUnitsReviewActions({
    user,
    reviewQuoteId: reviewLoader.reviewQuoteId,
    reviewQuote: reviewLoader.reviewQuote,
    setReviewQuote: reviewLoader.setReviewQuote,
    setOriginalSnapshot: reviewLoader.setOriginalSnapshot,
    setIsEditMode: reviewLoader.setIsEditMode,
    handleExitReview: reviewLoader.handleExitReview,
    customerName: drafts.customerName,
    quoteNumber: drafts.quoteNumber,
    quoteNotes: drafts.quoteNotes,
    sealedUnitMode: travel.sealedUnitMode,
    isInstallation: travel.isInstallation,
    isServiceOnly: travel.isServiceOnly,
    lineItems,
    totals,
    serviceSqftInput: travel.serviceSqftInput,
    serviceLabourRateInput: travel.serviceLabourRateInput,
    serviceMiscRateInput: travel.serviceMiscRateInput,
    selectedRegionId: travel.selectedRegionId,
    travelFeeType: travel.travelFeeType,
    customTravelFee: travel.customTravelFee,
    showOutTownTravel: travel.showOutTownTravel,
    travelKm: travel.travelKm,
    crewHours: travel.crewHours,
    crewSize: travel.crewSize,
    extraLabour: travel.extraLabour,
    globalUpcharges: travel.globalUpcharges,
    hstRate: travel.hstRate,
    attachedWindowQuote: drafts.attachedWindowQuote,
    attachedDoorQuote: drafts.attachedDoorQuote,
    staffList: settings.staffList,
    clerkList: settings.clerkList,
  })

  // 9. Standard Review Submit Hook (for initial workspace submission)
  const review = useSealedUnitsReviewSubmit({
    user,
    quoteNumber: drafts.quoteNumber,
    customerName: drafts.customerName,
    quoteNotes: drafts.quoteNotes,
    lineItems,
    isInstallation: travel.isInstallation,
    isServiceOnly: travel.isServiceOnly,
    hstRate: travel.hstRate,
    totals,
    assignedReviewer: settings.assignedReviewer,
    selectedOdooClerk: settings.selectedOdooClerk,
    attachedWindowQuote: drafts.attachedWindowQuote,
    attachedDoorQuote: drafts.attachedDoorQuote,
    selectedRegionId: travel.selectedRegionId,
    travelFeeType: travel.travelFeeType,
    customTravelFee: travel.customTravelFee,
    showOutTownTravel: travel.showOutTownTravel,
    travelKm: travel.travelKm,
    crewHours: travel.crewHours,
    crewSize: travel.crewSize,
    extraLabour: travel.extraLabour,
    globalUpcharges: travel.globalUpcharges,
  })

  const reviewWorkflowProps = {
    reviewQuote: reviewLoader.reviewQuote,
    activeTab: "sealed_unit" as const,
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
    setIsPreviewOpen,
    setOdooOrderNumberInput: reviewActions.setOdooOrderNumberInput,
    setShowCompleteOdooModal: reviewActions.setShowCompleteOdooModal,
    staffList: settings.staffList,
    setReassignTo: reviewActions.setReassignTo,
    setReassignNotes: reviewActions.setReassignNotes,
    setShowReassignModal: reviewActions.setShowReassignModal,
    handleReturnReviewQuote: reviewActions.handleReturnReviewQuote,
    handleApproveReviewQuote: reviewActions.handleApproveReviewQuote,
  }

  const handlePrint = () => {
    validateAndOpenPrint(
      lineItems,
      travel,
      totals,
      drafts,
      setIsPreviewOpen
    )
  }

  const handleOpenSubmitModal = () => {
    validateAndOpenSubmit(
      drafts,
      travel,
      totals,
      lineItems,
      settings,
      user,
      review
    )
  }

  const handleStartNewQuote = () => {
    startNewSealedUnitQuote(builder, drafts, lineItems, totals)
  }

  return {
    user,
    settings,
    travel,
    lineItems,
    setLineItems,
    isPreviewOpen,
    setIsPreviewOpen,
    quoteTemplate,
    setQuoteTemplate,
    quoteFontSize,
    setQuoteFontSize,
    quoteSpacing,
    setQuoteSpacing,
    totals,
    builder,
    drafts,
    reviewLoader,
    reviewActions,
    review,
    reviewWorkflowProps,
    handlePrint,
    handleOpenSubmitModal,
    handleStartNewQuote,
  }
}

export type SealedUnitsCalculatorPageState = ReturnType<
  typeof useSealedUnitsCalculatorPage
>
