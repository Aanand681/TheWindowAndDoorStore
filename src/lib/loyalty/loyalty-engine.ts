export interface ILoyaltyTier {
  id: string
  points: number
  minPurchase: number
  rewardAmount: number
  isTaxInclusive: boolean
  preTaxAmount: number
  isActive: boolean
  label?: string
}

export const DEFAULT_LOYALTY_TIERS: ILoyaltyTier[] = [
  {
    id: "loyalty_1000",
    points: 1000,
    minPurchase: 167.0,
    rewardAmount: 50.0,
    isTaxInclusive: true,
    preTaxAmount: 44.25,
    isActive: true,
    label: "1,000 Points ($50.00)",
  },
  {
    id: "loyalty_2500",
    points: 2500,
    minPurchase: 417.5,
    rewardAmount: 125.0,
    isTaxInclusive: true,
    preTaxAmount: 110.62,
    isActive: true,
    label: "2,500 Points ($125.00)",
  },
  {
    id: "loyalty_5000",
    points: 5000,
    minPurchase: 835.0,
    rewardAmount: 250.0,
    isTaxInclusive: true,
    preTaxAmount: 221.24,
    isActive: true,
    label: "5,000 Points ($250.00)",
  },
  {
    id: "loyalty_10000",
    points: 10000,
    minPurchase: 1670.0,
    rewardAmount: 500.0,
    isTaxInclusive: true,
    preTaxAmount: 442.48,
    isActive: true,
    label: "10,000 Points ($500.00)",
  },
  {
    id: "loyalty_20000",
    points: 20000,
    minPurchase: 3340.0,
    rewardAmount: 1200.0,
    isTaxInclusive: true,
    preTaxAmount: 1061.95,
    isActive: true,
    label: "20,000 Points ($1,200.00)",
  },
]

/**
 * Calculates the pre-tax discount to feed into the universal pricing engine.
 * Ensures the customer receives the exact promised gross discount after tax is applied.
 */
export function calculateLoyaltyPreTaxDiscount(
  rewardAmount: number,
  isTaxInclusive: boolean = true,
  hstRate: number = 13,
  isFirstNation: boolean = false
): number {
  if (!isTaxInclusive || rewardAmount <= 0) {
    return Math.max(0, Math.round(rewardAmount * 100) / 100)
  }

  // If 0% tax exempt, the customer gets the full amount pre-tax
  if (hstRate === 0) {
    return Math.max(0, Math.round(rewardAmount * 100) / 100)
  }

  // If First Nation Point-of-Sale exemption (5% GST on materials)
  if (isFirstNation || hstRate === 8 || hstRate === 0.05) {
    return Math.max(0, Math.round((rewardAmount / 1.05) * 100) / 100)
  }

  // Standard Ontario 13% HST
  return Math.max(0, Math.round((rewardAmount / 1.13) * 100) / 100)
}

/**
 * Recomputes the pre-tax loyalty discount string whenever tax mode changes,
 * leaving custom discounts or entries without a positive gross reward untouched.
 */
export function recalculateActiveLoyaltyDiscount(params: {
  discountType?: string
  loyaltyGrossAmount?: number
  currentDiscount?: string
  hstRate: number
  isFirstNation?: boolean
}): string {
  const {
    discountType,
    loyaltyGrossAmount = 0,
    currentDiscount = "",
    hstRate,
    isFirstNation = hstRate === 8,
  } = params

  if (discountType !== "loyalty" || loyaltyGrossAmount <= 0) {
    return currentDiscount
  }

  return calculateLoyaltyPreTaxDiscount(
    loyaltyGrossAmount,
    true,
    hstRate,
    isFirstNation
  ).toFixed(2)
}

export interface LoyaltyTaxTransitionInput {
  prevDiscountType: string
  prevLoyaltyGrossAmount: number
  prevTaxKey: string
  discountType: string
  loyaltyGrossAmount: number
  hstRate: number
  isFirstNation?: boolean
  currentDiscount?: string
}

/**
 * Resolves whether an active tax-inclusive loyalty discount must be recomputed
 * after a tax rate/mode transition, while leaving initial quote hydration and
 * custom discounts untouched.
 */
export function resolveLoyaltyDiscountForTaxChange(
  input: LoyaltyTaxTransitionInput
): { nextTaxKey: string; nextDiscount: string | null } {
  const isFirstNation = input.isFirstNation ?? input.hstRate === 8
  const nextTaxKey = `${input.hstRate}:${Boolean(isFirstNation)}`

  const taxChangedWhileLoyaltyActive =
    input.prevTaxKey !== "" &&
    input.prevTaxKey !== nextTaxKey &&
    input.prevDiscountType === "loyalty" &&
    input.prevLoyaltyGrossAmount > 0 &&
    input.discountType === "loyalty" &&
    input.loyaltyGrossAmount > 0

  if (!taxChangedWhileLoyaltyActive) {
    return { nextTaxKey, nextDiscount: null }
  }

  const nextDiscount = recalculateActiveLoyaltyDiscount({
    discountType: input.discountType,
    loyaltyGrossAmount: input.loyaltyGrossAmount,
    currentDiscount: input.currentDiscount,
    hstRate: input.hstRate,
    isFirstNation,
  })
  return { nextTaxKey, nextDiscount }
}

/**
 * Checks whether the combined materials base qualifies for a loyalty tier.
 * Qualifying Base = Combined Materials - Other Discounts.
 */
export function checkLoyaltyQualification(
  combinedMaterials: number,
  otherDiscounts: number,
  minPurchase: number
): {
  isQualified: boolean
  qualifyingBase: number
  shortage: number
} {
  const qualifyingBase = Math.max(0, Math.round((combinedMaterials - otherDiscounts) * 100) / 100)
  const isQualified = qualifyingBase >= minPurchase
  const shortage = isQualified ? 0 : Math.max(0, Math.round((minPurchase - qualifyingBase) * 100) / 100)

  return { isQualified, qualifyingBase, shortage }
}
