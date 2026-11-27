"use client"

import { useEffect, useCallback, useMemo, useRef } from "react"
import { toCents } from "@/lib/promo-logic"
import { QuotesSubTabType } from "@/components/quotes/QuotesTab"
import { useCalculatorWindows } from "@/hooks/useCalculatorWindows"
import { useCalculatorPricing } from "@/hooks/useCalculatorPricing"
import { useCalculatorSupplyMode } from "@/hooks/calculator/useCalculatorSupplyMode"
import { useCalculatorDataSync } from "@/hooks/calculator/useCalculatorDataSync"
import { useCalculatorBaseState } from "@/hooks/calculator/promo/useCalculatorBaseState"
import { useCalculatorWorkflows } from "@/hooks/calculator/promo/useCalculatorWorkflows"
import { useCalculatorDraftsSync } from "@/hooks/calculator/promo/useCalculatorDraftsSync"
import {
  buildHeaderToolbarProps,
  buildWindowConfigProps,
  buildSummaryProps,
  CalculatorPropsContext,
} from "@/hooks/calculator/promo/ui-props-builder"
import {
  buildReviewWorkflowProps,
  buildPrintInvoiceProps,
} from "@/hooks/calculator/promo/workflow-invoice-props-builder"
import { buildModalProps } from "@/hooks/calculator/promo/modal-props-builder"

export interface UsePromoCalculatorOptions {
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export function usePromoCalculator({
  initialReviewQuoteId,
  initialIsEditMode,
  originSubTab,
}: UsePromoCalculatorOptions = {}) {
  const base = useCalculatorBaseState()
  const windowsContext = useCalculatorWindows()
  const { windows, setWindows } = windowsContext

  const pricing = useCalculatorPricing({
    surchargeRate: base.surchargeRate,
    labourUpgradeTiers: base.dbLabourUpgradeTiers,
  })

  const supply = useCalculatorSupplyMode({
    taxTotals: pricing.taxTotals,
    setTaxTotals: pricing.setTaxTotals,
    setCustomJC: pricing.setCustomJC,
    customJC: pricing.customJC,
    setCustomLabour: pricing.setCustomLabour,
    customLabour: pricing.customLabour,
    setCustomMisc: pricing.setCustomMisc,
    customMisc: pricing.customMisc,
    setHstRate: pricing.setHstRate,
    setAttachedUpgrade: base.setAttachedUpgrade,
  })

  const draftsRef = useRef<any>(null)

  const { comparison, review, handleConfirmReset } = useCalculatorWorkflows({
    base,
    windowsContext,
    pricing,
    supply,
    drafts: {
      resetDraftState: () => draftsRef.current?.resetDraftState?.(),
    },
    originSubTab,
  })

  const { drafts } = useCalculatorDraftsSync({
    initialReviewQuoteId,
    reviewQuoteId: review.reviewQuoteId,
    base,
    windows,
    setWindows,
    pricing,
    supply,
  })

  useEffect(() => {
    draftsRef.current = drafts
  }, [drafts])

  const {
    calculateQuote,
    setQuoteResult,
    setCompareOptions,
    setTaxTotals,
    setHstRate,
  } = pricing
  const { attachedUpgrade, surchargeRate, setIsPreviewOpen } = base
  const {
    isSupplyOnly,
    isServiceOnly,
    setIsServiceOnly,
    setIsSupplyOnly,
    handleModeChange,
  } = supply

  useEffect(() => {
    setTaxTotals((prev: any) => {
      if (!prev) return prev
      if ((prev.attachedUpgrade ?? null) === (attachedUpgrade ?? null))
        return prev
      return { ...prev, attachedUpgrade: attachedUpgrade ?? null }
    })
  }, [attachedUpgrade, setTaxTotals])

  useEffect(() => {
    if (windows.some((w) => toCents(w.base) > 0)) {
      calculateQuote(windows)
    } else {
      setQuoteResult(null)
      setCompareOptions([])
    }
  }, [
    windows,
    surchargeRate,
    calculateQuote,
    setQuoteResult,
    setCompareOptions,
  ])

  const switchTab = (tab: string, sub?: QuotesSubTabType) => {
    const validTab =
      tab === "promo" || tab === "tax" || tab === "quotes" ? tab : "promo"
    base.setActiveTab(validTab)
    if (sub) base.setQuotesSubTab(sub)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (validTab === "promo") {
        url.searchParams.delete("tab")
        url.searchParams.delete("sub")
      } else {
        url.searchParams.set("tab", validTab)
        if (sub) url.searchParams.set("sub", sub)
      }
      const current =
        typeof window.history.state === "object" && window.history.state !== null
          ? window.history.state
          : {}
      window.history.pushState({ ...current, tab: validTab, sub }, "", url.toString())
    }
  }

