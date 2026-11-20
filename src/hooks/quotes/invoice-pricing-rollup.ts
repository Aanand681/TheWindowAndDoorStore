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
  isSupplyOnly?: boolean
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
  isSupplyOnly = false,
}: InvoicePricingRollupParams) {
  const isSupply = Boolean(isSupplyOnly || taxTotals?.isSupplyOnly)
  const promoDiscountCents = isWindowHost
    ? quoteResult?.promoDiscount || activePromo?.discount || 0
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
  const winLabourCents = hasWindows && !isSupply
    ? isWindowHost
      ? taxLabourCents
      : attachedWindowQuote?.totals?.labour
        ? Math.round(attachedWindowQuote.totals.labour * 100)
        : 0
    : 0
  const winMiscCents = hasWindows && !isSupply
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

  const suIsSupply = isSupply || effectiveSUTotals?.sealedUnitMode === "supply_only" || Boolean(effectiveSUTotals?.isSupplyOnly)
  const suGlassCents =
    hasSealedUnits && !isAttachedSUService
      ? Math.round((effectiveSUTotals.glassBefore8PercentTotal || 0) * 100)
      : 0
  const suSurchargeCents =
    hasSealedUnits && !isAttachedSUService
      ? Math.round((effectiveSUTotals.glass8PercentSurchargeTotal || 0) * 100)
      : 0
  const suMiscCents = hasSealedUnits && !suIsSupply
    ? Math.round((effectiveSUTotals.miscTotal || 0) * 100)
    : 0
  const suExtraLabour = Number(
    effectiveSUTotals.extraLabour ??
    (Array.isArray(effectiveSUTotals.globalUpcharges)
      ? effectiveSUTotals.globalUpcharges.reduce((acc: number, u: any) => acc + (parseFloat(String(u.price || u.rate || 0)) || 0), 0)
      : 0)
  )
  const rawSuUnitLabour = isAttachedSUService
    ? Number(effectiveSUTotals.serviceLabourTotal || 0)
    : Number(
      effectiveSUTotals.unitLabourSum ??
      effectiveSUTotals.doorPureLabourTotal ??
      effectiveSUTotals.pureLabourTotal ??
      Math.max(
        0,
        (effectiveSUTotals.combinedLabourTotal || 0) -
        (effectiveSUTotals.baseSetupFee || 0) -
        (effectiveSUTotals.totalTravelAndSetup || 0)
      )
    )

  const suLabourCents = hasSealedUnits && !suIsSupply
    ? isSUHost
      ? Math.round((effectiveSUTotals.combinedLabourTotal || 0) * 100)
      : Math.round((rawSuUnitLabour + suExtraLabour) * 100)
    : 0

  const doorIsSupply = isSupply || effectiveDoorTotals?.mode === "supply_only" || Boolean(effectiveDoorTotals?.isSupplyOnly)
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
  const doorMiscCents = hasDoors && !doorIsSupply
    ? Math.round((effectiveDoorTotals.miscTotal || 0) * 100)
    : 0

  const rawPureDoorLabour =
    effectiveDoorTotals.doorPureLabourTotal !== undefined
      ? Number(effectiveDoorTotals.doorPureLabourTotal)
      : (effectiveDoorTotals.unitLabourTotal !== undefined ||
        effectiveDoorTotals.upchargesTotal !== undefined)
        ? (effectiveDoorTotals.unitLabourTotal || 0) +
        (effectiveDoorTotals.upchargesTotal || 0)
        : Math.max(
          0,
          (effectiveDoorTotals.combinedLabourTotal || 0) -
          (effectiveDoorTotals.baseSetupFee || 0) -
          (effectiveDoorTotals.totalTravelAndSetup || 0)
        )

  const doorLabourCents = hasDoors && !doorIsSupply
    ? isDoorHost
      ? Math.round((effectiveDoorTotals.combinedLabourTotal || 0) * 100)
      : Math.round(rawPureDoorLabour * 100)
    : 0

  const effectiveMiscTotalCents = isSupply
    ? 0
    : (hasWindows ? winMiscCents : 0) +
    (hasSealedUnits ? suMiscCents : 0) +
    (hasDoors ? doorMiscCents : 0)
  const effectiveLabourTotalCents = isSupply
    ? 0
    : (hasWindows ? winLabourCents : 0) +
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
