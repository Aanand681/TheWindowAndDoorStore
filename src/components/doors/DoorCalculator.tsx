"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/layout/AppHeader"
import QuoteInvoice from "@/components/quotes/QuoteInvoice"
import { ReviewWorkflowBar } from "@/components/calculator/ReviewWorkflowBar"
import { ReviewActionDialogs } from "@/components/calculator/modals"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useDoorCalculatorPage } from "@/hooks/doors"
import { applyDoorHardwareConfig } from "@/hooks/doors/door-hardware-applicator"
import {
  DoorHeaderBar,
  DoorModalsGroup,
  DoorWorkspaceColumns,
} from "@/components/doors/page"
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

  const page = useDoorCalculatorPage({
    initialReviewQuoteId: effectiveQuoteId,
    initialIsEditMode: effectiveEdit,
    originSubTab: effectiveSub,
  })

  const handleStartNewQuote = () => {
    const isDirty = isWorkspaceDirtyOrUnsaved("door", {
      quoteNumber: page.quoteNumber,
      customerName: page.customerName,
      itemCount: page.lineItems.length,
      grandTotal: page.totals.grandTotal,
      data: {
        lineItems: page.lineItems,
        attachedWindowQuote: page.attachedWindowQuote,
        attachedSealedUnit: page.attachedSealedUnit,
      },
    })
    if (isDirty) {
      page.setShowResetModal(true)
    } else {
      page.handleConfirmReset()
    }
  }

  const handleApplyDoorHardware = (configOrSelections: any) => {
    page.setLineItems((prev) => applyDoorHardwareConfig(prev, configOrSelections))
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-5 px-4 pt-5 pb-16 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/doors" />

        {/* Sticky Review / Approval Bar */}
        <ReviewWorkflowBar {...page.reviewWorkflowProps} />

        {/* Page Top Header Bar */}
        <DoorHeaderBar
          lastSavedAt={page.lastSavedAt}
          attachedWindowQuote={page.attachedWindowQuote}
          attachedSealedUnit={page.attachedSealedUnit}
          savedDraftsCount={page.savedDraftsCount}
          isAdmin={page.isAdmin}
          onOpenAttach={() => page.setIsAttachModalOpen(true)}
          onSaveDraft={page.handleExplicitSaveDraft}
          onOpenSavedQuotes={() => page.setIsSavedQuotesOpen(true)}
        />

        {/* Main Work Area: 2 Columns */}
        <DoorWorkspaceColumns
          page={page}
          onStartNewQuote={handleStartNewQuote}
          onApplyDoorHardware={handleApplyDoorHardware}
        />
      </div>

      {/* Dedicated Printable Quote Invoice (Active during window.print) */}
      {!page.showPreviewModal &&
        (page.lineItems.length > 0 ||
          page.totals.grandTotal > 0 ||
          page.attachedWindowQuote ||
          page.attachedSealedUnit) && (
          <QuoteInvoice
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
            hstRate={page.isFirstNation ? 8 : 13}
            isSupplyOnly={page.mode === "supply_only"}
            regionName={
              page.mode === "supply_only" ? undefined : page.selectedRegion?.name
            }
            globalUpcharges={page.globalUpcharges}
            attachedWindowQuote={page.attachedWindowQuote}
            attachedSealedUnit={page.attachedSealedUnit}
            isDualOption={Boolean(readSessionAttachedInstallOption()?.enabled)}
            attachedInstallOption={readSessionAttachedInstallOption()}
            customOptions={readSessionCustomOptions()}
          />
        )}

      {/* Universal Interactive Print Preview & Workflow Modals */}
      <DoorModalsGroup page={page} />

      {/* Review Workflow Action Dialogs */}
      <ReviewActionDialogs
        reviewQuote={page.reviewQuote}
        reviewActions={page.reviewActions}
        user={page.user}
        staffList={page.staffList}
        clerkList={page.clerkList}
      />
    </div>
  )
}
