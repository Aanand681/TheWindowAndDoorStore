"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  saveActiveAutoSave,
  getActiveAutoSave,
  clearActiveAutoSave,
  flushAutoSaveDraftToServer,
} from "@/lib/quote-drafts-storage"
import {
  formatDoorSummarySentence,
  computeEffectiveDoorGrandTotal,
} from "@/lib/doors/calculations"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

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
  customLabour: string
  setCustomLabour: (l: string) => void
  customMisc: string
  setCustomMisc: (m: string) => void
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
  customLabour,
  setCustomLabour,
  customMisc,
  setCustomMisc,
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  totals,
}: UseDoorAutoSaveProps) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const initialLoadDone = useRef(false)
  const serverSyncTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastServerSyncFingerprintRef = useRef<string | null>(null)
  const currentPayloadRef = useRef<any>(null)

  // Load Active Auto-save Draft on Mount
  useEffect(() => {
    const autoSave = getActiveAutoSave("door")
    if (autoSave && autoSave.data) {
      const d = autoSave.data as any
      if (d.customerName) setCustomerName(d.customerName)
      if (d.quoteNumber) setQuoteNumber(d.quoteNumber)
      if (d.mode) setMode(d.mode)
      if (Array.isArray(d.lineItems)) setLineItems(d.lineItems)
      if (Array.isArray(d.globalUpcharges))
        setGlobalUpcharges(d.globalUpcharges)
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
      if (d.customMisc !== undefined) setCustomMisc(String(d.customMisc))
      if (d.attachedWindowQuote !== undefined)
        setAttachedWindowQuote(d.attachedWindowQuote)
      if (d.attachedSealedUnit !== undefined)
        setAttachedSealedUnit(d.attachedSealedUnit)
      if (autoSave.timestamp) {
        setLastSavedAt(
          new Date(autoSave.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        )
      }
    }
    initialLoadDone.current = true
  }, [])

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
    l: customLabour,
    misc: customMisc,
    qnNotes: quoteNotes,
  })

  const buildDoorPayload = useCallback(() => {
    const effectiveTotals = computeEffectiveDoorGrandTotal({
      totals,
      mode,
      customLabour,
      customMisc,
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
        customLabour,
        customMisc,
        attachedWindowQuote,
        attachedSealedUnit,
        attachedInstallOption: readSessionAttachedInstallOption(),
        customOptions: readSessionCustomOptions(),
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

  useEffect(() => {
    currentPayloadRef.current = buildDoorPayload()
  }, [buildDoorPayload])

  const flushDoorToServer = useCallback(() => {
    if (!currentPayloadRef.current) return
    const payload = currentPayloadRef.current
    if (payload.itemCount === 0 && (!payload.customerName || payload.customerName === "Valued Customer")) return

    flushAutoSaveDraftToServer(payload)
    lastServerSyncFingerprintRef.current = doorFingerprint
  }, [doorFingerprint])

  // Boundary Flush on tab switch and window close
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        lastServerSyncFingerprintRef.current !== doorFingerprint
      ) {
        flushDoorToServer()
      }
    }

    const handlePageHide = () => {
      if (lastServerSyncFingerprintRef.current !== doorFingerprint) {
        flushDoorToServer()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [doorFingerprint, flushDoorToServer])

  useEffect(() => {
    if (!initialLoadDone.current) {
      return
    }

    if (
      lineItems.length === 0 &&
      !attachedWindowQuote &&
      !attachedSealedUnit &&
      (!customerName || customerName === "Valued Customer")
    ) {
      clearActiveAutoSave("door")
      lastServerSyncFingerprintRef.current = null
      return
    }

    const timer = setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      const payload = buildDoorPayload()
      saveActiveAutoSave("door", payload)
      setLastSavedAt(nowStr)
    }, 700)

    if (serverSyncTimerRef.current) {
      clearTimeout(serverSyncTimerRef.current)
    }
    serverSyncTimerRef.current = setTimeout(() => {
      if (lastServerSyncFingerprintRef.current !== doorFingerprint) {
        flushDoorToServer()
      }
    }, 6000)

    return () => {
      clearTimeout(timer)
      if (serverSyncTimerRef.current) {
        clearTimeout(serverSyncTimerRef.current)
      }
    }
  }, [
    doorFingerprint,
    lineItems.length,
    attachedWindowQuote,
    attachedSealedUnit,
    customerName,
    buildDoorPayload,
    flushDoorToServer,
  ])

  return {
    lastSavedAt,
    setLastSavedAt,
  }
}
