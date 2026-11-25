"use client"

import { useCallback } from "react"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "@/components/sealed-units/types"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useUniversalReviewSubmit } from "@/hooks/quotes/review/useUniversalReviewSubmit"

interface UseSealedUnitsReviewSubmitProps {
  user: any
  quoteNumber: string
  customerName: string
  quoteNotes: string
  lineItems: SealedUnitLineItem[]
  isInstallation: boolean
  isServiceOnly: boolean
  hstRate: number
  totals: SealedUnitTotals
  assignedReviewer: string
  selectedOdooClerk: string
  attachedWindowQuote?: any
  attachedDoorQuote?: any
  selectedRegionId?: string
  travelFeeType?: string
  customTravelFee?: string
  showOutTownTravel?: boolean
  travelKm?: string
  crewHours?: string
  crewSize?: string
  extraLabour?: string
  globalUpcharges?: any[]
  customMaterials?: any[]
  loyaltyDiscount?: string
  loyaltyDiscountLabel?: string
  discountType?: "none" | "custom" | "loyalty"
  loyaltyPoints?: number
  loyaltyGrossAmount?: number
}

export function useSealedUnitsReviewSubmit({
  user,
  quoteNumber,
  customerName,
  quoteNotes,
  lineItems,
  isInstallation,
  isServiceOnly,
  hstRate,
  totals,
  assignedReviewer,
  selectedOdooClerk,
  attachedWindowQuote,
  attachedDoorQuote,
  selectedRegionId,
  travelFeeType,
  customTravelFee,
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
  extraLabour,
  globalUpcharges,
  customMaterials = [],
  loyaltyDiscount = "",
  loyaltyDiscountLabel = "",
  discountType = "none",
  loyaltyPoints = 0,
  loyaltyGrossAmount = 0,
}: UseSealedUnitsReviewSubmitProps) {
  const buildSubmitPayload = useCallback(
    ({ isDirectApprove, effectiveReviewer, effectiveClerk, preparerNotes }: any) => {
      const effectiveLineItems =
        lineItems.length > 0
          ? lineItems
          : [
              {
                id: "service-unit-1",
                combinationName: "On-Site Sealed Unit Glazing Service",
                paneType: "dual",
                treatment: "annealed",
                thicknessMm: 0,
                widthIn: 0,
                heightIn: 0,
                actualSqft: totals.totalSqft,
                billableSqft: Math.ceil(totals.totalSqft),
                quantity: 1,
                finalUnitPrice: 0,
                multipliedAmount: 0,
                multipliedTotal: 0,
                lineGlassTotal: 0,
                totalLabour: totals.serviceLabourTotal,
                totalMisc: totals.miscTotal,
              } as any,
            ]

      return {
        quoteNumber,
        customerName,
        assignedTo: isDirectApprove ? user?.username || "" : (effectiveReviewer || assignedReviewer),
        directApprove: isDirectApprove,
        odooAssignedTo: isDirectApprove ? (effectiveClerk || selectedOdooClerk) : undefined,
        preparerNotes,
        quoteNotes,
        attachedWindowQuote,
        attachedDoorQuote,
        attachedInstallOption: readSessionAttachedInstallOption(),
        customOptions: readSessionCustomOptions(),
        selectedRegionId,
        travelFeeType,
        customTravelFee,
        showOutTownTravel,
        travelKm,
        crewHours,
        crewSize,
        extraLabour: extraLabour || "",
        globalUpcharges: globalUpcharges || [],
        customMaterials: customMaterials || [],
        loyaltyDiscount,
        loyaltyDiscountLabel,
        discountType,
        loyaltyPoints,
        loyaltyGrossAmount,
        hstRate,
        windows: effectiveLineItems,
        taxTotals: {
          ...totals,
          isSupplyOnly: !isInstallation,
          isServiceOnly,
          subtotalPreTax: totals.subtotalPreTax,
          grandTotal: totals.grandTotal,
          hstAmount: totals.hstAmount,
          hstRate,
          totalUnits: totals.totalUnits,
          totalSqft: totals.totalSqft,
          glassSupplyTotal: totals.glassSupplyTotal,
          combinedLabourTotal: totals.combinedLabourTotal,
          miscTotal: totals.miscTotal,
          baseSetupFee: totals.baseSetupFee,
          totalAdditionalTravel: totals.totalAdditionalTravel,
          loyaltyDiscount: Math.max(0, parseFloat(String(loyaltyDiscount)) || 0),
          loyaltyDiscountLabel,
          discountType,
          loyaltyPoints,
          loyaltyGrossAmount,
          isSealedUnitQuote: true,
        },
        quoteResult: {
          base: totals.glassBefore8PercentTotal,
          surcharge: totals.glass8PercentSurchargeTotal,
          total: totals.grandTotal,
          isSealedUnit: true,
        },
        quoteSummaryTotal: Math.round(totals.grandTotal * 100),
      }
    },
    [
      lineItems, totals, quoteNumber, customerName, user?.username, assignedReviewer,
      selectedOdooClerk, quoteNotes, attachedWindowQuote, attachedDoorQuote,
      selectedRegionId, travelFeeType, customTravelFee, showOutTownTravel, travelKm,
      crewHours, crewSize, extraLabour, globalUpcharges, customMaterials,
      loyaltyDiscount, loyaltyDiscountLabel, discountType, loyaltyPoints, loyaltyGrossAmount,
      hstRate, isInstallation, isServiceOnly,
    ]
  )

  const universal = useUniversalReviewSubmit({
    user,
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPERADMIN",
    customerName,
    quoteNumber,
    itemCount: isServiceOnly && (totals.totalSqft || 0) > 0 ? 1 : lineItems.length,
    quoteType: "sealed_unit",
    quoteTypeLabel: "Sealed Unit",
    buildSubmitPayload,
    attachedWindowQuote,
    attachedDoorQuote,
  })

  return {
    showSubmitModal: universal.showSubmitModal,
    setShowSubmitModal: universal.setShowSubmitModal,
    submittingQuote: universal.submittingQuote,
    adminSubmitMode: universal.adminSubmitMode,
    setAdminSubmitMode: universal.setAdminSubmitMode,
    preparerNotes: universal.preparerNotes,
    setPreparerNotes: universal.setPreparerNotes,
    handleSubmitForReview: universal.handleSubmitQuote,
  }
}
