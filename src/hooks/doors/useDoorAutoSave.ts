"use client"

import { useEffect, useRef, useCallback } from "react"
import { getActiveAutoSave } from "@/lib/quote-drafts-storage"
import {
  formatDoorSummarySentence,
  computeEffectiveDoorGrandTotal,
} from "@/lib/doors/calculations"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import {
  useSessionOptionsHash,
  useUniversalAutoSave,
} from "@/hooks/shared/useUniversalAutoSave"

interface UseDoorAutoSaveProps {
  customerName: string
  setCustomerName: (name: string) => void
  quoteNumber: string
  setQuoteNumber: (num: string) => void
  mode: any
  setMode: (mode: any) => void
  lineItems: any[]
  setLineItems: (items: any[]) => void
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
  hstRate?: number
  setHstRate?: (r: number) => void
  customLabour: string
  setCustomLabour: (l: string) => void
  customMisc: string
  setCustomMisc: (m: string) => void
  customDiscount?: string
  setCustomDiscount?: (d: string) => void
  customDiscountLabel?: string
  setCustomDiscountLabel?: (l: string) => void
  loyaltyDiscount?: string
  setLoyaltyDiscount?: (l: string) => void
  loyaltyDiscountLabel?: string
  setLoyaltyDiscountLabel?: (l: string) => void
  discountType?: "none" | "custom" | "loyalty"
  setDiscountType?: (t: "none" | "custom" | "loyalty") => void
  loyaltyPoints?: number
  setLoyaltyPoints?: (p: number) => void
  loyaltyGrossAmount?: number
  setLoyaltyGrossAmount?: (a: number) => void
  customMaterials?: any[]
  setCustomMaterials?: (m: any[]) => void
  attachedWindowQuote: any
  setAttachedWindowQuote: (q: any) => void
  attachedSealedUnit: any
  setAttachedSealedUnit: (u: any) => void
  totals: any
}

