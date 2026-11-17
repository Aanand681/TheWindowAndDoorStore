"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import {
  saveActiveAutoSave,
  clearActiveAutoSave,
} from "@/lib/quote-drafts-storage"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
  CUSTOM_OPTIONS_CHANGE_EVENT,
  ATTACHED_INSTALL_CHANGE_EVENT,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface UseCalculatorAutoSaveParams {
  initialReviewQuoteId?: string | null
  reviewQuoteId?: string | null
  isReviewMode?: boolean
  windows: any[]
  customerName: string
  quoteNumber: string
  quoteNotes: string
  surchargeRate: number
  activePromoId: string
  isSupplyOnly: boolean
  supplyJambId: string
  supplyJambRate: string
  supplyCasingId: string
  supplyCasingRate: string
  customJC: string
  customMisc: string
  customLabour: string
  includeJCInPromo: boolean
  includeMiscInPromo: boolean
  includeLabourInPromo: boolean
  hstRate: number
  attachedUpgrade?: any
  attachedSealedUnit?: any
  attachedDoorQuote?: any
  wantsUpgrade?: boolean
  quoteResult?: any
  effectiveMisc: number
  effectiveLabour: number
  effectiveJC: number
  afterDiscount: number
  total: number
  taxTotals?: any
  enabled?: boolean
}

