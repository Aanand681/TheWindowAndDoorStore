import {
  NormalizedQuoteFinancials,
  normalizeWindowQuote,
  normalizeDoorQuote,
  normalizeSealedUnitQuote,
} from "./quote-financial-normalizer"

export interface UniversalPricingParams {
  windowQuote?: any
  doorQuote?: any
  sealedUnitQuote?: any
  hostType: "window" | "door" | "sealed_unit"
  isSupplyOnly?: boolean
  hstRate?: number
  isFirstNation?: boolean
  overrides?: {
    customLabour?: string
    customMisc?: string
    customDiscount?: string
    customJC?: string
    loyaltyDiscount?: string
    loyaltyDiscountLabel?: string
  }
}

export interface UniversalLineItem {
  label: string
  amount: number
  description?: string
  category: "material" | "labour" | "surcharge" | "misc" | "travel" | "discount"
}

export interface UniversalPricingResult {
  materials: number
  surcharges: number
  pureLabour: number
  travelAndSetup: number
  combinedLabour: number
  misc: number
  jambsAndCasing: number
  customMaterials: number
  discounts: number
  discountLabel: string
  subtotal: number
  hstRate: number
  hstAmount: number
  hstBase: number
  materialExemption: number
  total: number
  firstPayment: number
  secondPayment: number

  materialsCents: number
  surchargesCents: number
  labourCents: number
  miscCents: number
  subtotalCents: number
  taxCents: number
  totalCents: number

  winNorm: NormalizedQuoteFinancials | null
  doorNorm: NormalizedQuoteFinancials | null
  suNorm: NormalizedQuoteFinancials | null

  materialsLineItems: UniversalLineItem[]
  labourLineItems: UniversalLineItem[]
  surchargeLineItems: UniversalLineItem[]
  miscLineItems: UniversalLineItem[]
  discountLineItems: UniversalLineItem[]
  travelItems: { label: string; amount: number; details?: string }[]
  taxLabel: string
}

function buildLabourLineItems(
  win: NormalizedQuoteFinancials | null,
  door: NormalizedQuoteFinancials | null,
  su: NormalizedQuoteFinancials | null,
  travelFee: number
): UniversalLineItem[] {
  const items: UniversalLineItem[] = []
  if (win && win.pureLabour > 0) {
    items.push({
      label: `Window installation labour (${win.itemCount} unit${win.itemCount !== 1 ? "s" : ""})`,
      amount: win.pureLabour,
      category: "labour",
    })
  }
  if (door && door.pureLabour > 0) {
    items.push({
      label: `Door installation labour (${door.itemCount} unit${door.itemCount !== 1 ? "s" : ""})`,
      amount: door.pureLabour,
      category: "labour",
    })
  }
  if (su && su.pureLabour > 0) {
    items.push({
      label: su.isServiceOnly ? "Sealed unit service labour" : "Sealed unit installation labour",
      amount: su.pureLabour,
      category: "labour",
    })
  }
  if (travelFee > 0) {
    items.push({
      label: "Site setup & travel fee",
      amount: travelFee,
      category: "travel",
    })
  }
  return items
}

function buildMaterialLineItems(
  win: NormalizedQuoteFinancials | null,
  door: NormalizedQuoteFinancials | null,
  su: NormalizedQuoteFinancials | null
): UniversalLineItem[] {
  const items: UniversalLineItem[] = []
  if (win && win.materials > 0) {
    items.push({ label: `Window products (${win.itemCount} unit${win.itemCount !== 1 ? "s" : ""})`, amount: win.materials, category: "material" })
  }
  if (win && win.jambsAndCasing > 0) {
    items.push({ label: "Jambs & Casings (Window Add-on)", amount: win.jambsAndCasing, category: "material" })
  }
  if (win && win.customMaterials > 0) {
    items.push({ label: "Custom Materials / Window Add-ons", amount: win.customMaterials, category: "material" })
  }
  if (door && door.materials > 0) {
    items.push({ label: `Door products (${door.itemCount} unit${door.itemCount !== 1 ? "s" : ""})`, amount: door.materials, category: "material" })
  }
  if (su && su.materials > 0) {
    items.push({ label: `Sealed unit glass (${su.itemCount} unit${su.itemCount !== 1 ? "s" : ""})`, amount: su.materials, category: "material" })
  }
  return items
}

