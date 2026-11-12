"use client"

import { useState } from "react"
import { toast } from "sonner"
import { QuotesSubTabType } from "@/components/quotes/QuotesTab"

export interface UseReviewQuoteLoaderParams {
  user: any
  canReview: boolean
  canEditApprovedQuote: boolean
  isOdooClerk: boolean
  effectivePerms: any
  quotesSubTab?: QuotesSubTabType
  setQuotesSubTab: (tab: QuotesSubTabType) => void
  setActiveTab: (tab: any) => void
  resetCalculatorDefaults: () => void
  setWindows: (windows: any[]) => void
  setCustomerName: (name: string) => void
  setQuoteNumber: (num: string) => void
  setQuoteNotes: (notes: string) => void
  setSurchargeRate: (rate: number) => void
  setActivePromoId: (id: string) => void
  setLockedPromoId: (id: string | null) => void
  setCustomJC: (val: string) => void
  setCustomMisc: (val: string) => void
  setCustomLabour: (val: string) => void
  setIncludeJCInPromo: (val: boolean) => void
  setIncludeMiscInPromo: (val: boolean) => void
  setIncludeLabourInPromo: (val: boolean) => void
  setAttachedUpgrade?: (val: any) => void
  setAttachedDoorQuote?: (val: any) => void
  setAttachedSealedUnit?: (val: any) => void
  setWantsUpgrade?: (val: boolean) => void
  setIsSupplyOnly?: (val: boolean) => void
  setIsServiceOnly?: (val: boolean) => void
  setSupplyJambId?: (val: string) => void
  setSupplyJambRate?: (val: string) => void
  setSupplyCasingId?: (val: string) => void
  setSupplyCasingRate?: (val: string) => void
  setTaxTotals: (totals: any) => void
}

