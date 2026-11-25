"use client"

import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "@/components/sealed-units/types"

export interface BuildSealedUnitsUpdatePayloadParams {
  customerName: string
  quoteNumber: string
  quoteNotes: string
  sealedUnitMode: any
  isInstallation: boolean
  isServiceOnly: boolean
  lineItems: SealedUnitLineItem[]
  totals: SealedUnitTotals
  serviceSqftInput: string
  serviceLabourRateInput: string
  serviceMiscRateInput: string
  selectedRegionId?: string
  travelFeeType: any
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  extraLabour?: string
  globalUpcharges?: any[]
  customMaterials?: any[]
  loyaltyDiscount?: string
  loyaltyDiscountLabel?: string
  discountType?: "none" | "custom" | "loyalty"
  loyaltyPoints?: number
  loyaltyGrossAmount?: number
  hstRate: number
  attachedWindowQuote: any
  attachedDoorQuote: any
  status?: string
  extra?: Record<string, any>
}

export function buildSealedUnitsUpdatePayload(
  p: BuildSealedUnitsUpdatePayloadParams
) {
  const {
    customerName,
    quoteNumber,
    quoteNotes,
    sealedUnitMode,
    isInstallation,
    isServiceOnly,
    lineItems,
    totals,
    serviceSqftInput,
    serviceLabourRateInput,
    serviceMiscRateInput,
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
    hstRate,
    attachedWindowQuote,
    attachedDoorQuote,
    status,
    extra = {},
  } = p

  const loyaltyDiscountNum = Math.max(0, parseFloat(String(loyaltyDiscount)) || 0)

  return {
    customerName,
    quoteNumber,
    quoteNotes,
    quoteType: "sealed_unit",
    sealedUnitMode,
    windows: lineItems,
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
      effectiveLabourRate: totals.effectiveLabourRate,
      miscTotal: totals.miscTotal,
      effectiveMiscRate: totals.effectiveMiscRate,
      loyaltyDiscount: loyaltyDiscountNum,
      loyaltyDiscountLabel,
      discountType,
      loyaltyPoints,
      loyaltyGrossAmount,
      isSealedUnitQuote: true,
    },
    quoteSummaryTotal: Math.round(totals.grandTotal * 100),
    serviceSqftInput,
    serviceLabourRateInput,
    serviceMiscRateInput,
    selectedRegionId,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    extraLabour,
    globalUpcharges,
    customMaterials,
    loyaltyDiscount,
    loyaltyDiscountLabel,
    discountType,
    loyaltyPoints,
    loyaltyGrossAmount,
    hstRate,
    attachedWindowQuote,
    attachedDoorQuote,
    attachedInstallOption: readSessionAttachedInstallOption(),
    customOptions: readSessionCustomOptions(),
    ...(status ? { status } : {}),
    ...extra,
  }
}
