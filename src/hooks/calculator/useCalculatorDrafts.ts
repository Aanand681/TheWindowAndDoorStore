"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import {
  getActiveAutoSave,
  clearActiveAutoSave,
  isWorkspaceDirtyOrUnsaved,
  QuoteDraftItem,
} from "@/lib/quote-drafts-storage"
import { applyDraftDataToWorkspace } from "./drafts/workspace-draft-applier"
import { executeSaveDraft } from "./drafts/draft-saver"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import {
  UseCalculatorDraftsWorkspace,
  UseCalculatorDraftsFinancials,
  UseCalculatorDraftsParams,
  UseCalculatorDraftsReturn,
} from "./drafts/types"
import { useUniversalWorkspaceDrafts } from "@/hooks/shared/useUniversalWorkspaceDrafts"

export type {
  UseCalculatorDraftsWorkspace,
  UseCalculatorDraftsFinancials,
  UseCalculatorDraftsParams,
  UseCalculatorDraftsReturn,
}

export function useCalculatorDrafts({
  initialReviewQuoteId,
  workspace,
  financials,
  clearAutoSaveTimer,
  setLastSavedAt,
}: UseCalculatorDraftsParams): UseCalculatorDraftsReturn {
  const workspaceRef = useRef(workspace)
  useEffect(() => {
    workspaceRef.current = workspace
  })
  const initialLoadDoneRef = useRef(false)

  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null)
  const [loadedDraftTaxTotals, setLoadedDraftTaxTotals] = useState<any | null>(
    null
  )
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const loadDraftDirectly = useCallback((draft: QuoteDraftItem) => {
    const d = draft.data as any
    if (!d) return

    setLoadedDraftId(draft.id)
    applyDraftDataToWorkspace(
      workspaceRef.current,
      d,
      setLoadedDraftTaxTotals
    )
    clearActiveAutoSave("window")
    toast.success(`Loaded Window Quote #${draft.quoteNumber}`)
  }, [])

  const restoreAutoSaveIntoWorkspace = useCallback(
    (recovered: any) => {
      const d = recovered?.data
      if (!d) return
      if (recovered.id || d.id) {
        setLoadedDraftId(recovered.id || d.id)
      }
      applyDraftDataToWorkspace(
        workspaceRef.current,
        d,
        setLoadedDraftTaxTotals
      )
      if (recovered.timestamp) {
        setLastSavedAt(
          new Date(recovered.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        )
      }
    },
    [setLastSavedAt]
  )

  const isCurrentWorkspaceDirty = useCallback(() => {
    const ws = workspaceRef.current
    let grandTotalDollars = (financials.total || 0) / 100
    if (ws.attachedDoorQuote || ws.attachedSealedUnit) {
      const combined = computeCombinedQuoteFinancials({
        quoteResult: financials.quoteResult,
        afterDiscount: financials.afterDiscount,
        total: financials.total,
        attachedSealedUnit: ws.attachedSealedUnit,
        attachedDoorQuote: ws.attachedDoorQuote,
        effectiveJC: financials.effectiveJC,
        effectiveMisc: financials.effectiveMisc,
        effectiveLabour: financials.effectiveLabour,
        hstRate: ws.hstRate,
        isSupplyOnly: ws.isSupplyOnly,
      })
      grandTotalDollars = combined.grandTotalDollars
    }

    return isWorkspaceDirtyOrUnsaved("window", {
      id: loadedDraftId || undefined,
      quoteNumber: ws.quoteNumber,
      customerName: ws.customerName,
      itemCount: ws.windows.length,
      grandTotal: grandTotalDollars,
      data: {
        windows: ws.windows,
        attachedSealedUnit: ws.attachedSealedUnit,
        attachedDoorQuote: ws.attachedDoorQuote,
        attachedUpgrade: ws.attachedUpgrade,
        isSupplyOnly: ws.isSupplyOnly,
      },
    })
  }, [financials, loadedDraftId])

  const handleSaveDraft = useCallback(async (): Promise<QuoteDraftItem | null> => {
    return await executeSaveDraft({
      workspace: workspaceRef.current,
      financials,
      loadedDraftId,
      setLoadedDraftId,
    })
  }, [financials, loadedDraftId])

  const universalDrafts = useUniversalWorkspaceDrafts({
    quoteType: "window",
    quoteTypeLabel: "Window",
    isCurrentWorkspaceDirty,
    applyDraftToWorkspace: loadDraftDirectly,
    handleSaveDraft,
  })

  // Auto-restore active unsaved work-in-progress if opening fresh workspace with no URL param
  useEffect(() => {
    if (typeof window === "undefined" || initialLoadDoneRef.current) return
    initialLoadDoneRef.current = true
    setInitialLoadDone(true)

    if (initialReviewQuoteId) {
      clearActiveAutoSave("window")
      return
    }

    const searchParams = new URLSearchParams(window.location.search)
    const queryDraftId = searchParams.get("loadDraftId")
    if (!queryDraftId) {
      const recovered = getActiveAutoSave("window")
      if (recovered && recovered.data) {
        restoreAutoSaveIntoWorkspace(recovered)
        toast.info("Restored your unsaved work in progress.")
      }
    }
  }, [initialReviewQuoteId, restoreAutoSaveIntoWorkspace])

  const resetDraftState = useCallback(() => {
    setLoadedDraftId(null)
    setLoadedDraftTaxTotals(null)
    clearActiveAutoSave("window")
    clearAutoSaveTimer()
    setLastSavedAt(null)
  }, [clearAutoSaveTimer, setLastSavedAt])

  return {
    loadedDraftId,
    setLoadedDraftId,
    loadedDraftTaxTotals,
    setLoadedDraftTaxTotals,
    initialLoadDone,
    loadDraftIntoWorkspace: universalDrafts.handleLoadQuoteFromDrafts,
    restoreAutoSaveIntoWorkspace,
    handleSaveDraft,
    resetDraftState,
    ...universalDrafts,
  }
}
