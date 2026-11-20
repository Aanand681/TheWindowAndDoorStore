import { useMemo } from "react"
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

    const isSupply = Boolean(isSupplyOnly)
    const hasSU = Boolean(attachedSealedUnit)
    const suTotals = attachedSealedUnit?.totals || {}
    const isAttachedSUService =
      attachedSealedUnit?.sealedUnitMode === "service_only" ||
      attachedSealedUnit?.data?.sealedUnitMode === "service_only" ||
      Boolean(suTotals.isServiceOnly)
    const suIsSupply =
      isSupply ||
      attachedSealedUnit?.sealedUnitMode === "supply_only" ||
      Boolean(attachedSealedUnit?.isSupplyOnly) ||
      Boolean(suTotals.isSupplyOnly)

    const suGlassCents =
      hasSU && !isAttachedSUService
        ? Math.round((suTotals.glassBefore8PercentTotal || 0) * 100)
        : 0
    const suSurchargeCents =
      hasSU && !isAttachedSUService
        ? Math.round((suTotals.glass8PercentSurchargeTotal || 0) * 100)
        : 0
    const suExtraLabour = Number(
      suTotals.extraLabour ??
        (Array.isArray(attachedSealedUnit?.globalUpcharges)
          ? attachedSealedUnit.globalUpcharges.reduce((acc: number, u: any) => acc + (parseFloat(String(u.price || u.rate || 0)) || 0), 0)
          : 0)
    )
    const rawPureSULab = isAttachedSUService
      ? Number(suTotals.serviceLabourTotal || 0) + suExtraLabour
      : Number(
          suTotals.unitLabourSum ??
            suTotals.pureLabourTotal ??
            Math.max(
              0,
              (suTotals.combinedLabourTotal || 0) -
                (suTotals.baseSetupFee || 0) -
                (suTotals.totalTravelAndSetup || 0)
            )
        ) + suExtraLabour
    const suLabourCents =
      hasSU && !suIsSupply ? Math.round(Number(rawPureSULab) * 100) : 0
    const suMiscCents =
      hasSU && !suIsSupply ? Math.round((suTotals.miscTotal || 0) * 100) : 0

    const hasDoor = Boolean(attachedDoorQuote)
    const doorTotals =
      attachedDoorQuote?.totals || attachedDoorQuote?.taxTotals || {}
    const doorIsSupply =
      isSupply ||
      attachedDoorQuote?.mode === "supply_only" ||
      Boolean(attachedDoorQuote?.isSupplyOnly) ||
      Boolean(doorTotals.isSupplyOnly)

    const doorRawBaseCents = hasDoor
      ? Math.round(
          ((doorTotals.rawDoorBaseTotal ??
            doorTotals.totalPrice ??
            doorTotals.materialsTotal ??
            0) +
            (doorTotals.stormDoorTotal || 0) +
            (doorTotals.hardwareTotal || 0)) *
            100
        )
      : 0
    const doorDiscountCents = hasDoor
      ? Math.round((doorTotals.discountTotal ?? doorTotals.discount ?? 0) * 100)
      : 0
    const doorMaterialsCents = doorRawBaseCents
    const doorSurchargeCents = hasDoor
      ? Math.round(
          (doorTotals.surchargeTotal ??
            doorTotals.surcharge ??
            (doorRawBaseCents > 0
              ? Math.round(doorRawBaseCents * 0.08) / 100
              : 0)) *
            100
        )
      : 0

    const rawPureDoorLabour =
      doorTotals.doorPureLabourTotal !== undefined
        ? Number(doorTotals.doorPureLabourTotal)
        : doorTotals.unitLabourTotal !== undefined ||
            doorTotals.upchargesTotal !== undefined
          ? Number(doorTotals.unitLabourTotal || 0) +
            Number(doorTotals.upchargesTotal || 0)
          : Math.max(
              0,
              Number(
                doorTotals.combinedLabourTotal ??
                  doorTotals.combinedLabour ??
                  0
              ) -
                Number(doorTotals.baseSetupFee || 0) -
                Number(doorTotals.totalTravelAndSetup || 0)
            )

    const doorLabourCents =
      hasDoor && !doorIsSupply ? Math.round(rawPureDoorLabour * 100) : 0
    const doorMiscCents =
      hasDoor && !doorIsSupply
        ? Math.round(Number(doorTotals.miscTotal ?? doorTotals.misc ?? 0) * 100)
        : 0

    const windowBaseCents = quoteResult?.base || 0
    const windowSurchargeCents = quoteResult?.surcharge || 0
    const windowDiscountCents = quoteResult?.promoDiscount || 0

    const suTravel = hasSU && !suIsSupply ? Number(suTotals.totalTravelAndSetup || attachedSealedUnit?.totals?.travelAndSetupFee || 0) : 0
    const doorTravel = hasDoor && !doorIsSupply ? Number(doorTotals.totalTravelAndSetup || attachedDoorQuote?.totals?.travelAndSetupFee || 0) : 0
    const qTaxTotals = (quoteResult as any)?.taxTotals || {}
    const winTravel = Number(qTaxTotals?.extras ?? qTaxTotals?.totalTravelAndSetup ?? (quoteResult as any)?.extras ?? 0)
    const travelDeltaCents = (winTravel > 0 && Math.max(suTravel, doorTravel) > winTravel)
      ? Math.round((Math.max(suTravel, doorTravel) - winTravel) * 100)
      : 0

    const combinedMiscCents = isSupply
      ? 0
      : effectiveMiscCents + suMiscCents + doorMiscCents
    const combinedLabourCents = isSupply
      ? 0
      : effectiveLabourCents + suLabourCents + doorLabourCents + travelDeltaCents
    const combinedSurchargeCents =
      windowSurchargeCents + suSurchargeCents + doorSurchargeCents

    const combinedSubtotalCents =
      windowBaseCents -
      windowDiscountCents +
      suGlassCents +
      (doorRawBaseCents - doorDiscountCents) +
      effectiveJCCents +
      combinedMiscCents +
      combinedLabourCents +
      combinedSurchargeCents

    let combinedTaxCents = 0
    let combinedHstBaseCents = 0
    let combinedMaterialExemptionCents = 0

    if (hstRate === 13) {
      combinedTaxCents = Math.round(combinedSubtotalCents * 0.13)
      combinedHstBaseCents = combinedTaxCents
      combinedMaterialExemptionCents = 0
    } else if (hstRate === 8) {
      // Factory surcharges are EXCLUDED from materials (treated as handling/service).
      const materialsCents = Math.max(
        0,
        windowBaseCents -
          windowDiscountCents +
          effectiveJCCents +
          suGlassCents +
          (doorRawBaseCents - doorDiscountCents)
      )
      combinedHstBaseCents = Math.round(combinedSubtotalCents * 0.13)
      combinedMaterialExemptionCents = Math.round(materialsCents * 0.08)
      combinedTaxCents = Math.max(
        0,
        combinedHstBaseCents - combinedMaterialExemptionCents
      )
    } else {
      // 0% No Tax (Exempt)
      combinedTaxCents = 0
      combinedHstBaseCents = 0
      combinedMaterialExemptionCents = 0
    }

    const combinedTotalCents = combinedSubtotalCents + combinedTaxCents
    const combinedFirstPayment = Math.round(combinedTotalCents / 2)
    const combinedSecondPayment = combinedTotalCents - combinedFirstPayment

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

    return {
      hasSU,
      hasDoor,
      windowBaseCents,
      suGlassCents,
      suSummarySentence,
      isAttachedSUService,
      doorMaterialsCents,
      doorSummarySentence,
      doorDiscountCents,
      effectiveJCCents,
      combinedMiscCents,
      combinedLabourCents,
      combinedSurchargeCents,
      windowDiscountCents,
      combinedSubtotalCents,
      combinedTaxCents,
      combinedHstBaseCents,
      combinedMaterialExemptionCents,
      combinedTotalCents,
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
