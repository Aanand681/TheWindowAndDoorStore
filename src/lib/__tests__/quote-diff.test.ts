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

    it("should normalize legacy dollar snapshot (2449 vs 244900 cents) without generating a false ghost diff", () => {
      const orig = { quoteSummaryTotal: 2449 }
      const cur = { quoteSummaryTotal: 244900 }
      const changes = detectQuoteChanges(orig, cur)
      expect(changes).toEqual([])
    })

    it("should accurately detect price updates when orig was legacy dollars (2449 vs 254900 cents)", () => {
      const orig = { quoteSummaryTotal: 2449 }
      const cur = { quoteSummaryTotal: 254900 }
      const changes = detectQuoteChanges(orig, cur)
      expect(changes[0]).toContain(
        "Quote Total updated from $2,449.00 to $2,549.00 (+$100.00)"
      )
    })
  })

  describe("Door Quotes Polymorphic Diffing", () => {
    it("should detect door model, qty, slab size, hardware and price changes", () => {
      const orig = {
        type: "door",
        lineItems: [
          {
            id: "d1",
            presetLabel: "Classic 6-Panel Entry Door",
            quantity: 1,
            slabWidth: "36",
            slabHeight: "80",
            netDoorPrice: 1200,
            hardwareType: "standard",
          },
        ],
      }
      const cur = {
        type: "door",
        lineItems: [
          {
            id: "d1",
            presetLabel: "Modern Flush Glazed Entry Door",
            quantity: 2,
            slabWidth: "36",
            slabHeight: "84",
            netDoorPrice: 1550,
            hardwareType: "custom",
          },
        ],
      }

      const changes = detectQuoteChanges(orig, cur)
      expect(
        changes.some((c) =>
          c.includes(
            'Door #1 model changed to "Modern Flush Glazed Entry Door" (was "Classic 6-Panel Entry Door")'
          )
        )
      ).toBe(true)
      expect(changes.some((c) => c.includes("Door #1 qty updated from 1 to 2"))).toBe(true)
      expect(
        changes.some((c) => c.includes('Door #1 slab size updated from 36" × 80" to 36" × 84"'))
      ).toBe(true)
      expect(
        changes.some((c) => c.includes("Door #1 price updated from $1,200.00 to $1,550.00"))
      ).toBe(true)
      expect(
        changes.some((c) => c.includes("Door #1 hardware updated to custom (was standard)"))
      ).toBe(true)
    })

    it("should detect door line items count changes", () => {
      const orig = {
        quoteType: "door",
        lineItems: [{ id: "d1", presetLabel: "Door 1" }],
      }
      const cur = {
        quoteType: "door",
        lineItems: [
          { id: "d1", presetLabel: "Door 1" },
          { id: "d2", presetLabel: "Door 2" },
        ],
      }
      const changes = detectQuoteChanges(orig, cur)
      expect(changes[0]).toContain("Door line items changed (2 doors vs 1 originally)")
    })
  })

  describe("Sealed Unit Quotes Polymorphic Diffing", () => {
    it("should detect sealed unit dimensions, qty, glass type, spacer, gas fill, and labour changes", () => {
      const orig = {
        type: "sealed_unit",
        lineItems: [
          {
            id: "su1",
            width: "24",
            height: "36",
            quantity: 1,
            glassType: "Clear / Clear",
            spacer: "Super Spacer Black",
            argon: false,
            unitGlazingLabour: 75,
          },
        ],
      }
      const cur = {
        type: "sealed_unit",
        lineItems: [
          {
            id: "su1",
            width: "28",
            height: "40",
            quantity: 3,
            glassType: "Low-E 180 / Clear",
            spacer: "Intercept",
            argon: true,
            unitGlazingLabour: 95,
          },
        ],
      }

      const changes = detectQuoteChanges(orig, cur)
      expect(
        changes.some((c) =>
          c.includes('Sealed Unit #1 dimensions updated from 24" × 36" to 28" × 40"')
        )
      ).toBe(true)
      expect(
        changes.some((c) => c.includes("Sealed Unit #1 qty updated from 1 to 3"))
      ).toBe(true)
      expect(
        changes.some((c) =>
          c.includes('Sealed Unit #1 glass updated to "Low-E 180 / Clear" (was "Clear / Clear")')
        )
      ).toBe(true)
      expect(
        changes.some((c) =>
          c.includes('Sealed Unit #1 spacer updated to "Intercept" (was "Super Spacer Black")')
        )
      ).toBe(true)
      expect(
        changes.some((c) => c.includes("Sealed Unit #1 gas fill changed to Argon"))
      ).toBe(true)
      expect(
        changes.some((c) =>
          c.includes("Sealed Unit #1 glazing labour updated from $75.00 to $95.00")
        )
      ).toBe(true)
    })

    it("should detect sealed unit line items count changes", () => {
      const orig = {
        type: "sealed_unit",
        lineItems: [{ id: "su1", width: "24", height: "36" }],
      }
      const cur = {
        type: "sealed_unit",
        lineItems: [
          { id: "su1", width: "24", height: "36" },
          { id: "su2", width: "30", height: "48" },
        ],
      }
      const changes = detectQuoteChanges(orig, cur)
      expect(changes[0]).toContain("Sealed unit line items changed (2 vs 1 originally)")
    })
  })

  describe("Global Upcharges Polymorphic Diffing (Door & Sealed Units)", () => {
    it("should detect added, modified, and removed global upcharges", () => {
      const orig = {
        type: "door",
        globalUpcharges: [
          { id: "haul", label: "Haul Away & Disposal", price: 75, quantity: 1 },
          { id: "paint", label: "Custom Paint Finish", price: 200, quantity: 1 },
        ],
      }
      const cur = {
        type: "door",
        globalUpcharges: [
          { id: "haul", label: "Haul Away & Disposal", price: 100, quantity: 1 },
          { id: "trim", label: "Brickmould Install", price: 150, quantity: 2 },
        ],
      }

      const changes = detectQuoteChanges(orig, cur)
      expect(
        changes.some((c) =>
          c.includes('Add-on "Haul Away & Disposal": Price adjusted from $75.00 to $100.00')
        )
      ).toBe(true)
      expect(
        changes.some((c) =>
          c.includes('Added Add-on: "Brickmould Install" (Qty: 2 (+$150.00))')
        )
      ).toBe(true)
      expect(
        changes.some((c) => c.includes('Removed Add-on: "Custom Paint Finish"'))
      ).toBe(true)
    })
  })
})
