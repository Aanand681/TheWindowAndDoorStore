"use client"

import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { DoorLineItem, DoorQuoteTotals } from "@/lib/doors/types"

export interface BuildDoorUpdatePayloadParams {
  customerName: string
  quoteNumber: string
  quoteNotes: string
  mode: any
  lineItems: DoorLineItem[]
  totals: DoorQuoteTotals
  globalUpcharges: any[]
  selectedRegionId?: string
  travelFeeType: any
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  isFirstNation: boolean
  hstRate: number
  customLabour: string
  customMisc: string
  attachedWindowQuote: any
  attachedSealedUnit: any
  status?: string
  extra?: Record<string, any>
}

export function buildDoorUpdatePayload(p: BuildDoorUpdatePayloadParams) {
  const {
    customerName,
    quoteNumber,
    quoteNotes,
    mode,
    lineItems,
    totals,
    globalUpcharges,
    selectedRegionId,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    isFirstNation,
    hstRate,
    customLabour,
    customMisc,
    attachedWindowQuote,
    attachedSealedUnit,
    status,
    extra = {},
  } = p

  return {
    customerName,
    quoteNumber,
    quoteNotes,
    mode,
    quoteType: "door",
    windows: lineItems.map((item) => ({
      id: item.id,
      combinationName: item.customDescription || item.presetLabel,
      doorPresetId: item.presetId,
      presetId: item.presetId,
      presetLabel: item.presetLabel,
      category: item.category,
      quantity: item.quantity,
      inksterBasePrice: item.inksterBasePrice,
      finalUnitPrice: item.inksterBasePrice,
      lineTotal: item.lineGrandTotal,
      hardwareType: item.hardwareType,
      hardwarePrice: item.hardwarePrice,
      supplyHardwareType: item.supplyHardwareType,
      supplyHardwarePrice: item.supplyHardwarePrice,
      installHardwareType: item.installHardwareType,
      installHardwarePrice: item.installHardwarePrice,
      customHardwareName: item.customHardwareName,
      customHardwarePrice: item.customHardwarePrice,
      unitLabour: item.unitLabour,
      unitMisc: item.unitMisc,
      upcharges: item.upcharges,
      upchargesTotal: item.upchargesTotal,
      upgradeOption: item.upgradeOption,
      notes: item.notes,
    })),
    taxTotals: {
      isSupplyOnly: mode === "supply_only",
      isFirstNation,
      hstRate,
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
    quoteSummaryTotal: Math.round(totals.grandTotal * 100),
    globalUpcharges,
    selectedRegionId,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    isFirstNation,
    hstRate,
    customLabour,
    customMisc,
    attachedWindowQuote,
    attachedSealedUnit,
    attachedInstallOption: readSessionAttachedInstallOption(),
    customOptions: readSessionCustomOptions(),
    ...(status ? { status } : {}),
    ...extra,
  }
}
