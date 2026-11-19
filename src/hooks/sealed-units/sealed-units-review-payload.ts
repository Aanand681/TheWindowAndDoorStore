"use client"

import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "@/components/sealed-units/invoice/types"

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
    hstRate,
    attachedWindowQuote,
    attachedDoorQuote,
    status,
    extra = {},
  } = p

  return {
    customerName,
    quoteNumber,
    quoteNotes,
    quoteType: "sealed_unit",
    sealedUnitMode,
    windows: lineItems,
    taxTotals: {
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
    hstRate,
    attachedWindowQuote,
    attachedDoorQuote,
    attachedInstallOption: readSessionAttachedInstallOption(),
    customOptions: readSessionCustomOptions(),
    ...(status ? { status } : {}),
    ...extra,
  }
}