  useCalculatorDataSync({
    initialReviewQuoteId,
    initialIsEditMode,
    reviewQuoteId: review.reviewQuoteId,
    setAvailablePromos: pricing.setAvailablePromos,
    setSurchargeRate: base.setSurchargeRate,
    setDbLabourUpgradeTiers: base.setDbLabourUpgradeTiers,
    setUser: base.setUser,
    setQuoteTemplate: base.setQuoteTemplate,
    setStaffList: review.setStaffList,
    setAssignedReviewer: review.setAssignedReviewer,
    setReassignTo: review.setReassignTo,
    setClerkList: review.setClerkList,
    setSelectedOdooClerk: review.setSelectedOdooClerk,
    setPendingReviewCount: base.setPendingReviewCount,
    handleOpenQuoteFromTab: review.handleOpenQuoteFromTab,
    handleExitReview: review.handleExitReview,
  })

  const customPricing = {
    customJC: pricing.customJC,
    customMisc: pricing.customMisc,
    customLabour: pricing.customLabour,
    includeJCInPromo: pricing.includeJCInPromo,
    includeMiscInPromo: pricing.includeMiscInPromo,
    includeLabourInPromo: pricing.includeLabourInPromo,
    effectiveJC: pricing.effectiveJC,
    effectiveMisc: pricing.effectiveMisc,
    effectiveLabour: pricing.effectiveLabour,
    taxJC: pricing.taxJC,
    taxMisc: pricing.taxMisc,
    taxLabour: pricing.taxLabour,
    beforeTaxDiscount: pricing.beforeTaxDiscount,
    afterDiscount: pricing.afterDiscount,
    upgrade: pricing.upgrade,
    shownUpgrade: pricing.shownUpgrade,
    total: pricing.total,
    firstPayment: pricing.firstPayment,
    secondPayment: pricing.secondPayment,
    hstRate: pricing.hstRate,
  }

  const context: CalculatorPropsContext = {
    base,
    pricing,
    windowsContext,
    supply,
    comparison,
    drafts: {
      ...drafts,
      handleConfirmReset,
    },
    review,
    customPricing,
  }

  const reviewWorkflowProps = buildReviewWorkflowProps({
    base,
    pricing,
    review,
    windowsContext,
    supply,
    customPricing,
  })

  const headerToolbarProps = buildHeaderToolbarProps(context)
  const windowConfigProps = buildWindowConfigProps(context)
  const summaryProps = buildSummaryProps(context)
  const printInvoiceProps = buildPrintInvoiceProps({
    base,
    pricing,
    review,
    windowsContext,
    supply,
    customPricing,
  })
  const modalProps = buildModalProps(context)

