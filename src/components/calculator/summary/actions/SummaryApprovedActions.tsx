"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Save,
  Send,
  CheckCircle2,
  Edit3,
  ClipboardCheck,
  Printer,
} from "lucide-react"

export interface SummaryApprovedActionsProps {
  reviewQuote: any
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  canEditApprovedQuote: boolean
  reviewActionLoading: boolean
  handleSaveQuotePrices: () => void
  handleResubmitReturnedQuote: () => void
  handleCancelEdits: () => void
  handleExitReview: () => void
  setOdooOrderNumberInput: (val: string) => void
  setShowCompleteOdooModal: (val: boolean) => void
  setIsPreviewOpen: (val: boolean) => void
}

export function SummaryApprovedActions({
  reviewQuote,
  isEditMode,
  setIsEditMode,
  canEditApprovedQuote,
  reviewActionLoading,
  handleSaveQuotePrices,
  handleResubmitReturnedQuote,
  handleCancelEdits,
  handleExitReview,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  setIsPreviewOpen,
}: SummaryApprovedActionsProps) {
  return (
    <div className="space-y-2">
      {isEditMode ? (
        <>
          <Button
            variant="default"
            className="h-11 w-full cursor-pointer bg-emerald-600 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-700"
            onClick={handleSaveQuotePrices}
            disabled={reviewActionLoading}
          >
            <Save className="mr-2 h-4 w-4" /> Save &amp; Keep Approved
          </Button>
          <Button
            variant="default"
            className="h-11 w-full cursor-pointer bg-amber-600 text-sm font-bold text-white shadow-md transition-colors hover:bg-amber-700"
            onClick={handleResubmitReturnedQuote}
            disabled={reviewActionLoading}
          >
            <Send className="mr-2 h-4 w-4" /> Resubmit for Review
          </Button>
          <Button
            variant="outline"
            className="h-10 w-full text-xs font-semibold text-muted-foreground hover:bg-muted"
            onClick={handleCancelEdits}
            disabled={reviewActionLoading}
          >
            Cancel Edits
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Quote Approved (View Only)
            </span>
            {canEditApprovedQuote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="h-7 text-xs font-bold text-primary hover:bg-primary/10"
              >
                <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>
          {canEditApprovedQuote ? (
            <Button
              variant="outline"
              className="h-10 w-full cursor-pointer border-primary/50 text-xs font-bold text-primary hover:bg-primary/10"
              onClick={() => setIsEditMode(true)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Edit Quote Details
            </Button>
          ) : (
            <>
              {reviewQuote.odooStatus === "PENDING_ENTRY" && (
                <Button
                  variant="default"
                  className="h-11 w-full cursor-pointer bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  onClick={() => {
                    setOdooOrderNumberInput(reviewQuote.odooOrderNumber || "")
                    setShowCompleteOdooModal(true)
                  }}
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Mark Entered in
                  Odoo
                </Button>
              )}
              <Button
                variant="default"
                className="h-10 w-full cursor-pointer bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Printer className="mr-2 h-4 w-4" /> Preview &amp; Print Quote
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="h-10 w-full text-xs font-semibold text-muted-foreground hover:bg-muted"
            onClick={handleExitReview}
          >
            Exit Review Mode
          </Button>
        </>
      )}
    </div>
  )
}
