"use client"

import { useState } from "react"
import { toast } from "sonner"
import { QuotesSubTabType } from "@/components/quotes/QuotesTab"
import {
  clearAllQuoteSessionState,
  writeSessionAttachedInstallOption,
  writeSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { navigateExitReview } from "@/hooks/quotes/review/review-navigation"

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
  setCustomDiscount?: (val: string) => void
  setCustomDiscountLabel?: (val: string) => void
  setLoyaltyDiscount?: (val: string) => void
  setLoyaltyDiscountLabel?: (val: string) => void
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  setLoyaltyPoints?: (val: number) => void
  setLoyaltyGrossAmount?: (val: number) => void
  setIncludeJCInPromo: (val: boolean) => void
  setIncludeMiscInPromo: (val: boolean) => void
  setIncludeLabourInPromo: (val: boolean) => void
  setTaxTotals: (totals: any) => void
  setHstRate?: (rate: number) => void
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
  originSubTab?: string
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
  setCustomDiscount,
  setCustomDiscountLabel,
  setLoyaltyDiscount,
  setLoyaltyDiscountLabel,
  setDiscountType,
  setLoyaltyPoints,
  setLoyaltyGrossAmount,
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
  setHstRate,
  originSubTab,
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
    clearAllQuoteSessionState()
    if (originSubTab) {
      setQuotesSubTab(originSubTab)
    }
    setReviewQuoteId(qId)
    fetch(`/api/quotes/${qId}?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((q) => {
        if (q && q._id) {
          const isDoor =
            q.quoteType === "door" ||
            (Array.isArray(q.windows) &&
              q.windows.some((w: any) => w.doorPresetId || w.presetId))
          const isSU =
            q.quoteType === "sealed_unit" ||
            Boolean(q.taxTotals?.isSealedUnitQuote) ||
            Boolean(q.sealedUnitMode)

          if (isDoor) {
            if (typeof window !== "undefined") {
              window.location.href = `/review/${q._id}?type=door${isEdit ? "&edit=true" : ""}`
            }
            return
          }

          if (isSU) {
            if (typeof window !== "undefined") {
              window.location.href = `/review/${q._id}?type=sealed_unit${isEdit ? "&edit=true" : ""}`
            }
            return
          }

          setActiveTab("promo")
          if (typeof window !== "undefined") {
            window.history.pushState(
              { tab: "promo", reviewQuoteId: qId, isEdit },
              "",
              `/?reviewQuoteId=${qId}${isEdit ? "&edit=true" : ""}`
            )
          }

          const isClerk = Boolean(
            !canReview &&
            (user?.department === "CLERK" ||
              effectivePerms.canMarkOdooEntry ||
              effectivePerms.canAccessOdooQueue)
          )
          const isApproved = q.status === "APPROVED" || q.status === "MODIFIED"
          const isPending = q.status === "PENDING_REVIEW"
          const isPrep = Boolean(user?.username && q.preparedBy?.toLowerCase() === user.username.toLowerCase())
          const isReviewer = Boolean(canReview || (user?.username && q.assignedTo?.toLowerCase() === user.username.toLowerCase()))
          const isCompletedInOdoo = Boolean(q.odooStatus === "COMPLETED" || q.odooOrderNumber)
          const allowEdit = Boolean(
            isEdit && !isCompletedInOdoo && !isClerk &&
            (isApproved ? canEditApprovedQuote : true) &&
            (!isPending || (!isPrep && isReviewer))
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
          if (q.customMisc !== undefined) setCustomMisc(String(q.customMisc || ""))
          if (q.customLabour !== undefined) setCustomLabour(String(q.customLabour || ""))
          if (q.customDiscount !== undefined) setCustomDiscount?.(String(q.customDiscount ?? ""))
          if (q.customDiscountLabel !== undefined) setCustomDiscountLabel?.(q.customDiscountLabel || "")
          if (q.loyaltyDiscount !== undefined) setLoyaltyDiscount?.(String(q.loyaltyDiscount ?? ""))
          if (q.loyaltyDiscountLabel !== undefined) setLoyaltyDiscountLabel?.(q.loyaltyDiscountLabel || "")
          if (q.discountType !== undefined) setDiscountType?.(q.discountType || "none")
          if (q.loyaltyPoints !== undefined) setLoyaltyPoints?.(Number(q.loyaltyPoints) || 0)
          if (q.loyaltyGrossAmount !== undefined) setLoyaltyGrossAmount?.(Number(q.loyaltyGrossAmount) || 0)
          if (q.includeJCInPromo !== undefined) setIncludeJCInPromo(Boolean(q.includeJCInPromo))
          if (q.includeMiscInPromo !== undefined) setIncludeMiscInPromo(Boolean(q.includeMiscInPromo))
          if (q.includeLabourInPromo !== undefined) setIncludeLabourInPromo(Boolean(q.includeLabourInPromo))
          if (setAttachedUpgrade) setAttachedUpgrade(q.attachedUpgrade ?? null)
          if (setAttachedDoorQuote) setAttachedDoorQuote(q.attachedDoorQuote ?? null)
          if (setAttachedSealedUnit) setAttachedSealedUnit(q.attachedSealedUnit ?? null)
          if (setWantsUpgrade && q.wantsUpgrade !== undefined) setWantsUpgrade(Boolean(q.wantsUpgrade))
          if (setIsSupplyOnly && q.isSupplyOnly !== undefined) setIsSupplyOnly(Boolean(q.isSupplyOnly))
          if (setIsServiceOnly && q.isServiceOnly !== undefined) setIsServiceOnly(Boolean(q.isServiceOnly))
          if (setSupplyJambId && q.supplyJambId !== undefined) setSupplyJambId(q.supplyJambId)
          if (setSupplyJambRate && q.supplyJambRate !== undefined) setSupplyJambRate(q.supplyJambRate)
          if (setSupplyCasingId && q.supplyCasingId !== undefined) setSupplyCasingId(q.supplyCasingId)
          if (setSupplyCasingRate && q.supplyCasingRate !== undefined) setSupplyCasingRate(q.supplyCasingRate)
          writeSessionAttachedInstallOption(q.attachedInstallOption ?? null, "window")
          writeSessionCustomOptions(
            Array.isArray(q.customOptions) ? q.customOptions : [],
            "window"
          )
          if (setHstRate && (q.hstRate !== undefined || q.taxTotals?.hstRate !== undefined)) {
            setHstRate(Number(q.hstRate ?? q.taxTotals?.hstRate))
          }
          if (q.taxTotals || Array.isArray(q.customMaterials)) {
            const mats =
              q.taxTotals?.customMaterials ??
              (Array.isArray(q.customMaterials) ? q.customMaterials : [])
            const matsTotal = mats.reduce(
              (acc: number, m: any) => acc + (Number(m?.amount) || 0),
              0
            )
            setTaxTotals({
              ...(q.taxTotals || {}),
              customMaterials: mats,
              customMaterialsTotal:
                q.taxTotals?.customMaterialsTotal ??
                Math.round(matsTotal * 100) / 100,
              customMaterialsCents:
                q.taxTotals?.customMaterialsCents ??
                Math.round(matsTotal * 100),
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
    setCustomDiscount?.(String(reviewQuote.customDiscount ?? ""))
    setCustomDiscountLabel?.(reviewQuote.customDiscountLabel || "")
    setLoyaltyDiscount?.(String(reviewQuote.loyaltyDiscount ?? ""))
    setLoyaltyDiscountLabel?.(reviewQuote.loyaltyDiscountLabel || "")
    setDiscountType?.(reviewQuote.discountType || "none")
    setLoyaltyPoints?.(Number(reviewQuote.loyaltyPoints) || 0)
    setLoyaltyGrossAmount?.(Number(reviewQuote.loyaltyGrossAmount) || 0)
    setIncludeJCInPromo(reviewQuote.includeJCInPromo !== false)
    setIncludeMiscInPromo(reviewQuote.includeMiscInPromo !== false)
    setIncludeLabourInPromo(reviewQuote.includeLabourInPromo !== false)
    if (setAttachedUpgrade) setAttachedUpgrade(reviewQuote.attachedUpgrade ?? null)
    if (setAttachedDoorQuote) setAttachedDoorQuote(reviewQuote.attachedDoorQuote ?? null)
    if (setAttachedSealedUnit) setAttachedSealedUnit(reviewQuote.attachedSealedUnit ?? null)
    if (setWantsUpgrade && reviewQuote.wantsUpgrade !== undefined) setWantsUpgrade(Boolean(reviewQuote.wantsUpgrade))
    if (setIsSupplyOnly && reviewQuote.isSupplyOnly !== undefined) setIsSupplyOnly(Boolean(reviewQuote.isSupplyOnly))
    if (setIsServiceOnly && reviewQuote.isServiceOnly !== undefined) setIsServiceOnly(Boolean(reviewQuote.isServiceOnly))
    if (setSupplyJambId && reviewQuote.supplyJambId !== undefined) setSupplyJambId(reviewQuote.supplyJambId)
    if (setSupplyJambRate && reviewQuote.supplyJambRate !== undefined) setSupplyJambRate(reviewQuote.supplyJambRate)
    if (setSupplyCasingId && reviewQuote.supplyCasingId !== undefined) setSupplyCasingId(reviewQuote.supplyCasingId)
    if (setSupplyCasingRate && reviewQuote.supplyCasingRate !== undefined) setSupplyCasingRate(reviewQuote.supplyCasingRate)
    writeSessionAttachedInstallOption(
      reviewQuote.attachedInstallOption ?? null,
      "window"
    )
    writeSessionCustomOptions(
      Array.isArray(reviewQuote.customOptions) ? reviewQuote.customOptions : [],
      "window"
    )
    if (setHstRate && (reviewQuote.hstRate !== undefined || reviewQuote.taxTotals?.hstRate !== undefined)) {
      setHstRate(Number(reviewQuote.hstRate ?? reviewQuote.taxTotals?.hstRate))
    }
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
    clearAllQuoteSessionState()
    setIsEditMode(false)
    setReviewQuote(null)
    setReviewQuoteId(null)
    setOriginalSnapshot(null)
    resetCalculatorDefaults()

    const urlSub = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("sub") : null
    let defaultTab: string = "my"
    if (canReview) defaultTab = "review"
    else if (isOdooClerk) defaultTab = "odoo"

    const targetSubTab = (originSubTab || urlSub || quotesSubTab || defaultTab) as QuotesSubTabType
    setQuotesSubTab(targetSubTab)
    setActiveTab("quotes")
    navigateExitReview(targetSubTab)
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
