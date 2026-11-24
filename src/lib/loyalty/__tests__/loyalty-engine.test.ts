import { describe, it, expect } from "vitest"
import {
  calculateLoyaltyPreTaxDiscount,
  checkLoyaltyQualification,
  DEFAULT_LOYALTY_TIERS,
} from "../loyalty-engine"

describe("Loyalty Engine Calculations", () => {
  it("should have 5 default tiers matching user specifications", () => {
    expect(DEFAULT_LOYALTY_TIERS).toHaveLength(5)
    expect(DEFAULT_LOYALTY_TIERS[0].points).toBe(1000)
    expect(DEFAULT_LOYALTY_TIERS[0].rewardAmount).toBe(50)
    expect(DEFAULT_LOYALTY_TIERS[0].minPurchase).toBe(167)
    expect(DEFAULT_LOYALTY_TIERS[0].preTaxAmount).toBe(44.25)

    expect(DEFAULT_LOYALTY_TIERS[1].points).toBe(2500)
    expect(DEFAULT_LOYALTY_TIERS[1].rewardAmount).toBe(125)
    expect(DEFAULT_LOYALTY_TIERS[1].minPurchase).toBe(417.5)
    expect(DEFAULT_LOYALTY_TIERS[1].preTaxAmount).toBe(110.62)

    expect(DEFAULT_LOYALTY_TIERS[2].points).toBe(5000)
    expect(DEFAULT_LOYALTY_TIERS[2].rewardAmount).toBe(250)
    expect(DEFAULT_LOYALTY_TIERS[2].minPurchase).toBe(835)
    expect(DEFAULT_LOYALTY_TIERS[2].preTaxAmount).toBe(221.24)

    expect(DEFAULT_LOYALTY_TIERS[3].points).toBe(10000)
    expect(DEFAULT_LOYALTY_TIERS[3].rewardAmount).toBe(500)
    expect(DEFAULT_LOYALTY_TIERS[3].minPurchase).toBe(1670)
    expect(DEFAULT_LOYALTY_TIERS[3].preTaxAmount).toBe(442.48)

    expect(DEFAULT_LOYALTY_TIERS[4].points).toBe(20000)
    expect(DEFAULT_LOYALTY_TIERS[4].rewardAmount).toBe(1200)
    expect(DEFAULT_LOYALTY_TIERS[4].minPurchase).toBe(3340)
    expect(DEFAULT_LOYALTY_TIERS[4].preTaxAmount).toBe(1061.95)
  })

  it("should extract 13% tax to yield exact promised savings under standard tax", () => {
    // $50 incl tax -> $44.25 pre-tax -> $44.25 * 1.13 = $50.00
    const preTax50 = calculateLoyaltyPreTaxDiscount(50, true, 13, false)
    expect(preTax50).toBe(44.25)
    expect(Math.round(preTax50 * 1.13 * 100) / 100).toBe(50.0)

    // $125 incl tax -> $110.62 pre-tax -> $110.62 * 1.13 = $125.00
    const preTax125 = calculateLoyaltyPreTaxDiscount(125, true, 13, false)
    expect(preTax125).toBe(110.62)
    expect(Math.round(preTax125 * 1.13 * 100) / 100).toBe(125.0)

    // $250 incl tax -> $221.24 pre-tax -> $221.24 * 1.13 = $250.00
    const preTax250 = calculateLoyaltyPreTaxDiscount(250, true, 13, false)
    expect(preTax250).toBe(221.24)
    expect(Math.round(preTax250 * 1.13 * 100) / 100).toBe(250.0)
  })

  it("should yield full promised savings under 0% tax exemption", () => {
    const preTax = calculateLoyaltyPreTaxDiscount(50, true, 0, false)
    expect(preTax).toBe(50.0)
  })

  it("should adjust pre-tax discount for First Nation exemption (5% GST)", () => {
    const preTax = calculateLoyaltyPreTaxDiscount(50, true, 13, true)
    // 50 / 1.05 = 47.62
    expect(preTax).toBe(47.62)
    expect(Math.round(preTax * 1.05 * 100) / 100).toBe(50.0)
  })

  it("should return raw amount if not tax inclusive", () => {
    const preTax = calculateLoyaltyPreTaxDiscount(50, false, 13, false)
    expect(preTax).toBe(50)
  })

  it("should check loyalty qualification based on combined materials minus other discounts", () => {
    // Combined materials = 500, other discounts = 0, minPurchase = 417.50 -> Qualified
    const res1 = checkLoyaltyQualification(500, 0, 417.5)
    expect(res1.isQualified).toBe(true)
    expect(res1.qualifyingBase).toBe(500)
    expect(res1.shortage).toBe(0)

    // Combined materials = 500, other discount = 100 -> Qualifying base = 400 < 417.50 -> Not qualified
    const res2 = checkLoyaltyQualification(500, 100, 417.5)
    expect(res2.isQualified).toBe(false)
    expect(res2.qualifyingBase).toBe(400)
    expect(res2.shortage).toBe(17.5)
  })
})
