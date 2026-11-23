"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  getSavedDrafts,
  getActiveAutoSave,
  clearActiveAutoSave,
  isAutoSaveAlreadySaved,
  isDraftMeaningful,
  QuoteDraftItem,
  QuoteType,
  DRAFT_CHANGE_EVENT,
  syncRemoteDrafts,
} from "@/lib/quote-drafts-storage"

export interface UseUniversalWorkspaceDraftsProps {
  quoteType: QuoteType
  quoteTypeLabel?: string
  isCurrentWorkspaceDirty: () => boolean
  applyDraftToWorkspace: (draft: QuoteDraftItem) => void
  handleSaveDraft: () => Promise<QuoteDraftItem | null | any>
}

export function useUniversalWorkspaceDrafts({
  quoteType,
  quoteTypeLabel,
  isCurrentWorkspaceDirty,
  applyDraftToWorkspace,
  handleSaveDraft,
}: UseUniversalWorkspaceDraftsProps) {
  const router = useRouter()
  const [savedDraftsCount, setSavedDraftsCount] = useState<number>(0)
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState<boolean>(false)
  const [showResetModal, setShowResetModal] = useState<boolean>(false)
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false)
  const [pendingDraftToLoad, setPendingDraftToLoad] =
    useState<QuoteDraftItem | null>(null)

  const cleanUrlLoadDraftId = useCallback(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.delete("loadDraftId")
    window.history.replaceState({}, "", url.toString())
  }, [])

  const initialLoadDone = useRef(false)
  const applyRef = useRef(applyDraftToWorkspace)
  applyRef.current = applyDraftToWorkspace

  // Check URL query param ?loadDraftId=... strictly once on mount
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const loadDraftId = params.get("loadDraftId")
    if (!loadDraftId) return

    const drafts = getSavedDrafts()
    const target = drafts.find((d) => d.id === loadDraftId)
    if (!target || target.type !== quoteType) return

    const autoSave = getActiveAutoSave(quoteType)
    const isUnsaved =
      autoSave &&
      !isAutoSaveAlreadySaved(quoteType, autoSave) &&
      isDraftMeaningful(quoteType, autoSave)

    if (isUnsaved) {
      setPendingDraftToLoad(target)
      setShowConflictModal(true)
    } else {
      applyRef.current(target)
      clearActiveAutoSave(quoteType)
      const label = quoteTypeLabel || target.type
      toast.success(`Loaded ${label} Quote #${target.quoteNumber}`)
      cleanUrlLoadDraftId()
    }
  }, [quoteType, quoteTypeLabel, cleanUrlLoadDraftId])

  const updateSavedCount = useCallback(() => {
    const all = getSavedDrafts()
    setSavedDraftsCount(all.filter((d) => d.type === quoteType).length)
  }, [quoteType])

  useEffect(() => {
    updateSavedCount()
    syncRemoteDrafts().catch(() => {})
    window.addEventListener(DRAFT_CHANGE_EVENT, updateSavedCount)
    return () =>
      window.removeEventListener(DRAFT_CHANGE_EVENT, updateSavedCount)
  }, [updateSavedCount])

  const handleLoadQuoteFromDrafts = useCallback(
    (draft: QuoteDraftItem) => {
      // Cross-calculator routing
      if (draft.type !== quoteType) {
        setIsSavedQuotesOpen(false)
        if (draft.type === "window") {
          router.push(`/calculator?loadDraftId=${draft.id}`)
        } else if (draft.type === "door") {
          router.push(`/doors?loadDraftId=${draft.id}`)
        } else if (draft.type === "sealed_unit") {
          router.push(`/sealed-units?loadDraftId=${draft.id}`)
        }
        return
      }

      if (isCurrentWorkspaceDirty()) {
        setPendingDraftToLoad(draft)
        setShowConflictModal(true)
        setIsSavedQuotesOpen(false)
        return
      }

      applyDraftToWorkspace(draft)
      clearActiveAutoSave(quoteType)
      setIsSavedQuotesOpen(false)
      const label = quoteTypeLabel || draft.type
      toast.success(`Loaded ${label} Quote #${draft.quoteNumber}`)
    },
    [quoteType, quoteTypeLabel, isCurrentWorkspaceDirty, applyDraftToWorkspace, router]
  )

  const handleConflictSaveExistingAndLoad = useCallback(async () => {
    if (!pendingDraftToLoad) return
    const saved = await handleSaveDraft()
    if (saved) {
      applyDraftToWorkspace(pendingDraftToLoad)
      clearActiveAutoSave(quoteType)
      const label = quoteTypeLabel || pendingDraftToLoad.type
      toast.success(
        `Saved previous quote and loaded #${pendingDraftToLoad.quoteNumber}`
      )
      setShowConflictModal(false)
      setPendingDraftToLoad(null)
      cleanUrlLoadDraftId()
    }
  }, [
    pendingDraftToLoad,
    handleSaveDraft,
    applyDraftToWorkspace,
    quoteType,
    quoteTypeLabel,
    cleanUrlLoadDraftId,
  ])

  const handleConflictContinueWithNew = useCallback(() => {
    if (!pendingDraftToLoad) return
    clearActiveAutoSave(quoteType)
    applyDraftToWorkspace(pendingDraftToLoad)
    const label = quoteTypeLabel || pendingDraftToLoad.type
    toast.info(
      `Loaded #${pendingDraftToLoad.quoteNumber} (discarded previous unsaved edits)`
    )
    setShowConflictModal(false)
    setPendingDraftToLoad(null)
    cleanUrlLoadDraftId()
  }, [
    pendingDraftToLoad,
    applyDraftToWorkspace,
    quoteType,
    quoteTypeLabel,
    cleanUrlLoadDraftId,
  ])

  const handleConflictCancel = useCallback(() => {
    setShowConflictModal(false)
    setPendingDraftToLoad(null)
    cleanUrlLoadDraftId()
  }, [cleanUrlLoadDraftId])

  return {
    savedDraftsCount,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    showResetModal,
    setShowResetModal,
    showConflictModal,
    setShowConflictModal,
    pendingDraftToLoad,
    setPendingDraftToLoad,
    cleanUrlLoadDraftId,
    handleLoadQuoteFromDrafts,
    handleConflictSaveExistingAndLoad,
    handleConflictContinueWithNew,
    handleConflictCancel,
    updateSavedCount,
  }
}
