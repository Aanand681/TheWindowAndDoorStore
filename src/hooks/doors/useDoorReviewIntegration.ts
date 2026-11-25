"use client"

import { useDoorReviewSubmit } from "./useDoorReviewSubmit"
import { useDoorReviewLoader } from "./door-review-loader"
import { useDoorReviewActions } from "./door-review-actions"
import { useDoorAttachedSync } from "./useDoorAttachedSync"
import { buildDoorReviewWorkflowProps } from "./door-workflow-props-builder"

export interface UseDoorReviewIntegrationParams {
  user: any
  isAdmin: boolean
  customerName: string
  quoteNumber: string
  lineItems: any[]
  mode: any
  quoteNotes: string
  isFirstNation: boolean
  totals: any
  attachedWindowQuote: any
  attachedSealedUnit: any
  selectedRegionId: string
  travelFeeType: any
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  globalUpcharges: any[]
  hstRate: number
  customLabour: string
  customMisc: string
  customDiscount?: string
  customDiscountLabel?: string
  loyaltyDiscount?: string
  loyaltyDiscountLabel?: string
  discountType?: "none" | "custom" | "loyalty"
  loyaltyPoints?: number
  loyaltyGrossAmount?: number
  customMaterials?: any[]
  presets: any[]
  formula: any
  setCustomerName: (v: string) => void
  setQuoteNumber: (v: string) => void
  setQuoteNotes: (v: string) => void
  setMode: (m: any) => void
  setLineItems: any
  setGlobalUpcharges: any
  setSelectedRegionId: (id: string) => void
  setTravelFeeType: (t: any) => void
  setCustomTravelFee: (f: string) => void
  setShowOutTownTravel: (s: boolean) => void
  setTravelKm: (km: string) => void
  setCrewHours: (h: string) => void
  setCrewSize: (s: "2" | "3") => void
  handleToggleFirstNation: (val: boolean) => void
  setHstRate: (r: number) => void
  setCustomLabour: (l: string) => void
  setCustomMisc: (m: string) => void
  setCustomDiscount?: (d: string) => void
  setCustomDiscountLabel?: (l: string) => void
  setLoyaltyDiscount?: (l: string) => void
  setLoyaltyDiscountLabel?: (l: string) => void
  setDiscountType?: (t: "none" | "custom" | "loyalty") => void
  setLoyaltyPoints?: (p: number) => void
  setLoyaltyGrossAmount?: (a: number) => void
  setCustomMaterials?: (m: any[]) => void
  setAttachedWindowQuote: (q: any) => void
  setAttachedSealedUnit: (u: any) => void
  handleConfirmReset: () => void
  setShowPreviewModal: (show: boolean) => void
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export function useDoorReviewIntegration(p: UseDoorReviewIntegrationParams) {
  const reviewSubmit = useDoorReviewSubmit({
    user: p.user,
    isAdmin: p.isAdmin,
    customerName: p.customerName,
    quoteNumber: p.quoteNumber,
    lineItems: p.lineItems,
    mode: p.mode,
    quoteNotes: p.quoteNotes,
    isFirstNation: p.isFirstNation,
    totals: p.totals,
    attachedWindowQuote: p.attachedWindowQuote,
    attachedSealedUnit: p.attachedSealedUnit,
    selectedRegionId: p.selectedRegionId,
    travelFeeType: p.travelFeeType,
    customTravelFee: p.customTravelFee,
    showOutTownTravel: p.showOutTownTravel,
    travelKm: p.travelKm,
    crewHours: p.crewHours,
    crewSize: p.crewSize,
    hstRate: p.hstRate,
    customLabour: p.customLabour,
    customMisc: p.customMisc,
    customDiscount: p.customDiscount,
    customDiscountLabel: p.customDiscountLabel,
    loyaltyDiscount: p.loyaltyDiscount,
    loyaltyDiscountLabel: p.loyaltyDiscountLabel,
    discountType: p.discountType,
    loyaltyPoints: p.loyaltyPoints,
    loyaltyGrossAmount: p.loyaltyGrossAmount,
    customMaterials: p.customMaterials,
  })

  const reviewLoader = useDoorReviewLoader({
    user: p.user,
    presets: p.presets,
    formula: p.formula,
    setCustomerName: p.setCustomerName,
    setQuoteNumber: p.setQuoteNumber,
    setQuoteNotes: p.setQuoteNotes,
    setMode: p.setMode,
    setLineItems: p.setLineItems,
    setGlobalUpcharges: p.setGlobalUpcharges,
    setSelectedRegionId: p.setSelectedRegionId,
    setTravelFeeType: p.setTravelFeeType,
    setCustomTravelFee: p.setCustomTravelFee,
    setShowOutTownTravel: p.setShowOutTownTravel,
    setTravelKm: p.setTravelKm,
    setCrewHours: p.setCrewHours,
    setCrewSize: p.setCrewSize,
    setIsFirstNation: p.handleToggleFirstNation,
    setHstRate: p.setHstRate,
    setCustomLabour: p.setCustomLabour,
    setCustomMisc: p.setCustomMisc,
    setCustomDiscount: p.setCustomDiscount,
    setCustomDiscountLabel: p.setCustomDiscountLabel,
    setLoyaltyDiscount: p.setLoyaltyDiscount,
    setLoyaltyDiscountLabel: p.setLoyaltyDiscountLabel,
    setDiscountType: p.setDiscountType,
    setLoyaltyPoints: p.setLoyaltyPoints,
    setLoyaltyGrossAmount: p.setLoyaltyGrossAmount,
    setCustomMaterials: p.setCustomMaterials,
    setAttachedWindowQuote: p.setAttachedWindowQuote,
    setAttachedSealedUnit: p.setAttachedSealedUnit,
    onConfirmReset: p.handleConfirmReset,
    initialReviewQuoteId: p.initialReviewQuoteId,
    initialIsEditMode: p.initialIsEditMode,
    originSubTab: p.originSubTab,
  })

  useDoorAttachedSync({
    attachedWindowQuote: p.attachedWindowQuote,
    setAttachedWindowQuote: p.setAttachedWindowQuote,
    attachedSealedUnit: p.attachedSealedUnit,
    setAttachedSealedUnit: p.setAttachedSealedUnit,
    enabled: !reviewLoader.reviewQuote,
  })

  const reviewActions = useDoorReviewActions({
    user: p.user,
    reviewQuoteId: reviewLoader.reviewQuoteId,
    reviewQuote: reviewLoader.reviewQuote,
    setReviewQuote: reviewLoader.setReviewQuote,
    setOriginalSnapshot: reviewLoader.setOriginalSnapshot,
    setIsEditMode: reviewLoader.setIsEditMode,
    handleExitReview: reviewLoader.handleExitReview,
    customerName: p.customerName,
    quoteNumber: p.quoteNumber,
    quoteNotes: p.quoteNotes,
    mode: p.mode,
    lineItems: p.lineItems,
    totals: p.totals,
    globalUpcharges: p.globalUpcharges,
    selectedRegionId: p.selectedRegionId,
    travelFeeType: p.travelFeeType,
    customTravelFee: p.customTravelFee,
    showOutTownTravel: p.showOutTownTravel,
    travelKm: p.travelKm,
    crewHours: p.crewHours,
    crewSize: p.crewSize,
    isFirstNation: p.isFirstNation,
    hstRate: p.hstRate,
    customLabour: p.customLabour,
    customMisc: p.customMisc,
    customDiscount: p.customDiscount,
    customDiscountLabel: p.customDiscountLabel,
    loyaltyDiscount: p.loyaltyDiscount,
    loyaltyDiscountLabel: p.loyaltyDiscountLabel,
    discountType: p.discountType,
    loyaltyPoints: p.loyaltyPoints,
    loyaltyGrossAmount: p.loyaltyGrossAmount,
    customMaterials: p.customMaterials,
    attachedWindowQuote: p.attachedWindowQuote,
    attachedSealedUnit: p.attachedSealedUnit,
    staffList: reviewSubmit.staffList,
    clerkList: reviewSubmit.clerkList,
  })

  const reviewWorkflowProps = buildDoorReviewWorkflowProps({
    reviewLoader,
    reviewActions,
    user: p.user,
    staffList: reviewSubmit.staffList,
    setShowPreviewModal: p.setShowPreviewModal,
  })

  return {
    reviewSubmit,
    reviewLoader,
    reviewActions,
    reviewWorkflowProps,
  }
}
