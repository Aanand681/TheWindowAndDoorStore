"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  getSavedDrafts,
  clearActiveAutoSave,
  isWorkspaceDirtyOrUnsaved,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
  syncRemoteDrafts,
} from "@/lib/quote-drafts-storage"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "@/components/sealed-units/types"
import {
  applyDraftDataToWorkspace,
  WorkspaceSetters,
} from "./sealed-units-storage-helpers"
import {
  writeSessionAttachedInstallOption,
  writeSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useSealedUnitsAutoSave } from "./useSealedUnitsAutoSave"
import { createSealedUnitsConflictHandlers } from "./sealed-units-draft-conflict"
import { executeSaveSealedUnitDraft } from "./sealed-units-draft-saver"

export interface SealedUnitFormInputs {
  sealedUnitMode: "installation" | "supply_only" | "service_only"
  isInstallation: boolean
  isServiceOnly: boolean
  serviceSqftInput: string
  serviceLabourRateInput: string
  serviceMiscRateInput: string
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  extraLabour?: string
  globalUpcharges?: any[]
  hstRate: number
  selectedRegionId?: string
  regionName?: string
}

export interface SealedUnitFormSetters {
  setSealedUnitMode: (mode: "installation" | "supply_only" | "service_only") => void
  setIsInstallation: (val: boolean) => void
  setServiceSqftInput: (val: string) => void
  setServiceLabourRateInput: (val: string) => void
  setServiceMiscRateInput: (val: string) => void
  setTravelFeeType: (val: "none" | "local_std" | "far_std" | "far_small" | "custom") => void
  setCustomTravelFee: (val: string) => void
  setShowOutTownTravel: (val: boolean) => void
  setTravelKm: (val: string) => void
  setCrewHours: (val: string) => void
  setCrewSize: (val: "2" | "3") => void
  setExtraLabour?: (val: string) => void
  setGlobalUpcharges?: (val: any[]) => void
  setHstRate: (val: number) => void
  setSelectedRegionId?: (val: string) => void
}

interface UseSealedUnitsDraftsProps {
  lineItems: SealedUnitLineItem[]
  setLineItems: React.Dispatch<React.SetStateAction<SealedUnitLineItem[]>>
  formInputs: SealedUnitFormInputs
  formSetters: SealedUnitFormSetters
  totals: SealedUnitTotals
  regions?: any[]
}

