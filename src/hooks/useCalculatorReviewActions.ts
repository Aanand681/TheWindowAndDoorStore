"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { QuotesSubTabType } from "@/components/quotes/QuotesTab"
import { useReviewPermissions } from "@/hooks/calculator/review/useReviewPermissions"
import { useReviewQuoteLoader } from "@/hooks/calculator/review/useReviewQuoteLoader"
import {
  useUniversalReviewActions,
  useUniversalReviewSubmit,
} from "@/hooks/quotes/review"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
  clearAllQuoteSessionState,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { DRAFT_CHANGE_EVENT } from "@/lib/quote-drafts-storage"

export interface UseCalculatorReviewActionsProps {
  user: any
  quoteNumber: string
  setQuoteNumber: (num: string) => void
  customerName: string
  setCustomerName: (name: string) => void
  quoteNotes: string
  setQuoteNotes: (notes: string) => void
  surchargeRate: number
  setSurchargeRate: (rate: number) => void
  windows: any[]
  setWindows: (windows: any[]) => void
  taxTotals: any
  setTaxTotals: (totals: any) => void
  hstRate?: number
  setHstRate?: (rate: number) => void
  quoteResult: any
  activePromoId: string
  setActivePromoId: (id: string) => void
  setLockedPromoId: (id: string | null) => void
  customJC: string
  setCustomJC: (val: string) => void
  customMisc: string
  setCustomMisc: (val: string) => void
  customLabour: string
  setCustomLabour: (val: string) => void
  customDiscount?: string
  setCustomDiscount?: (val: string) => void
  customDiscountLabel?: string
  setCustomDiscountLabel?: (val: string) => void
  loyaltyDiscount?: string
  setLoyaltyDiscount?: (val: string) => void
  loyaltyDiscountLabel?: string
  setLoyaltyDiscountLabel?: (val: string) => void
  discountType?: "none" | "custom" | "loyalty"
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  loyaltyPoints?: number
  setLoyaltyPoints?: (val: number) => void
  loyaltyGrossAmount?: number
  setLoyaltyGrossAmount?: (val: number) => void
  includeJCInPromo: boolean
  setIncludeJCInPromo: (val: boolean) => void
  includeMiscInPromo: boolean
  setIncludeMiscInPromo: (val: boolean) => void
  includeLabourInPromo: boolean
  setIncludeLabourInPromo: (val: boolean) => void
  total: number
  attachedUpgrade?: any
  setAttachedUpgrade?: (val: any) => void
  attachedDoorQuote?: any
  setAttachedDoorQuote?: (val: any) => void
  attachedSealedUnit?: any
  setAttachedSealedUnit?: (val: any) => void
  wantsUpgrade?: boolean
  setWantsUpgrade?: (val: boolean) => void
  isSupplyOnly?: boolean
  setIsSupplyOnly?: (val: boolean) => void
  isServiceOnly?: boolean
  setIsServiceOnly?: (val: boolean) => void
  supplyJambId?: string
  setSupplyJambId?: (val: string) => void
  supplyJambRate?: string
  setSupplyJambRate?: (val: string) => void
  supplyCasingId?: string
  setSupplyCasingId?: (val: string) => void
  supplyCasingRate?: string
  setSupplyCasingRate?: (val: string) => void
  quotesSubTab?: QuotesSubTabType
  setQuotesSubTab: (tab: QuotesSubTabType) => void
  originSubTab?: string
  setActiveTab: (tab: any) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  resetCalculatorDefaults: () => void
}

