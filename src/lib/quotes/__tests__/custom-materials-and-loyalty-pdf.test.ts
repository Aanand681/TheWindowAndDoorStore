import { describe, it, expect } from "vitest"
import { calculateUniversalPricing } from "../universal-pricing-engine"
import { calculateInvoicePricingRollup } from "@/hooks/quotes/invoice-pricing-rollup"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import { computeQuotePricing } from "@/components/quotes/tab/quote-pricing-helper"
import {
  buildWindowAttachPayload,
  buildDoorAttachPayload,
  buildSealedUnitAttachPayload,
} from "@/components/calculator/attach/attach-payload-builders"
import { computeEffectiveDoorGrandTotal } from "@/lib/doors/totals-calculator"
import { getInvoiceLabourItems } from "@/hooks/quotes/invoice-labour"
import {
  getInvoiceTravelItems,
  getInvoiceDetailedExtrasList,
} from "@/hooks/quotes/invoice-logistics"

function createFixtures(withMaterials: boolean) {
  const winMats = withMaterials
    ? [{ id: "wm1", label: "Jamb as stop", amount: 120 }]
    : []
  const doorMats = withMaterials
    ? [{ id: "dm1", label: "Custom Brickmould", amount: 80 }]
    : []
  const suMats = withMaterials
    ? [{ id: "sm1", label: "Butyl Sealant", amount: 50 }]
    : []

  const windowQuote = {
    id: "w_1",
    quoteNumber: "404043",
    type: "window",
    windows: [
      { id: "qvslxma", qty: "1", base: "1659.2", argon: "74.83", solar: "165.72", triple: "" },
    ],
    taxTotals: {
      labourWindows: 632.27,
      miscTotal: 260.58,
      extras: 867.5,
      jc: 335.57,
      finalLabour: 1499.77,
      finalMisc: 260.58,
      finalJC: 335.57,
      customMaterials: winMats,
    },
    data: {
      quoteNumber: "404043",
      windows: [
        { id: "qvslxma", qty: "1", base: "1659.2", argon: "74.83", solar: "165.72", triple: "" },
      ],
      taxTotals: {
        labourWindows: 632.27,
        miscTotal: 260.58,
        extras: 867.5,
        jc: 335.57,
        finalLabour: 1499.77,
        finalMisc: 260.58,
        finalJC: 335.57,
        customMaterials: winMats,
      },
    },
  }

  const doorQuote = {
    id: "d_1",
    quoteNumber: "83917",
    type: "door",
    windows: [
      { id: "d1", quantity: 1, inksterBasePrice: 1800, category: "entry" },
    ],
    taxTotals: {
      rawDoorBaseTotal: 1800,
      stormDoorTotal: 0,
      hardwareTotal: 158,
      surchargeTotal: 144,
      discountTotal: 180,
      unitLabourTotal: 250,
      baseSetupFee: 140,
      totalTravelAndSetup: 140,
      combinedLabourTotal: 390,
      miscTotal: 30,
      customMaterials: doorMats,
      customMaterialsTotal: withMaterials ? 80 : 0,
    },
    data: {
      quoteNumber: "83917",
      windows: [{ id: "d1", quantity: 1, inksterBasePrice: 1800, category: "entry" }],
      taxTotals: {
        rawDoorBaseTotal: 1800,
        stormDoorTotal: 0,
        hardwareTotal: 158,
        surchargeTotal: 144,
        discountTotal: 180,
        unitLabourTotal: 250,
        baseSetupFee: 140,
        totalTravelAndSetup: 140,
        combinedLabourTotal: 390,
        miscTotal: 30,
        customMaterials: doorMats,
        customMaterialsTotal: withMaterials ? 80 : 0,
      },
    },
  }

  const sealedUnitQuote = {
    id: "su_1",
    quoteNumber: "437657",
    type: "sealed_unit",
    windows: [{ id: "s1", quantity: 1, multipliedTotal: 500, surcharge8PercentTotal: 40 }],
    taxTotals: {
      glassBefore8PercentTotal: 500,
      glass8PercentSurchargeTotal: 40,
      unitLabourSum: 150,
      baseSetupFee: 140,
      totalTravelAndSetup: 140,
      combinedLabourTotal: 290,
      miscTotal: 25,
      customMaterials: suMats,
      customMaterialsTotal: withMaterials ? 50 : 0,
    },
    data: {
      quoteNumber: "437657",
      windows: [{ id: "s1", quantity: 1, multipliedTotal: 500, surcharge8PercentTotal: 40 }],
      taxTotals: {
        glassBefore8PercentTotal: 500,
        glass8PercentSurchargeTotal: 40,
        unitLabourSum: 150,
        baseSetupFee: 140,
        totalTravelAndSetup: 140,
        combinedLabourTotal: 290,
        miscTotal: 25,
        customMaterials: suMats,
        customMaterialsTotal: withMaterials ? 50 : 0,
      },
    },
  }

  return { windowQuote, doorQuote, sealedUnitQuote }
}

