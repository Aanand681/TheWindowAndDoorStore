"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, X } from "lucide-react"
import { SubmitReviewModal } from "@/components/calculator/SubmitReviewModal"
import { SavedQuotesModal } from "@/components/calculator/SavedQuotesModal"
import { AttachQuoteModal } from "@/components/calculator/AttachQuoteModal"
import { QuoteDraftItem } from "@/lib/quote-drafts-storage"
import { QuoteTemplateType } from "@/components/quotes/QuoteInvoice"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

const QuotePreviewModal = dynamic(
  () => import("@/components/quotes/QuotePreviewModal"),
  { ssr: false }
)

interface DoorModalsGroupProps {
  showPreviewModal: boolean
  setShowPreviewModal: (show: boolean) => void
  showSubmitModal: boolean
  setShowSubmitModal: (show: boolean) => void
  showResetModal: boolean
  setShowResetModal: (show: boolean) => void
  isSavedQuotesOpen: boolean
  setIsSavedQuotesOpen: (open: boolean) => void
  isAttachModalOpen: boolean
  setIsAttachModalOpen: (open: boolean) => void
  customerName: string
  quoteNumber: string
  lineItems: any[]
  mode: any
  globalUpcharges: any[]
  regionName?: string
  isFirstNation: boolean
  quoteNotes: string
  setQuoteNotes: (notes: string) => void
  attachedWindowQuote: any
  setAttachedWindowQuote: (q: any) => void
  attachedSealedUnit: any
  setAttachedSealedUnit: (u: any) => void
  totals: any
  quoteTemplate: QuoteTemplateType
  setQuoteTemplate: (t: QuoteTemplateType) => void
  quoteFontSize: number
  setQuoteFontSize: (s: number) => void
  quoteSpacing: number
  setQuoteSpacing: (s: number) => void
  user: any
  adminSubmitMode: "direct_approve" | "submit_review"
  setAdminSubmitMode: (m: "direct_approve" | "submit_review") => void
  staffList: any[]
  assignedReviewer: string
  setAssignedReviewer: (r: string) => void
  clerkList: any[]
  selectedOdooClerk: string
  setSelectedOdooClerk: (c: string) => void
  preparerNotes: string
  setPreparerNotes: (n: string) => void
  submittingQuote: boolean
  onSubmitQuote: () => Promise<void>
  onLoadQuoteFromDrafts: (draft: QuoteDraftItem) => void
  onConfirmReset: () => void
  onSaveDraft?: () => void
}

export function DoorModalsGroup({
  showPreviewModal,
  setShowPreviewModal,
  showSubmitModal,
  setShowSubmitModal,
  showResetModal,
  setShowResetModal,
  isSavedQuotesOpen,
  setIsSavedQuotesOpen,
  isAttachModalOpen,
  setIsAttachModalOpen,
  customerName,
  quoteNumber,
  lineItems,
  mode,
  globalUpcharges,
  regionName,
  isFirstNation,
  quoteNotes,
  setQuoteNotes,
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  totals,
  quoteTemplate,
  setQuoteTemplate,
  quoteFontSize,
  setQuoteFontSize,
  quoteSpacing,
  setQuoteSpacing,
  user,
  adminSubmitMode,
  setAdminSubmitMode,
  staffList,
  assignedReviewer,
  setAssignedReviewer,
  clerkList,
  selectedOdooClerk,
  setSelectedOdooClerk,
  preparerNotes,
  setPreparerNotes,
  submittingQuote,
  onSubmitQuote,
  onLoadQuoteFromDrafts,
  onConfirmReset,
  onSaveDraft,
}: DoorModalsGroupProps) {
  const totalDoorUnits =
    totals.totalUnits ||
    lineItems.reduce((acc, it) => acc + (it.quantity || 1), 0)

  return (
    <>
      {/* 1. Preview Modal */}
      {showPreviewModal && (
        <QuotePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          template={quoteTemplate}
          onTemplateChange={setQuoteTemplate}
          fontSize={quoteFontSize}
          onFontSizeChange={setQuoteFontSize}
          spacing={quoteSpacing}
          onSpacingChange={setQuoteSpacing}
          quoteNotes={quoteNotes}
          onQuoteNotesChange={setQuoteNotes}
          primaryQuoteType="door"
          doors={lineItems}
          doorTotals={totals}
          customerName={customerName}
          quoteNumber={quoteNumber}
          preparedBy={user?.name || user?.username || "The Window & Door Store"}
          hstRate={isFirstNation ? 8 : 13}
          isSupplyOnly={mode === "supply_only"}
          regionName={regionName}
          globalUpcharges={globalUpcharges}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          isDualOption={Boolean(readSessionAttachedInstallOption()?.enabled)}
          attachedInstallOption={readSessionAttachedInstallOption()}
          customOptions={readSessionCustomOptions()}
        />
      )}

      {/* 2. Submit Review / Direct Approve Modal */}
      {showSubmitModal && (
        <SubmitReviewModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          user={user}
          adminSubmitMode={adminSubmitMode}
          setAdminSubmitMode={setAdminSubmitMode}
          quoteNumber={quoteNumber}
          customerName={customerName}
          quoteType="door"
          totalUnits={totalDoorUnits}
          lineCount={lineItems.length}
          windowsCount={totalDoorUnits}
          total={totals.grandTotal}
          staffList={staffList}
          clerkList={clerkList}
          assignedReviewer={assignedReviewer}
          setAssignedReviewer={setAssignedReviewer}
          selectedOdooClerk={selectedOdooClerk}
          setSelectedOdooClerk={setSelectedOdooClerk}
          preparerNotes={preparerNotes}
          setPreparerNotes={setPreparerNotes}
          submittingQuote={submittingQuote}
          onSubmit={onSubmitQuote}
        />
      )}

      {/* 3. Saved Quotes Modal */}
      {isSavedQuotesOpen && (
        <SavedQuotesModal
          isOpen={isSavedQuotesOpen}
          onClose={() => setIsSavedQuotesOpen(false)}
          defaultType="door"
          onLoadQuote={onLoadQuoteFromDrafts}
        />
      )}

      {/* 4. Attach Quote Modal */}
      {isAttachModalOpen && (
        <AttachQuoteModal
          isOpen={isAttachModalOpen}
          onClose={() => setIsAttachModalOpen(false)}
          currentQuoteType="door"
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          onAttachWindow={(win) => setAttachedWindowQuote(win)}
          onDetachWindow={() => setAttachedWindowQuote(null)}
          onAttachSealedUnit={(su) => setAttachedSealedUnit(su)}
          onDetachSealedUnit={() => setAttachedSealedUnit(null)}
        />
      )}

      {/* 5. In-App Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground">
                  Start New Door Quote?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  You have active work in progress. Would you like to save this quote as a draft before starting a clean workspace?
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowResetModal(false)}
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
                onClick={() => setShowResetModal(false)}
                className="h-9 cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onConfirmReset}
                className="h-9 cursor-pointer gap-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Discard &amp; Start New</span>
              </Button>
              {onSaveDraft && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onSaveDraft()
                    onConfirmReset()
                  }}
                  className="h-9 cursor-pointer gap-1.5 bg-primary text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Draft &amp; Start New</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
