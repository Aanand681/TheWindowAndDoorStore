"use client"

import { useRef, useEffect } from "react"
import { useCalculatorDrafts } from "@/hooks/calculator/useCalculatorDrafts"
import { useCalculatorAutoSave } from "@/hooks/calculator/useCalculatorAutoSave"
import { useWindowAttachedSync } from "@/hooks/calculator/attach/useWindowAttachedSync"

export function useCalculatorDraftsSync(p: {
  initialReviewQuoteId?: string
  reviewQuoteId?: string | null
  base: any
  windows: any[]
  setWindows: (w: any[]) => void
  pricing: any
  supply: any
}) {
  const {
    initialReviewQuoteId,
    reviewQuoteId,
    base,
    windows,
    setWindows,
    pricing,
    supply,
  } = p

  const clearAutoSaveTimerRef = useRef<() => void>(() => {})
  const setLastSavedAtRef = useRef<(time: string | null) => void>(() => {})

  const drafts = useCalculatorDrafts({
    initialReviewQuoteId,
    workspace: {
      quoteNumber: base.quoteNumber,
      setQuoteNumber: base.setQuoteNumber,
      customerName: base.customerName,
      setCustomerName: base.setCustomerName,
      quoteNotes: base.quoteNotes,
      setQuoteNotes: base.setQuoteNotes,
      surchargeRate: base.surchargeRate,
      setSurchargeRate: base.setSurchargeRate,
      windows,
      setWindows,
      activePromoId: pricing.activePromoId,
      setActivePromoId: pricing.setActivePromoId,
      isSupplyOnly: supply.isSupplyOnly,
      setIsSupplyOnly: supply.setIsSupplyOnly,
      supplyJambId: supply.supplyJambId,
      setSupplyJambId: supply.setSupplyJambId,
      supplyJambRate: supply.supplyJambRate,
      setSupplyJambRate: supply.setSupplyJambRate,
      supplyCasingId: supply.supplyCasingId,
      setSupplyCasingId: supply.setSupplyCasingId,
      supplyCasingRate: supply.supplyCasingRate,
      setSupplyCasingRate: supply.setSupplyCasingRate,
      customJC: pricing.customJC,
      setCustomJC: pricing.setCustomJC,
      customMisc: pricing.customMisc,
      setCustomMisc: pricing.setCustomMisc,
      customLabour: pricing.customLabour,
      setCustomLabour: pricing.setCustomLabour,
      customDiscount: pricing.customDiscount,
      setCustomDiscount: pricing.setCustomDiscount,
      customDiscountLabel: pricing.customDiscountLabel,
      setCustomDiscountLabel: pricing.setCustomDiscountLabel,
      loyaltyDiscount: pricing.loyaltyDiscount,
      setLoyaltyDiscount: pricing.setLoyaltyDiscount,
      loyaltyDiscountLabel: pricing.loyaltyDiscountLabel,
      setLoyaltyDiscountLabel: pricing.setLoyaltyDiscountLabel,
      discountType: pricing.discountType,
      setDiscountType: pricing.setDiscountType,
      loyaltyPoints: pricing.loyaltyPoints,
      setLoyaltyPoints: pricing.setLoyaltyPoints,
      loyaltyGrossAmount: pricing.loyaltyGrossAmount,
      setLoyaltyGrossAmount: pricing.setLoyaltyGrossAmount,
      includeJCInPromo: pricing.includeJCInPromo,
      setIncludeJCInPromo: pricing.setIncludeJCInPromo,
      includeMiscInPromo: pricing.includeMiscInPromo,
      setIncludeMiscInPromo: pricing.setIncludeMiscInPromo,
      includeLabourInPromo: pricing.includeLabourInPromo,
      setIncludeLabourInPromo: pricing.setIncludeLabourInPromo,
      hstRate: pricing.hstRate,
      setHstRate: pricing.setHstRate,
      attachedUpgrade: base.attachedUpgrade,
      setAttachedUpgrade: base.setAttachedUpgrade,
      attachedSealedUnit: base.attachedSealedUnit,
      setAttachedSealedUnit: base.setAttachedSealedUnit,
      attachedDoorQuote: base.attachedDoorQuote,
      setAttachedDoorQuote: base.setAttachedDoorQuote,
      wantsUpgrade: pricing.wantsUpgrade,
      setWantsUpgrade: pricing.setWantsUpgrade,
      taxTotals: pricing.taxTotals,
      setTaxTotals: pricing.setTaxTotals,
    },
    financials: {
      quoteResult: pricing.quoteResult,
      effectiveMisc: pricing.effectiveMisc,
      effectiveLabour: pricing.effectiveLabour,
      effectiveJC: pricing.effectiveJC,
      afterDiscount: pricing.afterDiscount,
      total: pricing.total,
    },
    clearAutoSaveTimer: () => clearAutoSaveTimerRef.current(),
    setLastSavedAt: (time) => setLastSavedAtRef.current(time),
  })

  const autoSave = useCalculatorAutoSave({
    initialReviewQuoteId,
    reviewQuoteId,
    windows,
    customerName: base.customerName,
    quoteNumber: base.quoteNumber,
    quoteNotes: base.quoteNotes,
    surchargeRate: base.surchargeRate,
    activePromoId: pricing.activePromoId,
    isSupplyOnly: supply.isSupplyOnly,
    supplyJambId: supply.supplyJambId,
    supplyJambRate: supply.supplyJambRate,
    supplyCasingId: supply.supplyCasingId,
    supplyCasingRate: supply.supplyCasingRate,
    customJC: pricing.customJC,
    customMisc: pricing.customMisc,
    customLabour: pricing.customLabour,
    customDiscount: pricing.customDiscount,
    customDiscountLabel: pricing.customDiscountLabel,
    loyaltyDiscount: pricing.loyaltyDiscount,
    loyaltyDiscountLabel: pricing.loyaltyDiscountLabel,
    discountType: pricing.discountType,
    loyaltyPoints: pricing.loyaltyPoints,
    loyaltyGrossAmount: pricing.loyaltyGrossAmount,
    includeJCInPromo: pricing.includeJCInPromo,
    includeMiscInPromo: pricing.includeMiscInPromo,
    includeLabourInPromo: pricing.includeLabourInPromo,
    hstRate: pricing.hstRate,
    attachedUpgrade: base.attachedUpgrade,
    attachedSealedUnit: base.attachedSealedUnit,
    attachedDoorQuote: base.attachedDoorQuote,
    wantsUpgrade: pricing.wantsUpgrade,
    quoteResult: pricing.quoteResult,
    effectiveMisc: pricing.effectiveMisc,
    effectiveLabour: pricing.effectiveLabour,
    effectiveJC: pricing.effectiveJC,
    afterDiscount: pricing.afterDiscount,
    total: pricing.total,
    taxTotals: pricing.taxTotals,
    enabled: drafts.initialLoadDone,
  })

  useEffect(() => {
    clearAutoSaveTimerRef.current = autoSave.clearAutoSaveTimer
    setLastSavedAtRef.current = autoSave.setLastSavedAt
  })

  // Auto-sync attached child quotes (doors & sealed units) when edited in other tabs
  useWindowAttachedSync({
    attachedDoorQuote: base.attachedDoorQuote,
    setAttachedDoorQuote: base.setAttachedDoorQuote,
    attachedSealedUnit: base.attachedSealedUnit,
    setAttachedSealedUnit: base.setAttachedSealedUnit,
    enabled: drafts.initialLoadDone && !reviewQuoteId,
  })

  return {
    drafts: {
      ...drafts,
      lastSavedAt: autoSave.lastSavedAt,
      flushDraftToServer: autoSave.flushToServer,
    },
  }
}
