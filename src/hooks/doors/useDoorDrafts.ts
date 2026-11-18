"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  saveQuoteDraftDirectly,
  getSavedDrafts,
  getActiveAutoSave,
  clearActiveAutoSave,
  isAutoSaveAlreadySaved,
  isDraftMeaningful,
  isWorkspaceDirtyOrUnsaved,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
  syncRemoteDrafts,
} from "@/lib/quote-drafts-storage"
import {
  formatDoorSummarySentence,
  computeEffectiveDoorGrandTotal,
} from "@/lib/doors/calculations"
import { toast } from "sonner"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
  writeSessionAttachedInstallOption,
  writeSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import {
  applyDoorDraftToWorkspace,
  DoorWorkspaceSetters,
} from "./door-draft-applier"
import { executeSaveDoorDraft } from "./door-draft-saver"

interface UseDoorDraftsProps {
  customerName: string
  setCustomerName: (name: string) => void
  quoteNumber: string
  setQuoteNumber: (num: string) => void
  mode: any
  setMode: (mode: any) => void
  lineItems: any[]
  setLineItems: (items: any[]) => void
  setEditingItem: (item: any) => void
  globalUpcharges: any[]
  setGlobalUpcharges: (u: any[]) => void
  selectedRegionId?: string
  setSelectedRegionId?: (id: string) => void
  travelFeeType: any
  setTravelFeeType: (t: any) => void
  customTravelFee: string
  setCustomTravelFee: (f: string) => void
  showOutTownTravel: boolean
  setShowOutTownTravel: (show: boolean) => void
  travelKm: string
  setTravelKm: (km: string) => void
  crewHours: string
  setCrewHours: (h: string) => void
  crewSize: "2" | "3"
  setCrewSize: (s: "2" | "3") => void
  quoteNotes: string
  setQuoteNotes: (notes: string) => void
  isFirstNation: boolean
  setIsFirstNation: (fn: boolean) => void
  customLabour: string
  setCustomLabour: (l: string) => void
  customMisc: string
  setCustomMisc: (m: string) => void
  attachedWindowQuote: any
  setAttachedWindowQuote: (q: any) => void
  attachedSealedUnit: any
  setAttachedSealedUnit: (u: any) => void
  totals: any
  setLastSavedAt: (time: string | null) => void
}