export function useSealedUnitsDrafts(props: UseSealedUnitsDraftsProps) {
  const { lineItems, setLineItems, formInputs, formSetters, totals, regions } = props
  const {
    sealedUnitMode, isInstallation, isServiceOnly, serviceSqftInput,
    serviceLabourRateInput, serviceMiscRateInput, travelFeeType, customTravelFee,
    showOutTownTravel, travelKm, crewHours, crewSize, extraLabour, hstRate,
    selectedRegionId, regionName,
  } = formInputs

  const router = useRouter()
  const generateQuoteNumber = () => Math.floor(100000 + Math.random() * 900000).toString()

  const [quoteNumber, setQuoteNumber] = useState<string>("")
  const [customerName, setCustomerName] = useState<string>("")
  const [quoteNotes, setQuoteNotes] = useState<string>("")
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState<boolean>(false)
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false)
  const [attachedWindowQuote, setAttachedWindowQuote] = useState<any | null>(null)
  const [attachedDoorQuote, setAttachedDoorQuote] = useState<any | null>(null)
  const [savedDraftsCount, setSavedDraftsCount] = useState<number>(0)
  const [showResetModal, setShowResetModal] = useState<boolean>(false)
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false)
  const [pendingDraftToLoad, setPendingDraftToLoad] = useState<QuoteDraftItem | null>(null)

  const cleanUrlLoadDraftId = () => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.delete("loadDraftId")
    window.history.replaceState({}, "", url.toString())
  }

  const setters: WorkspaceSetters = useMemo(
    () => ({
      setQuoteNumber, setCustomerName, setQuoteNotes, setLineItems,
      setAttachedWindowQuote, setAttachedDoorQuote, regions, ...formSetters,
    }),
    [setLineItems, formSetters, regions]
  )

  const currentSnapshotParams = useMemo(
    () => ({
      quoteNumber, customerName, lineItems, sealedUnitMode, isInstallation,
      serviceSqftInput, serviceLabourRateInput, serviceMiscRateInput, travelFeeType,
      customTravelFee, showOutTownTravel, travelKm, crewHours, crewSize,
      extraLabour: extraLabour || "", globalUpcharges: (formInputs as any)?.globalUpcharges || [],
      hstRate, selectedRegionId: selectedRegionId || "", regionName: regionName || "",
      attachedWindowQuote, attachedDoorQuote,
    }),
    [
      quoteNumber, customerName, lineItems, sealedUnitMode, isInstallation,
      serviceSqftInput, serviceLabourRateInput, serviceMiscRateInput, travelFeeType,
      customTravelFee, showOutTownTravel, travelKm, crewHours, crewSize,
      extraLabour, hstRate, selectedRegionId, regionName, attachedWindowQuote, attachedDoorQuote,
    ]
  )

  const loadDraftIntoWorkspace = useCallback(
    (draft: QuoteDraftItem) => {
      if (draft.type === "window") {
        router.push(`/calculator?loadDraftId=${draft.id}`)
        setIsSavedQuotesOpen(false)
        return
      }
      if (draft.type === "door") {
        router.push(`/doors?loadDraftId=${draft.id}`)
        setIsSavedQuotesOpen(false)
        return
      }

      const isDirty = isWorkspaceDirtyOrUnsaved("sealed_unit", {
        quoteNumber, customerName, itemCount: lineItems.length, grandTotal: totals.grandTotal,
        data: { lineItems, attachedWindowQuote, attachedDoorQuote },
      })

      if (isDirty) {
        setPendingDraftToLoad(draft)
        setShowConflictModal(true)
        setIsSavedQuotesOpen(false)
        return
      }

      const d = draft.data as any
      if (!d) return

      applyDraftDataToWorkspace(d, setters)
      clearActiveAutoSave("sealed_unit")
      setIsSavedQuotesOpen(false)
      toast.success(`Loaded Sealed Unit Quote #${draft.quoteNumber}`)
    },
    [router, setters, quoteNumber, customerName, lineItems, totals.grandTotal, attachedWindowQuote, attachedDoorQuote]
  )

  const autoSave = useSealedUnitsAutoSave({
    currentSnapshotParams, quoteNotes, totals, lineItems, isServiceOnly,
    serviceSqftInput, attachedWindowQuote, attachedDoorQuote, setters,
    loadDraftIntoWorkspace,
    onConflictDetected: (match) => {
      setPendingDraftToLoad(match)
      setShowConflictModal(true)
    },
  })

  const handleSaveDraft = useCallback(
    () => executeSaveSealedUnitDraft({
      lineItems, isServiceOnly, totals, serviceSqftInput, attachedWindowQuote,
      attachedDoorQuote, customerName, quoteNumber, setQuoteNumber, generateQuoteNumber,
      quoteNotes, currentSnapshotParams,
      clearTimerAndSaveSnapshot: autoSave.clearTimerAndSaveSnapshot,
    }),
    [lineItems, isServiceOnly, totals, serviceSqftInput, attachedWindowQuote, attachedDoorQuote, customerName, quoteNumber, quoteNotes, currentSnapshotParams, autoSave.clearTimerAndSaveSnapshot]
  )

  const conflictHandlers = useMemo(
    () => createSealedUnitsConflictHandlers({
      pendingDraftToLoad, setPendingDraftToLoad, setShowConflictModal,
      handleSaveDraft, setters, cleanUrlLoadDraftId,
    }),
    [pendingDraftToLoad, handleSaveDraft, setters]
  )

  useEffect(() => {
    const updateCount = () => {
      const all = getSavedDrafts()
      setSavedDraftsCount(all.filter((d) => d.type === "sealed_unit").length)
    }
    updateCount()
    syncRemoteDrafts().catch(() => {})
    window.addEventListener(DRAFT_CHANGE_EVENT, updateCount)
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, updateCount)
  }, [])

  const handleResetWorkspace = () => {
    setLineItems([])
    setAttachedWindowQuote(null)
    setAttachedDoorQuote(null)
    setCustomerName("")
    setQuoteNumber(generateQuoteNumber())
    setQuoteNotes("")
    writeSessionAttachedInstallOption(null)
    writeSessionCustomOptions([])
    setShowResetModal(false)
    clearActiveAutoSave("sealed_unit")
    autoSave.clearTimerAndSaveSnapshot("")
    autoSave.setLastSavedAt(null)
    toast.success("Sealed Unit quote reset. Workspace is fresh and ready.")
  }

  return {
    quoteNumber, setQuoteNumber, generateQuoteNumber, customerName, setCustomerName,
    quoteNotes, setQuoteNotes, isSavedQuotesOpen, setIsSavedQuotesOpen,
    isAttachModalOpen, setIsAttachModalOpen, attachedWindowQuote, setAttachedWindowQuote,
    attachedDoorQuote, setAttachedDoorQuote, savedDraftsCount, lastSavedAt: autoSave.lastSavedAt,
    showResetModal, setShowResetModal, loadDraftIntoWorkspace, handleSaveDraft,
    handleResetWorkspace, showConflictModal, setShowConflictModal, pendingDraftToLoad,
    ...conflictHandlers,
  }
}
