"use client"

import { useState, useEffect } from "react"
import {
  saveQuoteDraft,
  getSavedDrafts,
  clearActiveAutoSave,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
} from "@/lib/quote-drafts-storage"
import {
  formatDoorSummarySentence,
  computeEffectiveDoorGrandTotal,
} from "@/lib/doors/calculations"
import { toast } from "sonner"

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
  const [savedDraftsCount, setSavedDraftsCount] = useState<number>(0)
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState<boolean>(false)
  const [showResetModal, setShowResetModal] = useState<boolean>(false)

  const updateSavedCount = () => {
    const all = getSavedDrafts()
    setSavedDraftsCount(all.filter((d) => d.type === "door").length)
  }

  useEffect(() => {
    updateSavedCount()
    window.addEventListener(DRAFT_CHANGE_EVENT, updateSavedCount)
    return () =>
      window.removeEventListener(DRAFT_CHANGE_EVENT, updateSavedCount)
  }, [])

  const handleExplicitSaveDraft = () => {
    try {
      if (!customerName.trim()) {
        toast.error("Customer name is required before saving a draft.")
        return
      }

      if (!quoteNumber.trim()) {
        toast.error("Quote number is required before saving a draft.")
        return
      }

      if (
        lineItems.length === 0 &&
        !attachedWindowQuote &&
        !attachedSealedUnit
      ) {
        toast.error(
          "Please configure and add at least one door unit before saving a draft."
        )
        return
      }

      const summaryLabel = formatDoorSummarySentence(lineItems)
      const effectiveTotals = computeEffectiveDoorGrandTotal({
        totals,
        mode,
        customLabour,
        customMisc,
        isFirstNation,
        attachedWindowQuote,
        attachedSealedUnit,
      })

      saveQuoteDraft({
        type: "door",
        quoteNumber,
        customerName,
        itemCount: lineItems.length,
        subtotal: effectiveTotals.combinedSubtotal,
        grandTotal: effectiveTotals.grandTotal,
        summaryLabel,
        data: {
          quoteNumber,
          customerName,
          quoteNotes,
          mode,
          lineItems,
          globalUpcharges,
          selectedRegionId: selectedRegionId || "",
          travelFeeType,
          customTravelFee,
          showOutTownTravel,
          travelKm,
          crewHours,
          crewSize,
          isFirstNation,
          customLabour,
          customMisc,
          attachedWindowQuote,
          attachedSealedUnit,
          subtotal: effectiveTotals.combinedSubtotal,
          grandTotal: effectiveTotals.grandTotal,
          itemCount: lineItems.length,
          totals,
        },
      })
      updateSavedCount()
      const nowStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      setLastSavedAt(nowStr)
      toast.success(`Door quote draft #${quoteNumber} saved to Saved Quotes!`)
    } catch {
      toast.error("Failed to save draft")
    }
  }

  const handleLoadQuoteFromDrafts = (draft: QuoteDraftItem) => {
    if (draft.type !== "door") {
      toast.info(
        `Selected a ${draft.type} draft. Switch to that calculator to open it.`
      )
      return
    }

    const d = draft.data as any
    if (d.customerName) setCustomerName(d.customerName)
    if (d.quoteNumber) setQuoteNumber(d.quoteNumber)
    if (d.mode) setMode(d.mode)
    if (Array.isArray(d.lineItems)) setLineItems(d.lineItems)
    if (Array.isArray(d.globalUpcharges)) setGlobalUpcharges(d.globalUpcharges)
    if (d.selectedRegionId && setSelectedRegionId)
      setSelectedRegionId(d.selectedRegionId)
    if (d.travelFeeType) setTravelFeeType(d.travelFeeType)
    if (d.customTravelFee !== undefined) setCustomTravelFee(d.customTravelFee)
    if (d.showOutTownTravel !== undefined)
      setShowOutTownTravel(d.showOutTownTravel)
    if (d.travelKm !== undefined) setTravelKm(d.travelKm)
    if (d.crewHours !== undefined) setCrewHours(d.crewHours)
    if (d.crewSize) setCrewSize(d.crewSize)
    if (d.quoteNotes !== undefined) setQuoteNotes(d.quoteNotes)
    if (d.isFirstNation !== undefined) setIsFirstNation(d.isFirstNation)
    if (d.customLabour !== undefined) setCustomLabour(String(d.customLabour))
    else setCustomLabour("")
    if (d.customMisc !== undefined) setCustomMisc(String(d.customMisc))
    else setCustomMisc("")
    if (d.attachedWindowQuote !== undefined)
      setAttachedWindowQuote(d.attachedWindowQuote)
    else setAttachedWindowQuote(null)
    if (d.attachedSealedUnit !== undefined)
      setAttachedSealedUnit(d.attachedSealedUnit)
    else setAttachedSealedUnit(null)

    setIsSavedQuotesOpen(false)
    toast.success(`Loaded Door Quote #${draft.quoteNumber}`)
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
    handleExplicitSaveDraft,
    handleLoadQuoteFromDrafts,
    handleConfirmReset,
  }
}
