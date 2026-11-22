"use client"

import { useCallback } from "react"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useUniversalReviewSubmit } from "@/hooks/quotes/review/useUniversalReviewSubmit"

interface UseDoorReviewSubmitProps {
  user: any
  isAdmin: boolean
  customerName: string
  quoteNumber: string
  lineItems: any[]
  mode: any
  quoteNotes: string
  isFirstNation: boolean
  totals: any
  attachedWindowQuote?: any
  attachedSealedUnit?: any
  selectedRegionId?: string
  travelFeeType?: string
  customTravelFee?: string
  showOutTownTravel?: boolean
  travelKm?: string
  crewHours?: string
  crewSize?: string
}

export function useDoorReviewSubmit({
  user,
  isAdmin,
  customerName,
  quoteNumber,
  lineItems,
  mode,
  quoteNotes,
  isFirstNation,
  totals,
  attachedWindowQuote,
  attachedSealedUnit,
  selectedRegionId,
  travelFeeType,
  customTravelFee,
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
}: UseDoorReviewSubmitProps) {
  const buildSubmitPayload = useCallback(
    ({ isDirectApprove, effectiveReviewer, effectiveClerk, preparerNotes }: any) => ({
      quoteNumber,
      customerName,
      assignedTo: isDirectApprove ? user?.username || "" : effectiveReviewer,
      directApprove: isDirectApprove,
      odooAssignedTo: isDirectApprove ? effectiveClerk : undefined,
      preparerNotes,
      quoteNotes,
      attachedWindowQuote,
      attachedSealedUnit,
      attachedInstallOption: readSessionAttachedInstallOption(),
      customOptions: readSessionCustomOptions(),
      selectedRegionId,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      quoteSummaryTotal: Math.round(totals.grandTotal * 100),
      windows: lineItems.map((item) => ({
        id: item.id,
        combinationName: item.customDescription || item.presetLabel,
        doorPresetId: item.presetId,
        category: item.category,
        quantity: item.quantity,
        inksterBasePrice: item.inksterBasePrice,
        finalUnitPrice: item.inksterBasePrice,
        lineTotal:
          mode === "supply_only"
            ? (item.lineSupplyTotal ??
              item.lineDoorSupplyTotal +
                item.lineHardwareTotal +
                item.surchargeAmount * item.quantity -
                item.discountAmount * item.quantity)
            : item.lineGrandTotal,
        hardwareType: item.hardwareType,
        hardwarePrice: item.hardwarePrice,
        upgradeOption: item.upgradeOption,
      })),
      taxTotals: {
        isSupplyOnly: mode === "supply_only",
        isFirstNation,
        totalPrice: totals.rawDoorBaseTotal + totals.stormDoorTotal,
        subtotal: totals.subtotalPreTax,
        combinedLabour: totals.combinedLabourTotal,
        miscTotal: totals.miscTotal,
        surchargeTotal: totals.surchargeTotal,
        discountTotal: totals.discountTotal,
        hstAmount: totals.hstAmount,
        grandTotal: totals.grandTotal,
        depositAmount: totals.depositAmount,
      },
      status: isDirectApprove ? "APPROVED" : "PENDING_REVIEW",
    }),
    [
      customerName, quoteNumber, quoteNotes, attachedWindowQuote, attachedSealedUnit,
      selectedRegionId, travelFeeType, customTravelFee, showOutTownTravel, travelKm,
      crewHours, crewSize, totals, lineItems, mode, isFirstNation, user?.username,
    ]
  )

  return useUniversalReviewSubmit({
    user,
    isAdmin,
    customerName,
    quoteNumber,
    itemCount: lineItems.length,
    quoteType: "door",
    quoteTypeLabel: "Door",
    buildSubmitPayload,
    attachedWindowQuote,
    attachedSealedUnit,
  })
}