export function calculateUniversalPricing(params: UniversalPricingParams): UniversalPricingResult {
  const { windowQuote, doorQuote, sealedUnitQuote, hostType, hstRate = 13, isFirstNation = false, overrides } = params

  const winNorm = windowQuote ? normalizeWindowQuote(windowQuote, hostType === "window" ? overrides : undefined) : null
  const doorNorm = doorQuote ? normalizeDoorQuote(doorQuote, hostType === "door" ? overrides : undefined) : null
  const suNorm = sealedUnitQuote ? normalizeSealedUnitQuote(sealedUnitQuote, hostType === "sealed_unit" ? overrides : undefined) : null

  const isSupplyOnly = Boolean(
    params.isSupplyOnly ||
    (winNorm?.isSupplyOnly && !doorNorm && !suNorm) ||
    (doorNorm?.isSupplyOnly && !winNorm && !suNorm) ||
    (suNorm?.isSupplyOnly && !winNorm && !doorNorm)
  )

  const effectiveTravel = isSupplyOnly
    ? 0
    : Math.max(winNorm?.travelAndSetup || 0, doorNorm?.travelAndSetup || 0, suNorm?.travelAndSetup || 0)

  const pureLabour = isSupplyOnly
    ? 0
    : Math.round(((winNorm?.pureLabour || 0) + (doorNorm?.pureLabour || 0) + (suNorm?.pureLabour || 0)) * 100) / 100
  const combinedLabour = isSupplyOnly ? 0 : Math.round((pureLabour + effectiveTravel) * 100) / 100

  const jambsAndCasing = (winNorm?.jambsAndCasing || 0) + (doorNorm?.jambsAndCasing || 0)
  const customMaterials = winNorm?.customMaterials || 0
  const materials = Math.round(((winNorm?.materials || 0) + (doorNorm?.materials || 0) + (suNorm?.materials || 0) + jambsAndCasing + customMaterials) * 100) / 100
  const surcharges = Math.round(((winNorm?.surcharge || 0) + (doorNorm?.surcharge || 0) + (suNorm?.surcharge || 0)) * 100) / 100
  const misc = isSupplyOnly ? 0 : Math.round(((winNorm?.misc || 0) + (doorNorm?.misc || 0) + (suNorm?.misc || 0)) * 100) / 100
  const baseDiscounts = (winNorm?.discount || 0) + (doorNorm?.discount || 0) + (suNorm?.discount || 0)
  const loyaltyDiscounts = (winNorm?.loyaltyDiscount || 0) + (doorNorm?.loyaltyDiscount || 0) + (suNorm?.loyaltyDiscount || 0)
  const discounts = Math.round((baseDiscounts + loyaltyDiscounts) * 100) / 100
  const discountLabel = winNorm?.discountLabel || doorNorm?.discountLabel || suNorm?.discountLabel || "Discount"

  const subtotal = Math.round((materials + surcharges + misc + combinedLabour) * 100) / 100
  const hstBase = Math.round(subtotal * 0.13 * 100) / 100

  let hstAmount = 0
  let materialExemption = 0
  let taxLabel = `HST (${hstRate}%)`

  if (hstRate === 0) {
    taxLabel = "0% Tax (Exempt)"
  } else if (isFirstNation || hstRate === 8 || hstRate === 0.05) {
    materialExemption = Math.round(materials * 0.08 * 100) / 100
    hstAmount = Math.max(0, Math.round((hstBase - materialExemption) * 100) / 100)
    taxLabel = "First Nation Point-of-Sale Exemption"
  } else {
    hstAmount = hstBase
    taxLabel = "13% HST"
  }

  const total = Math.round((subtotal + hstAmount) * 100) / 100
  const firstPayment = Math.round(total * 0.5 * 100) / 100
  const secondPayment = Math.round((total - firstPayment) * 100) / 100

  const labourLineItems = buildLabourLineItems(winNorm, doorNorm, suNorm, effectiveTravel)
  const materialsLineItems = buildMaterialLineItems(winNorm, doorNorm, suNorm)
  const surchargeLineItems: UniversalLineItem[] = surcharges > 0 ? [{ label: "8% Factory glass & handling surcharge", amount: surcharges, category: "surcharge" }] : []
  const miscLineItems: UniversalLineItem[] = misc > 0 ? [{ label: "Disposal, caulking & miscellaneous", amount: misc, category: "misc" }] : []
  const discountLineItems: UniversalLineItem[] = []
  if (winNorm?.discount && winNorm.discount > 0) {
    discountLineItems.push({ label: winNorm.discountLabel || "Window Discount", amount: winNorm.discount, category: "discount" })
  }
  if (doorNorm?.discount && doorNorm.discount > 0) {
    discountLineItems.push({ label: doorNorm.discountLabel || "Door Discount", amount: doorNorm.discount, category: "discount" })
  }
  if (suNorm?.discount && suNorm.discount > 0) {
    discountLineItems.push({ label: suNorm.discountLabel || "Sealed Unit Discount", amount: suNorm.discount, category: "discount" })
  }
  if (loyaltyDiscounts > 0) {
    const loyaltyLabel = winNorm?.loyaltyDiscountLabel || doorNorm?.loyaltyDiscountLabel || suNorm?.loyaltyDiscountLabel || "Loyalty Points Redemption"
    discountLineItems.push({ label: loyaltyLabel, amount: Math.round(loyaltyDiscounts * 100) / 100, category: "discount" })
  }
  const travelItems = effectiveTravel > 0 ? [{ label: "Site setup & travel fee", amount: effectiveTravel, details: "Highest travel charge applied" }] : []

  return {
    materials, surcharges, pureLabour, travelAndSetup: effectiveTravel, combinedLabour,
    misc, jambsAndCasing, customMaterials, discounts, discountLabel, subtotal, hstRate, hstAmount,
    hstBase, materialExemption, total, firstPayment, secondPayment,
    materialsCents: Math.round(materials * 100), surchargesCents: Math.round(surcharges * 100),
    labourCents: Math.round(combinedLabour * 100), miscCents: Math.round(misc * 100),
    subtotalCents: Math.round(subtotal * 100), taxCents: Math.round(hstAmount * 100),
    totalCents: Math.round(total * 100), winNorm, doorNorm, suNorm,
    materialsLineItems, labourLineItems, surchargeLineItems, miscLineItems, discountLineItems, travelItems, taxLabel,
  }
}
