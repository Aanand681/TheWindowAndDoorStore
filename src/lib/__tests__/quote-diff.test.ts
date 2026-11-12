import { describe, it, expect } from "vitest"
import { detectQuoteChanges } from "../quote-diff"

describe("Quote Diff Engine - detectQuoteChanges", () => {
  it("should return an empty array if inputs are null, undefined, or identical", () => {
    expect(detectQuoteChanges(null, null)).toEqual([])
    expect(detectQuoteChanges({}, null)).toEqual([])
    expect(detectQuoteChanges(null, {})).toEqual([])

    const baseState = {
      customMisc: "50",
      customJC: "100",
      customLabour: "300",
      taxTotals: {
        finalMisc: 50,
        finalJC: 100,
        finalLabour: 300,
        jambName: "Vinyl Wrapped Jamb – 3/4 x 4 1/2",
        casingName: "Vinyl casing charge",
        selectedAddons: [{ id: "drip", label: "Drip edge", qty: 1, total: 30 }],
        vehicle: 50,
        crewTravel: 100,
        setup: 140,
        discount: 0,
      },
      windows: [{ w: "36", h: "48", qty: 1, base: 50000 }],
      quoteResult: { base: 50000 },
      surchargeRate: 8,
    }

    expect(detectQuoteChanges(baseState, { ...baseState })).toEqual([])
  })

  describe("Custom Overrides (Misc, JC, Labour)", () => {
    it("should detect setting, updating, and removing Custom Misc override", () => {
      const orig = { customMisc: null, taxTotals: { finalMisc: 40 } }
      const setCur = { customMisc: "65", taxTotals: { finalMisc: 40 } }
      expect(detectQuoteChanges(orig, setCur)[0]).toContain(
        "Custom Misc price override set to $65.00 (was calculated as $40.00)"
      )

      const updatedCur = { customMisc: "80", taxTotals: { finalMisc: 40 } }
      expect(detectQuoteChanges(setCur, updatedCur)[0]).toContain(
        "Custom Misc price updated from $65.00 to $80.00"
      )

      const revertedCur = { customMisc: null, taxTotals: { finalMisc: 40 } }
      expect(detectQuoteChanges(updatedCur, revertedCur)[0]).toContain(
        "Custom Misc override removed (reverted to tax calculation $40.00)"
      )
    })

    it("should detect setting, updating, and removing Custom Jambs & Casing override", () => {
      const orig = { customJC: null, taxTotals: { finalJC: 120 } }
      const setCur = { customJC: "200", taxTotals: { finalJC: 120 } }
      expect(detectQuoteChanges(orig, setCur)[0]).toContain(
        "Custom Jambs & Casing override set to $200.00 (was calculated as $120.00)"
      )

      const updatedCur = { customJC: "250", taxTotals: { finalJC: 120 } }
      expect(detectQuoteChanges(setCur, updatedCur)[0]).toContain(
        "Custom Jambs & Casing updated from $200.00 to $250.00"
      )

      const revertedCur = { customJC: null, taxTotals: { finalJC: 120 } }
      expect(detectQuoteChanges(updatedCur, revertedCur)[0]).toContain(
        "Custom Jambs & Casing override removed (reverted to calculated $120.00)"
      )
    })

    it("should detect setting, updating, and removing Custom Labour override", () => {
      const orig = { customLabour: null, taxTotals: { finalLabour: 500 } }
      const setCur = { customLabour: "650", taxTotals: { finalLabour: 500 } }
      expect(detectQuoteChanges(orig, setCur)[0]).toContain(
        "Custom Labour override set to $650.00 (was calculated as $500.00)"
      )

      const updatedCur = {
        customLabour: "700",
        taxTotals: { finalLabour: 500 },
      }
      expect(detectQuoteChanges(setCur, updatedCur)[0]).toContain(
        "Custom Labour updated from $650.00 to $700.00"
      )

      const revertedCur = {
        customLabour: null,
        taxTotals: { finalLabour: 500 },
      }
      expect(detectQuoteChanges(updatedCur, revertedCur)[0]).toContain(
        "Custom Labour override updated (reverted to calculated $500.00)"
      )
    })
  })

  describe("Jamb and Casing Selection", () => {
    it("should detect jamb profile changes with cleaned labels", () => {
      const orig = {
        taxTotals: { jambName: "Vinyl Wrapped Jamb – 3/4 x 4 1/2" },
      }
      const cur = {
        taxTotals: { jambName: "Vinyl Wrapped Jamb – 3/4 x 5 1/4" },
      }
      const changes = detectQuoteChanges(orig, cur)
      expect(changes).toEqual(["Jambs changed to 5 1/4 from 4 1/2"])
    })

    it("should detect casing profile changes with cleaned labels", () => {
      const orig = {
        taxTotals: { casingName: "Vinyl casing charge" },
      }
      const cur = {
        taxTotals: { casingName: "Oak casing charge" },
      }
      const changes = detectQuoteChanges(orig, cur)
      expect(changes).toEqual(["Casing changed to Oak from Vinyl"])
    })
  })

  describe("Windows, Add-ons, Logistics, and Discounts", () => {
    it("should detect window line item count, size, and quantity adjustments", () => {
      const orig = {
        windows: [{ w: "36", h: "48", qty: 1, base: 500 }],
      }
      const curDiffCount = {
        windows: [
          { w: "36", h: "48", qty: 1, base: 500 },
          { w: "24", h: "36", qty: 1, base: 350 },
        ],
      }
      expect(detectQuoteChanges(orig, curDiffCount)[0]).toContain(
        "Window line items changed (2 windows vs 1 originally)"
      )

      const curAdjusted = {
        windows: [{ w: "40", h: "50", qty: 2, base: 600 }],
      }
      const changes = detectQuoteChanges(orig, curAdjusted)
      expect(
        changes.some((c) =>
          c.includes('Window #1 size adjusted from 36" × 48" to 40" × 50"')
        )
      ).toBe(true)
      expect(
        changes.some((c) => c.includes("Window #1 qty updated from 1 to 2"))
      ).toBe(true)
      expect(
        changes.some((c) =>
          c.includes("Window #1 base price updated from $500.00 to $600.00")
        )
      ).toBe(true)
    })

    it("should detect travel & setup fee updates", () => {
      const orig = { taxTotals: { vehicle: 50, crewTravel: 50, setup: 140 } } // 240
      const cur = { taxTotals: { vehicle: 75, crewTravel: 50, setup: 140 } } // 265
      const changes = detectQuoteChanges(orig, cur)
      expect(changes[0]).toContain(
        "Travel & Setup fee updated from $240.00 to $265.00"
      )
    })

    it("should detect added, updated, and removed addons", () => {
      const orig = {
        taxTotals: {
          selectedAddons: [
            { id: "blinds", label: "Blinds back on", qty: 2, total: 120 },
            { id: "drip", label: "Drip edge", qty: 1, total: 30 },
          ],
        },
      }
      const cur = {
        taxTotals: {
          selectedAddons: [
            { id: "drip", label: "Drip edge", qty: 3, total: 90 }, // Qty + price change
            { id: "base", label: "Basement windows", qty: 1, total: 100 }, // Added
          ],
        },
      }

      const changes = detectQuoteChanges(orig, cur)
      expect(
        changes.some((c) => c.includes('Added Add-on: "Basement windows"'))
      ).toBe(true)
      expect(
        changes.some((c) =>
          c.includes('Add-on "Drip edge": Qty updated from 1 to 3')
        )
      ).toBe(true)
      expect(
        changes.some((c) => c.includes('Removed Add-on: "Blinds back on"'))
      ).toBe(true)
    })

    it("should detect surcharge, promo, and discount changes", () => {
      const orig = {
        surchargeRate: 8,
        activePromoId: "promo1",
        taxTotals: { discount: 50 },
      }
      const cur = {
        surchargeRate: 10,
        activePromoId: "promo2",
        quoteResult: { promoName: "Spring Sale" },
        taxTotals: { discount: 150 },
      }

      const changes = detectQuoteChanges(orig, cur)
      expect(
        changes.some((c) => c.includes("Surcharge rate updated from 8% to 10%"))
      ).toBe(true)
      expect(
        changes.some((c) => c.includes("Promotion updated to Spring Sale"))
      ).toBe(true)
      expect(
        changes.some((c) =>
          c.includes("Discount updated from $50.00 to $150.00")
        )
      ).toBe(true)
    })

    it("should fall back to Quote Total diff when no other itemized differences exist", () => {
      const orig = { quoteSummaryTotal: 100000 }
      const cur = { quoteSummaryTotal: 120000 }
      const changes = detectQuoteChanges(orig, cur)
      expect(changes[0]).toContain(
        "Quote Total updated from $1,000.00 to $1,200.00 (+$200.00)"
      )
    })
  })
})
