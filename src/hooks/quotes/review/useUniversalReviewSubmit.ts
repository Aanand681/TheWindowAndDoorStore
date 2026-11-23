"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  clearActiveAutoSave,
  syncRemoteDrafts,
  purgeSubmittedDrafts,
  QuoteType,
} from "@/lib/quote-drafts-storage"

export interface UseUniversalReviewSubmitProps {
  user: any
  isAdmin: boolean
  customerName: string
  quoteNumber: string
  itemCount: number
  quoteType: QuoteType
  quoteTypeLabel: string
  buildSubmitPayload: (params: {
    isDirectApprove: boolean
    effectiveReviewer: string
    effectiveClerk?: string
    preparerNotes: string
  }) => any
  attachedWindowQuote?: any
  attachedDoorQuote?: any
  attachedSealedUnit?: any
  onSuccess?: (params: {
    data: any
    isDirectApprove: boolean
    effectiveClerk: string
    effectiveReviewer: string
  }) => void
}

export function useUniversalReviewSubmit({
  user,
  isAdmin,
  customerName,
  quoteNumber,
  itemCount,
  quoteType,
  quoteTypeLabel,
  buildSubmitPayload,
  attachedWindowQuote,
  attachedDoorQuote,
  attachedSealedUnit,
  onSuccess,
}: UseUniversalReviewSubmitProps) {
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false)
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false)
  const [assignedReviewer, setAssignedReviewer] = useState<string>("")
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>("")
  const [adminSubmitMode, setAdminSubmitMode] = useState<
    "direct_approve" | "submit_review"
  >("direct_approve")
  const [preparerNotes, setPreparerNotes] = useState<string>("")
  const [staffList, setStaffList] = useState<any[]>([])
  const [clerkList, setClerkList] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/users")
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/users?canBeAssigned=true")
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([allUsers, assignees]) => {
      if (Array.isArray(allUsers)) {
        const eligible = allUsers.filter(
          (d: any) =>
            d.role !== "SUPERADMIN" &&
            d.role !== "superadmin" &&
            !d.username?.toLowerCase().includes("superadmin")
        )
        setStaffList(eligible)
        const otherStaff = eligible.filter(
          (s: any) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
        )
        if (otherStaff.length > 0) {
          setAssignedReviewer(otherStaff[0].username)
        }
      }
      if (Array.isArray(assignees)) {
        const eligible = assignees.filter(
          (d: any) =>
            d.role !== "SUPERADMIN" &&
            d.role !== "superadmin" &&
            !d.username?.toLowerCase().includes("superadmin")
        )
        setClerkList(eligible)
        const defaultClerk =
          eligible.find((c: any) => c.department === "CLERK") || eligible[0]
        if (defaultClerk) {
          setSelectedOdooClerk(defaultClerk.username)
        }
      }
    })
  }, [user?.username])

  const handleSubmitQuote = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required before submitting quote.")
      return
    }

    if (!quoteNumber.trim()) {
      toast.error("Quote number is required before submitting quote.")
      return
    }

    if (itemCount === 0) {
      toast.error(`Please add at least one item to the quote before submitting!`)
      return
    }

    const isDirectApprove = Boolean(isAdmin && adminSubmitMode === "direct_approve")
    const otherReviewers = staffList.filter(
      (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
    )
    const effectiveReviewer =
      assignedReviewer && assignedReviewer.toLowerCase() !== user?.username?.toLowerCase()
        ? assignedReviewer
        : otherReviewers[0]?.username || ""

    const effectiveClerk =
      selectedOdooClerk ||
      clerkList.find((c) => c.department === "CLERK")?.username ||
      clerkList[0]?.username ||
      ""

    if (isDirectApprove && !effectiveClerk) {
      toast.error("Please select an Odoo clerk to assign this quote to")
      return
    }

    if (!isDirectApprove) {
      if (!effectiveReviewer) {
        toast.error("No other reviewers available in the system. You cannot submit a quote to yourself.")
        return
      }
      if (effectiveReviewer.toLowerCase() === user?.username?.toLowerCase()) {
        toast.error("You cannot submit a quote for review to yourself. Please select another team member.")
        return
      }
    }

    setSubmittingQuote(true)
    try {
      const payload = buildSubmitPayload({
        isDirectApprove,
        effectiveReviewer,
        effectiveClerk,
        preparerNotes,
      })

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit quote")

      purgeSubmittedDrafts({
        mainQuoteNumber: quoteNumber,
        mainType: quoteType,
        attachedWindowQuote,
        attachedDoorQuote,
        attachedSealedUnit,
      })

      clearActiveAutoSave(quoteType)
      syncRemoteDrafts().catch(() => {})

      if (onSuccess) {
        onSuccess({ data, isDirectApprove, effectiveClerk, effectiveReviewer })
      } else {
        toast.success(
          isDirectApprove
            ? `${quoteTypeLabel} quote approved and assigned!`
            : `${quoteTypeLabel} quote submitted for review!`
        )
      }

      setShowSubmitModal(false)
      setPreparerNotes("")
      window.dispatchEvent(new CustomEvent("quote-count-updated"))
    } catch (err: any) {
      toast.error(err.message || "Error submitting quote")
    } finally {
      setSubmittingQuote(false)
    }
  }

  return {
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
    setStaffList,
    clerkList,
    setClerkList,
    handleSubmitQuote,
  }
}
