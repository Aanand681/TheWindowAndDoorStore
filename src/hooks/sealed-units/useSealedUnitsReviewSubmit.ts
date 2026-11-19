"use client"

import { useState } from "react"
import { toast } from "sonner"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "@/components/sealed-units/invoice/types"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import {
  clearActiveAutoSave,
  syncRemoteDrafts,
  purgeSubmittedDrafts,
} from "@/lib/quote-drafts-storage"

interface UseSealedUnitsReviewSubmitProps {
  user: any
  quoteNumber: string
  customerName: string
  quoteNotes: string
  lineItems: SealedUnitLineItem[]
  isInstallation: boolean
  isServiceOnly: boolean
  hstRate: number
  totals: SealedUnitTotals
  assignedReviewer: string
  selectedOdooClerk: string
  attachedWindowQuote?: any
  attachedDoorQuote?: any
  selectedRegionId?: string
  travelFeeType?: string
  customTravelFee?: string
  showOutTownTravel?: boolean
  travelKm?: string
  crewHours?: string
  crewSize?: string
}

export function useSealedUnitsReviewSubmit({
  user,
  quoteNumber,
  customerName,
  quoteNotes,
  lineItems,
  isInstallation,
  isServiceOnly,
  hstRate,
  totals,
  assignedReviewer,
  selectedOdooClerk,
  attachedWindowQuote,
  attachedDoorQuote,
  selectedRegionId,
  travelFeeType,
  customTravelFee,
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
}: UseSealedUnitsReviewSubmitProps) {
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false)
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false)
  const [adminSubmitMode, setAdminSubmitMode] = useState<
    "direct_approve" | "submit_review"
  >("direct_approve")
  const [preparerNotes, setPreparerNotes] = useState<string>("")

  const handleSubmitForReview = async () => {
    if (!quoteNumber.trim() || !customerName.trim()) {
      toast.error(
        "Please enter Customer Name and Quote Number before submitting!"
      )
      return
    }
    if (
      lineItems.length === 0 &&
      !(isServiceOnly && (totals.totalSqft || 0) > 0)
    ) {
      toast.error(
        "Please add at least one sealed unit or enter service sq ft before submitting!"
      )
      return
    }

    const isDirectApprove = Boolean(
      (user?.role === "ADMIN" || user?.role === "SUPERADMIN") &&
      adminSubmitMode === "direct_approve"
    )

    const effectiveReviewer =
      assignedReviewer &&
      assignedReviewer.toLowerCase() !== user?.username?.toLowerCase()
        ? assignedReviewer
        : ""

    if (isDirectApprove && !selectedOdooClerk) {
      toast.error("Please select an Odoo clerk to assign this quote to")
      return
    }
    if (!isDirectApprove) {
      if (!effectiveReviewer) {
        toast.error(
          "Please select another reviewer. You cannot submit a quote to yourself."
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
      const effectiveLineItems =
        lineItems.length > 0
          ? lineItems
          : [
              {
                id: "service-unit-1",
                combinationName: "On-Site Sealed Unit Glazing Service",
                paneType: "dual",
                treatment: "annealed",
                thicknessMm: 0,
                widthIn: 0,
                heightIn: 0,
                actualSqft: totals.totalSqft,
                billableSqft: Math.ceil(totals.totalSqft),
                quantity: 1,
                finalUnitPrice: 0,
                multipliedAmount: 0,
                multipliedTotal: 0,
                lineGlassTotal: 0,
                totalLabour: totals.serviceLabourTotal,
                totalMisc: totals.miscTotal,
              } as any,
            ]

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber,
          customerName,
          assignedTo: isDirectApprove ? user?.username || "" : effectiveReviewer,
          directApprove: isDirectApprove,
          odooAssignedTo: isDirectApprove ? selectedOdooClerk : undefined,
          preparerNotes,
          quoteNotes,
          attachedWindowQuote,
          attachedDoorQuote,
          attachedInstallOption: readSessionAttachedInstallOption(),
          customOptions: readSessionCustomOptions(),
          selectedRegionId,
          travelFeeType,
          customTravelFee,
          showOutTownTravel,
          travelKm,
          crewHours,
          crewSize,
          hstRate,
          windows: effectiveLineItems,
          taxTotals: {
            isSupplyOnly: !isInstallation,
            subtotalPreTax: totals.subtotalPreTax,
            grandTotal: totals.grandTotal,
            hstAmount: totals.hstAmount,
            hstRate,
            totalUnits: totals.totalUnits,
            totalSqft: totals.totalSqft,
            glassSupplyTotal: totals.glassSupplyTotal,
            combinedLabourTotal: totals.combinedLabourTotal,
            miscTotal: totals.miscTotal,
            baseSetupFee: totals.baseSetupFee,
            totalAdditionalTravel: totals.totalAdditionalTravel,
            isSealedUnitQuote: true,
          },
          quoteResult: {
            base: totals.glassBefore8PercentTotal,
            surcharge: totals.glass8PercentSurchargeTotal,
            total: totals.grandTotal,
            isSealedUnit: true,
          },
          quoteSummaryTotal: Math.round(totals.grandTotal * 100),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit quote")

      // Purge drafts for this submitted quote AND any absorbed child quotes
      purgeSubmittedDrafts({
        mainQuoteNumber: quoteNumber,
        mainType: "sealed_unit",
        attachedWindowQuote,
        attachedDoorQuote,
      })

      clearActiveAutoSave("sealed_unit")
      syncRemoteDrafts().catch(() => {})

      if (isDirectApprove) {
        toast.success(
          `Quote #${quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`
        )
      } else {
        toast.success(
          `Quote #${quoteNumber} submitted to ${effectiveReviewer} for review!`
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
    submittingQuote,
    adminSubmitMode,
    setAdminSubmitMode,
    preparerNotes,
    setPreparerNotes,
    handleSubmitForReview,
  }
}
