"use client"

import React from "react"
import { Plus, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SubmitReviewModal } from "@/components/calculator/SubmitReviewModal"
import { SavedQuotesModal } from "@/components/calculator/SavedQuotesModal"
import { AttachQuoteModal } from "@/components/calculator/AttachQuoteModal"
import QuoteInvoice from "@/components/quotes/QuoteInvoice"
import QuotePreviewModal from "@/components/quotes/QuotePreviewModal"
import { readSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTemplateType } from "@/components/sealed-units"
import { SealedUnitTotals } from "@/components/sealed-units/invoice/types"

export interface SealedUnitsPrintPreviewState {
  isPreviewOpen: boolean
  setIsPreviewOpen: (val: boolean) => void
  quoteTemplate: SealedUnitTemplateType
  setQuoteTemplate: (val: SealedUnitTemplateType) => void
  quoteFontSize: number
  setQuoteFontSize: (val: number) => void
  quoteSpacing: number
  setQuoteSpacing: (val: number) => void
}

interface SealedUnitsModalsGroupProps {
  user: any
  review: {
    showSubmitModal: boolean
    setShowSubmitModal: (val: boolean) => void
    adminSubmitMode: "direct_approve" | "submit_review"
    setAdminSubmitMode: (val: "direct_approve" | "submit_review") => void
    preparerNotes: string
    setPreparerNotes: (val: string) => void
    submittingQuote: boolean
    handleSubmitForReview: () => void
  }
  drafts: {
    quoteNumber: string
    customerName: string
    quoteNotes: string
    setQuoteNotes: (val: string) => void
    showResetModal: boolean
    setShowResetModal: (val: boolean) => void
    handleResetWorkspace: () => void
    isSavedQuotesOpen: boolean
    setIsSavedQuotesOpen: (val: boolean) => void
    isAttachModalOpen: boolean
    setIsAttachModalOpen: (val: boolean) => void
    attachedWindowQuote: any
    attachedDoorQuote: any
    setAttachedWindowQuote: (val: any) => void
    setAttachedDoorQuote: (val: any) => void
    loadDraftIntoWorkspace: (draft: any) => void
    handleSaveDraft?: () => void
  }
  settings: {
    staffList: any[]
    clerkList: any[]
    assignedReviewer: string
    setAssignedReviewer: (val: string) => void
    selectedOdooClerk: string
    setSelectedOdooClerk: (val: string) => void
  }
  preview: SealedUnitsPrintPreviewState
  lineItems: SealedUnitLineItem[]
  totals: SealedUnitTotals
  isInstallation: boolean
  regionName?: string
  hstRate: number
}

