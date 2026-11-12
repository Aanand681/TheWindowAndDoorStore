"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  getActiveAutoSave,
  clearActiveAutoSave,
  getSavedDrafts,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
} from "@/lib/quote-drafts-storage"
import { applyDraftDataToWorkspace } from "./drafts/workspace-draft-applier"
import { executeSaveDraft } from "./drafts/draft-saver"
import {
  UseCalculatorDraftsWorkspace,
  UseCalculatorDraftsFinancials,
  UseCalculatorDraftsParams,
  UseCalculatorDraftsReturn,
} from "./drafts/types"

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
  const router = useRouter()

  const workspaceRef = useRef(workspace)
  useEffect(() => {
    workspaceRef.current = workspace
  })
  const initialLoadDoneRef = useRef(false)

  const [savedDraftsCount, setSavedDraftsCount] = useState(0)
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null)
  const [loadedDraftTaxTotals, setLoadedDraftTaxTotals] = useState<any | null>(
    null
  )
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const restoreAutoSaveIntoWorkspace = useCallback(
    (recovered: any) => {
      const d = recovered?.data
      if (!d) return
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

  const loadDraftIntoWorkspace = useCallback(
    (draft: QuoteDraftItem) => {
      if (draft.type === "sealed_unit") {
        clearAutoSaveTimer()
        clearActiveAutoSave("window")
        router.push(`/sealed-units?loadDraftId=${draft.id}`)
        return
      }

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
    },
    [router, clearAutoSaveTimer]
  )

  const handleSaveDraft = useCallback(() => {
    executeSaveDraft({
      workspace: workspaceRef.current,
      financials,
      loadedDraftId,
      setLoadedDraftId,
    })
  }, [financials, loadedDraftId])

  const resetDraftState = useCallback(() => {
    setLoadedDraftId(null)
    setLoadedDraftTaxTotals(null)
    clearActiveAutoSave("window")
    clearAutoSaveTimer()
    setLastSavedAt(null)
  }, [clearAutoSaveTimer, setLastSavedAt])

  useEffect(() => {
    const refreshCount = () => {
      const drafts = getSavedDrafts()
      setSavedDraftsCount(drafts.length)
    }

    refreshCount()
    window.addEventListener(DRAFT_CHANGE_EVENT, refreshCount)
    window.addEventListener("storage", refreshCount)
    return () => {
      window.removeEventListener(DRAFT_CHANGE_EVENT, refreshCount)
      window.removeEventListener("storage", refreshCount)
    }
  }, [])

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

    if (queryDraftId) {
      const drafts = getSavedDrafts()
      const targetDraft = drafts.find((d) => d.id === queryDraftId)
      if (targetDraft) {
        loadDraftIntoWorkspace(targetDraft)
        const url = new URL(window.location.href)
        url.searchParams.delete("loadDraftId")
        window.history.replaceState({}, "", url.toString())
      }
    } else {
      const recovered = getActiveAutoSave("window")
      if (recovered && recovered.data) {
        restoreAutoSaveIntoWorkspace(recovered)
        toast.info("Restored your unsaved work in progress.")
      }
    }
  }, [
    initialReviewQuoteId,
    loadDraftIntoWorkspace,
    restoreAutoSaveIntoWorkspace,
  ])

  return {
    savedDraftsCount,
    loadedDraftId,
    setLoadedDraftId,
    loadedDraftTaxTotals,
    setLoadedDraftTaxTotals,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    initialLoadDone,
    loadDraftIntoWorkspace,
    restoreAutoSaveIntoWorkspace,
    handleSaveDraft,
    resetDraftState,
  }
}
