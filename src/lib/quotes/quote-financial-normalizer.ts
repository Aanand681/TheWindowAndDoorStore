/**
 * Normalizes any quote (Window, Door, or Sealed Unit) into a consistent financial structure.
 * Supports MongoDB documents, live calculator drafts, and attached payload snapshots.
 */

export interface NormalizedQuoteFinancials {
  type: "window" | "door" | "sealed_unit"
  quoteNumber?: string
  customerName?: string
  itemCount: number
  isSupplyOnly: boolean
  isServiceOnly: boolean
  rawBase: number
  discount: number
  discountLabel?: string
  loyaltyDiscount?: number
  loyaltyDiscountLabel?: string
  materials: number
  surcharge: number
  pureLabour: number
  travelAndSetup: number
  misc: number
  jambsAndCasing: number
  customMaterials: number
  lineItems: any[]
  summarySentence: string
  upcharges: any[]
}

function resolvePureLabour(
  customLabour: string | undefined,
  defaultPure: number,
  travelAndSetup: number
): number {
  if (customLabour !== undefined && customLabour.trim() !== "") {
    const val = parseFloat(customLabour) || 0
    if (travelAndSetup > 0 && val >= travelAndSetup) {
      return Math.round((val - travelAndSetup) * 100) / 100
    }
    return val
  }
  return defaultPure
}

export function normalizeWindowQuote(
  quote: any,
  overrides?: { customLabour?: string; customMisc?: string; customJC?: string; customDiscount?: string; loyaltyDiscount?: string; loyaltyDiscountLabel?: string }
): NormalizedQuoteFinancials {
  const data = quote?.data || quote || {}
  const taxTotals = data.taxTotals || quote?.taxTotals || {}
  const lineItems = data.windows || quote?.windows || data.lineItems || quote?.lineItems || []
  const itemCount = lineItems.reduce((acc: number, item: any) => acc + (Math.max(1, Number(item.qty || item.quantity) || 1)), 0)
  const isSupply = Boolean(data.isSupplyOnly || taxTotals?.isSupplyOnly)

  let rawBase = Number(quote?.totals?.base ?? data.effectiveBase ?? (data.quoteResult?.base ? data.quoteResult.base / 100 : data.subtotal || quote?.subtotal || 0))
  if (rawBase === 0 && lineItems.length > 0) {
    rawBase = lineItems.reduce((acc: number, w: any) => {
      const q = Math.max(1, Number(w.qty || w.quantity) || 1)
      const itemBase = (parseFloat(String(w.base || 0)) || 0) + (parseFloat(String(w.argon || 0)) || 0) +
        (parseFloat(String(w.solar || 0)) || 0) + (parseFloat(String(w.triple || 0)) || 0)
      return acc + itemBase * q
    }, 0)
  }

  const rawDiscount =
    data.customDiscount !== undefined && String(data.customDiscount).trim() !== ""
      ? parseFloat(String(data.customDiscount)) || 0
      : quote?.customDiscount !== undefined && String(quote.customDiscount).trim() !== ""
        ? parseFloat(String(quote.customDiscount)) || 0
        : Number(
            data.quoteResult?.promoDiscount
              ? data.quoteResult.promoDiscount / 100
              : quote?.totals?.discount ??
                data.totals?.discount ??
                quote?.totals?.promoDiscount ??
                data.totals?.promoDiscount ??
                taxTotals?.discount ??
                0
          )
  const discount = overrides?.customDiscount !== undefined && overrides.customDiscount !== ""
    ? parseFloat(overrides.customDiscount) || 0
    : rawDiscount
  const discountLabel =
    data.customDiscountLabel ||
    quote?.customDiscountLabel ||
    data.quoteResult?.promoName ||
    "Promo Discount"

  const loyaltyDiscount = Number(
    overrides?.loyaltyDiscount !== undefined && overrides.loyaltyDiscount !== ""
      ? parseFloat(overrides.loyaltyDiscount) || 0
      : data.loyaltyDiscount ?? quote?.totals?.loyaltyDiscount ?? quote?.loyaltyDiscount ?? 0
  )
  const loyaltyDiscountLabel =
    data.loyaltyDiscountLabel ||
    quote?.loyaltyDiscountLabel ||
    (data.discountType === "loyalty" ? "Loyalty Points Redemption" : undefined)

  const totalDiscount = discount + loyaltyDiscount
  const materials = Math.max(0, Math.round((rawBase - totalDiscount) * 100) / 100)

  const rawRate = Number(data.surchargeRate ?? 8)
  const decRate = rawRate > 1 ? rawRate / 100 : rawRate
  let surcharge = Number(quote?.totals?.surcharge ?? data.effectiveSurcharge ?? (data.quoteResult?.surcharge ? data.quoteResult.surcharge / 100 : 0))
  if (surcharge === 0 || surcharge > rawBase) {
    surcharge = Math.round(rawBase * decRate * 100) / 100
  }

  const travelAndSetup = isSupply ? 0 : Number(quote?.totals?.travelAndSetupFee ?? taxTotals?.extras ?? taxTotals?.totalTravelAndSetup ?? 0)
  const defaultPure = isSupply
    ? 0
    : quote?.totals?.labour !== undefined
      ? Number(quote.totals.labour)
      : Number(taxTotals?.labourWindows ?? (taxTotals?.finalLabour !== undefined ? Math.max(0, Number(taxTotals.finalLabour) - travelAndSetup) : 0))
  const pureLabour = isSupply ? 0 : resolvePureLabour(overrides?.customLabour ?? data.customLabour, defaultPure, travelAndSetup)

  const misc = isSupply ? 0 : (overrides?.customMisc !== undefined && overrides.customMisc !== "" ? parseFloat(overrides.customMisc) || 0 : Number(quote?.totals?.misc ?? taxTotals?.finalMisc ?? taxTotals?.miscTotal ?? 0))
  const jambsAndCasing = overrides?.customJC !== undefined && overrides.customJC !== "" ? parseFloat(overrides.customJC) || 0 : Number(quote?.totals?.jc ?? taxTotals?.finalJC ?? taxTotals?.jcTotal ?? 0)
  const customMaterials = Array.isArray(data.customMaterials) ? data.customMaterials.reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0) : Number(taxTotals?.customMaterialsTotal || (quote?.totals?.customMaterialsTotal ?? 0))

  return {
    type: "window", quoteNumber: quote?.quoteNumber || data.quoteNumber,
    customerName: quote?.customerName || data.customerName,
    itemCount, isSupplyOnly: isSupply, isServiceOnly: false,
    rawBase, discount, discountLabel, loyaltyDiscount, loyaltyDiscountLabel, materials, surcharge, pureLabour, travelAndSetup,
    misc, jambsAndCasing, customMaterials, lineItems,
    summarySentence: `${lineItems.length} window${lineItems.length !== 1 ? "s" : ""}`,
    upcharges: [],
  }
}