export function useCalculatorAutoSave(params: UseCalculatorAutoSaveParams) {
  const {
    initialReviewQuoteId,
    reviewQuoteId,
    isReviewMode,
    windows,
    customerName,
    quoteNumber,
    quoteNotes,
    surchargeRate,
    activePromoId,
    isSupplyOnly,
    supplyJambId,
    supplyJambRate,
    supplyCasingId,
    supplyCasingRate,
    customJC,
    customMisc,
    customLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    hstRate,
    attachedUpgrade,
    attachedSealedUnit,
    attachedDoorQuote,
    wantsUpgrade,
    quoteResult,
    effectiveMisc,
    effectiveLabour,
    effectiveJC,
    afterDiscount,
    total,
    taxTotals,
    enabled = true,
  } = params

  const inReview = Boolean(
    isReviewMode || reviewQuoteId || initialReviewQuoteId
  )

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [optionsHash, setOptionsHash] = useState(() =>
    JSON.stringify({
      c: readSessionCustomOptions(),
      a: readSessionAttachedInstallOption(),
    })
  )
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedFingerprintRef = useRef<string | null>(null)
  const currentPayloadRef = useRef<any>(null)

  useEffect(() => {
    const updateHash = () => {
      setOptionsHash(
        JSON.stringify({
          c: readSessionCustomOptions(),
          a: readSessionAttachedInstallOption(),
        })
      )
    }
    window.addEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, updateHash)
    window.addEventListener(ATTACHED_INSTALL_CHANGE_EVENT, updateHash)
    window.addEventListener("storage", updateHash)
    return () => {
      window.removeEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, updateHash)
      window.removeEventListener(ATTACHED_INSTALL_CHANGE_EVENT, updateHash)
      window.removeEventListener("storage", updateHash)
    }
  }, [])

  // Compute a deterministic fingerprint of user inputs to avoid re-arming auto-save
  // on ephemeral re-renders or internal calculation reference updates
  const inputFingerprint = useMemo(() => {
    return JSON.stringify({
      w: windows.map((w: any) => ({
        w: w.w,
        h: w.h,
        b: w.base,
        q: w.qty,
        t: w.triple,
        c: w.color,
        j: w.jamb,
        cas: w.casing,
        g: w.grill,
      })),
      cn: (customerName || "").trim(),
      qn: (quoteNumber || "").trim(),
      nt: (quoteNotes || "").trim(),
      sr: surchargeRate,
      p: activePromoId,
      so: Boolean(isSupplyOnly),
      sj: supplyJambId,
      sjr: supplyJambRate,
      sc: supplyCasingId,
      scr: supplyCasingRate,
      cjc: customJC,
      cm: customMisc,
      cl: customLabour,
      ij: includeJCInPromo,
      im: includeMiscInPromo,
      il: includeLabourInPromo,
      hst: hstRate,
      upg: attachedUpgrade?.title,
      wu: Boolean(wantsUpgrade),
      su: attachedSealedUnit
        ? `${attachedSealedUnit.quoteNumber || ""}-${attachedSealedUnit.totals?.grandTotal || ""}`
        : null,
      dr: attachedDoorQuote
        ? `${attachedDoorQuote.quoteNumber || ""}-${attachedDoorQuote.totals?.grandTotal || ""}`
        : null,
      opts: optionsHash,
    })
  }, [
    windows,
    customerName,
    quoteNumber,
    quoteNotes,
    surchargeRate,
    activePromoId,
    isSupplyOnly,
    supplyJambId,
    supplyJambRate,
    supplyCasingId,
    supplyCasingRate,
    customJC,
    customMisc,
    customLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    hstRate,
    attachedUpgrade,
    wantsUpgrade,
    attachedSealedUnit,
    attachedDoorQuote,
    optionsHash,
  ])

  const buildPayload = useCallback(() => {
    const validWindows = windows.filter(
      (w) =>
        (w.base && parseFloat(w.base) > 0) ||
        (w.w && w.w.trim() !== "") ||
        (w.h && w.h.trim() !== "")
    )
    const financials = computeCombinedQuoteFinancials({
      quoteResult,
      afterDiscount,
      total,
      attachedSealedUnit,
      attachedDoorQuote,
      effectiveJC,
      effectiveMisc,
      effectiveLabour,
      hstRate,
    })

    return {
      type: "window" as const,
      quoteNumber: quoteNumber || "Draft",
      customerName: customerName || "",
      itemCount: validWindows.length,
      grandTotal: financials.grandTotalDollars,
      summaryLabel: formatWindowSummarySentence(validWindows),
      data: {
        quoteNumber,
        customerName,
        quoteNotes,
        surchargeRate,
        windows,
        activePromoId,
        isSupplyOnly,
        supplyJambId,
        supplyJambRate,
        supplyCasingId,
        supplyCasingRate,
        customJC: customJC !== "" ? parseFloat(customJC) : undefined,
        customMisc: customMisc !== "" ? parseFloat(customMisc) : undefined,
        customLabour:
          customLabour !== "" ? parseFloat(customLabour) : undefined,
        includeJCInPromo,
        includeMiscInPromo,
        includeLabourInPromo,
        hstRate,
        attachedUpgrade,
        attachedInstallOption: readSessionAttachedInstallOption(),
        customOptions: readSessionCustomOptions(),
        selectedRegionId: taxTotals?.selectedRegionId,
        regionName: taxTotals?.regionName,
        attachedSealedUnit,
        attachedDoorQuote,
        wantsUpgrade,
        effectiveBase: (quoteResult?.base || 0) / 100,
        effectiveSurcharge: (quoteResult?.surcharge || 0) / 100,
        effectiveLabour: effectiveLabour / 100,
        effectiveMisc: effectiveMisc / 100,
        effectiveJC: effectiveJC / 100,
        taxTotals,
        quoteResult,
        subtotal: financials.subtotalDollars,
        grandTotal: financials.grandTotalDollars,
        itemCount: windows.length,
      },
    }
  }, [
    windows,
    quoteResult,
    afterDiscount,
    total,
    attachedSealedUnit,
    attachedDoorQuote,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    hstRate,
    quoteNumber,
    customerName,
    quoteNotes,
    surchargeRate,
    activePromoId,
    isSupplyOnly,
    supplyJambId,
    supplyJambRate,
    supplyCasingId,
    supplyCasingRate,
    customJC,
    customMisc,
    customLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    attachedUpgrade,
    wantsUpgrade,
    taxTotals,
    optionsHash,
  ])

  useEffect(() => {
    currentPayloadRef.current = buildPayload()
  }, [buildPayload])

  const flushToServer = useCallback(() => {
    // Explicit saves to MongoDB are performed when user clicks "Save Draft".
    // Auto-save strictly maintains local crash recovery without cluttering the database.
  }, [])

  useEffect(() => {
    if (!enabled || inReview) return

    const validWindows = windows.filter(
      (w) =>
        (w.base && parseFloat(w.base) > 0) ||
        (w.w && w.w.trim() !== "") ||
        (w.h && w.h.trim() !== "")
    )
    const hasValidAttachedQuote = Boolean(
      (attachedSealedUnit &&
        ((attachedSealedUnit.itemCount || 0) > 0 ||
          (attachedSealedUnit.totals?.grandTotal || 0) > 0)) ||
      (attachedDoorQuote &&
        ((attachedDoorQuote.itemCount || 0) > 0 ||
          (attachedDoorQuote.totals?.grandTotal || 0) > 0))
    )
    const hasContent =
      validWindows.length > 0 ||
      hasValidAttachedQuote ||
      Boolean(customerName && customerName.trim())

    if (!hasContent) {
      clearActiveAutoSave("window")
      lastSavedFingerprintRef.current = null
      return
    }

    // Skip if user inputs haven't actually changed since the last auto-save
    if (lastSavedFingerprintRef.current === inputFingerprint) {
      return
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Local Storage debounced at 800ms for instant crash recovery (clean & offline)
    autoSaveTimerRef.current = setTimeout(() => {
      const payload = buildPayload()
      saveActiveAutoSave("window", payload)
      lastSavedFingerprintRef.current = inputFingerprint
      setLastSavedAt(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    }, 800)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [
    enabled,
    inReview,
    inputFingerprint,
    windows,
    customerName,
    attachedSealedUnit,
    attachedDoorQuote,
    buildPayload,
  ])

  return {
    lastSavedAt,
    setLastSavedAt,
    flushToServer,
    clearAutoSaveTimer: () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
    },
    markFingerprintSaved: (newFingerprint?: string) => {
      lastSavedFingerprintRef.current = newFingerprint || inputFingerprint
    },
  }
}
