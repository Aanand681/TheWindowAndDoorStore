import type { QuotePricingResult } from "./types"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"

type PricingHostType = "window" | "door" | "sealed_unit"

function detectQuoteHostType(quote: any): PricingHostType {
  if (
    quote.quoteType === "door" ||
    (Array.isArray(quote.windows) &&
      quote.windows.some((w: any) => Boolean(w.doorPresetId)))
  ) {
    return "door"
  }
  if (
    quote.quoteType === "sealed_unit" ||
    Boolean(quote.taxTotals?.isSealedUnitQuote)
  ) {
    return "sealed_unit"
  }
  return "window"
}

function buildPricingOverrides(quote: any): Record<string, string> | undefined {
  const fields = [
    "customLabour",
    "customMisc",
    "customJC",
    "customDiscount",
    "customDiscountLabel",
    "loyaltyDiscount",
    "loyaltyDiscountLabel",
  ] as const

  const overrides: Record<string, string> = {}
  for (const key of fields) {
    const val = quote?.[key]
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      overrides[key] = String(val).trim()
    }
  }
  return Object.keys(overrides).length > 0 ? overrides : undefined
}

function resolveQuoteHstRate(quote: any): number {
  if (quote.hstRate !== undefined) return Number(quote.hstRate)
  if (quote.taxTotals?.hstRate !== undefined)
    return Number(quote.taxTotals.hstRate)
  if (quote.isFirstNation || quote.taxTotals?.isFirstNation) return 8
  return 13
}

function toStoredSummaryTotalCents(val: unknown): number {
  const n = Number(val)
  if (!Number.isFinite(n) || n <= 0) return 0
  // SavedQuote.quoteSummaryTotal is stored in integer cents, while legacy corrupted snapshots stored decimal dollars.
  return Number.isInteger(n) ? n : Math.round(n * 100)
}

function recoverLegacyTotalCents(
  quote: any,
  hostType: PricingHostType,
  hstRate: number
): number {
  const rootTaxGrand = Number(quote.taxTotals?.grandTotal)
  if (Number.isFinite(rootTaxGrand) && rootTaxGrand > 0) {
    return Math.round(rootTaxGrand * 100)
  }

  const rootSummaryCents = toStoredSummaryTotalCents(quote.quoteSummaryTotal)
  if (rootSummaryCents > 0) return rootSummaryCents

  const snapshotTaxGrand = Number(quote.initialSnapshot?.taxTotals?.grandTotal)
  if (Number.isFinite(snapshotTaxGrand) && snapshotTaxGrand > 0) {
    return Math.round(snapshotTaxGrand * 100)
  }

  const snapshotSummaryCents = toStoredSummaryTotalCents(
    quote.initialSnapshot?.quoteSummaryTotal
  )
  if (snapshotSummaryCents > 0) return snapshotSummaryCents

  if (Array.isArray(quote.windows) && quote.windows.length > 0) {
    const lineSum = quote.windows.reduce((sum: number, w: any) => {
      const qty = Math.max(1, Number(w.quantity || w.qty) || 1)
      const fallbackUnit =
        hostType === "door"
          ? Number(w.finalUnitPrice || w.inksterBasePrice || 0)
          : hostType === "sealed_unit"
            ? Number(w.finalUnitPrice || 0)
            : Number(w.base || 0) +
              Number(w.argon || 0) +
              Number(w.solar || 0) +
              Number(w.triple || 0)
      return sum + (Number(w.lineTotal) || fallbackUnit * qty)
    }, 0)

    if (lineSum > 0) {
      return Math.round(lineSum * (1 + hstRate / 100) * 100)
    }
  }

  return 0
}

function prepareWindowHostInput(quote: any, isSupplyOnly: boolean) {
  const taxTotals = quote.taxTotals || {}
  const resolvedCustomMaterials =
    Array.isArray(quote.customMaterials) && quote.customMaterials.length > 0
      ? quote.customMaterials
      : taxTotals.customMaterials

  const hasCustomLabour =
    quote.customLabour !== undefined &&
    String(quote.customLabour).trim() !== ""
  const rawExtras = Number(
    taxTotals.extras ?? taxTotals.totalTravelAndSetup ?? 0
  )
  const customLabNum = hasCustomLabour
    ? parseFloat(String(quote.customLabour)) || 0
    : undefined

  return {
    ...quote,
    isSupplyOnly,
    ...(resolvedCustomMaterials !== undefined
      ? { customMaterials: resolvedCustomMaterials }
      : {}),
    taxTotals: {
      ...taxTotals,
      isSupplyOnly,
      ...(customLabNum !== undefined && !isSupplyOnly
        ? {
            extras: Math.min(rawExtras, customLabNum),
            finalLabour: customLabNum,
          }
        : {}),
    },
  }
}

