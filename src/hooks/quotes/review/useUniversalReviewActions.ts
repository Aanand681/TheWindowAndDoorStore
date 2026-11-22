"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface UseUniversalReviewActionsProps {
  quoteTypeLabel: string
  quoteNumber: string
  reviewQuoteId: string | null
  reviewQuote: any
  setReviewQuote: (q: any) => void
  setOriginalSnapshot: (snapshot: any) => void
  setIsEditMode: (val: boolean) => void
  handleExitReview: () => void
  staffList: any[]
  clerkList: any[]
  user: any
  buildUpdatePayload: (extra?: Record<string, any>) => any
}

export function useUniversalReviewActions({
  quoteTypeLabel,
  quoteNumber,
  reviewQuoteId,
  reviewQuote,
  setReviewQuote,
  setOriginalSnapshot,
  setIsEditMode,
  handleExitReview,
  staffList,
  clerkList,
  user,
  buildUpdatePayload,
}: UseUniversalReviewActionsProps) {
  const [reviewActionLoading, setReviewActionLoading] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnNotes, setReturnNotes] = useState("")
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [reassignTo, setReassignTo] = useState("")
  const [reassignNotes, setReassignNotes] = useState("")
  const [showApproveOdooModal, setShowApproveOdooModal] = useState(false)
  const [selectedOdooClerk, setSelectedOdooClerk] = useState("")
  const [showCompleteOdooModal, setShowCompleteOdooModal] = useState(false)
  const [odooOrderNumberInput, setOdooOrderNumberInput] = useState("")

  const handleSaveQuotePrices = async () => {
    if (!reviewQuoteId) return
    setReviewActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildUpdatePayload()),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Failed to update ${quoteTypeLabel.toLowerCase()} quote`)
      setReviewQuote(data)
      setOriginalSnapshot(data)
      setIsEditMode(false)
      toast.success(`${quoteTypeLabel} Quote #${quoteNumber} updated!`)
    } catch (err: any) {
      toast.error(err.message || "Failed to save quote updates")
    } finally {
      setReviewActionLoading(false)
    }
  }

  const handleApproveReviewQuote = () => {
    if (!reviewQuoteId) return
    const defaultClerk =
      (clerkList.length > 0 ? clerkList : staffList).find(
        (c: any) => c.department === "CLERK"
      ) ||
      clerkList[0] ||
      staffList[0]
    setSelectedOdooClerk(reviewQuote?.odooAssignedTo || defaultClerk?.username || "")
    setShowApproveOdooModal(true)
  }

  const confirmApproveReviewQuote = async () => {
    if (!reviewQuoteId || !selectedOdooClerk) {
      toast.error("Please select an Odoo clerk before approving.")
      return
    }
    setReviewActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildUpdatePayload({
            status: "APPROVED",
            odooAssignedTo: selectedOdooClerk,
            odooStatus: "PENDING_ENTRY",
          })
        ),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to approve quote")
      toast.success(`${quoteTypeLabel} Quote #${quoteNumber} approved!`)
      setShowApproveOdooModal(false)
      handleExitReview()
    } catch (err: any) {
      toast.error(err.message || "Failed to approve quote")
    } finally {
      setReviewActionLoading(false)
    }
  }

  const handleReturnReviewQuote = () => {
    setReturnNotes("")
    setShowReturnModal(true)
  }

  const submitReturnReviewQuote = async () => {
    if (!reviewQuoteId || !returnNotes.trim()) {
      toast.error("Please provide return notes.")
      return
    }
    setReviewActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildUpdatePayload({
            status: "RETURNED",
            reviewerNotes: returnNotes,
          })
        ),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to return quote")
      toast.success(`${quoteTypeLabel} Quote #${quoteNumber} returned for revision.`)
      setShowReturnModal(false)
      handleExitReview()
    } catch (err: any) {
      toast.error(err.message || "Failed to return quote")
    } finally {
      setReviewActionLoading(false)
    }
  }

  const handleResubmitReturnedQuote = async () => {
    if (!reviewQuoteId) return
    setReviewActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildUpdatePayload({
            status: "PENDING_REVIEW",
            reviewerNotes: "",
          })
        ),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to resubmit quote")
      toast.success(`${quoteTypeLabel} Quote #${quoteNumber} resubmitted!`)
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
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: reassignTo,
          preparerNotes: reassignNotes
            ? `${reviewQuote?.preparerNotes ? reviewQuote.preparerNotes + "\n\n" : ""}[Reassigned by ${user?.username}]: ${reassignNotes}`
            : reviewQuote?.preparerNotes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reassign quote")
      toast.success(`${quoteTypeLabel} Quote #${quoteNumber} reassigned to ${reassignTo}`)
      setShowReassignModal(false)
      handleExitReview()
    } catch (err: any) {
      toast.error(err.message || "Failed to reassign quote")
    } finally {
      setReviewActionLoading(false)
    }
  }

  const handleCompleteOdooEntry = async () => {
    if (!reviewQuoteId || !odooOrderNumberInput.trim()) {
      toast.error("Please enter the Odoo Sales Order number")
      return
    }
    setReviewActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          odooStatus: "COMPLETED",
          odooOrderNumber: odooOrderNumberInput.trim(),
          odooCompletedAt: new Date(),
          odooCompletedBy: user?.username || "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to complete in Odoo")
      toast.success(`Marked as completed in Odoo (${odooOrderNumberInput.trim()})!`)
      setShowCompleteOdooModal(false)
      handleExitReview()
    } catch (err: any) {
      toast.error(err.message || "Failed to mark completed")
    } finally {
      setReviewActionLoading(false)
    }
  }

  return {
    reviewActionLoading,
    showReturnModal,
    setShowReturnModal,
    returnNotes,
    setReturnNotes,
    showReassignModal,
    setShowReassignModal,
    reassignTo,
    setReassignTo,
    reassignNotes,
    setReassignNotes,
    showApproveOdooModal,
    setShowApproveOdooModal,
    selectedOdooClerk,
    setSelectedOdooClerk,
    showCompleteOdooModal,
    setShowCompleteOdooModal,
    odooOrderNumberInput,
    setOdooOrderNumberInput,
    handleSaveQuotePrices,
    handleApproveReviewQuote,
    confirmApproveReviewQuote,
    handleReturnReviewQuote,
    submitReturnReviewQuote,
    handleResubmitReturnedQuote,
    handleReassignQuote,
    handleCompleteOdooEntry,
  }
}
