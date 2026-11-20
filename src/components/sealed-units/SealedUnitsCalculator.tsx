"use client"

import React, { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { calculateSealedUnitTotals } from "@/lib/sealed-units/calculations"
import {
  SealedUnitItemBuilder,
  SealedUnitLabourTravelCard,
  SealedUnitQuoteSummaryCard,
  SealedUnitLineItemsTable,
  SealedUnitOfficePricingCard,
  SealedUnitTemplateType,
} from "@/components/sealed-units"
import { ReviewWorkflowBar } from "@/components/calculator/ReviewWorkflowBar"
import {
  WorkflowDialogsWrapper,
  OdooActionModalsWrapper,
} from "@/components/calculator/modals"
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
import { SealedUnitsHeaderBar } from "@/components/sealed-units/page/SealedUnitsHeaderBar"
import { SealedUnitsModalsGroup } from "@/components/sealed-units/page/SealedUnitsModalsGroup"
import { isWorkspaceDirtyOrUnsaved } from "@/lib/quote-drafts-storage"

export interface SealedUnitsCalculatorProps {
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export function SealedUnitsCalculator(
  props: SealedUnitsCalculatorProps = {}
) {
  const searchParams = useSearchParams()
  const queryQuoteId = searchParams?.get("reviewQuoteId") || undefined
  const queryEdit = searchParams?.get("edit") === "true"
  const querySub = searchParams?.get("sub") || undefined
  const effectiveQuoteId = props.initialReviewQuoteId || queryQuoteId
  const effectiveEdit = props.initialIsEditMode ?? queryEdit
  const effectiveSub = props.originSubTab || querySub

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
    () => ({
      setQuoteNumber: drafts.setQuoteNumber,
      setCustomerName: drafts.setCustomerName,
      setQuoteNotes: drafts.setQuoteNotes,
      setLineItems,
      setSealedUnitMode: travel.handleSetSealedUnitMode,
      setIsInstallation: travel.setIsInstallation,
      setServiceSqftInput: travel.setServiceSqftInput,
      setServiceLabourRateInput: travel.setServiceLabourRateInput,
      setServiceMiscRateInput: travel.setServiceMiscRateInput,
      setTravelFeeType: travel.setTravelFeeType,
      setCustomTravelFee: travel.setCustomTravelFee,
      setShowOutTownTravel: travel.setShowOutTownTravel,
      setTravelKm: travel.setTravelKm,
      setCrewHours: travel.setCrewHours,
      setCrewSize: travel.setCrewSize,
      setExtraLabour: travel.setExtraLabour,
      setGlobalUpcharges: travel.setGlobalUpcharges,
      setHstRate: travel.setHstRate,
      setSelectedRegionId: travel.setSelectedRegionId,
      regions: travel.regions,
      setAttachedWindowQuote: drafts.setAttachedWindowQuote,
      setAttachedDoorQuote: drafts.setAttachedDoorQuote,
    }),
    [drafts, travel]
  )

  // 8. Review Mode & Workflow Hooks
  const reviewLoader = useSealedUnitsReviewLoader({
    user,
    setters: workspaceSetters,
    onConfirmReset: drafts.handleResetWorkspace,
    initialReviewQuoteId: effectiveQuoteId,
    initialIsEditMode: effectiveEdit,
    originSubTab: effectiveSub,
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
    activeTab: "sealed_unit",
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
    if (
      lineItems.length === 0 &&
      !(travel.isServiceOnly && (totals.totalSqft || 0) > 0) &&
      !drafts.attachedWindowQuote &&
      !drafts.attachedDoorQuote
    ) {
      toast.error(
        "Add at least one line item, enter service sq ft, or attach a quote before previewing."
      )
      return
    }
    setIsPreviewOpen(true)
  }

  const handleOpenSubmitModal = () => {
    if (!drafts.quoteNumber.trim() || !drafts.customerName.trim()) {
      toast.error(
        "Please enter a Customer Name and Quote Number before submitting!"
      )
      return
    }
    if (
      lineItems.length === 0 &&
      !(travel.isServiceOnly && (totals.totalSqft || 0) > 0)
    ) {
      toast.error(
        "Add at least one line item or enter service sq ft before submitting!"
      )
      return
    }
    const otherReviewers = settings.staffList.filter(
      (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
    )
    if (
      otherReviewers.length > 0 &&
      (!settings.assignedReviewer ||
        settings.assignedReviewer.toLowerCase() ===
          user?.username?.toLowerCase() ||
        settings.assignedReviewer === "Admin")
    ) {
      settings.setAssignedReviewer(otherReviewers[0].username)
    }
    if (!settings.selectedOdooClerk && settings.clerkList.length > 0) {
      const defaultClerk =
        settings.clerkList.find((c) => c.department === "CLERK") ||
        settings.clerkList[0]
      if (defaultClerk) settings.setSelectedOdooClerk(defaultClerk.username)
    }
    review.setShowSubmitModal(true)
  }

  const handleStartNewQuote = () => {
    builder.handleCancelEdit()
    const isDirty = isWorkspaceDirtyOrUnsaved("sealed_unit", {
      quoteNumber: drafts.quoteNumber,
      customerName: drafts.customerName,
      itemCount: lineItems.length,
      grandTotal: totals.grandTotal,
      data: {
        lineItems,
        attachedWindowQuote: drafts.attachedWindowQuote,
        attachedDoorQuote: drafts.attachedDoorQuote,
      },
    })
    if (isDirty) {
      drafts.setShowResetModal(true)
    } else {
      drafts.handleResetWorkspace()
    }
  }

  return (
    <>
      <div className="su-no-print min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-4 px-4 pt-5 pb-10 sm:px-6 sm:pt-6 lg:px-8">
          {/* Sticky Review / Approval Bar */}
          <ReviewWorkflowBar {...reviewWorkflowProps} />

          <SealedUnitsHeaderBar
            user={user}
            lastSavedAt={drafts.lastSavedAt}
            hasAttachedQuote={Boolean(
              drafts.attachedWindowQuote || drafts.attachedDoorQuote
            )}
            savedDraftsCount={drafts.savedDraftsCount}
            onOpenAttachModal={() => drafts.setIsAttachModalOpen(true)}
            onSaveDraft={drafts.handleSaveDraft}
            onOpenSavedQuotes={() => drafts.setIsSavedQuotesOpen(true)}
          />

          <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-12">
            {/* Left Column (7 cols): Builder, Table, Travel */}
            <div className="space-y-3.5 lg:col-span-7">
              <SealedUnitItemBuilder
                customerName={drafts.customerName}
                setCustomerName={drafts.setCustomerName}
                quoteNumber={drafts.quoteNumber}
                setQuoteNumber={drafts.setQuoteNumber}
                onRegenerateQuoteNumber={() =>
                  drafts.setQuoteNumber(drafts.generateQuoteNumber())
                }
                {...builder}
                grills={settings.grills}
                onResetQuote={handleStartNewQuote}
                onSaveDraft={drafts.handleSaveDraft}
                onOpenSavedQuotes={() => drafts.setIsSavedQuotesOpen(true)}
                savedDraftsCount={drafts.savedDraftsCount}
                isReadOnly={reviewLoader.isReadOnly}
              />

              <SealedUnitLineItemsTable
                lineItems={lineItems}
                isInstallation={travel.isInstallation}
                mode={travel.sealedUnitMode}
                labourRate={totals.effectiveLabourRate}
                miscRate={totals.effectiveMiscRate}
                labourMin={settings.labour.labourMinPerUnit ?? 120.0}
                editingItemId={builder.editingItem?.id}
                onEditItem={builder.handleEditItem}
                onDuplicateItem={builder.handleDuplicateItem}
                onRemoveItem={builder.handleRemoveItem}
                onResetQuote={handleStartNewQuote}
                isReadOnly={reviewLoader.isReadOnly}
              />

              <SealedUnitLabourTravelCard
                mode={travel.sealedUnitMode}
                setMode={travel.handleSetSealedUnitMode}
                isInstallation={travel.isInstallation}
                setIsInstallation={travel.setIsInstallation}
                labour={settings.labour}
                regions={travel.regions}
                selectedRegionId={travel.selectedRegionId}
                onSelectRegion={travel.setSelectedRegionId}
                travelFeeType={travel.travelFeeType}
                setTravelFeeType={travel.setTravelFeeType}
                customTravelFee={travel.customTravelFee}
                setCustomTravelFee={travel.setCustomTravelFee}
                showOutTownTravel={travel.showOutTownTravel}
                setShowOutTownTravel={travel.setShowOutTownTravel}
                travelKm={travel.travelKm}
                setTravelKm={travel.setTravelKm}
                crewHours={travel.crewHours}
                setCrewHours={travel.setCrewHours}
                crewSize={travel.crewSize}
                setCrewSize={travel.setCrewSize}
                extraLabour={travel.extraLabour}
                setExtraLabour={travel.setExtraLabour}
                globalUpcharges={travel.globalUpcharges}
                setGlobalUpcharges={travel.setGlobalUpcharges}
                serviceSqftInput={travel.serviceSqftInput}
                setServiceSqftInput={travel.setServiceSqftInput}
                serviceLabourRateInput={travel.serviceLabourRateInput}
                setServiceLabourRateInput={travel.setServiceLabourRateInput}
                serviceMiscRateInput={travel.serviceMiscRateInput}
                setServiceMiscRateInput={travel.setServiceMiscRateInput}
                itemsSqft={totals.itemsSqft || 0}
                totals={totals}
                isReadOnly={reviewLoader.isReadOnly}
              />
            </div>

            {/* Right Column (5 cols, sticky): Quote Summary */}
            <div className="space-y-3.5 lg:sticky lg:top-4 lg:col-span-5">
              <SealedUnitQuoteSummaryCard
                lineItems={lineItems}
                lineItemsCount={lineItems.length}
                mode={travel.sealedUnitMode}
                onModeChange={travel.handleSetSealedUnitMode}
                isInstallation={travel.isInstallation}
                labour={settings.labour}
                hstRate={travel.hstRate}
                setHstRate={travel.setHstRate}
                totals={totals}
                customerName={drafts.customerName}
                quoteNumber={drafts.quoteNumber}
                quoteNotes={drafts.quoteNotes}
                setQuoteNotes={drafts.setQuoteNotes}
                user={user}
                onOpenSubmitModal={handleOpenSubmitModal}
                onPrint={handlePrint}
                onResetQuote={handleStartNewQuote}
                onSaveDraft={drafts.handleSaveDraft}
                onOpenSavedQuotes={() => drafts.setIsSavedQuotesOpen(true)}
                attachedWindowQuote={drafts.attachedWindowQuote}
                attachedDoorQuote={drafts.attachedDoorQuote}
                onOpenAttachModal={() => drafts.setIsAttachModalOpen(true)}
                onRemoveAttachedWindowQuote={() => {
                  drafts.setAttachedWindowQuote(null)
                  toast.info("Detached Window Quote")
                }}
                onRemoveAttachedDoorQuote={() => {
                  drafts.setAttachedDoorQuote(null)
                  toast.info("Detached Door Quote")
                }}
                isReadOnly={reviewLoader.isReadOnly}
                isReviewMode={Boolean(reviewLoader.reviewQuote)}
              />

              <SealedUnitOfficePricingCard
                lineItems={lineItems}
                totals={totals}
                formula={settings.formula}
                labour={settings.labour}
                isInstallation={travel.isInstallation}
                isServiceOnly={travel.isServiceOnly}
                travelKm={travel.travelKm}
                crewHours={travel.crewHours}
                crewSize={travel.crewSize}
              />
            </div>
          </div>
        </div>
      </div>

      <SealedUnitsModalsGroup
        user={user}
        review={review}
        drafts={drafts}
        settings={settings}
        preview={{
          isPreviewOpen,
          setIsPreviewOpen,
          quoteTemplate,
          setQuoteTemplate,
          quoteFontSize,
          setQuoteFontSize,
          quoteSpacing,
          setQuoteSpacing,
        }}
        lineItems={lineItems}
        totals={totals}
        isInstallation={travel.isInstallation}
        regionName={
          travel.isInstallation ? travel.selectedRegion?.name : undefined
        }
        hstRate={travel.hstRate}
      />

      {/* Review Workflow Action Dialogs */}
      <WorkflowDialogsWrapper
        showReassignModal={reviewActions.showReassignModal}
        setShowReassignModal={reviewActions.setShowReassignModal}
        reviewQuote={reviewLoader.reviewQuote}
        user={user}
        staffList={settings.staffList}
        reassignTo={reviewActions.reassignTo}
        setReassignTo={reviewActions.setReassignTo}
        reassignNotes={reviewActions.reassignNotes}
        setReassignNotes={reviewActions.setReassignNotes}
        handleReassignQuote={reviewActions.handleReassignQuote}
        showReturnModal={reviewActions.showReturnModal}
        setShowReturnModal={reviewActions.setShowReturnModal}
        returnNotes={reviewActions.returnNotes}
        setReturnNotes={reviewActions.setReturnNotes}
        submitReturnReviewQuote={reviewActions.submitReturnReviewQuote}
        showExitReviewForPdfModal={false}
        setShowExitReviewForPdfModal={() => {}}
        handleExitReviewAndImportPdf={() => {}}
        reviewActionLoading={reviewActions.reviewActionLoading}
      />

      <OdooActionModalsWrapper
        showApproveOdooModal={reviewActions.showApproveOdooModal}
        setShowApproveOdooModal={reviewActions.setShowApproveOdooModal}
        showCompleteOdooModal={reviewActions.showCompleteOdooModal}
        setShowCompleteOdooModal={reviewActions.setShowCompleteOdooModal}
        reviewQuote={reviewLoader.reviewQuote}
        selectedOdooClerk={reviewActions.selectedOdooClerk}
        setSelectedOdooClerk={reviewActions.setSelectedOdooClerk}
        odooOrderNumberInput={reviewActions.odooOrderNumberInput}
        setOdooOrderNumberInput={reviewActions.setOdooOrderNumberInput}
        reviewActionLoading={reviewActions.reviewActionLoading}
        clerkList={settings.clerkList}
        staffList={settings.staffList}
        confirmApproveReviewQuote={reviewActions.confirmApproveReviewQuote}
        handleCompleteOdooEntry={reviewActions.handleCompleteOdooEntry}
      />
    </>
  )
}