describe("Custom Materials & Loyalty Discounts Across PDF, Combined Engine & Quotes Tab", () => {
  it("universal pricing engine rolls up customMaterials from all 3 products and applies 8% FN rebate", () => {
    const base = createFixtures(false)
    const withMats = createFixtures(true)

    const baseRes = calculateUniversalPricing({ ...base, hostType: "window", isFirstNation: true })
    const matsRes = calculateUniversalPricing({ ...withMats, hostType: "window", isFirstNation: true })

    expect(matsRes.customMaterials).toBe(250)
    expect(matsRes.subtotal).toBeCloseTo(baseRes.subtotal + 250, 2)
    expect(matsRes.materialExemption - baseRes.materialExemption).toBeCloseTo(20, 2)
    expect(matsRes.hstAmount - baseRes.hstAmount).toBeCloseTo(12.5, 2)
    expect(matsRes.materialsLineItems.some((i) => i.category === "material" && (i.label.includes("Brickmould") || i.amount === 250 || i.amount === 80 || i.label.toLowerCase().includes("material")))).toBe(true)
  })

  it("universal pricing engine stacks Layer 1 custom discount + Layer 2 loyalty discount on PDF", () => {
    const { windowQuote, doorQuote, sealedUnitQuote } = createFixtures(true)
    const base = calculateUniversalPricing({ windowQuote, doorQuote, sealedUnitQuote, hostType: "door" })
    const discounted = calculateUniversalPricing({
      windowQuote,
      doorQuote,
      sealedUnitQuote,
      hostType: "door",
      overrides: {
        customDiscount: "250",
        customDiscountLabel: "Spring Goodwill",
        loyaltyDiscount: "44.25",
        loyaltyDiscountLabel: "Loyalty Reward (1000 pts)",
      },
    })

    expect(discounted.discountLineItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Spring Goodwill", amount: 250 }),
        expect.objectContaining({ label: "Loyalty Reward (1000 pts)", amount: 44.25 }),
      ])
    )
    // Door 10% base discount ($180) overridden by $250 (-$70) + Loyalty ($44.25) = -$114.25
    expect(discounted.subtotal).toBeCloseTo(base.subtotal - 114.25, 2)

    const withLabourOverride = calculateUniversalPricing({
      windowQuote,
      doorQuote,
      sealedUnitQuote,
      hostType: "door",
      overrides: {
        customDiscount: "250",
        customDiscountLabel: "Spring Goodwill",
        loyaltyDiscount: "44.25",
        loyaltyDiscountLabel: "Loyalty Reward (1000 pts)",
        customLabour: "500",
        customMisc: "50",
      },
    })
    expect(withLabourOverride.doorNorm?.pureLabour).toBeCloseTo(360, 2)
    expect(withLabourOverride.subtotal).toBeCloseTo(discounted.subtotal + 130, 2)
  })

  it("preserves customMaterials across attach payload builders and computeEffectiveDoorGrandTotal", () => {
    const { windowQuote, doorQuote, sealedUnitQuote } = createFixtures(true)
    const winPayload = buildWindowAttachPayload(windowQuote as any)
    const doorPayload = buildDoorAttachPayload(doorQuote as any)
    const suPayload = buildSealedUnitAttachPayload(sealedUnitQuote as any)

    expect(winPayload.totals.customMaterials).toBe(120)
    expect(doorPayload.totals.customMaterialsTotal).toBe(80)
    expect(suPayload.totals.customMaterialsTotal).toBe(50)

    const effective = computeEffectiveDoorGrandTotal({
      totals: doorQuote.data.taxTotals as any,
      mode: "installation",
      customDiscount: "100",
      loyaltyDiscount: "44.25",
      hstRate: 0,
      attachedWindowQuote: winPayload,
      attachedSealedUnit: suPayload,
    })

    expect(effective.combinedTax).toBe(0)
    expect(effective.grandTotal).toBeCloseTo(effective.combinedSubtotal, 2)
  })

  it("calculateInvoicePricingRollup forwards loyaltyDiscount and customMaterials on Door host PDF", () => {
    const { doorQuote } = createFixtures(true)
    const rollupNoLoyalty = calculateInvoicePricingRollup({
      hasWindows: false,
      hasSealedUnits: false,
      hasDoors: true,
      hasAnyAttached: false,
      isWindowHost: false,
      isDoorHost: true,
      isSUHost: false,
      isAttachedSUService: false,
      quoteResult: { base: 0 },
      basePrice: 0,
      surcharge: 0,
      taxLabourCents: 0,
      taxMiscCents: 0,
      taxJCCents: 0,
      taxDiscount: 0,
      customLabour: "450",
      customMisc: "60",
      customDiscount: "50",
      customDiscountLabel: "Promo",
      activePromo: null,
      attachedWindowQuote: null,
      effectiveSUTotals: {},
      effectiveDoorTotals: doorQuote.data.taxTotals,
      hstRate: 13,
      afterDiscount: 0,
      taxTotals: doorQuote.data.taxTotals,
      isSupplyOnly: false,
    })

    const rollupWithLoyalty = calculateInvoicePricingRollup({
      hasWindows: false,
      hasSealedUnits: false,
      hasDoors: true,
      hasAnyAttached: false,
      isWindowHost: false,
      isDoorHost: true,
      isSUHost: false,
      isAttachedSUService: false,
      quoteResult: { base: 0 },
      basePrice: 0,
      surcharge: 0,
      taxLabourCents: 0,
      taxMiscCents: 0,
      taxJCCents: 0,
      taxDiscount: 0,
      customLabour: "450",
      customMisc: "60",
      customDiscount: "50",
      customDiscountLabel: "Promo",
      loyaltyDiscount: "110.62",
      loyaltyDiscountLabel: "Loyalty ($125 incl. HST)",
      activePromo: null,
      attachedWindowQuote: null,
      effectiveSUTotals: {},
      effectiveDoorTotals: doorQuote.data.taxTotals,
      hstRate: 13,
      afterDiscount: 0,
      taxTotals: doorQuote.data.taxTotals,
      isSupplyOnly: false,
    })

    expect(rollupWithLoyalty.effectiveLabourTotal).toBe(450)
    expect(rollupWithLoyalty.effectiveMiscTotalCents).toBe(6000)
    expect(rollupNoLoyalty.finalSubtotalCents - rollupWithLoyalty.finalSubtotalCents).toBe(11062)
  })

  it("computeCombinedQuoteFinancials includes customMaterials across all 3 products, stacked discounts & FN rebate", () => {
    const base = computeCombinedQuoteFinancials({
      quoteResult: { base: 200000, surcharge: 16000, promoDiscount: 0 },
      taxTotals: { customMaterials: [] },
      effectiveJC: 10000,
      effectiveMisc: 2000,
      effectiveLabour: 30000,
      hstRate: 8,
    })

    const withAllMatsAndLoyalty = computeCombinedQuoteFinancials({
      quoteResult: { base: 200000, surcharge: 16000, promoDiscount: 0 },
      taxTotals: { customMaterials: [{ id: "wm", label: "Stop", amount: 100 }] },
      attachedDoorQuote: {
        totals: { rawDoorBaseTotal: 1000, surchargeTotal: 80, discountTotal: 0, hardwareTotal: 0, stormDoorTotal: 0, unitLabourTotal: 200, miscTotal: 20, customMaterialsTotal: 50 },
      },
      attachedSealedUnit: {
        totals: { glassBefore8PercentTotal: 400, glass8PercentSurchargeTotal: 32, unitLabourSum: 100, miscTotal: 10, customMaterialsTotal: 50 },
      },
      customDiscount: "100",
      loyaltyDiscount: "44.25",
      effectiveJC: 10000,
      effectiveMisc: 2000,
      effectiveLabour: 30000,
      hstRate: 8,
    })

    expect(withAllMatsAndLoyalty.combinedSubtotalCents).toBeGreaterThan(base.combinedSubtotalCents)
    const noDiscSameMats = computeCombinedQuoteFinancials({
      quoteResult: { base: 200000, surcharge: 16000, promoDiscount: 0 },
      taxTotals: { customMaterials: [{ id: "wm", label: "Stop", amount: 100 }] },
      attachedDoorQuote: {
        totals: { rawDoorBaseTotal: 1000, surchargeTotal: 80, discountTotal: 0, hardwareTotal: 0, stormDoorTotal: 0, unitLabourTotal: 200, miscTotal: 20, customMaterialsTotal: 50 },
      },
      attachedSealedUnit: {
        totals: { glassBefore8PercentTotal: 400, glass8PercentSurchargeTotal: 32, unitLabourSum: 100, miscTotal: 10, customMaterialsTotal: 50 },
      },
      effectiveJC: 10000,
      effectiveMisc: 2000,
      effectiveLabour: 30000,
      hstRate: 8,
    })

    expect(noDiscSameMats.combinedSubtotalCents - withAllMatsAndLoyalty.combinedSubtotalCents).toBe(14425)
  })

  it("computeQuotePricing (/quotes tab) handles Window customMaterials, loyaltyDiscount & FN 8% POS exemption", () => {
    const winNoMats = {
      quoteType: "window",
      windows: [{ id: "w1", qty: "1", base: "1000" }],
      hstRate: 8,
      taxTotals: { finalLabour: 300, finalMisc: 50, finalJC: 100, customMaterials: [] },
    }
    const winWithMats = {
      ...winNoMats,
      taxTotals: { ...winNoMats.taxTotals, customMaterials: [{ id: "m1", label: "Stop", amount: 100 }] },
    }
    const winWithLoyalty = {
      ...winWithMats,
      customDiscount: "50",
      loyaltyDiscount: "44.25",
    }

    const p0 = computeQuotePricing(winNoMats)!
    const p1 = computeQuotePricing(winWithMats)!
    const p2 = computeQuotePricing(winWithLoyalty)!

    // Adding $100 of materials at FN 8% POS exemption adds $100 subtotal + $5 net HST = $105.00 (10500 cents)
    expect(p1.total - p0.total).toBe(10500)
    // Subtracting $94.25 stacked discounts on subtotal
    expect(p2.total).toBeLessThan(p1.total)
  })

  it("getInvoiceLabourItems & invoice-logistics preserve Window/Door/SU labours, upcharges, add-ons & travel fallbacks", () => {
    const labour = getInvoiceLabourItems({
      isSupplyOnly: false,
      isWinSupply: false,
      isDoorSupply: false,
      isSUSupply: false,
      hasWindows: true,
      winLabourCents: 35000,
      effectiveWindows: [{ id: "w1" }],
      taxTotals: { wLab: 350 },
      hasDoors: true,
      effectiveDoors: [{ id: "d1" }],
      effectiveDoorTotals: { unitLabourTotal: 200 },
      doorUpcharges: [{ upchargeId: "custom_1", label: "Storm Removal", qty: 1, total: 60 }],
      hasSealedUnits: true,
      effectiveSUTotals: { serviceLabourTotal: 150, extraLabour: 90 },
      suUpcharges: [{ id: "su_u1", label: "High Ladder", price: 90 }],
      isAttachedSUService: true,
    })

    expect(labour.map((l) => l.label)).toEqual([
      "Window installation labour (1 unit)",
      "Door installation labour (1 unit)",
      "Door Storm Removal",
      "Sealed unit service labour",
      "Sealed unit High Ladder",
    ])
    expect(labour.map((l) => l.amount)).toEqual([35000, 20000, 6000, 15000, 9000])

    // Supply-only attached door does not leak upcharges into Install host
    const supplyDoorExcluded = getInvoiceLabourItems({
      isSupplyOnly: false,
      isDoorSupply: true,
      hasWindows: false,
      winLabourCents: 0,
      hasDoors: true,
      effectiveDoors: [{ id: "d1" }],
      effectiveDoorTotals: { unitLabourTotal: 0 },
      doorUpcharges: [{ upchargeId: "custom_1", label: "Storm Removal", qty: 1, total: 60 }],
      hasSealedUnits: false,
    })
    expect(supplyDoorExcluded).toEqual([])

    const extras = getInvoiceDetailedExtrasList([
      { id: "a1", label: "Exterior Capping", qty: 2, lab: 40, misc: 25 },
    ])
    expect(extras).toHaveLength(2)
    expect(extras[0].label).toBe("Exterior Capping — Labour")
    expect(extras[1].label).toBe("Exterior Capping — Materials / Misc")

    const attachedDoorTravel = getInvoiceTravelItems({
      isWindowHost: false,
      taxTotals: undefined,
      isDoorHost: false,
      effectiveDoorTotals: { travelAndSetupFee: 320 },
      isSUHost: true,
      effectiveSUTotals: { totalTravelAndSetup: 140 },
      attachedDoorQuote: { totals: { travelAndSetupFee: 320 } },
    })
    expect(attachedDoorTravel).toEqual([
      { label: "Job set-up & travel fee (door quote)", amount: 32000 },
    ])
  })
})
