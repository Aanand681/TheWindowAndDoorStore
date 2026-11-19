"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import {
  clearActiveAutoSave,
  syncRemoteDrafts,
  purgeSubmittedDrafts,
} from "@/lib/quote-drafts-storage"

interface UseDoorReviewSubmitProps {
  user: any
  isAdmin: boolean
  customerName: string
  quoteNumber: string
  lineItems: any[]
  mode: any
  quoteNotes: string
  isFirstNation: boolean
  totals: any
  attachedWindowQuote?: any
  attachedSealedUnit?: any
  selectedRegionId?: string
  travelFeeType?: string
  customTravelFee?: string
  showOutTownTravel?: boolean
  travelKm?: string
  crewHours?: string
  crewSize?: string
}

export function useDoorReviewSubmit({
  user,
  isAdmin,
  customerName,
  quoteNumber,
  lineItems,
  mode,
  quoteNotes,
  isFirstNation,
  totals,
  attachedWindowQuote,
  attachedSealedUnit,
  selectedRegionId,
  travelFeeType,
  customTravelFee,
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
}: UseDoorReviewSubmitProps) {
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

    if (lineItems.length === 0) {
      toast.error(
        "Please add at least one door to the quote before submitting!"
      )
      return
    }

    const isDirectApprove = Boolean(
      isAdmin && adminSubmitMode === "direct_approve"
    )

    const otherReviewers = staffList.filter(
      (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
    )
    const effectiveReviewer =
      assignedReviewer &&
      assignedReviewer.toLowerCase() !== user?.username?.toLowerCase()
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
          quoteNotes,
          attachedWindowQuote,
          attachedSealedUnit,
          attachedInstallOption: readSessionAttachedInstallOption(),
          customOptions: readSessionCustomOptions(),
          selectedRegionId,
          travelFeeType,
          customTravelFee,
          showOutTownTravel,
          travelKm,
          crewHours,
          crewSize,
          quoteSummaryTotal: Math.round(totals.grandTotal * 100),
          windows: lineItems.map((item) => ({
            id: item.id,
            combinationName: item.customDescription || item.presetLabel,
            doorPresetId: item.presetId,
            category: item.category,
            quantity: item.quantity,
            inksterBasePrice: item.inksterBasePrice,
            finalUnitPrice: item.inksterBasePrice,
            lineTotal:
              mode === "supply_only"
                ? (item.lineSupplyTotal ??
                  item.lineDoorSupplyTotal +
                    item.lineHardwareTotal +
                    item.surchargeAmount * item.quantity -
                    item.discountAmount * item.quantity)
                : item.lineGrandTotal,
            hardwareType: item.hardwareType,
            hardwarePrice: item.hardwarePrice,
            upgradeOption: item.upgradeOption,
          })),
          taxTotals: {
            isSupplyOnly: mode === "supply_only",
            isFirstNation,
            totalPrice: totals.rawDoorBaseTotal + totals.stormDoorTotal,
            subtotal: totals.subtotalPreTax,
            combinedLabour: totals.combinedLabourTotal,
            miscTotal: totals.miscTotal,
            surchargeTotal: totals.surchargeTotal,
            discountTotal: totals.discountTotal,
            hstAmount: totals.hstAmount,
            grandTotal: totals.grandTotal,
            depositAmount: totals.depositAmount,
          },
          status: isDirectApprove ? "APPROVED" : "PENDING_REVIEW",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit quote")

      // Purge drafts for this submitted quote AND any absorbed child quotes
      purgeSubmittedDrafts({
        mainQuoteNumber: quoteNumber,
        mainType: "door",
        attachedWindowQuote,
        attachedSealedUnit,
      })

      clearActiveAutoSave("door")
      syncRemoteDrafts().catch(() => {})

      toast.success(
        isDirectApprove
          ? "Door quote approved and assigned!"
          : "Door quote submitted for review!"
      )
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
    clerkList,
    handleSubmitQuote,
  }
}
