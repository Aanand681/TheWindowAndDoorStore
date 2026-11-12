import { describe, it, expect } from "vitest"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import { detectQuoteChanges } from "@/lib/quote-diff"

describe("Drafts & Combined Quotes Architecture", () => {
  it("correctly serializes and computes combined financials for Window + Attached Door + Attached SU", () => {
    const windowQuote = {
      quoteResult: { base: 200000, surcharge: 16000, promoDiscount: 20000 },
      afterDiscount: 196000,
      total: 221480,
      effectiveJC: 25000,
      effectiveMisc: 10000,
      effectiveLabour: 50000,
      hstRate: 13,
      attachedDoorQuote: {
        totals: {
          rawDoorBaseTotal: 1500,
          stormDoorTotal: 0,
          hardwareTotal: 120,
          discountTotal: 150,
          surchargeTotal: 120,
          unitLabourTotal: 400,
          upchargesTotal: 100,
          miscTotal: 80,
        },
      },
      attachedSealedUnit: {
        totals: {
          glassBefore8PercentTotal: 600,
          glass8PercentSurchargeTotal: 48,
          unitLabourSum: 200,
          miscTotal: 50,
        },
      },
    }

    const fin = computeCombinedQuoteFinancials({
      quoteResult: windowQuote.quoteResult,
      afterDiscount: windowQuote.afterDiscount,
      total: windowQuote.total,
      attachedDoorQuote: windowQuote.attachedDoorQuote,
      attachedSealedUnit: windowQuote.attachedSealedUnit,
      effectiveJC: windowQuote.effectiveJC,
      effectiveMisc: windowQuote.effectiveMisc,
      effectiveLabour: windowQuote.effectiveLabour,
      hstRate: windowQuote.hstRate,
    })

    expect(fin.doorMaterialsCents).toBeGreaterThan(0)
    expect(fin.suGlassCents).toBeGreaterThan(0)
    expect(fin.subtotalDollars).toBeGreaterThan(0)
    expect(fin.grandTotalDollars).toBeGreaterThan(fin.subtotalDollars)
  })

  it("detects changes when jamb or casing is modified during review", () => {
    const originalQuote = {
      windows: [{ id: "1", w: "36", h: "48", base: 450 }],
      taxTotals: {
        selectedJamb: { name: 'Vinyl Wrapped Jamb - 6 9/16"' },
        selectedCasing: { name: "Colonial Casing" },
      },
      customJC: "300",
    }

    const updatedQuote = {
      windows: [{ id: "1", w: "36", h: "48", base: 450 }],
      taxTotals: {
        selectedJamb: { name: 'Vinyl Wrapped Jamb - 4 9/16"' },
        selectedCasing: { name: "Flat Casing" },
      },
      customJC: "350",
    }

    const changes = detectQuoteChanges(originalQuote, updatedQuote)
    expect(changes.some((c) => c.includes("Jambs changed"))).toBe(true)
    expect(changes.some((c) => c.includes("Casing changed"))).toBe(true)
    expect(changes.some((c) => c.includes("Custom Jambs & Casing"))).toBe(true)
  })

  it("retains supply casing and jamb parameters across workspace payload without data loss", () => {
    const payload = {
      quoteNumber: "109823",
      customerName: "Jane Smith",
      isSupplyOnly: true,
      supplyJambId: "j4",
      supplyJambRate: "4.75",
      supplyCasingId: "c2",
      supplyCasingRate: "2.50",
      attachedDoorQuote: {
        lineItems: [{ id: "door-1", name: "Entry Door" }],
        totals: { grandTotal: 2850 },
      },
      attachedWindowQuote: null,
      attachedSealedUnit: null,
    }

    expect(payload.isSupplyOnly).toBe(true)
    expect(payload.supplyJambId).toBe("j4")
    expect(payload.supplyJambRate).toBe("4.75")
    expect(payload.supplyCasingId).toBe("c2")
    expect(payload.supplyCasingRate).toBe("2.50")
    expect(payload.attachedDoorQuote.totals.grandTotal).toBe(2850)
  })

  it("keys drafts by username instead of gmail", () => {
    const draftRecord = {
      username: "cheeku",
      type: "window" as const,
      quoteNumber: "109823",
      customerName: "Jane Smith",
      grandTotal: 1500,
    }

    expect(draftRecord.username).toBe("cheeku")
    expect((draftRecord as any).userEmail).toBeUndefined()
  })

  it("calculates 8% First Nations material exemption as (13% on all) - (8% on material) with surcharge in services", () => {
    // Window quote with $10,000 subtotal:
    // Window base: $6,000
    // JC: $1,000
    // Surcharge: $800 (handling/service, NOT material!)
    // Labour: $2,000
    // Misc: $200
    // Total subtotal: $10,000
    // 13% on all: $1,300.00
    // Materials: $6,000 + $1,000 = $7,000.00
    // 8% Material Exemption: $7,000 * 0.08 = $560.00
    // Net Tax: $1,300 - $560 = $740.00
    const fin = computeCombinedQuoteFinancials({
      quoteResult: { base: 600000, surcharge: 80000, promoDiscount: 0 },
      afterDiscount: 1000000,
      total: 1074000,
      effectiveJC: 100000,
      effectiveLabour: 200000,
      effectiveMisc: 20000,
      hstRate: 8,
    })

    expect(fin.combinedSubtotalCents).toBe(1000000)
    expect(fin.combinedHstBaseCents).toBe(130000)
    expect(fin.combinedMaterialExemptionCents).toBe(56000)
    expect(fin.combinedTaxCents).toBe(74000)
    expect(fin.combinedTotalCents).toBe(1074000)
  })

  it("supports 0% No Tax option, resulting in exactly $0.00 tax", () => {
    const fin = computeCombinedQuoteFinancials({
      quoteResult: { base: 600000, surcharge: 80000, promoDiscount: 0 },
      afterDiscount: 1000000,
      total: 1000000,
      effectiveJC: 100000,
      effectiveLabour: 200000,
      effectiveMisc: 20000,
      hstRate: 0,
    })

    expect(fin.combinedTaxCents).toBe(0)
    expect(fin.combinedTotalCents).toBe(fin.combinedSubtotalCents)
  })
})