export function useReviewQuoteLoader({
  user,
  canReview,
  canEditApprovedQuote,
  isOdooClerk,
  effectivePerms,
  quotesSubTab,
  setQuotesSubTab,
  setActiveTab,
  resetCalculatorDefaults,
  setWindows,
  setCustomerName,
  setQuoteNumber,
  setQuoteNotes,
  setSurchargeRate,
  setActivePromoId,
  setLockedPromoId,
  setCustomJC,
  setCustomMisc,
  setCustomLabour,
  setIncludeJCInPromo,
  setIncludeMiscInPromo,
  setIncludeLabourInPromo,
  setAttachedUpgrade,
  setAttachedDoorQuote,
  setAttachedSealedUnit,
  setWantsUpgrade,
  setIsSupplyOnly,
  setIsServiceOnly,
  setSupplyJambId,
  setSupplyJambRate,
  setSupplyCasingId,
  setSupplyCasingRate,
  setTaxTotals,
}: UseReviewQuoteLoaderParams) {
  const [reviewQuoteId, setReviewQuoteId] = useState<string | null>(null)
  const [reviewQuote, setReviewQuote] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [originalSnapshot, setOriginalSnapshot] = useState<any>(null)

  const handleOpenQuoteFromTab = (
    qId: string,
    isEdit?: boolean,
    originSubTab?: QuotesSubTabType
  ) => {
    if (originSubTab) {
      setQuotesSubTab(originSubTab)
    }
    setReviewQuoteId(qId)
    setActiveTab("promo")
    if (typeof window !== "undefined") {
      window.history.pushState(
        { tab: "promo", reviewQuoteId: qId, isEdit },
        "",
        `/?reviewQuoteId=${qId}${isEdit ? "&edit=true" : ""}`
      )
    }
    fetch(`/api/quotes/${qId}?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((q) => {
        if (q && q._id) {
          const isClerk = Boolean(
            !canReview &&
            (user?.department === "CLERK" ||
              effectivePerms.canMarkOdooEntry ||
              effectivePerms.canAccessOdooQueue)
          )
          const isApproved = q.status === "APPROVED" || q.status === "MODIFIED"
          const isCompletedInOdoo = Boolean(
            q.odooStatus === "COMPLETED" || q.odooOrderNumber
          )
          const allowEdit = Boolean(
            isEdit &&
            !isCompletedInOdoo &&
            !isClerk &&
            (isApproved ? canEditApprovedQuote : true)
          )
          setIsEditMode(allowEdit)

          setReviewQuote(q)
          setOriginalSnapshot(q.initialSnapshot || q)
          if (q.windows?.length) setWindows(q.windows)
          if (q.customerName) setCustomerName(q.customerName)
          if (q.quoteNumber) setQuoteNumber(q.quoteNumber)
          if (q.quoteNotes) setQuoteNotes(q.quoteNotes)
          if (q.surchargeRate !== undefined) setSurchargeRate(q.surchargeRate)
          if (q.activePromoId) {
            setActivePromoId(q.activePromoId)
            setLockedPromoId(q.activePromoId)
          }
          if (q.customJC !== undefined) setCustomJC(String(q.customJC || ""))
          if (q.customMisc !== undefined)
            setCustomMisc(String(q.customMisc || ""))
          if (q.customLabour !== undefined)
            setCustomLabour(String(q.customLabour || ""))
          if (q.includeJCInPromo !== undefined)
            setIncludeJCInPromo(Boolean(q.includeJCInPromo))
          if (q.includeMiscInPromo !== undefined)
            setIncludeMiscInPromo(Boolean(q.includeMiscInPromo))
          if (q.includeLabourInPromo !== undefined)
            setIncludeLabourInPromo(Boolean(q.includeLabourInPromo))
          if (setAttachedUpgrade) setAttachedUpgrade(q.attachedUpgrade ?? null)
          if (setAttachedDoorQuote)
            setAttachedDoorQuote(q.attachedDoorQuote ?? null)
          if (setAttachedSealedUnit)
            setAttachedSealedUnit(q.attachedSealedUnit ?? null)
          if (setWantsUpgrade && q.wantsUpgrade !== undefined)
            setWantsUpgrade(Boolean(q.wantsUpgrade))
          if (setIsSupplyOnly && q.isSupplyOnly !== undefined)
            setIsSupplyOnly(Boolean(q.isSupplyOnly))
          if (setIsServiceOnly && q.isServiceOnly !== undefined)
            setIsServiceOnly(Boolean(q.isServiceOnly))
          if (setSupplyJambId && q.supplyJambId !== undefined)
            setSupplyJambId(q.supplyJambId)
          if (setSupplyJambRate && q.supplyJambRate !== undefined)
            setSupplyJambRate(q.supplyJambRate)
          if (setSupplyCasingId && q.supplyCasingId !== undefined)
            setSupplyCasingId(q.supplyCasingId)
          if (setSupplyCasingRate && q.supplyCasingRate !== undefined)
            setSupplyCasingRate(q.supplyCasingRate)
          if (q.taxTotals) {
            setTaxTotals({
              ...q.taxTotals,
              _quoteId: q._id,
              _quoteNumber: q.quoteNumber,
            })
          }
          toast.info(
            allowEdit
              ? `Loaded Quote #${q.quoteNumber} in Edit Mode`
              : `Loaded Quote #${q.quoteNumber} in Review Mode`
          )
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      })
      .catch(console.error)
  }

  const handleCancelEdits = () => {
    if (!reviewQuote) {
      setIsEditMode(false)
      return
    }
    if (reviewQuote.windows?.length) setWindows(reviewQuote.windows)
    if (reviewQuote.customerName) setCustomerName(reviewQuote.customerName)
    if (reviewQuote.quoteNumber) setQuoteNumber(reviewQuote.quoteNumber)
    if (reviewQuote.quoteNotes !== undefined)
      setQuoteNotes(reviewQuote.quoteNotes)
    if (reviewQuote.surchargeRate !== undefined)
      setSurchargeRate(reviewQuote.surchargeRate)
    if (reviewQuote.activePromoId) {
      setActivePromoId(reviewQuote.activePromoId)
      setLockedPromoId(reviewQuote.activePromoId)
    }
    setCustomJC(String(reviewQuote.customJC || ""))
    setCustomMisc(String(reviewQuote.customMisc || ""))
    setCustomLabour(String(reviewQuote.customLabour || ""))
    setIncludeJCInPromo(reviewQuote.includeJCInPromo !== false)
    setIncludeMiscInPromo(reviewQuote.includeMiscInPromo !== false)
    setIncludeLabourInPromo(reviewQuote.includeLabourInPromo !== false)
    if (setAttachedUpgrade)
      setAttachedUpgrade(reviewQuote.attachedUpgrade ?? null)
    if (setAttachedDoorQuote)
      setAttachedDoorQuote(reviewQuote.attachedDoorQuote ?? null)
    if (setAttachedSealedUnit)
      setAttachedSealedUnit(reviewQuote.attachedSealedUnit ?? null)
    if (setWantsUpgrade && reviewQuote.wantsUpgrade !== undefined)
      setWantsUpgrade(Boolean(reviewQuote.wantsUpgrade))
    if (setIsSupplyOnly && reviewQuote.isSupplyOnly !== undefined)
      setIsSupplyOnly(Boolean(reviewQuote.isSupplyOnly))
    if (setIsServiceOnly && reviewQuote.isServiceOnly !== undefined)
      setIsServiceOnly(Boolean(reviewQuote.isServiceOnly))
    if (setSupplyJambId && reviewQuote.supplyJambId !== undefined)
      setSupplyJambId(reviewQuote.supplyJambId)
    if (setSupplyJambRate && reviewQuote.supplyJambRate !== undefined)
      setSupplyJambRate(reviewQuote.supplyJambRate)
    if (setSupplyCasingId && reviewQuote.supplyCasingId !== undefined)
      setSupplyCasingId(reviewQuote.supplyCasingId)
    if (setSupplyCasingRate && reviewQuote.supplyCasingRate !== undefined)
      setSupplyCasingRate(reviewQuote.supplyCasingRate)
    if (reviewQuote.taxTotals) {
      setTaxTotals({
        ...reviewQuote.taxTotals,
        _quoteId: reviewQuote._id,
        _quoteNumber: reviewQuote.quoteNumber,
      })
    }
    setIsEditMode(false)
    toast.info("Edits cancelled. Reverted back to saved quote.")
  }

  const handleExitReview = () => {
    setIsEditMode(false)
    setReviewQuote(null)
    setReviewQuoteId(null)
    setOriginalSnapshot(null)
    resetCalculatorDefaults()

    let defaultTab: string = "my"
    if (canReview) defaultTab = "review"
    else if (isOdooClerk) defaultTab = "odoo"

    const targetSubTab = (quotesSubTab || defaultTab) as QuotesSubTabType
    setQuotesSubTab(targetSubTab)
    setActiveTab("quotes")
    if (typeof window !== "undefined") {
      window.history.pushState(
        { tab: "quotes", sub: targetSubTab },
        "",
        `/?tab=quotes&sub=${targetSubTab}`
      )
    }
    const tabName =
      targetSubTab === "review"
        ? "Pending Review queue"
        : targetSubTab === "odoo"
          ? "Odoo Entry queue"
          : targetSubTab === "odoo_completed"
            ? "Completed in Odoo"
            : targetSubTab === "all"
              ? "All Quotes"
              : targetSubTab === "all_assigned"
                ? "Total Assigned"
                : "your Quote History"
    toast.info(`Exited review mode. Returned to ${tabName}.`)
  }

  return {
    reviewQuoteId,
    setReviewQuoteId,
    reviewQuote,
    setReviewQuote,
    isEditMode,
    setIsEditMode,
    originalSnapshot,
    setOriginalSnapshot,
    handleOpenQuoteFromTab,
    handleCancelEdits,
    handleExitReview,
  }
}
