/**
 * Pure Calculation Engine for Quotes, Drafts, and Attached Quotations.
 * Single source of truth across PromoCalculator, AutoSave, Drafts, and Review Workflows.
 * 100% Stateless & Pure — Safe to unit test and verify.
 */

export interface CombinedPricingParams {
  quoteResult?: {
    base?: number
    surcharge?: number
    promoDiscount?: number
  } | null
  afterDiscount?: number // cents
  total?: number // cents
  attachedSealedUnit?: any | null
  attachedDoorQuote?: any | null
  effectiveJC?: number // cents
  effectiveMisc?: number // cents
  effectiveLabour?: number // cents
  hstRate?: number // 13 or 8 (First Nation exempt) or 0
  isSupplyOnly?: boolean
}

export interface CombinedPricingResult {
  // Dollar amounts (used for auto-save and draft records)
  subtotalDollars: number
  grandTotalDollars: number

  // Cents amounts (exact financial accounting)
  combinedSubtotalCents: number
  combinedTaxCents: number
  combinedTotalCents: number
  combinedHstBaseCents?: number
  combinedMaterialExemptionCents?: number

  // Breakdown components (cents)
  windowBaseCents: number
  windowSurchargeCents: number
  windowDiscountCents: number

  suGlassCents: number
  suSurchargeCents: number
  suLabourCents: number
  suMiscCents: number

  doorMaterialsCents: number
  doorSurchargeCents: number
  doorLabourCents: number
  doorMiscCents: number

  combinedMiscCents: number
  combinedLabourCents: number
  combinedSurchargeCents: number
}

import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"

/**
 * Computes exact unified financials across windows, attached sealed units, and attached doors.
 * Delegates to the Universal Pricing Engine (Single Source of Truth).
 */
export function computeCombinedQuoteFinancials(
  params: CombinedPricingParams
): CombinedPricingResult {
  const {
    quoteResult, afterDiscount = 0, total = 0, attachedSealedUnit,
    attachedDoorQuote, effectiveJC = 0, effectiveMisc = 0,
    effectiveLabour = 0, hstRate = 13, isSupplyOnly = false,
  } = params

  const isSupply = Boolean(isSupplyOnly)

  const qTaxTotals = (quoteResult as any)?.taxTotals || (params as any)?.taxTotals || {}
  const winTravel = Number(qTaxTotals?.extras ?? qTaxTotals?.totalTravelAndSetup ?? 0)

  const universal = calculateUniversalPricing({
    windowQuote: {
      data: {
        effectiveBase: (quoteResult?.base || 0) / 100,
        quoteResult,
        taxTotals: {
          ...qTaxTotals,
          extras: winTravel,
          finalLabour: effectiveLabour / 100,
          finalMisc: effectiveMisc / 100,
          finalJC: effectiveJC / 100,
        },
        surchargeRate: 8,
        isSupplyOnly: isSupply,
      },
    },
    doorQuote: winTravel > 0
      ? attachedDoorQuote
      : attachedDoorQuote
        ? {
            ...attachedDoorQuote,
            totals: { ...(attachedDoorQuote.totals || {}), travelAndSetupFee: 0, totalTravelAndSetup: 0 },
            taxTotals: { ...(attachedDoorQuote.taxTotals || {}), travelAndSetupFee: 0, totalTravelAndSetup: 0 },
          }
        : undefined,
    sealedUnitQuote: winTravel > 0
      ? attachedSealedUnit
      : attachedSealedUnit
        ? {
            ...attachedSealedUnit,
            totals: { ...(attachedSealedUnit.totals || {}), travelAndSetupFee: 0, totalTravelAndSetup: 0 },
            taxTotals: { ...(attachedSealedUnit.taxTotals || {}), travelAndSetupFee: 0, totalTravelAndSetup: 0 },
          }
        : undefined,
    hostType: "window",
    isSupplyOnly: isSupply,
    hstRate,
    isFirstNation: hstRate === 8,
  })

  const hasAnyAttached = Boolean(attachedSealedUnit || attachedDoorQuote)
  const combinedSubtotalCents = !hasAnyAttached && afterDiscount > 0
    ? Math.round(afterDiscount)
    : universal.subtotalCents
  const combinedTaxCents = !hasAnyAttached && total > 0 && afterDiscount > 0
    ? Math.max(0, Math.round(total) - combinedSubtotalCents)
    : universal.taxCents
  const combinedTotalCents = !hasAnyAttached && total > 0
    ? Math.round(total)
    : universal.totalCents

  return {
    subtotalDollars: Math.round(combinedSubtotalCents) / 100,
    grandTotalDollars: Math.round(combinedTotalCents) / 100,
    combinedSubtotalCents,
    combinedTaxCents,
    combinedTotalCents,
    combinedHstBaseCents: Math.round(universal.hstBase * 100),
    combinedMaterialExemptionCents: Math.round(universal.materialExemption * 100),
    windowBaseCents: Math.round((universal.winNorm?.rawBase || 0) * 100),
    windowSurchargeCents: Math.round((universal.winNorm?.surcharge || 0) * 100),
    windowDiscountCents: Math.round((universal.winNorm?.discount || 0) * 100),
    suGlassCents: Math.round((universal.suNorm?.materials || 0) * 100),
    suSurchargeCents: Math.round((universal.suNorm?.surcharge || 0) * 100),
    suLabourCents: Math.round((universal.suNorm?.pureLabour || 0) * 100),
    suMiscCents: Math.round((universal.suNorm?.misc || 0) * 100),
    doorMaterialsCents: Math.round((universal.doorNorm?.materials || 0) * 100),
    doorSurchargeCents: Math.round((universal.doorNorm?.surcharge || 0) * 100),
    doorLabourCents: Math.round((universal.doorNorm?.pureLabour || 0) * 100),
    doorMiscCents: Math.round((universal.doorNorm?.misc || 0) * 100),
    combinedMiscCents: universal.miscCents,
    combinedLabourCents: universal.labourCents,
    combinedSurchargeCents: universal.surchargesCents,
  }
}
