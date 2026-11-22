"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { ReviewWorkflowBar } from "@/components/calculator/ReviewWorkflowBar"
import { ReviewActionDialogs } from "@/components/calculator/modals"
import { useSealedUnitsCalculatorPage } from "@/hooks/sealed-units"
import {
  SealedUnitsHeaderBar,
  SealedUnitsModalsGroup,
  SealedUnitsWorkspaceColumns,
} from "@/components/sealed-units/page"

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

  const page = useSealedUnitsCalculatorPage({
    initialReviewQuoteId: effectiveQuoteId,
    initialIsEditMode: effectiveEdit,
    originSubTab: effectiveSub,
  })

  return (
    <>
      <div className="su-no-print min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-4 px-4 pt-5 pb-10 sm:px-6 sm:pt-6 lg:px-8">
          {/* Sticky Review / Approval Bar */}
          <ReviewWorkflowBar {...page.reviewWorkflowProps} />

          <SealedUnitsHeaderBar
            user={page.user}
            lastSavedAt={page.drafts.lastSavedAt}
            hasAttachedQuote={Boolean(
              page.drafts.attachedWindowQuote || page.drafts.attachedDoorQuote
            )}
            savedDraftsCount={page.drafts.savedDraftsCount}
            onOpenAttachModal={() => page.drafts.setIsAttachModalOpen(true)}
            onSaveDraft={page.drafts.handleSaveDraft}
            onOpenSavedQuotes={() => page.drafts.setIsSavedQuotesOpen(true)}
          />

          {/* Main Work Area: 2 Columns */}
          <SealedUnitsWorkspaceColumns page={page} />
        </div>
      </div>

      <SealedUnitsModalsGroup
        user={page.user}
        review={page.review}
        drafts={page.drafts}
        settings={page.settings}
        preview={{
          isPreviewOpen: page.isPreviewOpen,
          setIsPreviewOpen: page.setIsPreviewOpen,
          quoteTemplate: page.quoteTemplate,
          setQuoteTemplate: page.setQuoteTemplate,
          quoteFontSize: page.quoteFontSize,
          setQuoteFontSize: page.setQuoteFontSize,
          quoteSpacing: page.quoteSpacing,
          setQuoteSpacing: page.setQuoteSpacing,
        }}
        lineItems={page.lineItems}
        totals={page.totals}
        isInstallation={page.travel.isInstallation}
        regionName={
          page.travel.isInstallation
            ? page.travel.selectedRegion?.name
            : undefined
        }
        hstRate={page.travel.hstRate}
      />

      {/* Review Workflow Action Dialogs */}
      <ReviewActionDialogs
        reviewQuote={page.reviewLoader.reviewQuote}
        reviewActions={page.reviewActions}
        user={page.user}
        staffList={page.settings.staffList}
        clerkList={page.settings.clerkList}
      />
    </>
  )
}
