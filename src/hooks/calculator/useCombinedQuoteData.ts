import { useMemo } from "react"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import { formatDoorSummarySentence } from "@/lib/doors/calculations"
import {
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"

export interface CombinedQuoteData {
  hasSU: boolean
  hasDoor: boolean
  // Dollar decimal fields
  windowBase: number
  suGlass: number
  doorMaterials: number
  doorDiscount: number
  combinedMisc: number
  combinedLabour: number
  combinedSurcharge: number
  windowDiscount: number
  combinedSubtotal: number
  combinedTax: number
  combinedTotal: number
  combinedFirstPaymentDollar: number
  combinedSecondPaymentDollar: number

  // Cents fields (for backward compatibility)
  windowBaseCents: number
  suGlassCents: number
  suSummarySentence: string
  isAttachedSUService: boolean
  doorMaterialsCents: number
  doorSummarySentence: string
  doorDiscountCents: number
  effectiveJCCents: number
  combinedMiscCents: number
  combinedLabourCents: number
  combinedSurchargeCents: number
  windowDiscountCents: number
  combinedSubtotalCents: number
  combinedTaxCents: number
  combinedHstBaseCents?: number
  combinedMaterialExemptionCents?: number
  combinedTotalCents: number
  combinedFirstPayment: number
  combinedSecondPayment: number
}

export interface UseCombinedQuoteDataParams {
  attachedSealedUnit?: any | null
  attachedDoorQuote?: any | null
  quoteResult?: any
  customDiscount?: string | number
  // Dollar decimal amounts
  effectiveMisc?: number
  effectiveLabour?: number
  effectiveJC?: number
  // Cents amounts
  effectiveMiscCents?: number
  effectiveLabourCents?: number
  effectiveJCCents?: number
  hstRate: number
  isSupplyOnly?: boolean
}

/**
 * Hook to compute combined financial ledger figures and summary sentences
 * when a Window calculation has an attached Sealed Unit or Door quote.
 */
export function useCombinedQuoteData({
  attachedSealedUnit,
  attachedDoorQuote,
  quoteResult,
  customDiscount,
  effectiveMisc,
  effectiveLabour,
  effectiveJC,
  effectiveMiscCents,
  effectiveLabourCents,
  effectiveJCCents,
  hstRate,
  isSupplyOnly = false,
}: UseCombinedQuoteDataParams): CombinedQuoteData | null {
  return useMemo(() => {
    if (!attachedSealedUnit && !attachedDoorQuote) return null

    const resolvedJCCents =
      effectiveJC !== undefined
        ? Math.round(effectiveJC * 100)
        : effectiveJCCents || 0
    const resolvedMiscCents =
      effectiveMisc !== undefined
        ? Math.round(effectiveMisc * 100)
        : effectiveMiscCents || 0
    const resolvedLabourCents =
      effectiveLabour !== undefined
        ? Math.round(effectiveLabour * 100)
        : effectiveLabourCents || 0

    const fin = computeCombinedQuoteFinancials({
      quoteResult,
      attachedSealedUnit,
      attachedDoorQuote,
      customDiscount,
      effectiveJC: resolvedJCCents,
      effectiveMisc: resolvedMiscCents,
      effectiveLabour: resolvedLabourCents,
      hstRate,
      isSupplyOnly,
    })

    const hasSU = Boolean(attachedSealedUnit)
    const hasDoor = Boolean(attachedDoorQuote)
    const suTotals = attachedSealedUnit?.totals || {}
    const isAttachedSUService =
      attachedSealedUnit?.sealedUnitMode === "service_only" ||
      attachedSealedUnit?.data?.sealedUnitMode === "service_only" ||
      Boolean(suTotals.isServiceOnly)

    const suLineItems = attachedSealedUnit?.lineItems || []
    let suSummarySentence = "Sealed Unit"
    if (isAttachedSUService) {
      suSummarySentence = getSealedUnitServiceSummaryLabel(
        suLineItems,
        suTotals.totalSqft
      )
    } else if (suLineItems.length > 0) {
      suSummarySentence = formatSealedUnitSummarySentence(suLineItems)
    }

    const doorLineItems = attachedDoorQuote?.lineItems || []
    const doorSummarySentence =
      doorLineItems.length > 0
        ? formatDoorSummarySentence(doorLineItems)
        : `${attachedDoorQuote?.itemCount || 1} Door Unit${(attachedDoorQuote?.itemCount || 1) !== 1 ? "s" : ""}`

    const doorDiscountDollars = hasDoor
      ? Number(attachedDoorQuote?.totals?.discountTotal ?? attachedDoorQuote?.totals?.discount ?? 0)
      : 0
    const doorDiscountCents = Math.round(doorDiscountDollars * 100)

    const combinedFirstPayment = Math.round(fin.combinedTotalCents / 2)
    const combinedSecondPayment = fin.combinedTotalCents - combinedFirstPayment

    const windowBase = Math.round(fin.windowBaseCents) / 100
    const suGlass = Math.round(fin.suGlassCents) / 100
    const doorMaterials = Math.round(fin.doorMaterialsCents) / 100
    const doorDiscount = doorDiscountDollars
    const combinedMisc = Math.round(fin.combinedMiscCents) / 100
    const combinedLabour = Math.round(fin.combinedLabourCents) / 100
    const combinedSurcharge = Math.round(fin.combinedSurchargeCents) / 100
    const windowDiscount = Math.round(fin.windowDiscountCents) / 100
    const combinedSubtotal = fin.subtotalDollars
    const combinedTotal = fin.grandTotalDollars
    const combinedTax = Math.round((combinedTotal - combinedSubtotal) * 100) / 100
    const combinedFirstPaymentDollar = Math.round(combinedTotal * 0.5 * 100) / 100
    const combinedSecondPaymentDollar = Math.round((combinedTotal - combinedFirstPaymentDollar) * 100) / 100

    return {
      hasSU,
      hasDoor,
      windowBase,
      suGlass,
      doorMaterials,
      doorDiscount,
      combinedMisc,
      combinedLabour,
      combinedSurcharge,
      windowDiscount,
      combinedSubtotal,
      combinedTax,
      combinedTotal,
      combinedFirstPaymentDollar,
      combinedSecondPaymentDollar,

      windowBaseCents: fin.windowBaseCents,
      suGlassCents: fin.suGlassCents,
      suSummarySentence,
      isAttachedSUService,
      doorMaterialsCents: fin.doorMaterialsCents,
      doorSummarySentence,
      doorDiscountCents,
      effectiveJCCents: resolvedJCCents,
      combinedMiscCents: fin.combinedMiscCents,
      combinedLabourCents: fin.combinedLabourCents,
      combinedSurchargeCents: fin.combinedSurchargeCents,
      windowDiscountCents: fin.windowDiscountCents,
      combinedSubtotalCents: fin.combinedSubtotalCents,
      combinedTaxCents: fin.combinedTaxCents,
      combinedHstBaseCents: fin.combinedHstBaseCents || 0,
      combinedMaterialExemptionCents: fin.combinedMaterialExemptionCents || 0,
      combinedTotalCents: fin.combinedTotalCents,
      combinedFirstPayment,
      combinedSecondPayment,
    }
  }, [
    attachedSealedUnit,
    attachedDoorQuote,
    quoteResult,
    customDiscount,
    effectiveMisc,
    effectiveLabour,
    effectiveJC,
    effectiveMiscCents,
    effectiveLabourCents,
    effectiveJCCents,
    hstRate,
    isSupplyOnly,
  ])
}
