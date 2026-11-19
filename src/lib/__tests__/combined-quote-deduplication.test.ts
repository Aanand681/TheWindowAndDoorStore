import { describe, it, expect } from "vitest"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import { buildDoorAttachPayload } from "@/components/calculator/attach/attach-payload-builders"
import { calculateInvoicePricingRollup } from "@/hooks/quotes/invoice-pricing-rollup"
import { getInvoiceLabourItems } from "@/hooks/quotes/invoice-labour"

describe("Combined Quote Travel & Setup Deduplication and Supply/Install Modes", () => {
  it("strictly deduplicates door setup fee ($140) and travel fees when attached to window quote in installation mode", () => {
    // Door standalone has:
    // rawDoorBase: $1,000, 8% surcharge: $80, unit labour: $200, upcharges: $50
    // baseSetupFee: $140, travel: $100 -> standalone combinedLabour = 200 + 50 + 140 + 100 = $490
    const rawDoorDraft = {
      quoteNumber: "D-101",
      customerName: "Jane Doe",
      itemCount: 1,
      mode: "installation",
      data: {
        totals: {
          rawDoorBaseTotal: 1000,
          stormDoorTotal: 0,
          hardwareTotal: 0,
          surchargeTotal: 80,
          discountTotal: 0,
          unitLabourTotal: 200,
          upchargesTotal: 50,
          baseSetupFee: 140,
          totalTravelAndSetup: 240, // 140 setup + 100 travel
          combinedLabourTotal: 490,
          miscTotal: 30,
        },
      },
    }

    const attachedDoor = buildDoorAttachPayload(rawDoorDraft as any)

    // Attached door payload must strip the $140 setup fee and $100 travel
    expect(attachedDoor.totals.baseSetupFee).toBe(0)
    expect(attachedDoor.totals.totalTravelAndSetup).toBe(0)
    expect(attachedDoor.totals.combinedLabourTotal).toBe(250) // 200 unit labour + 50 upcharges only
    expect(attachedDoor.totals.doorPureLabourTotal).toBe(250)

    // Window Host has:
    // base: $2,000 (200,000 cents), surcharge: $160 (16,000 cents)
    // labour: $300 (including window $140 setup + travel), misc: $20
    const combined = computeCombinedQuoteFinancials({
      quoteResult: { base: 200000, surcharge: 16000, promoDiscount: 0 },
      attachedDoorQuote: attachedDoor,
      effectiveJC: 0,
      effectiveMisc: 2000,
      effectiveLabour: 30000, // window labour (with window setup fee)
      hstRate: 13,
      isSupplyOnly: false,
    })

    // Door labour in combined calculation must be exactly pure labour ($250 = 25,000 cents)
    expect(combined.doorLabourCents).toBe(25000)
    // Total combined labour must be window labour ($300) + pure door labour ($250) = $550 (no duplicate 140 setup or travel)
    expect(combined.combinedLabourCents).toBe(55000)
    // Combined misc: $20 + $30 = $50 (5,000 cents)
    expect(combined.combinedMiscCents).toBe(5000)
    // Combined subtotal: Window (2000 + 160) + Door (1000 + 80) + Labour (550) + Misc (50) = $3,840 (384,000 cents)
    expect(combined.combinedSubtotalCents).toBe(384000)
  })

  it("zeros out labour, misc, and travel setup fees in Supply Only mode", () => {
    const rawDoorDraft = {
      quoteNumber: "D-102",
      customerName: "Bob Smith",
      itemCount: 1,
      mode: "supply_only",
      data: {
        isSupplyOnly: true,
        totals: {
          rawDoorBaseTotal: 1500,
          stormDoorTotal: 0,
          hardwareTotal: 0,
          surchargeTotal: 120,
          discountTotal: 150,
          unitLabourTotal: 200,
          upchargesTotal: 50,
          baseSetupFee: 140,
          totalTravelAndSetup: 140,
          combinedLabourTotal: 390,
          miscTotal: 40,
        },
      },
    }

    const attachedDoor = buildDoorAttachPayload(rawDoorDraft as any)
    expect(attachedDoor.totals.combinedLabourTotal).toBe(0)
    expect(attachedDoor.totals.miscTotal).toBe(0)
    expect(attachedDoor.totals.baseSetupFee).toBe(0)

    // Window Host in Supply Only mode
    const combined = computeCombinedQuoteFinancials({
      quoteResult: { base: 300000, surcharge: 24000, promoDiscount: 0 },
      attachedDoorQuote: attachedDoor,
      effectiveJC: 10000, // Jambs & Casing material: $100
      effectiveMisc: 5000, // should be zeroed in supply mode
      effectiveLabour: 40000, // should be zeroed in supply mode
      hstRate: 13,
      isSupplyOnly: true,
    })

    // In Supply mode: labour and misc MUST be 0
    expect(combined.doorLabourCents).toBe(0)
    expect(combined.doorMiscCents).toBe(0)
    expect(combined.combinedLabourCents).toBe(0)
    expect(combined.combinedMiscCents).toBe(0)

    // Materials: Window (3000) + Door net (1500 - 150 = 1350) + JC (100) = $4,450
    // Surcharges: Window (240) + Door (120) = $360
    // Subtotal: 4450 + 360 = $4,810 (481,000 cents)
    expect(combined.combinedSubtotalCents).toBe(481000)
  })

  it("correctly rolls up invoice pricing in Supply mode vs Installation mode", () => {
    const doorTotals = {
      rawDoorBaseTotal: 1000,
      stormDoorTotal: 0,
      hardwareTotal: 0,
      discountTotal: 100,
      surchargeTotal: 80,
      unitLabourTotal: 180,
      upchargesTotal: 40,
      baseSetupFee: 0,
      doorPureLabourTotal: 220,
      miscTotal: 25,
    }

    // 1. Supply mode
    const supplyRollup = calculateInvoicePricingRollup({
      hasWindows: true,
      hasSealedUnits: false,
      hasDoors: true,
      hasAnyAttached: true,
      isWindowHost: true,
      isDoorHost: false,
      isSUHost: false,
      isAttachedSUService: false,
      quoteResult: { base: 200000 },
      basePrice: 200000,
      surcharge: 16000,
      taxLabourCents: 35000,
      taxMiscCents: 2000,
      taxJCCents: 0,
      taxDiscount: 0,
      activePromo: null,
      attachedWindowQuote: null,
      effectiveSUTotals: {},
      effectiveDoorTotals: doorTotals,
      hstRate: 13,
      afterDiscount: 0,
      isSupplyOnly: true,
    })

    expect(supplyRollup.effectiveLabourTotalCents).toBe(0)
    expect(supplyRollup.effectiveMiscTotalCents).toBe(0)
    // Materials: Win (2000) + Door net (1000 - 100 = 900) = 2900
    // Surcharge: Win (160) + Door (80) = 240
    // Subtotal: 2900 + 240 = $3,140 (314,000 cents)
    expect(supplyRollup.finalSubtotalCents).toBe(314000)

    // 2. Installation mode
    const installRollup = calculateInvoicePricingRollup({
      hasWindows: true,
      hasSealedUnits: false,
      hasDoors: true,
      hasAnyAttached: true,
      isWindowHost: true,
      isDoorHost: false,
      isSUHost: false,
      isAttachedSUService: false,
      quoteResult: { base: 200000 },
      basePrice: 200000,
      surcharge: 16000,
      taxLabourCents: 35000, // Window labour + single host travel & setup
      taxMiscCents: 2000,
      taxJCCents: 0,
      taxDiscount: 0,
      activePromo: null,
      attachedWindowQuote: null,
      effectiveSUTotals: {},
      effectiveDoorTotals: doorTotals,
      hstRate: 13,
      afterDiscount: 0,
      isSupplyOnly: false,
    })

    // Window labour (35000) + Door pure labour (22000) = 57000 cents
    expect(installRollup.effectiveLabourTotalCents).toBe(57000)
    // Window misc (2000) + Door misc (2500) = 4500 cents
    expect(installRollup.effectiveMiscTotalCents).toBe(4500)
    // Subtotal: 314000 (materials+surcharge) + 57000 (labour) + 4500 (misc) = 375500 cents
    expect(installRollup.finalSubtotalCents).toBe(375500)
  })

  it("generates an itemized labour breakdown for the PDF in installation mode", () => {
    const items = getInvoiceLabourItems({
      isSupplyOnly: false,
      hasWindows: true,
      winLabourCents: 30000,
      effectiveWindows: [{}, {}, {}],
      taxTotals: { labourWindows: 300 },
      hasDoors: true,
      effectiveDoors: [
        {
          upcharges: [
            { label: "Exterior Capping", total: 120, qty: 1 },
            { label: "Custom Trim", total: 80, qty: 2 },
          ],
        },
      ],
      effectiveDoorTotals: { unitLabourTotal: 180, upchargesTotal: 200 },
      hasSealedUnits: true,
      effectiveSUTotals: { unitLabourSum: 150 },
      isAttachedSUService: false,
    })

    expect(items).toHaveLength(5)
    expect(items[0]).toEqual({
      label: "Window installation labour (3 units)",
      amount: 30000,
    })
    expect(items[1]).toEqual({
      label: "Door installation labour (1 unit)",
      amount: 18000,
    })
    expect(items[2]).toEqual({
      label: "Door Exterior Capping",
      amount: 12000,
    })
    expect(items[3]).toEqual({
      label: "Door Custom Trim (×2)",
      amount: 8000,
    })
    expect(items[4]).toEqual({
      label: "Sealed unit installation labour",
      amount: 15000,
    })
  })

  it("returns an empty labour breakdown in Supply Only mode for PDF", () => {
    const items = getInvoiceLabourItems({
      isSupplyOnly: true,
      hasWindows: true,
      winLabourCents: 30000,
      taxTotals: { labourWindows: 300 },
      hasDoors: true,
      effectiveDoorTotals: { unitLabourTotal: 180 },
      hasSealedUnits: true,
      effectiveSUTotals: { unitLabourSum: 150 },
    })

    expect(items).toEqual([])
  })
})
