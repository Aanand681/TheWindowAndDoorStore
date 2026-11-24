"use client"

import { useMemo } from "react"
import { useSession } from "next-auth/react"
import { calculateDoorQuoteTotals } from "@/lib/doors/calculations"
import { useDoorSettings } from "./useDoorSettings"
import { useDoorItemBuilder } from "./useDoorItemBuilder"
import { useDoorTravel } from "./useDoorTravel"
import { useDoorDrafts } from "./useDoorDrafts"
import { useDoorAutoSave } from "./useDoorAutoSave"
import { useDoorBaseQuoteState } from "./useDoorBaseQuoteState"
import { useDoorReviewIntegration } from "./useDoorReviewIntegration"
import { buildDoorSharedSyncProps } from "./door-sync-props-builder"

export interface UseDoorCalculatorPageOptions {
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export function useDoorCalculatorPage(
  options: UseDoorCalculatorPageOptions = {}
) {
  const { data: session } = useSession()
  const user = session?.user as any
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN"

  // 1. Settings Hook
  const { presets, upcharges, formula, logistics } = useDoorSettings()

  // 2. Base Quote Customer & Mode State
  const base = useDoorBaseQuoteState()

  // 3. Line Item Builder Hook
  const items = useDoorItemBuilder()

  // 4. Travel & Logistics Hook
  const travel = useDoorTravel()

  // 5. Calculate Totals using Pure Calculation Engine
  const totals = useMemo(() => {
    return calculateDoorQuoteTotals({
      lineItems: items.lineItems,
      mode: base.mode,
      globalUpcharges: base.globalUpcharges,
      travelFeeType: travel.travelFeeType,
      customTravelFee: travel.customTravelFee,
      showOutTownTravel: travel.showOutTownTravel,
      travelKm: travel.travelKm,
      crewHours: travel.crewHours,
      crewSize: travel.crewSize,
      hstRate: base.hstRate,
      isFirstNation: base.isFirstNation,
      formula,
      logistics,
      customDiscount: base.customDiscount,
      loyaltyDiscount: base.loyaltyDiscount,
      loyaltyDiscountLabel: base.loyaltyDiscountLabel,
    })
  }, [
    items.lineItems,
    base.mode,
    base.globalUpcharges,
    travel.travelFeeType,
    travel.customTravelFee,
    travel.showOutTownTravel,
    travel.travelKm,
    travel.crewHours,
    travel.crewSize,
    base.hstRate,
    base.isFirstNation,
    formula,
    logistics,
    base.customDiscount,
    base.loyaltyDiscount,
    base.loyaltyDiscountLabel,
  ])

  const sharedSyncProps = buildDoorSharedSyncProps({
    ...base,
    lineItems: items.lineItems,
    setLineItems: items.setLineItems,
    selectedRegionId: travel.selectedRegionId,
    setSelectedRegionId: travel.setSelectedRegionId,
    travelFeeType: travel.travelFeeType,
    setTravelFeeType: travel.setTravelFeeType,
    customTravelFee: travel.customTravelFee,
    setCustomTravelFee: travel.setCustomTravelFee,
    showOutTownTravel: travel.showOutTownTravel,
    setShowOutTownTravel: travel.setShowOutTownTravel,
    travelKm: travel.travelKm,
    setTravelKm: travel.setTravelKm,
    crewHours: travel.crewHours,
    setCrewHours: travel.setCrewHours,
    crewSize: travel.crewSize,
    setCrewSize: travel.setCrewSize,
    totals,
  })

  // 6. Auto-Save Hook
  const { lastSavedAt, setLastSavedAt } = useDoorAutoSave(sharedSyncProps)

  // 7. Drafts & Workspace Reset Hook
  const drafts = useDoorDrafts({
    ...sharedSyncProps,
    setEditingItem: items.setEditingItem,
    setLastSavedAt,
  })

  // 8. Review Mode & Workflow Hooks
  const review = useDoorReviewIntegration({
    user,
    isAdmin,
    customerName: base.customerName,
    quoteNumber: base.quoteNumber,
    lineItems: items.lineItems,
    mode: base.mode,
    quoteNotes: base.quoteNotes,
    isFirstNation: base.isFirstNation,
    totals,
    attachedWindowQuote: base.attachedWindowQuote,
    attachedSealedUnit: base.attachedSealedUnit,
    selectedRegionId: travel.selectedRegionId,
    travelFeeType: travel.travelFeeType,
    customTravelFee: travel.customTravelFee,
    showOutTownTravel: travel.showOutTownTravel,
    travelKm: travel.travelKm,
    crewHours: travel.crewHours,
    crewSize: travel.crewSize,
    globalUpcharges: base.globalUpcharges,
    hstRate: base.hstRate,
    customLabour: base.customLabour,
    customMisc: base.customMisc,
    presets,
    formula,
    setCustomerName: base.setCustomerName,
    setQuoteNumber: base.setQuoteNumber,
    setQuoteNotes: base.setQuoteNotes,
    setMode: base.setMode,
    setLineItems: items.setLineItems,
    setGlobalUpcharges: base.setGlobalUpcharges,
    setSelectedRegionId: travel.setSelectedRegionId,
    setTravelFeeType: travel.setTravelFeeType,
    setCustomTravelFee: travel.setCustomTravelFee,
    setShowOutTownTravel: travel.setShowOutTownTravel,
    setTravelKm: travel.setTravelKm,
    setCrewHours: travel.setCrewHours,
    setCrewSize: travel.setCrewSize,
    handleToggleFirstNation: base.handleToggleFirstNation,
    setHstRate: base.setHstRate,
    setCustomLabour: base.setCustomLabour,
    setCustomMisc: base.setCustomMisc,
    setAttachedWindowQuote: base.setAttachedWindowQuote,
    setAttachedSealedUnit: base.setAttachedSealedUnit,
    handleConfirmReset: drafts.handleConfirmReset,
    setShowPreviewModal: base.setShowPreviewModal,
    initialReviewQuoteId: options.initialReviewQuoteId,
    initialIsEditMode: options.initialIsEditMode,
    originSubTab: options.originSubTab,
  })

  return {
    reviewQuote: review.reviewLoader.reviewQuote,
    isEditMode: review.reviewLoader.isEditMode,
    isReadOnly: review.reviewLoader.perms.isReadOnly,
    reviewWorkflowProps: review.reviewWorkflowProps,
    reviewLoader: review.reviewLoader,
    reviewActions: review.reviewActions,
    user,
    isAdmin,
    presets,
    upcharges,
    formula,
    logistics,
    ...base,
    ...items,
    ...travel,
    totals,
    lastSavedAt,
    ...drafts,
    ...review.reviewSubmit,
  }
}

export type DoorCalculatorPageState = ReturnType<typeof useDoorCalculatorPage>
