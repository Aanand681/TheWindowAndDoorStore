import { describe, it, expect, vi, beforeEach } from "vitest"
import { computeQuotePricing } from "@/components/quotes/tab/quote-pricing-helper"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"
import { buildDoorUpdatePayload } from "@/hooks/doors/door-review-payload"
import { buildSealedUnitsUpdatePayload } from "@/hooks/sealed-units/sealed-units-review-payload"
import { computeEffectiveSealedUnitGrandTotal } from "@/lib/sealed-units/totals-calculator"

vi.mock("@/hooks/calculator/supply-mode/supply-session-storage", () => ({
  readSessionAttachedInstallOption: vi.fn().mockReturnValue(null),
  readSessionCustomOptions: vi.fn().mockReturnValue([]),
}))

describe("Batch B — Single-Source-of-Truth Pricing Parity (/quotes & Payloads)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const attachedWindowPayload = {
    quoteNumber: "W-101",
    customerName: "Jane Doe",
    windows: [{ id: "w1", qty: 1, base: 1000 }],
    totals: {
      base: 1000,
      surcharge: 80,
      promoDiscount: 0,
      labour: 200,
      misc: 25,
      jc: 50,
      travelAndSetupFee: 0,
    },
  }

  const attachedSealedUnitPayload = {
    quoteNumber: "SU-201",
    customerName: "Jane Doe",
    lineItems: [{ id: "su1", quantity: 1 }],
    totals: {
      glassBefore8PercentTotal: 500,
      glass8PercentSurchargeTotal: 40,
      glassSupplyTotal: 540,
      pureLabourTotal: 100,
      combinedLabourTotal: 100,
      miscTotal: 15,
      travelAndSetupFee: 0,
      totalTravelAndSetup: 0,
    },
  }

  it("computeQuotePricing includes attached quotes, customLabour/Misc, and deduplicates travel on Door quotes", () => {
    const doorQuote = {
      quoteType: "door",
      quoteNumber: "D-301",
      customerName: "Jane Doe",
      mode: "installation",
      hstRate: 13,
      customLabour: "450",
      customMisc: "60",
      loyaltyDiscount: "44.25",
      loyaltyDiscountLabel: "Loyalty Reward",
      windows: [{ id: "d1", doorPresetId: "entry", quantity: 1 }],
      taxTotals: {
        rawDoorBaseTotal: 1200,
        stormDoorTotal: 0,
        hardwareTotal: 100,
        discountTotal: 120,
        surchargeTotal: 96,
        doorPureLabourTotal: 250,
        baseSetupFee: 140,
        totalTravelAndSetup: 240,
        combinedLabourTotal: 490,
        miscTotal: 30,
        grandTotal: 2000,
      },
      attachedWindowQuote: attachedWindowPayload,
      attachedSealedUnit: attachedSealedUnitPayload,
    }

    const expected = calculateUniversalPricing({
      doorQuote,
      windowQuote: attachedWindowPayload,
      sealedUnitQuote: attachedSealedUnitPayload,
      hostType: "door",
      isSupplyOnly: false,
      hstRate: 13,
      overrides: {
        customLabour: "450",
        customMisc: "60",
        loyaltyDiscount: "44.25",
        loyaltyDiscountLabel: "Loyalty Reward",
      },
    })

    const pricing = computeQuotePricing(doorQuote)!
    expect(pricing.total).toBe(expected.totalCents)
    expect(pricing.afterDiscount).toBe(expected.subtotalCents)
    expect(pricing.hst).toBe(expected.taxCents)
    expect(pricing.effectiveLabour).toBe(45000)
    expect(pricing.effectiveMisc).toBe(6000)
    expect(pricing.firstPayment + pricing.secondPayment).toBe(pricing.total)
  })

  it("computeQuotePricing deduplicates shared travel and includes attached quotes on Sealed Unit & Window quotes", () => {
    const attachedDoorWithTravel = {
      quoteNumber: "D-401",
      totals: {
        rawDoorBaseTotal: 1000,
        stormDoorTotal: 0,
        hardwareTotal: 0,
        discountTotal: 0,
        surchargeTotal: 80,
        doorPureLabourTotal: 200,
        baseSetupFee: 140,
        totalTravelAndSetup: 240,
        combinedLabourTotal: 440,
        miscTotal: 20,
      },
    }

    const suQuote = {
      quoteType: "sealed_unit",
      sealedUnitMode: "installation",
      hstRate: 13,
      windows: [{ id: "su1", quantity: 1 }],
      taxTotals: {
        isSealedUnitQuote: true,
        glassBefore8PercentTotal: 800,
        glass8PercentSurchargeTotal: 64,
        glassSupplyTotal: 864,
        unitLabourSum: 150,
        baseSetupFee: 140,
        totalTravelAndSetup: 140,
        combinedLabourTotal: 290,
        miscTotal: 25,
      },
      attachedWindowQuote: attachedWindowPayload,
      attachedDoorQuote: attachedDoorWithTravel,
    }

    const expectedSU = calculateUniversalPricing({
      sealedUnitQuote: suQuote,
      windowQuote: attachedWindowPayload,
      doorQuote: attachedDoorWithTravel,
      hostType: "sealed_unit",
      hstRate: 13,
    })

    const suPricing = computeQuotePricing(suQuote)!
    expect(suPricing.total).toBe(expectedSU.totalCents)

    const winQuote = {
      quoteType: "window",
      hstRate: 13,
      quoteResult: { base: 200000, surcharge: 16000, promoDiscount: 0 },
      customLabour: "100", // Intentionally below $140 extras to test clamping
      customMisc: "50",
      customJC: "75",
      taxTotals: {
        extras: 140,
        finalLabour: 300,
        finalMisc: 30,
        finalJC: 40,
      },
      attachedDoorQuote: attachedDoorWithTravel,
    }

    const winPricing = computeQuotePricing(winQuote)!
    expect(winPricing.effectiveLabour).toBe(10000)
    expect(winPricing.effectiveMisc).toBe(5000)
    expect(winPricing.effectiveJC).toBe(7500)
    // Shared travel max(100, 240) = 240 (NOT 100 + 240 = 340)
    expect(winPricing.afterDiscount).toBe(
      (2000 + 160 + 75 + 50 + 1000 + 80 + 20 + 200 + 240) * 100
    )
  })

  it("never applies the 100x heuristic to stored integer-cent quoteSummaryTotal values under $1,000", () => {
    const legacyFallbackQuote = {
      quoteType: "window",
      quoteSummaryTotal: 50000, // Exact integer cents = $500.00
      taxTotals: {},
      windows: [],
    }

    const pricing = computeQuotePricing(legacyFallbackQuote)!
    expect(pricing.total).toBe(50000)
  })

  it("buildDoorUpdatePayload & buildSealedUnitsUpdatePayload store combined quoteSummaryTotal (cents)", () => {
    const doorTotals = {
      rawDoorBaseTotal: 1000,
      stormDoorTotal: 0,
      hardwareTotal: 0,
      discountTotal: 100,
      surchargeTotal: 80,
      doorPureLabourTotal: 200,
      baseSetupFee: 140,
      totalTravelAndSetup: 140,
      combinedLabourTotal: 340,
      miscTotal: 30,
      unitLabourTotal: 200,
      upchargesTotal: 0,
      suppliesTotal: 0,
      subtotalPreTax: 1350,
      hstAmount: 175.5,
      grandTotal: 1525.5,
      depositAmount: 762.75,
    } as any

    const doorPayload = buildDoorUpdatePayload({
      customerName: "Jane Doe",
      quoteNumber: "D-501",
      quoteNotes: "",
      mode: "installation",
      lineItems: [],
      totals: doorTotals,
      globalUpcharges: [],
      travelFeeType: "local_std",
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "",
      crewHours: "",
      crewSize: "2",
      isFirstNation: false,
      hstRate: 13,
      customLabour: "500",
      customMisc: "",
      attachedWindowQuote: attachedWindowPayload,
      attachedSealedUnit: null,
    })

    const expectedDoorCombined = calculateUniversalPricing({
      doorQuote: { data: { totals: doorTotals, mode: "installation" } },
      windowQuote: attachedWindowPayload,
      hostType: "door",
      hstRate: 13,
      overrides: { customLabour: "500" },
    })

    expect(doorPayload.quoteSummaryTotal).toBe(expectedDoorCombined.totalCents)
    expect(doorPayload.quoteSummaryTotal).toBeGreaterThan(
      Math.round(doorTotals.grandTotal * 100)
    )

    const suTotals = {
      glassBefore8PercentTotal: 600,
      glass8PercentSurchargeTotal: 48,
      glassSupplyTotal: 648,
      unitLabourSum: 150,
      baseSetupFee: 140,
      totalTravelAndSetup: 140,
      combinedLabourTotal: 290,
      miscTotal: 20,
      subtotalPreTax: 958,
      hstAmount: 124.54,
      grandTotal: 1082.54,
    } as any

    const suPayload = buildSealedUnitsUpdatePayload({
      customerName: "Jane Doe",
      quoteNumber: "SU-501",
      quoteNotes: "",
      sealedUnitMode: "installation",
      isInstallation: true,
      isServiceOnly: false,
      lineItems: [],
      totals: suTotals,
      serviceSqftInput: "",
      serviceLabourRateInput: "",
      serviceMiscRateInput: "",
      travelFeeType: "local_std",
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "",
      crewHours: "",
      crewSize: "2",
      hstRate: 13,
      attachedWindowQuote: attachedWindowPayload,
      attachedDoorQuote: null,
    })

    const expectedSU = computeEffectiveSealedUnitGrandTotal({
      totals: suTotals,
      sealedUnitMode: "installation",
      hstRate: 13,
      attachedWindowQuote: attachedWindowPayload,
    })

    expect(suPayload.quoteSummaryTotal).toBe(Math.round(expectedSU.grandTotal * 100))
    expect(suPayload.quoteSummaryTotal).toBeGreaterThan(
      Math.round(suTotals.grandTotal * 100)
    )
  })
})