export function normalizeDoorQuote(
  quote: any,
  overrides?: { customLabour?: string; customMisc?: string; customDiscount?: string; loyaltyDiscount?: string; loyaltyDiscountLabel?: string }
): NormalizedQuoteFinancials {
  const data = quote?.data || quote || {}
  const totals = {
    ...(quote?.taxTotals || {}),
    ...(data.taxTotals || {}),
    ...(quote?.totals || {}),
    ...(data.totals || {}),
  }
  const lineItems = data.doors || data.lineItems || quote?.doors || quote?.lineItems || []
  const itemCount = lineItems.reduce((acc: number, item: any) => acc + (Math.max(1, Number(item.qty || item.quantity) || 1)), 0)
  const isSupply = Boolean(data.mode === "supply_only" || totals?.isSupplyOnly)

  const rawBase = Number((totals.rawDoorBaseTotal ?? totals.materialsTotal ?? totals.totalPrice ?? 0) + (totals.stormDoorTotal || 0) + (totals.hardwareTotal || 0))
  const discount = overrides?.customDiscount !== undefined && overrides.customDiscount !== ""
    ? parseFloat(overrides.customDiscount) || 0
    : Number(totals.discountTotal ?? totals.discount ?? 0)
  const discountLabel =
    data.customDiscountLabel ||
    quote?.customDiscountLabel ||
    totals.discountLabel ||
    "Door Discount"

  const loyaltyDiscount = Number(
    overrides?.loyaltyDiscount !== undefined && overrides.loyaltyDiscount !== ""
      ? parseFloat(overrides.loyaltyDiscount) || 0
      : totals.loyaltyDiscount ?? data.loyaltyDiscount ?? quote?.totals?.loyaltyDiscount ?? quote?.loyaltyDiscount ?? 0
  )
  const loyaltyDiscountLabel =
    data.loyaltyDiscountLabel ||
    quote?.loyaltyDiscountLabel ||
    totals.loyaltyDiscountLabel ||
    (data.discountType === "loyalty" ? "Loyalty Points Redemption" : undefined)

  const totalDiscount = discount + loyaltyDiscount
  const materials = Math.max(0, Math.round((rawBase - totalDiscount) * 100) / 100)
  const surcharge = Number(totals.surchargeTotal ?? totals.surcharge ?? (materials > 0 ? Math.round(materials * 0.08 * 100) / 100 : 0))

  const travelAndSetup = isSupply ? 0 : Number(quote?.totals?.travelAndSetupFee ?? totals?.totalTravelAndSetup ?? 0)
  const defaultPure = isSupply
    ? 0
    : quote?.totals?.doorPureLabourTotal !== undefined
      ? Number(quote.totals.doorPureLabourTotal)
      : totals.doorPureLabourTotal !== undefined
        ? Number(totals.doorPureLabourTotal)
        : totals.unitLabourTotal !== undefined || totals.upchargesTotal !== undefined
          ? Number(totals.unitLabourTotal || 0) + Number(totals.upchargesTotal || 0)
          : Math.max(
              0,
              Number(totals.combinedLabourTotal ?? totals.combinedLabour ?? 0) -
                Number(totals.baseSetupFee || 0) -
                Number(totals.totalTravelAndSetup || 0)
            )
  const pureLabour = isSupply ? 0 : resolvePureLabour(overrides?.customLabour ?? data.customLabour, defaultPure, travelAndSetup)

  const misc = isSupply ? 0 : (overrides?.customMisc !== undefined && overrides.customMisc !== "" ? parseFloat(overrides.customMisc) || 0 : Number(totals.miscTotal ?? totals.misc ?? 0))
  const jambsAndCasing = Number(totals.suppliesTotal || 0)

  return {
    type: "door", quoteNumber: quote?.quoteNumber || data.quoteNumber,
    customerName: quote?.customerName || data.customerName,
    itemCount, isSupplyOnly: isSupply, isServiceOnly: false,
    rawBase, discount, discountLabel, loyaltyDiscount, loyaltyDiscountLabel, materials, surcharge, pureLabour, travelAndSetup,
    misc, jambsAndCasing, customMaterials: 0, lineItems,
    summarySentence: `${itemCount} door${itemCount !== 1 ? "s" : ""}`,
    upcharges: data.globalUpcharges || totals.globalUpcharges || [],
  }
}

