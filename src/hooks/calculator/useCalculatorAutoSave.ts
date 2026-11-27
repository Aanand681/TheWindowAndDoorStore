"use client"

import { useMemo, useCallback } from "react"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import {
  useSessionOptionsHash,
  useUniversalAutoSave,
} from "@/hooks/shared/useUniversalAutoSave"

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
  customDiscount?: string
  customDiscountLabel?: string
  loyaltyDiscount?: string
  loyaltyDiscountLabel?: string
  discountType?: "none" | "custom" | "loyalty"
  loyaltyPoints?: number
  loyaltyGrossAmount?: number
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
    customDiscount = "",
    customDiscountLabel = "",
    loyaltyDiscount = "",
    loyaltyDiscountLabel = "",
    discountType = "none",
    loyaltyPoints = 0,
    loyaltyGrossAmount = 0,
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
  const optionsHash = useSessionOptionsHash("window")

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
      cd: customDiscount,
      cdl: customDiscountLabel,
      ld: loyaltyDiscount,
      ldl: loyaltyDiscountLabel,
      dt: discountType,
      lp: loyaltyPoints,
      lga: loyaltyGrossAmount,
      mats: taxTotals?.customMaterials || [],
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
    customDiscount,
    customDiscountLabel,
    loyaltyDiscount,
    loyaltyDiscountLabel,
    discountType,
    loyaltyPoints,
    loyaltyGrossAmount,
    taxTotals?.customMaterials,
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
      taxTotals,
      customDiscount,
      customDiscountLabel,
      loyaltyDiscount,
      loyaltyDiscountLabel,
      afterDiscount,
      total,
      attachedSealedUnit,
      attachedDoorQuote,
      effectiveJC,
      effectiveMisc,
      effectiveLabour,
      hstRate,
      isSupplyOnly,
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
        customDiscount,
        customDiscountLabel,
        loyaltyDiscount,
        loyaltyDiscountLabel,
        discountType,
        loyaltyPoints,
        loyaltyGrossAmount,
        customMaterials: taxTotals?.customMaterials || [],
        includeJCInPromo,
        includeMiscInPromo,
        includeLabourInPromo,
        hstRate,
        attachedUpgrade,
        attachedInstallOption: readSessionAttachedInstallOption("window"),
        customOptions: readSessionCustomOptions("window"),
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
    customDiscount,
    customDiscountLabel,
    loyaltyDiscount,
    loyaltyDiscountLabel,
    discountType,
    loyaltyPoints,
    loyaltyGrossAmount,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    attachedUpgrade,
    wantsUpgrade,
    taxTotals,
  ])

  const flushToServer = useCallback(() => {
    // Explicit saves to MongoDB are performed when user clicks "Save Draft".
    // Auto-save strictly maintains local crash recovery without cluttering the database.
  }, [])

  const customMaterials = taxTotals?.customMaterials
  const hasContent = useMemo(() => {
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
    return (
      validWindows.length > 0 ||
      hasValidAttachedQuote ||
      (Array.isArray(customMaterials) && customMaterials.length > 0) ||
      Boolean(customerName && customerName.trim())
    )
  }, [windows, attachedSealedUnit, attachedDoorQuote, customMaterials, customerName])

  const {
    lastSavedAt,
    setLastSavedAt,
    clearAutoSaveTimer,
    markFingerprintSaved,
  } = useUniversalAutoSave({
    quoteType: "window",
    enabled: enabled && !inReview,
    hasContent,
    fingerprint: inputFingerprint,
    buildPayload,
    debounceMs: 800,
  })

  return {
    lastSavedAt,
    setLastSavedAt,
    flushToServer,
    clearAutoSaveTimer,
    markFingerprintSaved,
  }
}