function buildRecoveredLegacyResult(
  quote: any,
  hostType: PricingHostType,
  hstRate: number,
  totalCents: number
): QuotePricingResult {
  const tax = quote.taxTotals || {}
  const snapTax = quote.initialSnapshot?.taxTotals || {}
  const rawSubtotal =
    Number(tax.subtotalPreTax) ||
    Number(tax.subtotal) ||
    Number(snapTax.subtotalPreTax) ||
    Number(snapTax.subtotal) ||
    0
  const subtotalCents = Math.round(rawSubtotal * 100)
  const hstCents = Math.max(0, totalCents - subtotalCents)
  const baseCents = Math.round(
    (Number(tax.totalPrice ?? tax.glassSupplyTotal ?? snapTax.totalPrice) ||
      0) * 100
  )
  const labourCents = Math.round(
    (Number(tax.combinedLabour ?? tax.combinedLabourTotal ?? tax.finalLabour) ||
      0) * 100
  )
  const miscCents = Math.round((Number(tax.miscTotal ?? tax.finalMisc) || 0) * 100)
  const surchargeCents = Math.round(
    (Number(tax.surchargeTotal ?? tax.glass8PercentSurchargeTotal) || 0) * 100
  )
  const discountCents = Math.round(
    ((Number(tax.discountTotal ?? tax.discount) || 0) +
      (Number(tax.loyaltyDiscount ?? quote.loyaltyDiscount) || 0)) *
      100
  )

  const firstPayment = Math.floor(totalCents / 2)
  return {
    basePrice: baseCents,
    surcharge: surchargeCents,
    promoDiscount: discountCents,
    effectiveJC: 0,
    effectiveMisc: miscCents,
    effectiveLabour: labourCents,
    includeJCInPromo: hostType === "window" ? quote.includeJCInPromo !== false : false,
    includeMiscInPromo:
      hostType === "window" ? quote.includeMiscInPromo !== false : false,
    includeLabourInPromo:
      hostType === "window" ? quote.includeLabourInPromo !== false : false,
    beforeTaxDiscount: subtotalCents + discountCents,
    afterDiscount: subtotalCents,
    hstRate,
    hst: hstCents,
    total: totalCents,
    firstPayment,
    secondPayment: totalCents - firstPayment,
  }
}

export function computeQuotePricing(quote: any): QuotePricingResult | null {
  if (!quote) return null

  const hostType = detectQuoteHostType(quote)
  const hstRate = resolveQuoteHstRate(quote)
  const isFirstNation =
    hstRate === 8 || Boolean(quote.isFirstNation || quote.taxTotals?.isFirstNation)
  const isServiceOnly = Boolean(
    hostType === "sealed_unit" &&
      (quote.sealedUnitMode === "service_only" ||
        quote.taxTotals?.isServiceOnly ||
        quote.isServiceOnly)
  )
  const isSupplyOnly =
    !isServiceOnly &&
    Boolean(
      quote.isSupplyOnly ||
        quote.taxTotals?.isSupplyOnly ||
        quote.mode === "supply_only" ||
        quote.sealedUnitMode === "supply_only"
    )

  const overrides = buildPricingOverrides(quote)
  const windowQuote =
    hostType === "window"
      ? prepareWindowHostInput(quote, isSupplyOnly)
      : quote.attachedWindowQuote || undefined
  const doorQuote =
    hostType === "door" ? quote : quote.attachedDoorQuote || undefined
  const sealedUnitQuote =
    hostType === "sealed_unit" ? quote : quote.attachedSealedUnit || undefined

  const universal = calculateUniversalPricing({
    windowQuote,
    doorQuote,
    sealedUnitQuote,
    hostType,
    isSupplyOnly,
    hstRate,
    isFirstNation,
    overrides,
  })

  if (universal.totalCents <= 0) {
    const recoveredTotal = recoverLegacyTotalCents(quote, hostType, hstRate)
    if (recoveredTotal > 0 || hostType !== "window") {
      return buildRecoveredLegacyResult(quote, hostType, hstRate, recoveredTotal)
    }
  }

  const hostNorm =
    hostType === "door"
      ? universal.doorNorm
      : hostType === "sealed_unit"
        ? universal.suNorm
        : universal.winNorm

  const promoDiscount = Math.round(
    ((hostNorm?.discount || 0) + (hostNorm?.loyaltyDiscount || 0)) * 100
  )
  const total = universal.totalCents
  const firstPayment = Math.floor(total / 2)

  return {
    basePrice: Math.round((hostNorm?.rawBase || 0) * 100),
    surcharge: Math.round((hostNorm?.surcharge || 0) * 100),
    promoDiscount,
    effectiveJC: Math.round((hostNorm?.jambsAndCasing || 0) * 100),
    effectiveMisc:
      isSupplyOnly && !isServiceOnly
        ? 0
        : Math.round((hostNorm?.misc || 0) * 100),
    effectiveLabour:
      isSupplyOnly && !isServiceOnly
        ? 0
        : Math.round(
            ((hostNorm?.pureLabour || 0) + (hostNorm?.travelAndSetup || 0)) * 100
          ),
    includeJCInPromo:
      hostType === "window" ? quote.includeJCInPromo !== false : false,
    includeMiscInPromo:
      hostType === "window" ? quote.includeMiscInPromo !== false : false,
    includeLabourInPromo:
      hostType === "window" ? quote.includeLabourInPromo !== false : false,
    beforeTaxDiscount:
      universal.subtotalCents + Math.round(universal.discounts * 100),
    afterDiscount: universal.subtotalCents,
    hstRate: universal.hstRate,
    hst: universal.taxCents,
    total,
    firstPayment,
    secondPayment: total - firstPayment,
  }
}
