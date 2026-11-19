"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  clearAllQuoteSessionState,
  writeSessionAttachedInstallOption,
  writeSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { useReviewPermissions } from "@/hooks/calculator/review/useReviewPermissions"
import {
  applyDraftDataToWorkspace,
  WorkspaceSetters,
} from "./sealed-units-storage-helpers"

export interface UseSealedUnitsReviewLoaderParams {
  user: any
  setters: WorkspaceSetters
  onConfirmReset: () => void
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export function useSealedUnitsReviewLoader(
  p: UseSealedUnitsReviewLoaderParams
) {
  const {
    user,
    setters,
    onConfirmReset,
    initialReviewQuoteId,
    initialIsEditMode = false,
  } = p

  const [reviewQuoteId, setReviewQuoteId] = useState<string | null>(
    initialReviewQuoteId || null
  )
  const [reviewQuote, setReviewQuote] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState<boolean>(initialIsEditMode)
  const [originalSnapshot, setOriginalSnapshot] = useState<any>(null)
  const [reviewActionLoading, setReviewActionLoading] = useState(false)

  const perms = useReviewPermissions({ user, reviewQuote, isEditMode })

  const loadQuoteIntoWorkspace = useCallback(
    (q: any, edit?: boolean) => {
      clearAllQuoteSessionState()
      setReviewQuote(q)
      setOriginalSnapshot(q.initialSnapshot || q)

      const isClerk = perms.isOdooClerk
      const isApproved = q.status === "APPROVED" || q.status === "MODIFIED"
      const isPending = q.status === "PENDING_REVIEW"
      const isPreparer = Boolean(
        user &&
        q.preparedBy &&
        user.username &&
        q.preparedBy.toLowerCase() === user.username.toLowerCase()
      )
      const isOdooDone = Boolean(
        q.odooStatus === "COMPLETED" || q.odooOrderNumber
      )
      const allowEdit = Boolean(
        edit &&
        !isOdooDone &&
        !isClerk &&
        (isApproved ? perms.canEditApprovedQuote : true) &&
        (!isPending || (!isPreparer && perms.isReviewerOrAdmin))
      )
      setIsEditMode(allowEdit)

      const lineItems = Array.isArray(q.windows)
        ? q.windows
        : Array.isArray(q.lineItems)
          ? q.lineItems
          : []

      applyDraftDataToWorkspace(
        {
          quoteNumber: q.quoteNumber,
          customerName: q.customerName,
          quoteNotes: q.quoteNotes,
          lineItems,
          sealedUnitMode: q.sealedUnitMode || (q.taxTotals?.isSupplyOnly ? "supply_only" : "installation"),
          isInstallation: q.isInstallation ?? !q.taxTotals?.isSupplyOnly,
          serviceSqftInput: q.serviceSqftInput,
          serviceLabourRateInput: q.serviceLabourRateInput,
          serviceMiscRateInput: q.serviceMiscRateInput,
          travelFeeType: q.travelFeeType,
          customTravelFee: q.customTravelFee,
          showOutTownTravel: q.showOutTownTravel,
          travelKm: q.travelKm,
          crewHours: q.crewHours,
          crewSize: q.crewSize,
          hstRate: q.hstRate ?? q.taxTotals?.hstRate ?? 13,
          selectedRegionId: q.selectedRegionId,
          regionName: q.regionName,
          attachedWindowQuote: q.attachedWindowQuote,
          attachedDoorQuote: q.attachedDoorQuote,
          attachedInstallOption: q.attachedInstallOption,
          customOptions: q.customOptions,
        },
        setters
      )

      writeSessionAttachedInstallOption(q.attachedInstallOption ?? null)
      writeSessionCustomOptions(Array.isArray(q.customOptions) ? q.customOptions : [])

      toast.info(
        allowEdit
          ? `Loaded Sealed Unit Quote #${q.quoteNumber} in Edit Mode`
          : `Loaded Sealed Unit Quote #${q.quoteNumber} in Review Mode`
      )
    },
    [perms.canEditApprovedQuote, perms.isOdooClerk, setters]
  )

  const handleOpenQuote = useCallback(
    (qId: string, edit?: boolean) => {
      setReviewQuoteId(qId)
      fetch(`/api/quotes/${qId}?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((q) => {
          if (q && q._id) loadQuoteIntoWorkspace(q, edit)
        })
        .catch(console.error)
    },
    [loadQuoteIntoWorkspace]
  )

  useEffect(() => {
    if (initialReviewQuoteId) {
      handleOpenQuote(initialReviewQuoteId, initialIsEditMode)
    }
  }, [initialReviewQuoteId, initialIsEditMode, handleOpenQuote])

  const handleCancelEdits = useCallback(() => {
    if (reviewQuote) loadQuoteIntoWorkspace(reviewQuote, false)
  }, [reviewQuote, loadQuoteIntoWorkspace])

  const handleExitReview = useCallback(() => {
    clearAllQuoteSessionState()
    setReviewQuoteId(null)
    setReviewQuote(null)
    setIsEditMode(false)
    setOriginalSnapshot(null)
    onConfirmReset()
    if (typeof window !== "undefined") {
      const sub = p.originSubTab || new URLSearchParams(window.location.search).get("sub")
      if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
        window.history.back()
        return
      }
      window.location.href = sub ? `/quotes?sub=${sub}` : "/quotes"
    }
  }, [onConfirmReset, p.originSubTab])

  return {
    reviewQuoteId,
    reviewQuote,
    setReviewQuote,
    isEditMode,
    setIsEditMode,
    originalSnapshot,
    setOriginalSnapshot,
    reviewActionLoading,
    setReviewActionLoading,
    perms,
    isReadOnly: perms.isReadOnly,
    handleOpenQuote,
    handleCancelEdits,
    handleExitReview,
  }
}
