"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  getActiveAutoSave,
  clearActiveAutoSave,
  getSavedDrafts,
  isAutoSaveAlreadySaved,
  isDraftMeaningful,
  isWorkspaceDirtyOrUnsaved,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
  syncRemoteDrafts,
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
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [pendingDraftToLoad, setPendingDraftToLoad] =
    useState<QuoteDraftItem | null>(null)

  const cleanUrlLoadDraftId = () => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.delete("loadDraftId")
    window.history.replaceState({}, "", url.toString())
  }

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
        router.push(`/sealed-units?loadDraftId=${draft.id}`)
        setIsSavedQuotesOpen(false)
        return
      }
      if (draft.type === "door") {
        clearAutoSaveTimer()
        router.push(`/doors?loadDraftId=${draft.id}`)
        setIsSavedQuotesOpen(false)
        return
      }

      const ws = workspaceRef.current
      const isDirty = isWorkspaceDirtyOrUnsaved("window", {
        id: loadedDraftId || undefined,
        quoteNumber: ws.quoteNumber,
        customerName: ws.customerName,
        itemCount: ws.windows.length,
        grandTotal: financials.total,
        data: {
          windows: ws.windows,
          attachedSealedUnit: ws.attachedSealedUnit,
          attachedDoorQuote: ws.attachedDoorQuote,
          attachedUpgrade: ws.attachedUpgrade,
        },
      })

      if (isDirty) {
        setPendingDraftToLoad(draft)
        setShowConflictModal(true)
        setIsSavedQuotesOpen(false)
        return
      }

      loadDraftDirectly(draft)
      setIsSavedQuotesOpen(false)
    },
    [
      router,
      clearAutoSaveTimer,
      financials.total,
      loadedDraftId,
      loadDraftDirectly,
    ]
  )

  const handleSaveDraft = useCallback(async (): Promise<QuoteDraftItem | null> => {
    return await executeSaveDraft({
      workspace: workspaceRef.current,
      financials,
      loadedDraftId,
      setLoadedDraftId,
    })
  }, [financials, loadedDraftId])

  const handleConflictSaveExistingAndLoad = useCallback(async () => {
    if (!pendingDraftToLoad) return
    const saved = await handleSaveDraft()
    if (saved) {
      loadDraftDirectly(pendingDraftToLoad)
      setShowConflictModal(false)
      setPendingDraftToLoad(null)
      cleanUrlLoadDraftId()
    }
  }, [pendingDraftToLoad, handleSaveDraft, loadDraftDirectly])

  const handleConflictContinueWithNew = useCallback(() => {
    if (!pendingDraftToLoad) return
    loadDraftDirectly(pendingDraftToLoad)
    setShowConflictModal(false)
    setPendingDraftToLoad(null)
    cleanUrlLoadDraftId()
  }, [pendingDraftToLoad, loadDraftDirectly])

  const handleConflictCancel = useCallback(() => {
    setShowConflictModal(false)
    setPendingDraftToLoad(null)
    cleanUrlLoadDraftId()
  }, [])

  useEffect(() => {
    syncRemoteDrafts().catch(() => {})
  }, [])

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
      if (targetDraft && targetDraft.type === "window") {
        const recovered = getActiveAutoSave("window")
        const isUnsaved =
          recovered &&
          !isAutoSaveAlreadySaved("window", recovered) &&
          isDraftMeaningful("window", recovered)

        if (isUnsaved) {
          restoreAutoSaveIntoWorkspace(recovered)
          setPendingDraftToLoad(targetDraft)
          setShowConflictModal(true)
        } else {
          loadDraftDirectly(targetDraft)
          cleanUrlLoadDraftId()
        }
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
    loadDraftDirectly,
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
    showConflictModal,
    setShowConflictModal,
    pendingDraftToLoad,
    handleConflictSaveExistingAndLoad,
    handleConflictContinueWithNew,
    handleConflictCancel,
  }
}
