"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface UseQuoteReviewSubmissionStateParams {
  user: any
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
  supplyJambId?: string
  supplyJambRate?: string
  supplyCasingId?: string
  supplyCasingRate?: string
  wantsUpgrade?: boolean
  isSupplyOnly?: boolean
  isServiceOnly?: boolean
  total: number
  setReviewQuote?: (q: any) => void
  setReviewQuoteId?: (id: string | null) => void
  setOriginalSnapshot?: (s: any) => void
  setIsEditMode?: (mode: boolean) => void
}

export function useQuoteReviewSubmissionState({
  user,
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
  supplyJambId,
  supplyJambRate,
  supplyCasingId,
  supplyCasingRate,
  wantsUpgrade,
  isSupplyOnly,
  isServiceOnly,
  total,
  setReviewQuote,
  setReviewQuoteId,
  setOriginalSnapshot,
  setIsEditMode,
}: UseQuoteReviewSubmissionStateParams) {
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false)
  const [assignedReviewer, setAssignedReviewer] = useState<string>("")
  const [preparerNotes, setPreparerNotes] = useState<string>("")
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false)
  const [staffList, setStaffList] = useState<any[]>([])
  const [clerkList, setClerkList] = useState<any[]>([])
  const [adminSubmitMode, setAdminSubmitMode] = useState<
    "direct_approve" | "submit_review"
  >("direct_approve")
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>("")

  const handleSubmitForReview = async () => {
    if (!quoteNumber.trim() || !customerName.trim()) {
      toast.error("Please enter a Quote Number and Customer Name")
      return
    }

    const isDirectApprove = Boolean(
      (user?.role === "ADMIN" || user?.role === "SUPERADMIN") &&
      adminSubmitMode === "direct_approve"
    )

    const effectiveClerk =
      selectedOdooClerk ||
      clerkList.find((c) => c.department === "CLERK")?.username ||
      clerkList[0]?.username ||
      ""

    const eligibleReviewers = staffList.filter(
      (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
    )
    const effectiveReviewer =
      assignedReviewer &&
      assignedReviewer.toLowerCase() !== user?.username?.toLowerCase()
        ? assignedReviewer
        : eligibleReviewers[0]?.username || ""

    if (isDirectApprove && !effectiveClerk) {
      toast.error("Please select an Odoo clerk to assign this quote to")
      return
    }

    if (!isDirectApprove) {
      if (!effectiveReviewer) {
        toast.error(
          "No other reviewers available in the system. You cannot submit a quote to yourself."
        )
        return
      }
      if (effectiveReviewer.toLowerCase() === user?.username?.toLowerCase()) {
        toast.error(
          "You cannot submit a quote for review to yourself. Please select another team member."
        )
        return
      }
    }

    setSubmittingQuote(true)
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber,
          customerName,
          assignedTo: isDirectApprove ? user?.username || "" : effectiveReviewer,
          directApprove: isDirectApprove,
          odooAssignedTo: isDirectApprove ? effectiveClerk : undefined,
          preparerNotes,
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
          attachedInstallOption: readSessionAttachedInstallOption(),
          customOptions: readSessionCustomOptions(),
          selectedRegionId: taxTotals?.selectedRegionId,
          regionName: taxTotals?.regionName,
          attachedDoorQuote,
          attachedSealedUnit,
          supplyJambId,
          supplyJambRate,
          supplyCasingId,
          supplyCasingRate,
          wantsUpgrade,
          isSupplyOnly,
          isServiceOnly,
          quoteSummaryTotal: total,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit quote")

      if (isDirectApprove) {
        toast.success(
          `Quote #${quoteNumber} approved & assigned to ${effectiveClerk} for Odoo entry!`
        )
      } else {
        toast.success(
          `Quote #${quoteNumber} submitted to ${effectiveReviewer} for review!`
        )
      }

      if (setReviewQuote && data.quote) {
        setReviewQuote(data.quote)
      }
      if (setReviewQuoteId && data.quote?._id) {
        setReviewQuoteId(data.quote._id)
      }
      if (setOriginalSnapshot && (data.quote?.initialSnapshot || data.quote)) {
        setOriginalSnapshot(data.quote.initialSnapshot || data.quote)
      }
      if (setIsEditMode) {
        setIsEditMode(false)
      }
      if (typeof window !== "undefined" && data.quote?._id) {
        window.history.pushState(
          { tab: "promo", reviewQuoteId: data.quote._id },
          "",
          `/?reviewQuoteId=${data.quote._id}`
        )
      }

      setShowSubmitModal(false)
      setPreparerNotes("")
      window.dispatchEvent(new CustomEvent("quote-count-updated"))
    } catch (err: any) {
      toast.error(err.message || "Failed to submit quote")
    } finally {
      setSubmittingQuote(false)
    }
  }

  return {
    showSubmitModal,
    setShowSubmitModal,
    assignedReviewer,
    setAssignedReviewer,
    preparerNotes,
    setPreparerNotes,
    submittingQuote,
    staffList,
    setStaffList,
    clerkList,
    setClerkList,
    adminSubmitMode,
    setAdminSubmitMode,
    selectedOdooClerk,
    setSelectedOdooClerk,
    handleSubmitForReview,
  }
}
