"use client"

import React from "react"
import { toast } from "sonner"
import { generateId } from "@/hooks/useCalculatorWindows"
import { useCalculatorComparison } from "@/hooks/calculator/useCalculatorComparison"
import { useCalculatorReviewActions } from "@/hooks/useCalculatorReviewActions"
import { clearAllQuoteSessionState } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"

export function useCalculatorWorkflows(p: {
  base: any
  windowsContext: any
  pricing: any
  supply: any
  drafts: any
  originSubTab?: string
}) {
  const { base, windowsContext, pricing, supply, drafts, originSubTab } = p
  const { windows, setWindows, fileInputRef } = windowsContext

  const comparison = useCalculatorComparison({
    windows,
    setWindows,
    surchargeRate: base.surchargeRate,
    setSurchargeRate: base.setSurchargeRate,
    isSupplyOnly: supply.isSupplyOnly,
    setIsSupplyOnly: supply.handleToggleSupplyOnly,
    supplyJambId: supply.supplyJambId,
    setSupplyJambId: supply.setSupplyJambId,
    supplyJambName: supply.supplyJambName,
    setSupplyJambName: supply.setSupplyJambName,
    supplyJambRate: supply.supplyJambRate,
    setSupplyJambRate: supply.setSupplyJambRate,
    supplyCasingId: supply.supplyCasingId,
    setSupplyCasingId: supply.setSupplyCasingId,
    supplyCasingName: supply.supplyCasingName,
    setSupplyCasingName: supply.setSupplyCasingName,
    supplyCasingRate: supply.supplyCasingRate,
    setSupplyCasingRate: supply.setSupplyCasingRate,
    taxTotals: pricing.taxTotals,
    setTaxTotals: pricing.setTaxTotals,
    customJC: pricing.customJC,
    setCustomJC: pricing.setCustomJC,
    customMisc: pricing.customMisc,
    setCustomMisc: pricing.setCustomMisc,
    customLabour: pricing.customLabour,
    setCustomLabour: pricing.setCustomLabour,
    activePromoId: pricing.activePromoId,
    setActivePromoId: pricing.setActivePromoId,
    setLockedPromoId: pricing.setLockedPromoId,
    hstRate: pricing.hstRate,
    setHstRate: pricing.setHstRate,
    customerName: base.customerName,
    setCustomerName: base.setCustomerName,
    quoteNumber: base.quoteNumber,
    setQuoteNumber: base.setQuoteNumber,
    quoteResult: pricing.quoteResult,
    afterDiscount: pricing.afterDiscount,
    total: pricing.total,
    firstPayment: pricing.firstPayment,
    secondPayment: pricing.secondPayment,
  })

  const resetCalculatorDefaults = () => {
    setWindows([
      {
        id: generateId(),
        qty: "1",
        base: "",
        argon: "",
        solar: "",
        triple: "",
        w: "",
        h: "",
        color: "White",
      },
    ])
    base.setCustomerName("")
    base.setQuoteNumber("")
    base.setQuoteNotes("")
    base.setSurchargeRate(8)
    supply.resetSupplyMode()
    comparison.setAppliedOption("A")
    comparison.setBaseWindowsA(null)
    base.setAttachedUpgrade(null)
    base.setAttachedSealedUnit(null)
    base.setAttachedDoorQuote(null)
    comparison.setIsComparisonStaging(false)
    comparison.setBaseSnapshotA(null)
    pricing.resetPricingOverrides()
    drafts?.resetDraftState?.()
    clearAllQuoteSessionState()
  }

  const handleConfirmReset = () => {
    resetCalculatorDefaults()
    base.setShowResetModal(false)
    toast.success("Window quote reset. Workspace is fresh and ready.")
  }

  const effectiveTotalCents = React.useMemo(() => {
    if (!base.attachedDoorQuote && !base.attachedSealedUnit) {
      return pricing.total
    }
    const combined = computeCombinedQuoteFinancials({
      quoteResult: pricing.quoteResult,
      taxTotals: pricing.taxTotals,
      customDiscount: pricing.customDiscount,
      customDiscountLabel: pricing.customDiscountLabel,
      loyaltyDiscount: pricing.loyaltyDiscount,
      loyaltyDiscountLabel: pricing.loyaltyDiscountLabel,
      total: pricing.total,
      afterDiscount: pricing.afterDiscount,
      attachedSealedUnit: base.attachedSealedUnit,
      attachedDoorQuote: base.attachedDoorQuote,
      effectiveJC: pricing.effectiveJCCents,
      effectiveMisc: pricing.effectiveMiscCents,
      effectiveLabour: pricing.effectiveLabourCents,
      hstRate: pricing.hstRate,
      isSupplyOnly: supply.isSupplyOnly,
    })
    return combined.combinedTotalCents
  }, [
    base.attachedDoorQuote,
    base.attachedSealedUnit,
    pricing.total,
    pricing.afterDiscount,
    pricing.quoteResult,
    pricing.taxTotals,
    pricing.customDiscount,
    pricing.customDiscountLabel,
    pricing.loyaltyDiscount,
    pricing.loyaltyDiscountLabel,
    pricing.effectiveJCCents,
    pricing.effectiveMiscCents,
    pricing.effectiveLabourCents,
    pricing.hstRate,
    supply.isSupplyOnly,
  ])

  const review = useCalculatorReviewActions({
    user: base.user,
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
    taxTotals: pricing.taxTotals,
    setTaxTotals: pricing.setTaxTotals,
    hstRate: pricing.hstRate,
    setHstRate: pricing.setHstRate,
    quoteResult: pricing.quoteResult,
    activePromoId: pricing.activePromoId,
    setActivePromoId: pricing.setActivePromoId,
    setLockedPromoId: pricing.setLockedPromoId,
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
    total: effectiveTotalCents,
    attachedUpgrade: base.attachedUpgrade,
    setAttachedUpgrade: base.setAttachedUpgrade,
    attachedDoorQuote: base.attachedDoorQuote,
    setAttachedDoorQuote: base.setAttachedDoorQuote,
    attachedSealedUnit: base.attachedSealedUnit,
    setAttachedSealedUnit: base.setAttachedSealedUnit,
    wantsUpgrade: pricing.wantsUpgrade,
    setWantsUpgrade: pricing.setWantsUpgrade,
    isSupplyOnly: supply.isSupplyOnly,
    setIsSupplyOnly: supply.handleToggleSupplyOnly,
    isServiceOnly: supply.isServiceOnly,
    setIsServiceOnly: supply.setIsServiceOnly,
    supplyJambId: supply.supplyJambId,
    setSupplyJambId: supply.setSupplyJambId,
    supplyJambRate: supply.supplyJambRate,
    setSupplyJambRate: supply.setSupplyJambRate,
    supplyCasingId: supply.supplyCasingId,
    setSupplyCasingId: supply.setSupplyCasingId,
    supplyCasingRate: supply.supplyCasingRate,
    setSupplyCasingRate: supply.setSupplyCasingRate,
    quotesSubTab: base.quotesSubTab,
    setQuotesSubTab: base.setQuotesSubTab,
    originSubTab,
    setActiveTab: base.setActiveTab,
    fileInputRef,
    resetCalculatorDefaults,
  })

  return {
    comparison,
    review,
    resetCalculatorDefaults,
    handleConfirmReset,
  }
}