export function useDoorAutoSave({
  customerName,
  setCustomerName,
  quoteNumber,
  setQuoteNumber,
  mode,
  setMode,
  lineItems,
  setLineItems,
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
  hstRate,
  setHstRate,
  customLabour,
  setCustomLabour,
  customMisc,
  setCustomMisc,
  customDiscount = "",
  setCustomDiscount,
  customDiscountLabel = "",
  setCustomDiscountLabel,
  loyaltyDiscount = "",
  setLoyaltyDiscount,
  loyaltyDiscountLabel = "",
  setLoyaltyDiscountLabel,
  discountType = "none",
  setDiscountType,
  loyaltyPoints = 0,
  setLoyaltyPoints,
  loyaltyGrossAmount = 0,
  setLoyaltyGrossAmount,
  customMaterials = [],
  setCustomMaterials,
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  totals,
}: UseDoorAutoSaveProps) {
  const optionsHash = useSessionOptionsHash("door")
  const initialLoadDone = useRef(false)
  const restoreSettersRef = useRef({
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
    setHstRate,
    setIsFirstNation,
    setCustomLabour,
    setCustomMisc,
    setCustomDiscount,
    setCustomDiscountLabel,
    setLoyaltyDiscount,
    setLoyaltyDiscountLabel,
    setDiscountType,
    setLoyaltyPoints,
    setLoyaltyGrossAmount,
    setCustomMaterials,
    setAttachedWindowQuote,
    setAttachedSealedUnit,
  })
  useEffect(() => {
    restoreSettersRef.current = {
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
      setHstRate,
      setIsFirstNation,
      setCustomLabour,
      setCustomMisc,
      setCustomDiscount,
      setCustomDiscountLabel,
      setLoyaltyDiscount,
      setLoyaltyDiscountLabel,
      setDiscountType,
      setLoyaltyPoints,
      setLoyaltyGrossAmount,
      setCustomMaterials,
      setAttachedWindowQuote,
      setAttachedSealedUnit,
    }
  })

  const doorFingerprint = JSON.stringify({
    qn: quoteNumber,
    cn: customerName,
    m: mode,
    li: lineItems,
    up: globalUpcharges,
    r: selectedRegionId,
    tf: travelFeeType,
    ctf: customTravelFee,
    out: showOutTownTravel,
    km: travelKm,
    h: crewHours,
    s: crewSize,
    fn: isFirstNation,
    hst: hstRate,
    l: customLabour,
    misc: customMisc,
    cd: customDiscount,
    cdl: customDiscountLabel,
    ld: loyaltyDiscount,
    ldl: loyaltyDiscountLabel,
    dt: discountType,
    lp: loyaltyPoints,
    lga: loyaltyGrossAmount,
    mats: customMaterials,
    qnNotes: quoteNotes,
    opts: optionsHash,
  })

  const buildDoorPayload = useCallback(() => {
    const effectiveTotals = computeEffectiveDoorGrandTotal({
      totals,
      mode,
      customLabour,
      customMisc,
      customDiscount,
      customDiscountLabel,
      loyaltyDiscount,
      loyaltyDiscountLabel,
      hstRate,
      isFirstNation,
      attachedWindowQuote,
      attachedSealedUnit,
    })

    return {
      type: "door" as const,
      quoteNumber,
      customerName,
      itemCount: lineItems.length,
      grandTotal: effectiveTotals.grandTotal,
      summaryLabel: formatDoorSummarySentence(lineItems),
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
        hstRate,
        customLabour,
        customMisc,
        customDiscount,
        customDiscountLabel,
        loyaltyDiscount,
        loyaltyDiscountLabel,
        discountType,
        loyaltyPoints,
        loyaltyGrossAmount,
        customMaterials,
        attachedWindowQuote,
        attachedSealedUnit,
        attachedInstallOption: readSessionAttachedInstallOption("door"),
        customOptions: readSessionCustomOptions("door"),
        subtotal: effectiveTotals.combinedSubtotal,
        grandTotal: effectiveTotals.grandTotal,
        itemCount: lineItems.length,
        totals,
      },
    }
  }, [
    totals,
    mode,
    customLabour,
    customMisc,
    customDiscount,
    customDiscountLabel,
    loyaltyDiscount,
    loyaltyDiscountLabel,
    discountType,
    loyaltyPoints,
    loyaltyGrossAmount,
    customMaterials,
    hstRate,
    isFirstNation,
    attachedWindowQuote,
    attachedSealedUnit,
    quoteNumber,
    customerName,
    lineItems,
    quoteNotes,
    globalUpcharges,
    selectedRegionId,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
  ])

  const hasContent = !(
    lineItems.length === 0 &&
    customMaterials.length === 0 &&
    !attachedWindowQuote &&
    !attachedSealedUnit &&
    (!customerName || customerName === "Valued Customer")
  )

  const { lastSavedAt, setLastSavedAt } = useUniversalAutoSave({
    quoteType: "door",
    enabled: true,
    enabledRef: initialLoadDone,
    hasContent,
    fingerprint: doorFingerprint,
    buildPayload: buildDoorPayload,
    debounceMs: 700,
  })

  // Load Active Auto-save Draft on Mount (Skipped if a specific draft is requested via URL)
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const draftId = urlParams.get("loadDraftId")
      if (draftId) {
        // A specific draft is being loaded by useDoorDrafts; avoid restoring stale auto-save
        return
      }
    }

    const autoSave = getActiveAutoSave("door")
    if (autoSave && autoSave.data) {
      const d = autoSave.data as any
      const s = restoreSettersRef.current
      if (d.customerName) s.setCustomerName(d.customerName)
      if (d.quoteNumber) s.setQuoteNumber(d.quoteNumber)
      if (d.mode) s.setMode(d.mode)
      if (Array.isArray(d.lineItems)) s.setLineItems(d.lineItems)
      if (Array.isArray(d.globalUpcharges))
        s.setGlobalUpcharges(d.globalUpcharges)
      if (d.selectedRegionId && s.setSelectedRegionId)
        s.setSelectedRegionId(d.selectedRegionId)
      if (d.travelFeeType) s.setTravelFeeType(d.travelFeeType)
      if (d.customTravelFee !== undefined) s.setCustomTravelFee(d.customTravelFee)
      if (d.showOutTownTravel !== undefined)
        s.setShowOutTownTravel(d.showOutTownTravel)
      if (d.travelKm !== undefined) s.setTravelKm(d.travelKm)
      if (d.crewHours !== undefined) s.setCrewHours(d.crewHours)
      if (d.crewSize) s.setCrewSize(d.crewSize)
      if (d.quoteNotes !== undefined) s.setQuoteNotes(d.quoteNotes)
      if (d.hstRate !== undefined && s.setHstRate) {
        s.setHstRate(Number(d.hstRate))
        s.setIsFirstNation(Number(d.hstRate) === 8)
      } else if (d.isFirstNation !== undefined) {
        s.setIsFirstNation(d.isFirstNation)
      }
      if (d.customLabour !== undefined) s.setCustomLabour(String(d.customLabour))
      if (d.customMisc !== undefined) s.setCustomMisc(String(d.customMisc))
      if (d.customDiscount !== undefined)
        s.setCustomDiscount?.(String(d.customDiscount))
      if (d.customDiscountLabel !== undefined)
        s.setCustomDiscountLabel?.(d.customDiscountLabel || "")
      if (d.loyaltyDiscount !== undefined)
        s.setLoyaltyDiscount?.(String(d.loyaltyDiscount))
      if (d.loyaltyDiscountLabel !== undefined)
        s.setLoyaltyDiscountLabel?.(d.loyaltyDiscountLabel || "")
      if (d.discountType !== undefined)
        s.setDiscountType?.(d.discountType || "none")
      if (d.loyaltyPoints !== undefined)
        s.setLoyaltyPoints?.(Number(d.loyaltyPoints) || 0)
      if (d.loyaltyGrossAmount !== undefined)
        s.setLoyaltyGrossAmount?.(Number(d.loyaltyGrossAmount) || 0)
      const mats = Array.isArray(d.customMaterials)
        ? d.customMaterials
        : Array.isArray(d.totals?.customMaterials)
          ? d.totals.customMaterials
          : []
      if (mats.length > 0) s.setCustomMaterials?.(mats)
      if (d.attachedWindowQuote !== undefined)
        s.setAttachedWindowQuote(d.attachedWindowQuote)
      if (d.attachedSealedUnit !== undefined)
        s.setAttachedSealedUnit(d.attachedSealedUnit)
      if (autoSave.timestamp) {
        setLastSavedAt(
          new Date(autoSave.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        )
      }
    }
  }, [setLastSavedAt])

  return {
    lastSavedAt,
    setLastSavedAt,
  }
}
