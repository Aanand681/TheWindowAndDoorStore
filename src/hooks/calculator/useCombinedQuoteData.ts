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
  combinedTotalCents: number
  combinedFirstPayment: number
  combinedSecondPayment: number
}

export interface UseCombinedQuoteDataParams {
  attachedSealedUnit?: any | null
  attachedDoorQuote?: any | null
  quoteResult?: any
  effectiveMiscCents: number
  effectiveLabourCents: number
  effectiveJCCents: number
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
  effectiveMiscCents,
  effectiveLabourCents,
  effectiveJCCents,
  hstRate,
  isSupplyOnly = false,
}: UseCombinedQuoteDataParams): CombinedQuoteData | null {
  return useMemo(() => {
    if (!attachedSealedUnit && !attachedDoorQuote) return null

    const fin = computeCombinedQuoteFinancials({
      quoteResult,
      attachedSealedUnit,
      attachedDoorQuote,
      effectiveJC: effectiveJCCents,
      effectiveMisc: effectiveMiscCents,
      effectiveLabour: effectiveLabourCents,
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

    const doorDiscountCents = hasDoor
      ? Math.round((attachedDoorQuote?.totals?.discountTotal ?? attachedDoorQuote?.totals?.discount ?? 0) * 100)
      : 0

    const combinedFirstPayment = Math.round(fin.combinedTotalCents / 2)
    const combinedSecondPayment = fin.combinedTotalCents - combinedFirstPayment

    return {
      hasSU,
      hasDoor,
      windowBaseCents: fin.windowBaseCents,
      suGlassCents: fin.suGlassCents,
      suSummarySentence,
      isAttachedSUService,
      doorMaterialsCents: fin.doorMaterialsCents,
      doorSummarySentence,
      doorDiscountCents,
      effectiveJCCents,
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
    effectiveMiscCents,
    effectiveLabourCents,
    effectiveJCCents,
    hstRate,
    isSupplyOnly,
  ])
}
