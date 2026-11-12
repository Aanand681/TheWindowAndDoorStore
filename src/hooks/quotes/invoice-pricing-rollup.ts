export interface InvoicePricingRollupParams {
  hasWindows: boolean
  hasSealedUnits: boolean
  hasDoors: boolean
  hasAnyAttached: boolean
  isWindowHost: boolean
  isDoorHost: boolean
  isSUHost: boolean
  isAttachedSUService: boolean
  quoteResult: any
  basePrice: number
  surcharge: number
  taxLabourCents: number
  taxMiscCents: number
  taxJCCents: number
  taxDiscount: number
  activePromo: { name: string; discount: number } | null | undefined
  attachedWindowQuote: any
  effectiveSUTotals: any
  effectiveDoorTotals: any
  hstRate: number
  afterDiscount: number
  taxTotals?: any
}

export function calculateInvoicePricingRollup({
  hasWindows,
  hasSealedUnits,
  hasDoors,
  hasAnyAttached,
  isWindowHost,
  isDoorHost,
  isSUHost,
  isAttachedSUService,
  quoteResult,
  basePrice,
  surcharge,
  taxLabourCents,
  taxMiscCents,
  taxJCCents,
  taxDiscount,
  activePromo,
  attachedWindowQuote,
  effectiveSUTotals,
  effectiveDoorTotals,
  hstRate,
  afterDiscount,
  taxTotals,
}: InvoicePricingRollupParams) {
  const promoDiscountCents = isWindowHost
    ? activePromo?.discount || 0
    : attachedWindowQuote?.totals?.promoDiscount
      ? Math.round(attachedWindowQuote.totals.promoDiscount * 100)
      : attachedWindowQuote?.quoteResult?.promoDiscount ||
        activePromo?.discount ||
        0
  const monthlyDiscountCents = Math.round((taxDiscount || 0) * 100)

  const winMaterialsCents = hasWindows
    ? quoteResult?.base ||
      basePrice ||
      (attachedWindowQuote?.totals?.base
        ? Math.round(attachedWindowQuote.totals.base * 100)
        : 0)
    : 0
  const rawWinSurchargeCents = hasWindows
    ? surcharge ||
      (attachedWindowQuote?.totals?.surcharge
        ? Math.round(attachedWindowQuote.totals.surcharge * 100)
        : 0)
    : 0
  const winSurchargeCents =
    !isWindowHost &&
    rawWinSurchargeCents > winMaterialsCents &&
    winMaterialsCents > 0
      ? Math.round(winMaterialsCents * 0.08)
      : rawWinSurchargeCents
  const winLabourCents = hasWindows
    ? isWindowHost
      ? taxLabourCents
      : attachedWindowQuote?.totals?.labour
        ? Math.round(attachedWindowQuote.totals.labour * 100)
        : 0
    : 0
  const winMiscCents = hasWindows
    ? isWindowHost
      ? taxMiscCents
      : attachedWindowQuote?.totals?.misc
        ? Math.round(attachedWindowQuote.totals.misc * 100)
        : 0
    : 0
  const winJCCents = hasWindows
    ? isWindowHost
      ? taxJCCents
      : attachedWindowQuote?.totals?.jc
        ? Math.round(attachedWindowQuote.totals.jc * 100)
        : 0
    : 0

  const suGlassCents =
    hasSealedUnits && !isAttachedSUService
      ? Math.round((effectiveSUTotals.glassBefore8PercentTotal || 0) * 100)
      : 0
  const suSurchargeCents =
    hasSealedUnits && !isAttachedSUService
      ? Math.round((effectiveSUTotals.glass8PercentSurchargeTotal || 0) * 100)
      : 0
  const suMiscCents = hasSealedUnits
    ? Math.round((effectiveSUTotals.miscTotal || 0) * 100)
    : 0
  const suLabourCents = hasSealedUnits
    ? isSUHost
      ? Math.round((effectiveSUTotals.combinedLabourTotal || 0) * 100)
      : Math.round(
          (effectiveSUTotals.serviceLabourTotal ??
            effectiveSUTotals.unitLabourSum ??
            0) * 100
        )
    : 0

  const doorRawBaseCents = hasDoors
    ? Math.round(
        ((effectiveDoorTotals.rawDoorBaseTotal || 0) +
          (effectiveDoorTotals.stormDoorTotal || 0) +
          (effectiveDoorTotals.hardwareTotal || 0)) *
          100
      )
    : 0
  const doorDiscountCents = hasDoors
    ? Math.round((effectiveDoorTotals.discountTotal || 0) * 100)
    : 0
  const doorNetMaterialsCents = Math.max(
    0,
    doorRawBaseCents - doorDiscountCents
  )
  const doorSurchargeCents = hasDoors
    ? Math.round((effectiveDoorTotals.surchargeTotal || 0) * 100)
    : 0
  const doorMiscCents = hasDoors
    ? Math.round((effectiveDoorTotals.miscTotal || 0) * 100)
    : 0
  const doorLabourCents = hasDoors
    ? isDoorHost
      ? Math.round((effectiveDoorTotals.combinedLabourTotal || 0) * 100)
      : Math.round(
          ((effectiveDoorTotals.unitLabourTotal || 0) +
            (effectiveDoorTotals.upchargesTotal || 0)) *
            100
        )
    : 0

  const effectiveMiscTotalCents =
    (hasWindows ? winMiscCents : 0) +
    (hasSealedUnits ? suMiscCents : 0) +
    (hasDoors ? doorMiscCents : 0)
  const effectiveLabourTotalCents =
    (hasWindows ? winLabourCents : 0) +
    (hasSealedUnits ? suLabourCents : 0) +
    (hasDoors ? doorLabourCents : 0)
  const effectiveSurchargeTotalCents =
    (hasWindows ? winSurchargeCents : 0) +
    (hasSealedUnits ? suSurchargeCents : 0) +
    (hasDoors ? doorSurchargeCents : 0)
  const totalDiscountCents = promoDiscountCents + monthlyDiscountCents

  const combinedSubtotalCalculatedCents = Math.max(
    0,
    (hasWindows ? winMaterialsCents - totalDiscountCents + winJCCents : 0) +
      suGlassCents +
      doorNetMaterialsCents +
      effectiveMiscTotalCents +
      effectiveLabourTotalCents +
      effectiveSurchargeTotalCents
  )

  const finalSubtotalCents =
    hasAnyAttached || isDoorHost || isSUHost
      ? combinedSubtotalCalculatedCents
      : afterDiscount > 0 &&
          Math.abs(afterDiscount - combinedSubtotalCalculatedCents) <= 10
        ? afterDiscount
        : combinedSubtotalCalculatedCents

  let finalHstAmountCents = 0
  let finalHstLabel = `HST (${hstRate}%)`
  let finalHstBaseCents = 0
  let finalMaterialExemptionCents = 0

  if (hstRate === 13) {
    finalHstAmountCents = Math.round(finalSubtotalCents * 0.13)
    finalHstBaseCents = finalHstAmountCents
    finalHstLabel = "13% HST"
  } else if (hstRate === 8) {
    // Factory surcharges are EXCLUDED from materials base (treated as handling/service).
    const customMatCents = Math.round(
      ((taxTotals as any)?.customMaterialsTotal || 0) * 100
    )
    const matCents = Math.max(
      0,
      (hasWindows
        ? winMaterialsCents - totalDiscountCents + winJCCents + customMatCents
        : 0) +
        (hasSealedUnits ? suGlassCents : 0) +
        (hasDoors ? doorNetMaterialsCents : 0)
    )
    const hstBase = Math.round(finalSubtotalCents * 0.13)
    const matExemption = Math.round(matCents * 0.08)
    finalHstAmountCents = Math.max(0, hstBase - matExemption)
    finalHstBaseCents = hstBase
    finalMaterialExemptionCents = matExemption
    finalHstLabel = "8% Material Exemption"
  } else {
    finalHstAmountCents = 0
    finalHstBaseCents = 0
    finalHstLabel = "0% No Tax (Exempt)"
  }

  const finalTotalCents = finalSubtotalCents + finalHstAmountCents
  const finalFirstPayment = Math.round(finalTotalCents / 2)
  const finalSecondPayment = finalTotalCents - finalFirstPayment

  return {
    promoDiscountCents,
    monthlyDiscountCents,
    winMaterialsCents,
    suGlassCents,
    doorNetMaterialsCents,
    effectiveMiscTotalCents,
    effectiveLabourTotalCents,
    effectiveSurchargeTotalCents,
    finalSubtotalCents,
    finalHstAmountCents,
    finalHstBaseCents,
    finalMaterialExemptionCents,
    finalHstLabel,
    finalTotalCents,
    finalFirstPayment,
    finalSecondPayment,
  }
}