export function useDoorDrafts({
  customerName,
  setCustomerName,
  quoteNumber,
  setQuoteNumber,
  mode,
  setMode,
  lineItems,
  setLineItems,
  setEditingItem,
  globalUpcharges,
  setGlobalUpcharges,
  selectedRegionId,
  setSelectedRegionId,
  travelFeeType,
  setTravelFeeType,
  customTravelFee,
  setCustomTravelFee,
  showOutTownTravel,
  setShowOutTownTravel,
  travelKm,
  setTravelKm,
  crewHours,
  setCrewHours,
  crewSize,
  setCrewSize,
  quoteNotes,
  setQuoteNotes,
  isFirstNation,
  setIsFirstNation,
  customLabour,
  setCustomLabour,
  customMisc,
  setCustomMisc,
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  totals,
  setLastSavedAt,
}: UseDoorDraftsProps) {
  const router = useRouter()
  const [savedDraftsCount, setSavedDraftsCount] = useState<number>(0)
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState<boolean>(false)
  const [showResetModal, setShowResetModal] = useState<boolean>(false)
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false)
  const [pendingDraftToLoad, setPendingDraftToLoad] =
    useState<QuoteDraftItem | null>(null)

  const setters: DoorWorkspaceSetters = useMemo(
    () => ({
      setCustomerName,
      setQuoteNumber,
      setMode,
      setLineItems,
      setGlobalUpcharges,
      setSelectedRegionId,
      setTravelFeeType,
      setCustomTravelFee,
      setShowOutTownTravel,
      setTravelKm,
      setCrewHours,
      setCrewSize,
      setQuoteNotes,
      setIsFirstNation,
      setCustomLabour,
      setCustomMisc,
      setAttachedWindowQuote,
      setAttachedSealedUnit,
    }),
    [
      setCustomerName,
      setQuoteNumber,
      setMode,
      setLineItems,
      setGlobalUpcharges,
      setSelectedRegionId,
      setTravelFeeType,
      setCustomTravelFee,
      setShowOutTownTravel,
      setTravelKm,
      setCrewHours,
      setCrewSize,
      setQuoteNotes,
      setIsFirstNation,
      setCustomLabour,
      setCustomMisc,
      setAttachedWindowQuote,
      setAttachedSealedUnit,
    ]
  )

  const isCurrentWorkspaceDirty = () => {
    return isWorkspaceDirtyOrUnsaved("door", {
      quoteNumber,
      customerName,
      itemCount: lineItems.length,
      grandTotal: totals.grandTotal,
      data: {
        lineItems,
        attachedWindowQuote,
        attachedSealedUnit,
      },
    })
  }

  const cleanUrlLoadDraftId = () => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.delete("loadDraftId")
    window.history.replaceState({}, "", url.toString())
  }

  // Check URL query param ?loadDraftId=... on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const loadDraftId = params.get("loadDraftId")
    if (!loadDraftId) return

    const drafts = getSavedDrafts()
    const target = drafts.find((d) => d.id === loadDraftId)
    if (!target || target.type !== "door") return

    const autoSave = getActiveAutoSave("door")
    const isUnsaved =
      autoSave &&
      !isAutoSaveAlreadySaved("door", autoSave) &&
      isDraftMeaningful("door", autoSave)

    if (isUnsaved) {
      setPendingDraftToLoad(target)
      setShowConflictModal(true)
    } else {
      applyDoorDraftToWorkspace(target, setters)
      clearActiveAutoSave("door")
      toast.success(`Loaded Door Quote #${target.quoteNumber}`)
      cleanUrlLoadDraftId()
    }
  }, [setters])

  const updateSavedCount = () => {
    const all = getSavedDrafts()
    setSavedDraftsCount(all.filter((d) => d.type === "door").length)
  }

  useEffect(() => {
    updateSavedCount()
    syncRemoteDrafts().catch(() => {})
    window.addEventListener(DRAFT_CHANGE_EVENT, updateSavedCount)
    return () =>
      window.removeEventListener(DRAFT_CHANGE_EVENT, updateSavedCount)
  }, [])

  const handleExplicitSaveDraft = async (): Promise<QuoteDraftItem | null> => {
    const saved = await executeSaveDoorDraft({
      customerName,
      quoteNumber,
      lineItems,
      attachedWindowQuote,
      attachedSealedUnit,
      totals,
      mode,
      globalUpcharges,
      selectedRegionId,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      isFirstNation,
      customLabour,
      customMisc,
      quoteNotes,
    })

    if (saved) {
      updateSavedCount()
      const nowStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      setLastSavedAt(nowStr)
      toast.success(
        `Door quote draft #${quoteNumber} saved directly to database!`
      )
    }
    return saved
  }

  const handleLoadQuoteFromDrafts = (draft: QuoteDraftItem) => {
    if (draft.type === "window") {
      router.push(`/calculator?loadDraftId=${draft.id}`)
      setIsSavedQuotesOpen(false)
      return
    }
    if (draft.type === "sealed_unit") {
      router.push(`/sealed-units?loadDraftId=${draft.id}`)
      setIsSavedQuotesOpen(false)
      return
    }

    if (isCurrentWorkspaceDirty()) {
      setPendingDraftToLoad(draft)
      setShowConflictModal(true)
      setIsSavedQuotesOpen(false)
      return
    }

    applyDoorDraftToWorkspace(draft, setters)
    clearActiveAutoSave("door")
    setIsSavedQuotesOpen(false)
    toast.success(`Loaded Door Quote #${draft.quoteNumber}`)
  }

  const handleConflictSaveExistingAndLoad = async () => {
    if (!pendingDraftToLoad) return
    const saved = await handleExplicitSaveDraft()
    if (saved) {
      applyDoorDraftToWorkspace(pendingDraftToLoad, setters)
      clearActiveAutoSave("door")
      toast.success(`Loaded Door Quote #${pendingDraftToLoad.quoteNumber}`)
      setShowConflictModal(false)
      setPendingDraftToLoad(null)
      cleanUrlLoadDraftId()
    }
  }

  const handleConflictContinueWithNew = () => {
    if (!pendingDraftToLoad) return
    applyDoorDraftToWorkspace(pendingDraftToLoad, setters)
    clearActiveAutoSave("door")
    toast.success(`Loaded Door Quote #${pendingDraftToLoad.quoteNumber}`)
    setShowConflictModal(false)
    setPendingDraftToLoad(null)
    cleanUrlLoadDraftId()
  }

  const handleConflictCancel = () => {
    setShowConflictModal(false)
    setPendingDraftToLoad(null)
    cleanUrlLoadDraftId()
  }

  const handleConfirmReset = () => {
    setLineItems([])
    setEditingItem(null)
    setGlobalUpcharges([])
    setTravelFeeType("local_std")
    setCustomTravelFee("")
    setShowOutTownTravel(false)
    setTravelKm("")
    setCrewHours("")
    setCrewSize("3")
    setQuoteNotes("")
    setIsFirstNation(false)
    setCustomLabour("")
    setCustomMisc("")
    setCustomerName("")
    setQuoteNumber("")
    setAttachedWindowQuote(null)
    setAttachedSealedUnit(null)
    writeSessionAttachedInstallOption(null)
    writeSessionCustomOptions([])
    clearActiveAutoSave("door")
    setLastSavedAt(null)
    setShowResetModal(false)
    toast.info("Quote reset to a blank workspace")
  }

  return {
    savedDraftsCount,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    showResetModal,
    setShowResetModal,
    showConflictModal,
    setShowConflictModal,
    pendingDraftToLoad,
    handleConflictSaveExistingAndLoad,
    handleConflictContinueWithNew,
    handleConflictCancel,
    handleExplicitSaveDraft,
    handleLoadQuoteFromDrafts,
    handleConfirmReset,
  }
}