export function useCalculatorReviewActions({
  user,
  quoteNumber,
  setQuoteNumber,
  customerName,
  setCustomerName,
  quoteNotes,
  setQuoteNotes,
  surchargeRate,
  setSurchargeRate,
  windows,
  setWindows,
  taxTotals,
  setTaxTotals,
  hstRate,
  setHstRate,
  quoteResult,
  activePromoId,
  setActivePromoId,
  setLockedPromoId,
  customJC,
  setCustomJC,
  customMisc,
  setCustomMisc,
  customLabour,
  setCustomLabour,
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
  includeJCInPromo,
  setIncludeJCInPromo,
  includeMiscInPromo,
  setIncludeMiscInPromo,
  includeLabourInPromo,
  setIncludeLabourInPromo,
  total,
  attachedUpgrade,
  setAttachedUpgrade,
  attachedDoorQuote,
  setAttachedDoorQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  wantsUpgrade,
  setWantsUpgrade,
  isSupplyOnly,
  setIsSupplyOnly,
  isServiceOnly,
  setIsServiceOnly,
  supplyJambId,
  setSupplyJambId,
  supplyJambRate,
  setSupplyJambRate,
  supplyCasingId,
  setSupplyCasingId,
  supplyCasingRate,
  setSupplyCasingRate,
  quotesSubTab,
  setQuotesSubTab,
  originSubTab,
  setActiveTab,
  fileInputRef,
  resetCalculatorDefaults,
}: UseCalculatorReviewActionsProps) {
  const effectivePerms = user?.permissions || user?.departmentPermissions || {}
  const isAdmin = Boolean(user && (user.role === "ADMIN" || user.role === "SUPERADMIN"))
  const canReview = Boolean(isAdmin || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote)
  const canEditApprovedQuote = Boolean(isAdmin || effectivePerms.canEditApprovedQuote)

  // 1. Review Quote Lifecycle & Loader Hook
  const loader = useReviewQuoteLoader({
    user,
    canReview,
    canEditApprovedQuote,
    isOdooClerk: false,
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
  })

  // 2. Computed Permissions & Role Checks Hook
  const permissions = useReviewPermissions({
    user,
    reviewQuote: loader.reviewQuote,
    isEditMode: loader.isEditMode,
  })

  // 3. Payload Builders
  const buildSubmitPayload = useCallback(
    ({ isDirectApprove, effectiveReviewer, effectiveClerk, preparerNotes }: any) => {
      const effectiveHst =
        hstRate !== undefined
          ? hstRate
          : taxTotals?.hstRate !== undefined
            ? taxTotals.hstRate
            : 13
      return {
        quoteNumber,
        customerName,
        assignedTo: isDirectApprove ? user?.username || "" : effectiveReviewer,
        directApprove: isDirectApprove,
        odooAssignedTo: isDirectApprove ? effectiveClerk : undefined,
        preparerNotes,
        windows,
        taxTotals: {
          ...taxTotals,
          hstRate: effectiveHst,
        },
        hstRate: effectiveHst,
        quoteResult,
        quoteNotes,
        surchargeRate,
        activePromoId,
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
        customMaterials: taxTotals?.customMaterials || [],
        includeJCInPromo,
        includeMiscInPromo,
        includeLabourInPromo,
        attachedUpgrade,
        attachedInstallOption: readSessionAttachedInstallOption("window"),
        customOptions: readSessionCustomOptions("window"),
        selectedRegionId: taxTotals?.selectedRegionId,
        regionName: taxTotals?.regionName,
        attachedDoorQuote,
        attachedSealedUnit,
        supplyJambId,
        supplyJambRate,
        supplyCasingId,
        supplyCasingRate,
        wantsUpgrade,
        isSupplyOnly,
        isServiceOnly,
        quoteSummaryTotal: total,
      }
    },
    [
      quoteNumber,
      customerName,
      user?.username,
      windows,
      taxTotals,
      hstRate,
      quoteResult,
      quoteNotes,
      surchargeRate,
      activePromoId,
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
      attachedDoorQuote,
      attachedSealedUnit,
      supplyJambId,
      supplyJambRate,
      supplyCasingId,
      supplyCasingRate,
      wantsUpgrade,
      isSupplyOnly,
      isServiceOnly,
      total,
    ]
  )

  const buildUpdatePayload = useCallback(
    (extra: Record<string, any> = {}) => {
      const effectiveHst =
        hstRate !== undefined
          ? hstRate
          : taxTotals?.hstRate !== undefined
            ? taxTotals.hstRate
            : 13
      return {
        customerName,
        quoteNumber,
        windows,
        taxTotals: {
          ...taxTotals,
          hstRate: effectiveHst,
        },
        hstRate: effectiveHst,
        quoteResult,
        quoteNotes,
        surchargeRate,
        activePromoId,
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
        customMaterials: taxTotals?.customMaterials || [],
        includeJCInPromo,
        includeMiscInPromo,
        includeLabourInPromo,
        attachedUpgrade,
        attachedInstallOption: readSessionAttachedInstallOption("window"),
        customOptions: readSessionCustomOptions("window"),
        selectedRegionId: taxTotals?.selectedRegionId,
        regionName: taxTotals?.regionName,
        attachedDoorQuote,
        attachedSealedUnit,
        wantsUpgrade,
        isSupplyOnly,
        isServiceOnly,
        supplyJambId,
        supplyJambRate,
        supplyCasingId,
        supplyCasingRate,
        quoteSummaryTotal: total,
        ...extra,
      }
    },
    [
      customerName,
      quoteNumber,
      windows,
      taxTotals,
      hstRate,
      quoteResult,
      quoteNotes,
      surchargeRate,
      activePromoId,
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
      attachedDoorQuote,
      attachedSealedUnit,
      wantsUpgrade,
      isSupplyOnly,
      isServiceOnly,
      supplyJambId,
      supplyJambRate,
      supplyCasingId,
      supplyCasingRate,
      total,
    ]
  )

  // 4. Universal Submit Hook
  const reviewSubmit = useUniversalReviewSubmit({
    user,
    isAdmin,
    customerName,
    quoteNumber,
    itemCount: windows.length,
    quoteType: "window",
    quoteTypeLabel: "Window",
    buildSubmitPayload,
    attachedDoorQuote,
    attachedSealedUnit,
    onSuccess: ({ data, isDirectApprove, effectiveClerk, effectiveReviewer }) => {
      clearAllQuoteSessionState()
      if (isDirectApprove) {
        toast.success(
          `Quote #${quoteNumber} approved & assigned to ${effectiveClerk} for Odoo entry!`
        )
        if (data.quote) {
          loader.setReviewQuote(data.quote)
          if (data.quote._id) loader.setReviewQuoteId(data.quote._id)
          if (data.quote.initialSnapshot || data.quote) {
            loader.setOriginalSnapshot(data.quote.initialSnapshot || data.quote)
          }
        }
        loader.setIsEditMode(false)
        if (typeof window !== "undefined" && data.quote?._id) {
          window.history.pushState(
            { tab: "promo", reviewQuoteId: data.quote._id },
            "",
            `/?reviewQuoteId=${data.quote._id}`
          )
        }
      } else {
        toast.success(
          `Quote #${quoteNumber} submitted to ${effectiveReviewer} for review!`
        )
        resetCalculatorDefaults()
        if (typeof window !== "undefined") {
          window.history.pushState({}, "", "/?tab=promo")
        }
        window.dispatchEvent(new CustomEvent(DRAFT_CHANGE_EVENT))
      }
    },
  })

  // 5. Universal Review Actions Hook
  const reviewActions = useUniversalReviewActions({
    quoteTypeLabel: "Window",
    quoteNumber,
    reviewQuoteId: loader.reviewQuoteId,
    reviewQuote: loader.reviewQuote,
    setReviewQuote: loader.setReviewQuote,
    setOriginalSnapshot: loader.setOriginalSnapshot,
    setIsEditMode: loader.setIsEditMode,
    handleExitReview: loader.handleExitReview,
    staffList: reviewSubmit.staffList,
    clerkList: reviewSubmit.clerkList,
    user,
    buildUpdatePayload,
    originalSnapshot: loader.originalSnapshot,
  })

  // 6. PDF Import Exit Handlers
  const [showExitReviewForPdfModal, setShowExitReviewForPdfModal] = useState<boolean>(false)

  const handlePdfImportClick = () => {
    if (loader.reviewQuote) {
      setShowExitReviewForPdfModal(true)
      return
    }
    fileInputRef.current?.click()
  }

  const handleExitReviewAndImportPdf = () => {
    setShowExitReviewForPdfModal(false)
    loader.handleExitReview()
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 100)
  }

  return {
    reviewQuoteId: loader.reviewQuoteId,
    setReviewQuoteId: loader.setReviewQuoteId,
    reviewQuote: loader.reviewQuote,
    setReviewQuote: loader.setReviewQuote,
    isEditMode: loader.isEditMode,
    setIsEditMode: loader.setIsEditMode,
    originalSnapshot: loader.originalSnapshot,
    setOriginalSnapshot: loader.setOriginalSnapshot,
    reviewActionLoading: reviewActions.reviewActionLoading,
    showSubmitModal: reviewSubmit.showSubmitModal,
    setShowSubmitModal: reviewSubmit.setShowSubmitModal,
    assignedReviewer: reviewSubmit.assignedReviewer,
    setAssignedReviewer: reviewSubmit.setAssignedReviewer,
    preparerNotes: reviewSubmit.preparerNotes,
    setPreparerNotes: reviewSubmit.setPreparerNotes,
    submittingQuote: reviewSubmit.submittingQuote,
    staffList: reviewSubmit.staffList,
    setStaffList: reviewSubmit.setStaffList,
    clerkList: reviewSubmit.clerkList,
    setClerkList: reviewSubmit.setClerkList,
    adminSubmitMode: reviewSubmit.adminSubmitMode,
    setAdminSubmitMode: reviewSubmit.setAdminSubmitMode,
    showReassignModal: reviewActions.showReassignModal,
    setShowReassignModal: reviewActions.setShowReassignModal,
    reassignTo: reviewActions.reassignTo,
    setReassignTo: reviewActions.setReassignTo,
    reassignNotes: reviewActions.reassignNotes,
    setReassignNotes: reviewActions.setReassignNotes,
    showReturnModal: reviewActions.showReturnModal,
    setShowReturnModal: reviewActions.setShowReturnModal,
    returnNotes: reviewActions.returnNotes,
    setReturnNotes: reviewActions.setReturnNotes,
    showApproveOdooModal: reviewActions.showApproveOdooModal,
    setShowApproveOdooModal: reviewActions.setShowApproveOdooModal,
    selectedOdooClerk: reviewActions.selectedOdooClerk,
    setSelectedOdooClerk: reviewActions.setSelectedOdooClerk,
    showCompleteOdooModal: reviewActions.showCompleteOdooModal,
    setShowCompleteOdooModal: reviewActions.setShowCompleteOdooModal,
    odooOrderNumberInput: reviewActions.odooOrderNumberInput,
    setOdooOrderNumberInput: reviewActions.setOdooOrderNumberInput,
    showExitReviewForPdfModal,
    setShowExitReviewForPdfModal,
    isReviewerOrAdmin: permissions.isReviewerOrAdmin,
    canApprove: permissions.canApprove,
    isAssignedReviewer: permissions.isAssignedReviewer,
    isOdooClerk: permissions.isOdooClerk,
    isApprovedOrModified: permissions.isApprovedOrModified,
    canEditCurrentQuote: permissions.canEditCurrentQuote,
    canEditApprovedQuote: permissions.canEditApprovedQuote,
    isReadOnly: permissions.isReadOnly,
    handleOpenQuoteFromTab: loader.handleOpenQuoteFromTab,
    handleSubmitForReview: reviewSubmit.handleSubmitQuote,
    handleSaveQuotePrices: reviewActions.handleSaveQuotePrices,
    handleCancelEdits: loader.handleCancelEdits,
    handleExitReview: loader.handleExitReview,
    handleApproveReviewQuote: reviewActions.handleApproveReviewQuote,
    confirmApproveReviewQuote: reviewActions.confirmApproveReviewQuote,
    handleCompleteOdooEntry: reviewActions.handleCompleteOdooEntry,
    handleReturnReviewQuote: reviewActions.handleReturnReviewQuote,
    submitReturnReviewQuote: reviewActions.submitReturnReviewQuote,
    handlePdfImportClick,
    handleExitReviewAndImportPdf,
    handleResubmitReturnedQuote: reviewActions.handleResubmitReturnedQuote,
    handleReassignQuote: reviewActions.handleReassignQuote,
  }
}
