"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { toast } from "sonner"
import {
  clearActiveAutoSave,
  isWorkspaceDirtyOrUnsaved,
  QuoteDraftItem,
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
import { executeSaveSealedUnitDraft } from "./sealed-units-draft-saver"
import { useUniversalWorkspaceDrafts } from "@/hooks/shared/useUniversalWorkspaceDrafts"

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
  customMaterials?: any[]
  loyaltyDiscount?: string
  loyaltyDiscountLabel?: string
  discountType?: "none" | "custom" | "loyalty"
  loyaltyPoints?: number
  loyaltyGrossAmount?: number
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
  setCustomMaterials?: (val: any[]) => void
  setLoyaltyDiscount?: (val: string) => void
  setLoyaltyDiscountLabel?: (val: string) => void
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  setLoyaltyPoints?: (val: number) => void
  setLoyaltyGrossAmount?: (val: number) => void
  resetTravelAndMode?: () => void
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

  const generateQuoteNumber = () => Math.floor(100000 + Math.random() * 900000).toString()

  const [quoteNumber, setQuoteNumber] = useState<string>("")
  const [customerName, setCustomerName] = useState<string>("")
  const [quoteNotes, setQuoteNotes] = useState<string>("")
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false)
  const [attachedWindowQuote, setAttachedWindowQuote] = useState<any | null>(null)
  const [attachedDoorQuote, setAttachedDoorQuote] = useState<any | null>(null)

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
      customMaterials: (formInputs as any)?.customMaterials || [],
      loyaltyDiscount: formInputs.loyaltyDiscount || "",
      loyaltyDiscountLabel: formInputs.loyaltyDiscountLabel || "",
      discountType: formInputs.discountType || "none",
      loyaltyPoints: formInputs.loyaltyPoints || 0,
      loyaltyGrossAmount: formInputs.loyaltyGrossAmount || 0,
      hstRate, selectedRegionId: selectedRegionId || "", regionName: regionName || "",
      attachedWindowQuote, attachedDoorQuote,
    }),
    [
      quoteNumber, customerName, lineItems, sealedUnitMode, isInstallation,
      serviceSqftInput, serviceLabourRateInput, serviceMiscRateInput, travelFeeType,
      customTravelFee, showOutTownTravel, travelKm, crewHours, crewSize,
      extraLabour, hstRate, selectedRegionId, regionName, attachedWindowQuote, attachedDoorQuote, formInputs,
    ]
  )

  const isCurrentWorkspaceDirty = useCallback(() => {
    return isWorkspaceDirtyOrUnsaved("sealed_unit", {
      quoteNumber, customerName, itemCount: lineItems.length, grandTotal: totals.grandTotal,
      data: { lineItems, attachedWindowQuote, attachedDoorQuote },
    })
  }, [quoteNumber, customerName, lineItems.length, totals.grandTotal, attachedWindowQuote, attachedDoorQuote])

  const applyDraftToWorkspace = useCallback(
    (draft: QuoteDraftItem) => {
      const d = draft.data as any
      if (!d) return
      applyDraftDataToWorkspace(d, setters)
    },
    [setters]
  )

  const autoSaveRef = useRef<{ clearTimerAndSaveSnapshot: (snap: string) => void } | null>(null)

  const handleSaveDraft = useCallback(
    () => executeSaveSealedUnitDraft({
      lineItems, isServiceOnly, totals, serviceSqftInput, attachedWindowQuote,
      attachedDoorQuote, customerName, quoteNumber, setQuoteNumber, generateQuoteNumber,
      quoteNotes, currentSnapshotParams,
      clearTimerAndSaveSnapshot: (snap: string) => autoSaveRef.current?.clearTimerAndSaveSnapshot(snap),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lineItems, isServiceOnly, totals, serviceSqftInput, attachedWindowQuote, attachedDoorQuote, customerName, quoteNumber, quoteNotes, currentSnapshotParams]
  )

  const universalDrafts = useUniversalWorkspaceDrafts({
    quoteType: "sealed_unit",
    quoteTypeLabel: "Sealed Unit",
    isCurrentWorkspaceDirty,
    applyDraftToWorkspace,
    handleSaveDraft,
  })

  const autoSave = useSealedUnitsAutoSave({
    currentSnapshotParams, quoteNotes, totals, lineItems, isServiceOnly,
    serviceSqftInput, attachedWindowQuote, attachedDoorQuote, setters,
    loadDraftIntoWorkspace: universalDrafts.handleLoadQuoteFromDrafts,
    onConflictDetected: (match) => {
      universalDrafts.setPendingDraftToLoad(match)
      universalDrafts.setShowConflictModal(true)
    },
  })

  useEffect(() => {
    autoSaveRef.current = autoSave
  })

  const handleResetWorkspace = () => {
    setLineItems([])
    if (formSetters.resetTravelAndMode) {
      formSetters.resetTravelAndMode()
    } else {
      formSetters.setSealedUnitMode("installation")
      formSetters.setServiceSqftInput("")
      formSetters.setServiceLabourRateInput("")
      formSetters.setServiceMiscRateInput("")
      formSetters.setTravelFeeType("local_std")
      formSetters.setCustomTravelFee("")
      formSetters.setShowOutTownTravel(false)
      formSetters.setTravelKm("")
      formSetters.setCrewHours("")
      formSetters.setCrewSize("3")
      formSetters.setExtraLabour?.("")
      formSetters.setGlobalUpcharges?.([])
      formSetters.setCustomMaterials?.([])
      formSetters.setLoyaltyDiscount?.("")
      formSetters.setLoyaltyDiscountLabel?.("")
      formSetters.setDiscountType?.("none")
      formSetters.setLoyaltyPoints?.(0)
      formSetters.setLoyaltyGrossAmount?.(0)
      formSetters.setHstRate(13)
    }
    setAttachedWindowQuote(null)
    setAttachedDoorQuote(null)
    setCustomerName("")
    setQuoteNumber(generateQuoteNumber())
    setQuoteNotes("")
    writeSessionAttachedInstallOption(null)
    writeSessionCustomOptions([])
    universalDrafts.setShowResetModal(false)
    clearActiveAutoSave("sealed_unit")
    autoSave.clearTimerAndSaveSnapshot("")
    autoSave.setLastSavedAt(null)
    toast.success("Sealed Unit quote reset. Workspace is fresh and ready.")
  }

  return {
    quoteNumber, setQuoteNumber, generateQuoteNumber, customerName, setCustomerName,
    quoteNotes, setQuoteNotes, isAttachModalOpen, setIsAttachModalOpen,
    attachedWindowQuote, setAttachedWindowQuote, attachedDoorQuote, setAttachedDoorQuote,
    lastSavedAt: autoSave.lastSavedAt,
    handleSaveDraft, handleResetWorkspace,
    loadDraftIntoWorkspace: universalDrafts.handleLoadQuoteFromDrafts,
    ...universalDrafts,
  }
}
