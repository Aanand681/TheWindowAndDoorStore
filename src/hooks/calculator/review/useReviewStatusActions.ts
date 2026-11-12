"use client"

import { useState } from "react"
import { toast } from "sonner"

export interface UseReviewStatusActionsParams {
  reviewQuoteId: string | null
  reviewQuote: any
  isOdooCompleted: boolean
  setReviewQuote: (q: any) => void
  setOriginalSnapshot: (snapshot: any) => void
  setIsEditMode: (val: boolean) => void
  handleExitReview: () => void
  quoteNumber: string
  customerName: string
  windows: any[]
  taxTotals: any
  quoteResult: any
  quoteNotes: string
  surchargeRate: number
  activePromoId: string
  customJC: string
  customMisc: string
  customLabour: string
  includeJCInPromo: boolean
  includeMiscInPromo: boolean
  includeLabourInPromo: boolean
  attachedUpgrade?: any
  attachedDoorQuote?: any
  attachedSealedUnit?: any
  wantsUpgrade?: boolean
  isSupplyOnly?: boolean
  isServiceOnly?: boolean
  total: number
  fileInputRef: React.RefObject<HTMLInputElement | null>
  setReviewActionLoading: (loading: boolean) => void
}

export function useReviewStatusActions({
  reviewQuoteId,
  reviewQuote,
  isOdooCompleted,
  setReviewQuote,
  setOriginalSnapshot,
  setIsEditMode,
  handleExitReview,
  quoteNumber,
  customerName,
  windows,
  taxTotals,
  quoteResult,
  quoteNotes,
  surchargeRate,
  activePromoId,
  customJC,
  customMisc,
  customLabour,
  includeJCInPromo,
  includeMiscInPromo,
  includeLabourInPromo,
  attachedUpgrade,
  attachedDoorQuote,
  attachedSealedUnit,
  wantsUpgrade,
  isSupplyOnly,
  isServiceOnly,
  total,
  fileInputRef,
  setReviewActionLoading,
}: UseReviewStatusActionsParams) {
  const [showReassignModal, setShowReassignModal] = useState<boolean>(false)
  const [reassignTo, setReassignTo] = useState<string>("")
  const [reassignNotes, setReassignNotes] = useState<string>("")

  const [showReturnModal, setShowReturnModal] = useState<boolean>(false)
  const [returnNotes, setReturnNotes] = useState<string>("")

  const [showExitReviewForPdfModal, setShowExitReviewForPdfModal] =
    useState<boolean>(false)

  const handleSaveQuotePrices = async () => {
    if (!reviewQuoteId) return
    if (isOdooCompleted) {
      toast.error(
        "This quote has been entered and confirmed in Odoo. Specifications cannot be modified."
      )
      return
    }
    setReviewActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          quoteNumber,
          windows,
          taxTotals,
          quoteResult,
          quoteNotes,
          surchargeRate,
          activePromoId,
          customJC,
          customMisc,
          customLabour,
          includeJCInPromo,
          includeMiscInPromo,
          includeLabourInPromo,
          attachedUpgrade,
          attachedDoorQuote,
          attachedSealedUnit,
          wantsUpgrade,
          isSupplyOnly,
          isServiceOnly,
          quoteSummaryTotal: total,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save changes")
      toast.success(`Quote #${quoteNumber} changes saved successfully!`)
      if (data.quote) {
        setReviewQuote(data.quote)
        if (data.quote.initialSnapshot) {
          setOriginalSnapshot(data.quote.initialSnapshot)
        }
      }
      setIsEditMode(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save price updates")
    } finally {
      setReviewActionLoading(false)
    }
  }

  const handleReturnReviewQuote = () => {
    setReturnNotes("")
    setShowReturnModal(true)
  }

  const submitReturnReviewQuote = async () => {
    if (!reviewQuoteId) return
    if (!returnNotes.trim()) {
      toast.error("Please enter revision instructions for the preparer.")
      return
    }
    setReviewActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RETURNED",
          reviewerNotes: returnNotes.trim(),
        }),
      })
      if (res.ok) {
        toast.info(`Quote returned to ${reviewQuote.preparedBy}`)
        setShowReturnModal(false)
        handleExitReview()
      }
    } catch {
      toast.error("Failed to return quote")
    } finally {
      setReviewActionLoading(false)
    }
  }

  const handlePdfImportClick = () => {
    if (reviewQuote) {
      setShowExitReviewForPdfModal(true)
      return
    }
    fileInputRef.current?.click()
  }

  const handleExitReviewAndImportPdf = () => {
    setShowExitReviewForPdfModal(false)
    handleExitReview()
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 100)
  }

  const handleResubmitReturnedQuote = async () => {
    if (!reviewQuoteId) return
    setReviewActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PENDING_REVIEW",
          reviewerNotes: "",
          windows,
          taxTotals,
          quoteResult,
          quoteNotes,
          surchargeRate,
          activePromoId,
          customJC,
          customMisc,
          customLabour,
          includeJCInPromo,
          includeMiscInPromo,
          includeLabourInPromo,
          attachedUpgrade,
          attachedDoorQuote,
          attachedSealedUnit,
          wantsUpgrade,
          isSupplyOnly,
          isServiceOnly,
          quoteSummaryTotal: total,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to resubmit quote")
      toast.success(
        `Quote #${quoteNumber} resubmitted to ${reviewQuote.assignedTo || "reviewer"} for review!`
      )
      handleExitReview()
    } catch (err: any) {
      toast.error(err.message || "Failed to resubmit quote")
    } finally {
      setReviewActionLoading(false)
    }
  }

  const handleReassignQuote = async () => {
    if (!reviewQuoteId || !reassignTo) return
    setReviewActionLoading(true)
    try {
      const updatedNotes = reassignNotes.trim()
        ? reviewQuote.preparerNotes
          ? `${reviewQuote.preparerNotes} | Forwarded to ${reassignTo}: ${reassignNotes.trim()}`
          : `Forwarded to ${reassignTo}: ${reassignNotes.trim()}`
        : reviewQuote.preparerNotes

      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: reassignTo,
          status: "PENDING_REVIEW",
          preparerNotes: updatedNotes,
          windows,
          taxTotals,
          quoteResult,
          quoteNotes,
          surchargeRate,
          activePromoId,
          customJC,
          customMisc,
          customLabour,
          includeJCInPromo,
          includeMiscInPromo,
          includeLabourInPromo,
          attachedUpgrade,
          attachedDoorQuote,
          attachedSealedUnit,
          wantsUpgrade,
          isSupplyOnly,
          isServiceOnly,
          quoteSummaryTotal: total,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to forward quote")
      toast.success(
        `Quote #${quoteNumber} forwarded to ${reassignTo} for review!`
      )
      setShowReassignModal(false)
      handleExitReview()
    } catch (err: any) {
      toast.error(err.message || "Failed to forward quote")
    } finally {
      setReviewActionLoading(false)
    }
  }

  return {
    showReassignModal,
    setShowReassignModal,
    reassignTo,
    setReassignTo,
    reassignNotes,
    setReassignNotes,
    showReturnModal,
    setShowReturnModal,
    returnNotes,
    setReturnNotes,
    showExitReviewForPdfModal,
    setShowExitReviewForPdfModal,
    handleSaveQuotePrices,
    handleReturnReviewQuote,
    submitReturnReviewQuote,
    handlePdfImportClick,
    handleExitReviewAndImportPdf,
    handleResubmitReturnedQuote,
    handleReassignQuote,
  }
}
