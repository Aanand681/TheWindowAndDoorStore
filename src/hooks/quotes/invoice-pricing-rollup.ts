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
  customLabour?: string
  customMisc?: string
  customDiscount?: number | string
  customDiscountLabel?: string
  loyaltyDiscount?: number | string
  loyaltyDiscountLabel?: string
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
  customLabour,
  customMisc,
  customDiscount,
  customDiscountLabel,
  loyaltyDiscount,
  loyaltyDiscountLabel,
  activePromo,
  attachedWindowQuote,
  effectiveSUTotals,
  effectiveDoorTotals,
  hstRate,
  taxTotals,
  isSupplyOnly = false,
}: InvoicePricingRollupParams) {
  const isSUServiceMode = Boolean(
    isAttachedSUService || (isSUHost && effectiveSUTotals?.isServiceOnly)
  )
  const isSupply = !isSUServiceMode && Boolean(isSupplyOnly || taxTotals?.isSupplyOnly)
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

  const hasCustomDisc =
    customDiscount !== undefined && String(customDiscount).trim() !== ""
  const resolvedCustomDiscountStr = hasCustomDisc
    ? String(customDiscount).trim()
    : isWindowHost && (promoDiscountCents > 0 || monthlyDiscountCents > 0)
      ? ((promoDiscountCents + monthlyDiscountCents) / 100).toString()
      : undefined
  const resolvedLoyaltyDiscountStr =
    loyaltyDiscount !== undefined && String(loyaltyDiscount).trim() !== ""
      ? String(loyaltyDiscount).trim()
      : undefined

  const hasCustomLab =
    customLabour !== undefined && String(customLabour).trim() !== ""
  const hasCustomMisc =
    customMisc !== undefined && String(customMisc).trim() !== ""

  const overrides =
    resolvedCustomDiscountStr !== undefined ||
    resolvedLoyaltyDiscountStr !== undefined ||
    Boolean(customDiscountLabel) ||
    Boolean(loyaltyDiscountLabel) ||
    hasCustomLab ||
    hasCustomMisc
      ? {
          ...(hasCustomLab ? { customLabour: String(customLabour).trim() } : {}),
          ...(hasCustomMisc ? { customMisc: String(customMisc).trim() } : {}),
          ...(resolvedCustomDiscountStr !== undefined
            ? { customDiscount: resolvedCustomDiscountStr }
            : {}),
          ...(customDiscountLabel ? { customDiscountLabel } : {}),
          ...(resolvedLoyaltyDiscountStr !== undefined
            ? { loyaltyDiscount: resolvedLoyaltyDiscountStr }
            : {}),
          ...(loyaltyDiscountLabel ? { loyaltyDiscountLabel } : {}),
        }
      : undefined

  const universal = calculateUniversalPricing({
    windowQuote: hasWindows
      ? isWindowHost
        ? {
            data: {
              effectiveBase: rawBaseDollars,
              quoteResult:
                quoteResult ??
                (activePromo
                  ? {
                      promoName: activePromo.name,
                      promoDiscount: activePromo.discount,
                    }
                  : null),
              ...(hasCustomDisc ? { customDiscount: resolvedCustomDiscountStr } : {}),
              ...(customDiscountLabel ? { customDiscountLabel } : {}),
              ...(resolvedLoyaltyDiscountStr !== undefined
                ? { loyaltyDiscount: resolvedLoyaltyDiscountStr }
                : {}),
              ...(loyaltyDiscountLabel ? { loyaltyDiscountLabel } : {}),
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
        ? {
            data: {
              totals: effectiveDoorTotals,
              mode: isSupply ? "supply_only" : "installation",
              ...(hasCustomLab ? { customLabour: String(customLabour).trim() } : {}),
              ...(hasCustomMisc ? { customMisc: String(customMisc).trim() } : {}),
              ...(hasCustomDisc ? { customDiscount: resolvedCustomDiscountStr } : {}),
              ...(customDiscountLabel ? { customDiscountLabel } : {}),
              ...(resolvedLoyaltyDiscountStr !== undefined
                ? { loyaltyDiscount: resolvedLoyaltyDiscountStr }
                : {}),
              ...(loyaltyDiscountLabel ? { loyaltyDiscountLabel } : {}),
            },
          }
        : { totals: effectiveDoorTotals }
      : undefined,
    sealedUnitQuote: hasSealedUnits
      ? isSUHost
        ? {
            data: {
              totals: effectiveSUTotals,
              sealedUnitMode: isSUServiceMode ? "service_only" : isSupply ? "supply_only" : "installation",
              ...(hasCustomDisc ? { customDiscount: resolvedCustomDiscountStr } : {}),
              ...(customDiscountLabel ? { customDiscountLabel } : {}),
              ...(resolvedLoyaltyDiscountStr !== undefined
                ? { loyaltyDiscount: resolvedLoyaltyDiscountStr }
                : {}),
              ...(loyaltyDiscountLabel ? { loyaltyDiscountLabel } : {}),
            },
          }
        : { totals: effectiveSUTotals }
      : undefined,
    hostType: isWindowHost ? "window" : isDoorHost ? "door" : "sealed_unit",
    isSupplyOnly: isSupply,
    hstRate,
    isFirstNation: hstRate === 8,
    overrides,
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
    // Direct dollar decimal amounts
    finalSubtotal: universal.subtotal,
    finalHstAmount: universal.hstAmount,
    finalTotal: universal.total,
    finalFirstPaymentDollar: universal.firstPayment,
    finalSecondPaymentDollar: universal.secondPayment,
    winMaterials: universal.winNorm ? universal.winNorm.materials : 0,
    suGlass: universal.suNorm ? universal.suNorm.materials : 0,
    doorNetMaterials: universal.doorNorm ? universal.doorNorm.materials : 0,
    effectiveLabourTotal: universal.combinedLabour,
    effectiveMiscTotal: universal.misc,
    effectiveSurchargeTotal: universal.surcharges,
    promoDiscount: promoDiscountCents / 100,
    monthlyDiscount: monthlyDiscountCents / 100,
    universal,
  }
}
