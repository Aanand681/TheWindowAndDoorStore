import { describe, it, expect } from "vitest"
import { calculateUniversalPricing } from "../universal-pricing-engine"

describe("Universal Pricing Engine", () => {
  const windowDraft = {
    quoteNumber: "404043",
    customerName: "Hannah Land",
    type: "window",
    data: {
      effectiveBase: 5860,
      quoteResult: { base: 586000, surcharge: 46880, promoDiscount: 0 },
      taxTotals: {
        labourWindows: 632.27,
        extras: 867.5,
        finalLabour: 1499.77,
        finalMisc: 350,
        miscTotal: 350,
        finalJC: 335.57,
        jcTotal: 335.57,
      },
      windows: [{ id: "w1", qty: 2 }],
    },
  }

  const doorDraft = {
    quoteNumber: "83917",
    customerName: "Hillary Hackerman",
    type: "door",
    data: {
      doors: [{ id: "d1", qty: 1 }],
      totals: {
        rawDoorBaseTotal: 3100,
        stormDoorTotal: 500,
        hardwareTotal: 189.26,
        discountTotal: 500, // net materials = 3289.26
        surchargeTotal: 269.22,
        unitLabourTotal: 196.43,
        doorPureLabourTotal: 196.43,
        totalTravelAndSetup: 867.5,
        miscTotal: 180.58,
      },
    },
  }

  const sealedUnitDraft = {
    quoteNumber: "437657",
    customerName: "SL Health",
    type: "sealed_unit",
    data: {
      sealedUnits: [{ id: "su1", qty: 1 }],
      totals: {
        glassBefore8PercentTotal: 1204.43,
        glass8PercentSurchargeTotal: 96.35,
        unitLabourSum: 3000,
        extraLabour: 0,
        totalTravelAndSetup: 503.5, // small-job travel fee!
        miscTotal: 150,
      },
    },
  }

  it("calculates exact reconciled figures across all 3 quotes with max travel fee applied", () => {
    const result = calculateUniversalPricing({
      windowQuote: windowDraft,
      doorQuote: doorDraft,
      sealedUnitQuote: sealedUnitDraft,
      hostType: "sealed_unit", // host is sealed unit with 503.50 travel
    })

    // Materials: 5860 (win) + 3289.26 (door) + 1204.43 (su) + 335.57 (JC) = 10689.26
    expect(result.materials).toBe(10689.26)
    // Surcharges: 468.80 + 269.22 + 96.35 = 834.37
    expect(result.surcharges).toBe(834.37)
    // Misc: 350 + 180.58 + 150 = 680.58
    expect(result.misc).toBe(680.58)
    // Travel fee must be MAX(867.50, 867.50, 503.50) = 867.50
    expect(result.travelAndSetup).toBe(867.5)
    // Pure labour: 632.27 + 196.43 + 3000 = 3828.70
    expect(result.pureLabour).toBe(3828.7)
    // Combined labour: 3828.70 + 867.50 = 4696.20
    expect(result.combinedLabour).toBe(4696.2)
    // Subtotal: 10689.26 + 834.37 + 680.58 + 4696.20 = 16900.41
    expect(result.subtotal).toBe(16900.41)
    // Tax: 13% of 16900.41 = 2197.05
    expect(result.hstAmount).toBe(2197.05)
    // Total: 16900.41 + 2197.05 = 19097.46
    expect(result.total).toBe(19097.46)
  })

  it("produces identical results whether hosted from Window, Door, or Sealed Unit", () => {
    const winHost = calculateUniversalPricing({
      windowQuote: windowDraft,
      doorQuote: doorDraft,
      sealedUnitQuote: sealedUnitDraft,
      hostType: "window",
    })

    const doorHost = calculateUniversalPricing({
      windowQuote: windowDraft,
      doorQuote: doorDraft,
      sealedUnitQuote: sealedUnitDraft,
      hostType: "door",
    })

    const suHost = calculateUniversalPricing({
      windowQuote: windowDraft,
      doorQuote: doorDraft,
      sealedUnitQuote: sealedUnitDraft,
      hostType: "sealed_unit",
    })

    expect(winHost.subtotal).toBe(doorHost.subtotal)
    expect(doorHost.subtotal).toBe(suHost.subtotal)
    expect(winHost.total).toBe(doorHost.total)
    expect(doorHost.total).toBe(suHost.total)
    expect(winHost.combinedLabour).toBe(4696.2)
  })

  it("handles 1-cent labour override without inflating travel fee", () => {
    // User types 1499.78 on window quote (default was 1499.77)
    const result = calculateUniversalPricing({
      windowQuote: windowDraft,
      doorQuote: doorDraft,
      sealedUnitQuote: sealedUnitDraft,
      hostType: "window",
      overrides: {
        customLabour: "1499.78",
      },
    })

    // Pure window labour should be 1499.78 - 867.50 = 632.28 (+0.01)
    expect(result.winNorm?.pureLabour).toBe(632.28)
    // Combined labour should increase by exactly 1 cent: 4696.21
    expect(result.combinedLabour).toBe(4696.21)
    // Subtotal should increase by exactly 1 cent: 16900.42
    expect(result.subtotal).toBe(16900.42)
    // Total should increase by 1 cent: 19097.47
    expect(result.total).toBe(19097.47)
  })

  it("applies First Nation point-of-sale exemption accurately", () => {
    const result = calculateUniversalPricing({
      windowQuote: windowDraft,
      doorQuote: doorDraft,
      sealedUnitQuote: sealedUnitDraft,
      hostType: "window",
      isFirstNation: true,
    })

    // 8% material exemption on materials (10689.26 * 0.08 = 855.14)
    expect(result.materialExemption).toBe(855.14)
    expect(result.hstAmount).toBe(1341.91)
    expect(result.total).toBe(18242.32)
  })

  it("produces unified line items for both UI summary cards and Invoice PDF", () => {
    const result = calculateUniversalPricing({
      windowQuote: windowDraft,
      doorQuote: doorDraft,
      sealedUnitQuote: sealedUnitDraft,
      hostType: "window",
    })

    expect(result.labourLineItems).toHaveLength(4)
    expect(result.labourLineItems[0]).toEqual({
      label: "Window installation labour (2 units)",
      amount: 632.27,
      category: "labour",
    })
    expect(result.labourLineItems[1]).toEqual({
      label: "Door installation labour (1 unit)",
      amount: 196.43,
      category: "labour",
    })
    expect(result.labourLineItems[2]).toEqual({
      label: "Sealed unit installation labour",
      amount: 3000,
      category: "labour",
    })
    expect(result.labourLineItems[3]).toEqual({
      label: "Site setup & travel fee",
      amount: 867.5,
      category: "travel",
    })
  })
})