  const handleTaxCalculated = useCallback(
    (totals: any) => {
      if (!totals) return
      setTaxTotals((prev: any) => {
        const effectiveTotals =
          prev && (isSupplyOnly || totals.isSupplyOnly)
            ? {
                ...totals,
                isSupplyOnly: true,
                jc: prev.jc ?? totals.jc,
                finalJC: prev.finalJC ?? totals.finalJC,
                jcLabourCents: prev.jcLabourCents ?? totals.jcLabourCents,
                selectedJamb: prev.selectedJamb ?? totals.selectedJamb,
                selectedCasing: prev.selectedCasing ?? totals.selectedCasing,
                customMaterials:
                  prev.customMaterials ?? totals.customMaterials ?? [],
                customMaterialsTotal:
                  prev.customMaterialsTotal ?? totals.customMaterialsTotal ?? 0,
                customMaterialsCents:
                  prev.customMaterialsCents ?? totals.customMaterialsCents ?? 0,
              }
            : totals

        if (prev) {
          const isSame =
            prev.subtotal === effectiveTotals.subtotal &&
            prev.total === effectiveTotals.total &&
            prev.hst === effectiveTotals.hst &&
            prev.extras === effectiveTotals.extras &&
            prev.finalLabour === effectiveTotals.finalLabour &&
            prev.finalMisc === effectiveTotals.finalMisc &&
            prev.finalJC === effectiveTotals.finalJC &&
            prev.jcLabourCents === effectiveTotals.jcLabourCents &&
            prev.standardLabourCents === effectiveTotals.standardLabourCents &&
            prev.miscLabourCents === effectiveTotals.miscLabourCents &&
            prev.isSupplyOnly === effectiveTotals.isSupplyOnly &&
            prev.isServiceOnly === effectiveTotals.isServiceOnly &&
            prev.selectedRegionId === effectiveTotals.selectedRegionId &&
            prev.jambId === effectiveTotals.jambId &&
            prev.casingId === effectiveTotals.casingId &&
            prev.selectedJamb?.id === effectiveTotals.selectedJamb?.id &&
            prev.selectedCasing?.id === effectiveTotals.selectedCasing?.id &&
            prev.selectedJamb?.rate === effectiveTotals.selectedJamb?.rate &&
            prev.selectedCasing?.rate === effectiveTotals.selectedCasing?.rate &&
            prev.customMaterialsCents ===
              effectiveTotals.customMaterialsCents &&
            JSON.stringify(prev.customMaterials) ===
              JSON.stringify(effectiveTotals.customMaterials) &&
            (prev.attachedUpgrade ?? null) === (attachedUpgrade ?? null)
          if (isSame) return prev
        }
        return {
          ...effectiveTotals,
          attachedUpgrade: prev?.attachedUpgrade ?? attachedUpgrade ?? null,
        }
      })

      if (totals?.isServiceOnly && !isServiceOnly) {
        setIsServiceOnly(true)
        setIsSupplyOnly(false)
        setHstRate(13)
      }
    },
    [
      setTaxTotals,
      setHstRate,
      isSupplyOnly,
      isServiceOnly,
      setIsServiceOnly,
      setIsSupplyOnly,
      attachedUpgrade,
    ]
  )

  const taxTabProps = useMemo(
    () => ({
      windows,
      onWindowsChange: setWindows,
      onCalculated: handleTaxCalculated,
      savedTaxTotals:
        review.reviewQuote?.taxTotals ||
        drafts.loadedDraftTaxTotals ||
        null,
      readOnly: review.isReadOnly,
      onOpenPreview: () => setIsPreviewOpen(true),
      isSupplyOnly,
      isServiceOnly,
      onModeChange: handleModeChange,
    }),
    [
      windows,
      setWindows,
      handleTaxCalculated,
      review.reviewQuote?.taxTotals,
      drafts.loadedDraftTaxTotals,
      review.isReadOnly,
      setIsPreviewOpen,
      isSupplyOnly,
      isServiceOnly,
      handleModeChange,
    ]
  )

  const quotesTabProps = useMemo(
    () => ({
      currentUser: base.user,
      onOpenQuote: review.handleOpenQuoteFromTab,
      onQuotesCountChange: base.setPendingReviewCount,
      initialSubTab: base.quotesSubTab,
    }),
    [
      base.user,
      review.handleOpenQuoteFromTab,
      base.setPendingReviewCount,
      base.quotesSubTab,
    ]
  )

  return {
    activeTab: base.activeTab,
    switchTab,
    reviewWorkflowProps,
    headerToolbarProps,
    windowConfigProps,
    summaryProps,
    taxCalcKey: base.taxCalcKey,
    taxTabProps,
    quotesTabProps,
    printInvoiceProps,
    modalProps,
  }
}