export function normalizeSealedUnitQuote(
  quote: any,
  overrides?: { customLabour?: string; customMisc?: string }
): NormalizedQuoteFinancials {
  const data = quote?.data || quote || {}
  const totals = {
    ...(quote?.taxTotals || {}),
    ...(data.taxTotals || {}),
    ...(quote?.totals || {}),
    ...(data.totals || {}),
  }
  const lineItems = data.sealedUnits || data.lineItems || quote?.sealedUnits || quote?.lineItems || []
  const itemCount = lineItems.reduce((acc: number, item: any) => acc + (Math.max(1, Number(item.qty || item.quantity) || 1)), 0)
  const isService = Boolean(data.sealedUnitMode === "service_only" || totals?.isServiceOnly)
  const isSupply = Boolean(!isService && (data.sealedUnitMode === "supply_only" || totals?.isSupplyOnly))

  const rawBase = isService ? 0 : Number(totals.glassBefore8PercentTotal || totals.materialsTotal || 0)
  const materials = rawBase
  const surcharge = isService ? 0 : Number(totals.glass8PercentSurchargeTotal || 0)

  const travelAndSetup = isSupply ? 0 : Number(quote?.totals?.travelAndSetupFee ?? totals?.totalTravelAndSetup ?? 0)
  const defaultPure = isSupply
    ? 0
    : quote?.totals?.pureLabourTotal !== undefined
      ? Number(quote.totals.pureLabourTotal)
      : isService
        ? Number(totals.serviceLabourTotal || 0) + Number(totals.extraLabour || 0)
        : totals.unitLabourSum !== undefined
          ? Number(totals.unitLabourSum) + Number(totals.extraLabour || 0)
          : Math.max(
              0,
              Number(totals.combinedLabourTotal || 0) -
                Number(totals.baseSetupFee || 0) -
                Number(totals.totalTravelAndSetup || 0)
            )
  const pureLabour = isSupply ? 0 : resolvePureLabour(overrides?.customLabour ?? data.customLabour, defaultPure, travelAndSetup)

  const misc = isSupply ? 0 : (overrides?.customMisc !== undefined && overrides.customMisc !== "" ? parseFloat(overrides.customMisc) || 0 : Number(totals.miscTotal || 0))

  return {
    type: "sealed_unit", quoteNumber: quote?.quoteNumber || data.quoteNumber,
    customerName: quote?.customerName || data.customerName,
    itemCount, isSupplyOnly: isSupply, isServiceOnly: isService,
    rawBase, discount: 0, materials, surcharge, pureLabour, travelAndSetup,
    misc, jambsAndCasing: 0, customMaterials: 0, lineItems,
    summarySentence: `${itemCount} sealed unit${itemCount !== 1 ? "s" : ""}`,
    upcharges: data.globalUpcharges || totals.globalUpcharges || [],
  }
}
