"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/layout/AppHeader"
import {
  DoorItemBuilder,
  DoorLineItemsTable,
  DoorLabourTravelCard,
  DoorQuoteSummaryCard,
  DoorOfficePricingCard,
} from "@/components/doors"
import QuoteInvoice from "@/components/quotes/QuoteInvoice"
import { ReviewWorkflowBar } from "@/components/calculator/ReviewWorkflowBar"
import {
  WorkflowDialogsWrapper,
  OdooActionModalsWrapper,
} from "@/components/calculator/modals"
import {
  readSessionAttachedInstallOption,
  readSessionDoorHardwareConfig,
  writeSessionDoorHardwareConfig,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { toast } from "sonner"

import { useDoorCalculatorPage } from "@/hooks/doors"
import { DoorHeaderBar, DoorModalsGroup } from "@/components/doors/page"
import { isWorkspaceDirtyOrUnsaved } from "@/lib/quote-drafts-storage"

export interface DoorCalculatorProps {
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export function DoorCalculator(props: DoorCalculatorProps = {}) {
  const searchParams = useSearchParams()
  const queryQuoteId = searchParams?.get("reviewQuoteId") || undefined
  const queryEdit = searchParams?.get("edit") === "true"
  const querySub = searchParams?.get("sub") || undefined
  const effectiveQuoteId = props.initialReviewQuoteId || queryQuoteId
  const effectiveEdit = props.initialIsEditMode ?? queryEdit
  const effectiveSub = props.originSubTab || querySub

  const {
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
    hstRate,
    setHstRate,
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
    setLineItems,
    editingItem,
    setEditingItem,
    handleSaveItem,
    handleEditItem,
    handleDuplicateItem,
    handleDeleteItem,
    regions,
    selectedRegionId,
    selectedRegion,
    setSelectedRegionId,
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
    reviewQuote,
    isEditMode,
    isReadOnly,
    reviewWorkflowProps,
    reviewActions,
  } = useDoorCalculatorPage({
    initialReviewQuoteId: effectiveQuoteId,
    initialIsEditMode: effectiveEdit,
    originSubTab: effectiveSub,
  })

  const handleStartNewQuote = () => {
    const isDirty = isWorkspaceDirtyOrUnsaved("door", {
      quoteNumber,
      customerName,
      itemCount: lineItems.length,
      grandTotal: totals.grandTotal,
      data: {
        lineItems,
        attachedWindowQuote,
        attachedSealedUnit,
      },
    })
    if (isDirty) {
      setShowResetModal(true)
    } else {
      handleConfirmReset()
    }
  }

  const handleApplyDoorHardware = (configOrSelections: any) => {
    if (!configOrSelections) return

    if (
      typeof configOrSelections.standardQty === "number" ||
      typeof configOrSelections.totalQty === "number"
    ) {
      const config = configOrSelections
      writeSessionDoorHardwareConfig(config)
      let remainingStd = config.type === "standard" ? config.standardQty : 0
      let remainingCust = config.hasCustom
        ? config.customQty
        : config.type === "custom"
          ? config.standardPrice
            ? config.standardQty
            : 0
          : 0
      const custPrice = config.hasCustom
        ? config.customPrice
        : config.type === "custom"
          ? config.standardPrice
          : 220

      setLineItems((prev) =>
        prev.map((item) => {
          if (item.category === "storm") return item
          const q = item.quantity || 1
          let hwType: "standard" | "custom" | "none" = "none"
          let hwPrice = 0

          if (remainingStd >= q) {
            hwType = "standard"
            hwPrice = config.standardPrice || 158.0
            remainingStd -= q
          } else if (remainingCust >= q) {
            hwType = "custom"
            hwPrice = custPrice
            remainingCust -= q
          } else if (remainingStd > 0) {
            hwType = "standard"
            hwPrice = config.standardPrice || 158.0
            remainingStd = 0
          } else if (remainingCust > 0) {
            hwType = "custom"
            hwPrice = custPrice
            remainingCust = 0
          }

          return {
            ...item,
            hardwareType: hwType,
            hardwarePrice: hwPrice,
            installHardwareType: hwType,
            installHardwarePrice: hwPrice,
            lineHardwareTotal: Math.round(hwPrice * q * 100) / 100,
          }
        })
      )
      return
    }

    if (Array.isArray(configOrSelections)) {
      setLineItems((prev) =>
        prev.map((item, idx) => {
          const match = configOrSelections.find(
            (s: any) => s.doorId === item.id || s.doorId === `door_${idx}`
          )
          if (!match) return item
          return {
            ...item,
            hardwareType: match.hardwareType,
            hardwarePrice: match.price,
            installHardwareType: match.hardwareType,
            installHardwarePrice: match.price,
            customHardwareName: match.customHardwareName,
            lineHardwareTotal:
              Math.round(match.price * (item.quantity || 1) * 100) / 100,
          }
        })
      )
    }
  }

  const handleModeChange = (newMode: any) => {
    if (newMode === mode) return
    setMode(newMode)

    if (newMode === "supply_only") {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.category === "storm") return item
          const q = item.quantity || 1
          const supplyHwType = item.supplyHardwareType || "none"
          const supplyHwPrice =
            supplyHwType === "none" ? 0 : item.supplyHardwarePrice || 0
          return {
            ...item,
            installHardwareType: item.hardwareType,
            installHardwarePrice: item.hardwarePrice,
            hardwareType: supplyHwType,
            hardwarePrice: supplyHwPrice,
            lineHardwareTotal: Math.round(supplyHwPrice * q * 100) / 100,
          }
        })
      )
    } else if (newMode === "installation") {
      const savedConfig = readSessionDoorHardwareConfig()
      if (savedConfig) {
        handleApplyDoorHardware(savedConfig)
      } else {
        setLineItems((prev) =>
          prev.map((item) => {
            if (item.category === "storm") return item
            const q = item.quantity || 1
            const instHwType = item.installHardwareType || "standard"
            const instHwPrice =
              instHwType === "none"
                ? 0
                : instHwType === "custom"
                  ? item.installHardwarePrice || 220.0
                  : Number(formula.locksetDeadboltPrice) || 158.0
            return {
              ...item,
              hardwareType: instHwType,
              hardwarePrice: instHwPrice,
              lineHardwareTotal: Math.round(instHwPrice * q * 100) / 100,
            }
          })
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-5 px-4 pt-5 pb-16 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/doors" />

        {/* Sticky Review / Approval Bar */}
        <ReviewWorkflowBar {...reviewWorkflowProps} />

        {/* Page Top Header Bar */}
        <DoorHeaderBar
          lastSavedAt={lastSavedAt}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          savedDraftsCount={savedDraftsCount}
          isAdmin={isAdmin}
          onOpenAttach={() => setIsAttachModalOpen(true)}
          onSaveDraft={handleExplicitSaveDraft}
          onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
        />

        {/* Main Work Area: 2 Columns */}
        <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-12">
          {/* Left Column: Item Builder, Items Table, Labour/Travel (8 cols) */}
          <div className="space-y-5 lg:col-span-8">
            <DoorItemBuilder
              customerName={customerName}
              setCustomerName={setCustomerName}
              quoteNumber={quoteNumber}
              setQuoteNumber={setQuoteNumber}
              mode={mode}
              presets={presets}
              formula={formula}
              editingItem={editingItem}
              onSaveItem={handleSaveItem}
              onCancelEdit={() => setEditingItem(null)}
              onResetQuote={handleStartNewQuote}
              isReadOnly={isReadOnly}
            />

            <DoorLineItemsTable
              lineItems={lineItems}
              mode={mode}
              onEdit={handleEditItem}
              onDuplicate={handleDuplicateItem}
              onDelete={handleDeleteItem}
              isReadOnly={isReadOnly}
            />

            <DoorLabourTravelCard
              mode={mode}
              availableUpcharges={upcharges}
              globalUpcharges={globalUpcharges}
              onUpdateGlobalUpcharges={setGlobalUpcharges}
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
              travelFeeType={travelFeeType}
              customTravelFee={customTravelFee}
              showOutTownTravel={showOutTownTravel}
              travelKm={travelKm}
              crewHours={crewHours}
              crewSize={crewSize}
              logistics={logistics}
              onUpdateParams={handleUpdateTravelParams}
              isReadOnly={isReadOnly}
            />
          </div>

          {/* Right Column: Quote Summary & Office Reference (4 cols) */}
          <div className="space-y-5 lg:sticky lg:top-5 lg:col-span-4">
            <DoorQuoteSummaryCard
              customerName={customerName}
              quoteNumber={quoteNumber}
              lineItems={lineItems}
              totals={totals}
              mode={mode}
              onModeChange={handleModeChange}
              isFirstNation={isFirstNation}
              onToggleFirstNation={setIsFirstNation}
              hstRate={hstRate}
              setHstRate={setHstRate}
              customLabour={customLabour}
              setCustomLabour={setCustomLabour}
              customMisc={customMisc}
              setCustomMisc={setCustomMisc}
              onSubmitQuote={() => setShowSubmitModal(true)}
              onPrintPreview={() => setShowPreviewModal(true)}
              isAdmin={isAdmin}
              attachedWindowQuote={attachedWindowQuote}
              attachedSealedUnit={attachedSealedUnit}
              onOpenAttachModal={() => setIsAttachModalOpen(true)}
              onRemoveAttachedWindowQuote={() => {
                setAttachedWindowQuote(null)
                toast.info("Detached window quote.")
              }}
              onRemoveAttachedSealedUnit={() => {
                setAttachedSealedUnit(null)
                toast.info("Detached sealed unit quote.")
              }}
              onApplyDoorHardware={handleApplyDoorHardware}
              isReadOnly={isReadOnly}
              isReviewMode={Boolean(reviewQuote)}
            />

            <DoorOfficePricingCard
              totals={totals}
              lineItems={lineItems}
              mode={mode}
            />
          </div>
        </div>
      </div>

      {/* Dedicated Printable Quote Invoice (Active during window.print) */}
      {!showPreviewModal && (
        <QuoteInvoice
          customerName={customerName}
          quoteNumber={quoteNumber}
          preparedBy={user?.name || user?.username || "The Window & Door Store"}
          primaryQuoteType="door"
          doors={lineItems}
          doorTotals={totals}
          quoteNotes={quoteNotes}
          template={quoteTemplate}
          fontSize={quoteFontSize}
          spacing={quoteSpacing}
          hstRate={isFirstNation ? 8 : 13}
          isSupplyOnly={mode === "supply_only"}
          regionName={mode === "supply_only" ? undefined : selectedRegion?.name}
          globalUpcharges={globalUpcharges}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          isDualOption={Boolean(readSessionAttachedInstallOption()?.enabled)}
          attachedInstallOption={readSessionAttachedInstallOption()}
          customOptions={readSessionCustomOptions()}
        />
      )}

      {/* Universal Interactive Print Preview & Workflow Modals */}
      <DoorModalsGroup
        showPreviewModal={showPreviewModal}
        setShowPreviewModal={setShowPreviewModal}
        showSubmitModal={showSubmitModal}
        setShowSubmitModal={setShowSubmitModal}
        showResetModal={showResetModal}
        setShowResetModal={setShowResetModal}
        isSavedQuotesOpen={isSavedQuotesOpen}
        setIsSavedQuotesOpen={setIsSavedQuotesOpen}
        isAttachModalOpen={isAttachModalOpen}
        setIsAttachModalOpen={setIsAttachModalOpen}
        customerName={customerName}
        quoteNumber={quoteNumber}
        lineItems={lineItems}
        mode={mode}
        regionName={mode === "supply_only" ? undefined : selectedRegion?.name}
        globalUpcharges={globalUpcharges}
        isFirstNation={isFirstNation}
        quoteNotes={quoteNotes}
        setQuoteNotes={setQuoteNotes}
        attachedWindowQuote={attachedWindowQuote}
        setAttachedWindowQuote={setAttachedWindowQuote}
        attachedSealedUnit={attachedSealedUnit}
        setAttachedSealedUnit={setAttachedSealedUnit}
        totals={totals}
        quoteTemplate={quoteTemplate}
        setQuoteTemplate={setQuoteTemplate}
        quoteFontSize={quoteFontSize}
        setQuoteFontSize={setQuoteFontSize}
        quoteSpacing={quoteSpacing}
        setQuoteSpacing={setQuoteSpacing}
        user={user}
        adminSubmitMode={adminSubmitMode}
        setAdminSubmitMode={setAdminSubmitMode}
        staffList={staffList}
        assignedReviewer={assignedReviewer}
        setAssignedReviewer={setAssignedReviewer}
        clerkList={clerkList}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        preparerNotes={preparerNotes}
        setPreparerNotes={setPreparerNotes}
        submittingQuote={submittingQuote}
        onSubmitQuote={handleSubmitQuote}
        onLoadQuoteFromDrafts={handleLoadQuoteFromDrafts}
        onConfirmReset={handleConfirmReset}
        onSaveDraft={handleExplicitSaveDraft}
        showConflictModal={showConflictModal}
        setShowConflictModal={setShowConflictModal}
        pendingDraftToLoad={pendingDraftToLoad}
        onConflictSaveExistingAndLoad={handleConflictSaveExistingAndLoad}
        onConflictContinueWithNew={handleConflictContinueWithNew}
        onConflictCancel={handleConflictCancel}
      />

      {/* Review Workflow Action Dialogs */}
      <WorkflowDialogsWrapper
        showReassignModal={reviewActions.showReassignModal}
        setShowReassignModal={reviewActions.setShowReassignModal}
        reviewQuote={reviewQuote}
        user={user}
        staffList={staffList}
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
        reviewQuote={reviewQuote}
        selectedOdooClerk={reviewActions.selectedOdooClerk}
        setSelectedOdooClerk={reviewActions.setSelectedOdooClerk}
        odooOrderNumberInput={reviewActions.odooOrderNumberInput}
        setOdooOrderNumberInput={reviewActions.setOdooOrderNumberInput}
        reviewActionLoading={reviewActions.reviewActionLoading}
        clerkList={clerkList}
        staffList={staffList}
        confirmApproveReviewQuote={reviewActions.confirmApproveReviewQuote}
        handleCompleteOdooEntry={reviewActions.handleCompleteOdooEntry}
      />
    </div>
  )
}
