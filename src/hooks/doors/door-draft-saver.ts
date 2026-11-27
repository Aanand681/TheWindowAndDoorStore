"use client"

import {
  saveQuoteDraftDirectly,
  QuoteDraftItem,
} from "@/lib/quote-drafts-storage"
import {
  formatDoorSummarySentence,
  computeEffectiveDoorGrandTotal,
} from "@/lib/doors/calculations"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { toast } from "sonner"

export interface ExecuteSaveDoorDraftParams {
  customerName: string
  quoteNumber: string
  lineItems: any[]
  attachedWindowQuote: any
  attachedSealedUnit: any
  totals: any
  mode: any
  globalUpcharges: any[]
  selectedRegionId?: string
  travelFeeType: any
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  isFirstNation: boolean
  hstRate?: number
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
  quoteNotes: string
}

export async function executeSaveDoorDraft(
  params: ExecuteSaveDoorDraftParams
): Promise<QuoteDraftItem | null> {
  const {
    customerName,
    quoteNumber,
    lineItems,
    attachedWindowQuote,
    attachedSealedUnit,
    totals,
    mode,
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
    customDiscount = "",
    customDiscountLabel = "",
    loyaltyDiscount = "",
    loyaltyDiscountLabel = "",
    discountType = "none",
    loyaltyPoints = 0,
    loyaltyGrossAmount = 0,
    customMaterials = [],
    quoteNotes,
  } = params

  try {
    if (!customerName.trim()) {
      toast.error("Customer name is required before saving a draft.")
      return null
    }

    if (!quoteNumber.trim()) {
      toast.error("Quote number is required before saving a draft.")
      return null
    }

    if (
      lineItems.length === 0 &&
      customMaterials.length === 0 &&
      !attachedWindowQuote &&
      !attachedSealedUnit
    ) {
      toast.error(
        "Please configure and add at least one door unit before saving a draft."
      )
      return null
    }

    const summaryLabel = formatDoorSummarySentence(lineItems)
    const effectiveTotals = computeEffectiveDoorGrandTotal({
      totals,
      mode,
      customLabour,
      customMisc,
      customDiscount,
      customDiscountLabel,
      loyaltyDiscount,
      loyaltyDiscountLabel,
      hstRate,
      isFirstNation,
      attachedWindowQuote,
      attachedSealedUnit,
    })

    const saved = await saveQuoteDraftDirectly({
      type: "door",
      quoteNumber,
      customerName,
      itemCount: lineItems.length,
      subtotal: effectiveTotals.combinedSubtotal,
      grandTotal: effectiveTotals.grandTotal,
      summaryLabel,
      data: {
        quoteNumber,
        customerName,
        quoteNotes,
        mode,
        lineItems,
        globalUpcharges,
        selectedRegionId: selectedRegionId || "",
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
        customDiscount,
        customDiscountLabel,
        loyaltyDiscount,
        loyaltyDiscountLabel,
        discountType,
        loyaltyPoints,
        loyaltyGrossAmount,
        customMaterials,
        attachedWindowQuote,
        attachedSealedUnit,
        attachedInstallOption: readSessionAttachedInstallOption("door"),
        customOptions: readSessionCustomOptions("door"),
        subtotal: effectiveTotals.combinedSubtotal,
        grandTotal: effectiveTotals.grandTotal,
        itemCount: lineItems.length,
        totals,
        taxTotals: {
          ...totals,
          subtotalPreTax: effectiveTotals.combinedSubtotal,
          grandTotal: effectiveTotals.grandTotal,
        },
      },
    })

    return saved
  } catch {
    toast.error(
      "Failed to save draft to database. Please check your connection and try again."
    )
    return null
  }
}

