import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"

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

  const rawBaseDollars = quoteResult?.base
    ? quoteResult.base / 100
    : basePrice > 1000
      ? basePrice / 100
      : basePrice
  const rawSurchargeDollars = surcharge > 1000 ? surcharge / 100 : surcharge

  const universal = calculateUniversalPricing({
    windowQuote: hasWindows
      ? isWindowHost
        ? {
            data: {
              effectiveBase: rawBaseDollars,
              quoteResult,
              taxTotals: {
                ...taxTotals,
                extras: taxTotals?.extras ?? taxTotals?.totalTravelAndSetup ?? 0,
                finalLabour: taxLabourCents / 100,
                finalMisc: taxMiscCents / 100,
                finalJC: taxJCCents / 100,
              },
              effectiveSurcharge: rawSurchargeDollars,
              surchargeRate: 8,
              isSupplyOnly: isSupply,
            },
          }
        : attachedWindowQuote
      : undefined,
    doorQuote: hasDoors
      ? isDoorHost
        ? { data: { totals: effectiveDoorTotals, mode: isSupply ? "supply_only" : "installation" } }
        : { totals: effectiveDoorTotals }
      : undefined,
    sealedUnitQuote: hasSealedUnits
      ? isSUHost
        ? {
            data: {
              totals: effectiveSUTotals,
              sealedUnitMode: isAttachedSUService ? "service_only" : isSupply ? "supply_only" : "installation",
            },
          }
        : { totals: effectiveSUTotals }
      : undefined,
    hostType: isWindowHost ? "window" : isDoorHost ? "door" : "sealed_unit",
    isSupplyOnly: isSupply,
    hstRate,
    isFirstNation: hstRate === 8,
  })

  return {
    promoDiscountCents,
    monthlyDiscountCents,
    winMaterialsCents: universal.winNorm ? Math.round(universal.winNorm.materials * 100) : 0,
    suGlassCents: universal.suNorm ? Math.round(universal.suNorm.materials * 100) : 0,
    doorNetMaterialsCents: universal.doorNorm ? Math.round(universal.doorNorm.materials * 100) : 0,
    effectiveMiscTotalCents: universal.miscCents,
    effectiveLabourTotalCents: universal.labourCents,
    effectiveSurchargeTotalCents: universal.surchargesCents,
    finalSubtotalCents: universal.subtotalCents,
    finalHstAmountCents: universal.taxCents,
    finalHstBaseCents: Math.round(universal.hstBase * 100),
    finalMaterialExemptionCents: Math.round(universal.materialExemption * 100),
    finalHstLabel: universal.taxLabel,
    finalTotalCents: universal.totalCents,
    finalFirstPayment: Math.round(universal.firstPayment * 100),
    finalSecondPayment: Math.round(universal.secondPayment * 100),
  }
}