export function SealedUnitsModalsGroup({
  user,
  review,
  drafts,
  settings,
  preview,
  lineItems,
  totals,
  isInstallation,
  regionName,
  hstRate,
}: SealedUnitsModalsGroupProps) {
  const totalSealedUnits = lineItems.reduce(
    (acc, it) => acc + (it.quantity || 1),
    0
  )

  return (
    <>
      {/* Submit for Review / Direct Approve Modal */}
      <SubmitReviewModal
        isOpen={review.showSubmitModal}
        onClose={() => review.setShowSubmitModal(false)}
        user={user}
        adminSubmitMode={review.adminSubmitMode}
        setAdminSubmitMode={review.setAdminSubmitMode}
        quoteNumber={drafts.quoteNumber}
        customerName={drafts.customerName}
        quoteType="sealed_unit"
        totalUnits={totalSealedUnits}
        lineCount={lineItems.length}
        windowsCount={totalSealedUnits}
        total={totals.grandTotal}
        staffList={settings.staffList}
        clerkList={settings.clerkList}
        assignedReviewer={settings.assignedReviewer}
        setAssignedReviewer={settings.setAssignedReviewer}
        selectedOdooClerk={settings.selectedOdooClerk}
        setSelectedOdooClerk={settings.setSelectedOdooClerk}
        preparerNotes={review.preparerNotes}
        setPreparerNotes={review.setPreparerNotes}
        submittingQuote={review.submittingQuote}
        onSubmit={review.handleSubmitForReview}
      />

      {/* Custom Designed Reset Confirmation Modal */}
      {drafts.showResetModal && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground">
                  Start New Sealed Unit Quote?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  You have active work in progress. Would you like to save this quote as a draft before starting a clean workspace?
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => drafts.setShowResetModal(false)}
                className="h-7 w-7 rounded-full text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => drafts.setShowResetModal(false)}
                className="h-9 cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={drafts.handleResetWorkspace}
                className="h-9 cursor-pointer gap-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Discard &amp; Start New</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (drafts.handleSaveDraft) {
                    drafts.handleSaveDraft()
                  }
                  drafts.handleResetWorkspace()
                }}
                className="h-9 cursor-pointer gap-1.5 bg-primary text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Draft &amp; Start New</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED CLEAN PRINTABLE QUOTE INVOICE */}
      {!preview.isPreviewOpen && (
        <QuoteInvoice
          customerName={drafts.customerName}
          quoteNumber={drafts.quoteNumber}
          preparedBy={user?.name || user?.username || ""}
          primaryQuoteType="sealed_unit"
          sealedUnits={lineItems}
          sealedUnitTotals={totals}
          quoteNotes={drafts.quoteNotes}
          template={preview.quoteTemplate as any}
          fontSize={preview.quoteFontSize}
          spacing={preview.quoteSpacing}
          hstRate={hstRate}
          isSupplyOnly={!isInstallation}
          regionName={regionName}
          attachedWindowQuote={drafts.attachedWindowQuote}
          attachedDoorQuote={drafts.attachedDoorQuote}
          isDualOption={Boolean(readSessionAttachedInstallOption()?.enabled)}
        />
      )}

      {/* Universal Interactive Print Preview Modal */}
      <QuotePreviewModal
        isOpen={preview.isPreviewOpen}
        onClose={() => preview.setIsPreviewOpen(false)}
        template={preview.quoteTemplate as any}
        onTemplateChange={preview.setQuoteTemplate as any}
        fontSize={preview.quoteFontSize}
        onFontSizeChange={preview.setQuoteFontSize}
        spacing={preview.quoteSpacing}
        onSpacingChange={preview.setQuoteSpacing}
        quoteNotes={drafts.quoteNotes}
        onQuoteNotesChange={drafts.setQuoteNotes}
        primaryQuoteType="sealed_unit"
        sealedUnits={lineItems}
        sealedUnitTotals={totals}
        customerName={drafts.customerName}
        quoteNumber={drafts.quoteNumber}
        preparedBy={user?.name || user?.username || ""}
        hstRate={hstRate}
        isSupplyOnly={!isInstallation}
        regionName={regionName}
        attachedWindowQuote={drafts.attachedWindowQuote}
        attachedDoorQuote={drafts.attachedDoorQuote}
      />

      {/* Saved Quotes & Drafts Modal */}
      <SavedQuotesModal
        isOpen={drafts.isSavedQuotesOpen}
        onClose={() => drafts.setIsSavedQuotesOpen(false)}
        defaultType="sealed_unit"
        onLoadQuote={drafts.loadDraftIntoWorkspace}
      />

      {/* Universal Multi-Quote Attachment Modal */}
      <AttachQuoteModal
        isOpen={drafts.isAttachModalOpen}
        onClose={() => drafts.setIsAttachModalOpen(false)}
        currentQuoteType="sealed_unit"
        attachedWindowQuote={drafts.attachedWindowQuote}
        attachedDoorQuote={drafts.attachedDoorQuote}
        onAttachWindow={drafts.setAttachedWindowQuote}
        onDetachWindow={() => drafts.setAttachedWindowQuote(null)}
        onAttachDoor={drafts.setAttachedDoorQuote}
        onDetachDoor={() => drafts.setAttachedDoorQuote(null)}
      />
    </>
  )
}
