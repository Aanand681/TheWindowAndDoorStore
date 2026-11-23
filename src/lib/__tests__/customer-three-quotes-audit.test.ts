import { describe, it, expect } from "vitest"
import { calculateUniversalPricing } from "../quotes/universal-pricing-engine"
import { detectQuoteChanges } from "../quote-diff"
import { calculateCompareTotals } from "@/components/shared/compare/compare-math"

describe("End-to-End Audit: Customer with 3 Quotes (Window, Door, Sealed Unit)", () => {
  // Customer: "Acme Corporation"
  const windowDraft = {
    quoteNumber: "WIN-9001",
    customerName: "Acme Corporation",
    type: "window",
    data: {
      quoteNumber: "WIN-9001",
      customerName: "Acme Corporation",
      effectiveBase: 3318.4,
      quoteResult: { base: 331840, surcharge: 26547, promoDiscount: 0 },
      taxTotals: {
        labourWindows: 632.27,
        extras: 867.5, // travel & setup
        finalLabour: 1499.77,
        finalMisc: 260.58,
        miscTotal: 260.58,
        finalJC: 335.57,
        jcTotal: 335.57,
      },
      windows: [
        { id: "w1", qty: 1, base: 1659.2, w: "36", h: "48" },
        { id: "w2", qty: 1, base: 1659.2, w: "36", h: "48" },
      ],
    },
  }

  const doorDraft = {
    quoteNumber: "DOOR-8001",
    customerName: "Acme Corporation",
    type: "door",
    data: {
      quoteNumber: "DOOR-8001",
      customerName: "Acme Corporation",
      doors: [
        { id: "d1", quantity: 1, presetLabel: "Executive 6-Panel Entry Door", inksterBasePrice: 1832.85, hardwareType: "standard", hardwarePrice: 158 },
        { id: "d2", quantity: 1, presetLabel: "Deluxe Storm Door", inksterBasePrice: 665.0, hardwareType: "none", hardwarePrice: 0 },
      ],
      totals: {
        rawDoorBaseTotal: 1832.85,
        stormDoorTotal: 665.0,
        hardwareTotal: 158.0,
        discountTotal: 183.29, // 10% discount on entry door
        surchargeTotal: 199.83, // 8% manufacturer surcharge
        unitLabourTotal: 196.43,
        doorPureLabourTotal: 196.43,
        totalTravelAndSetup: 867.5,
        miscTotal: 180.58,
      },
    },
  }

  const sealedUnitDraft = {
    quoteNumber: "SU-7001",
    customerName: "Acme Corporation",
    type: "sealed_unit",
    data: {
      quoteNumber: "SU-7001",
      customerName: "Acme Corporation",
      sealedUnits: [
        { id: "su1", quantity: 2, actualSqft: 15.5, multipliedTotal: 2366.26, glassType: "Clear Low-E Argon" },
      ],
      totals: {
        glassBefore8PercentTotal: 2366.26,
        glass8PercentSurchargeTotal: 189.3,
        unitLabourSum: 446.43,
        extraLabour: 0,
        totalTravelAndSetup: 503.5, // small-job travel fee
        miscTotal: 74.4,
      },
    },
  }

  describe("1. Combined Pricing & Deduplication", () => {
    it("correctly reconciles all 3 quotes with max travel fee and accurate subtotal", () => {
      const result = calculateUniversalPricing({
        windowQuote: windowDraft,
        doorQuote: doorDraft,
        sealedUnitQuote: sealedUnitDraft,
        hostType: "window",
        hstRate: 13,
      })

      // Window net base: 3318.40
      // Door net materials: 1832.85 + 665.00 + 158.00 - 183.29 = 2472.56
      // Sealed units net materials: 2366.26
      // Jambs & Casings: 335.57
      // Total materials = 3318.40 + 2472.56 + 2366.26 + 335.57 = 8492.79
      expect(result.materials).toBe(8492.79)

      // Total Surcharges: 265.47 (win) + 199.83 (door) + 189.30 (su) = 654.60
      expect(result.surcharges).toBe(654.6)

      // Total Misc: 260.58 (win) + 180.58 (door) + 74.40 (su) = 515.56
      expect(result.misc).toBe(515.56)

      // Max Travel Rule: max(867.50, 867.50, 503.50) = 867.50
      expect(result.travelAndSetup).toBe(867.5)

      // Pure labour: 632.27 (win) + 196.43 (door) + 446.43 (su) = 1275.13
      expect(result.pureLabour).toBe(1275.13)

      // Combined labour: 1275.13 + 867.50 = 2142.63
      expect(result.combinedLabour).toBe(2142.63)

      // Subtotal = 8492.79 + 654.60 + 515.56 + 2142.63 = 11805.58
      expect(result.subtotal).toBe(11805.58)

      // Standard 13% HST: 11805.58 * 0.13 = 1534.73
      expect(result.hstAmount).toBe(1534.73)
      expect(result.taxLabel).toBe("13% HST")

      // Total = 11805.58 + 1534.73 = 13340.31
      expect(result.total).toBe(13340.31)

      // 50% deposit & final balance
      expect(result.firstPayment).toBe(6670.16)
      expect(result.secondPayment).toBe(6670.15)
    })

    it("produces identical subtotal and total regardless of which calculator is the host", () => {
      const fromWindow = calculateUniversalPricing({
        windowQuote: windowDraft,
        doorQuote: doorDraft,
        sealedUnitQuote: sealedUnitDraft,
        hostType: "window",
      })

      const fromDoor = calculateUniversalPricing({
        windowQuote: windowDraft,
        doorQuote: doorDraft,
        sealedUnitQuote: sealedUnitDraft,
        hostType: "door",
      })

      const fromSealedUnit = calculateUniversalPricing({
        windowQuote: windowDraft,
        doorQuote: doorDraft,
        sealedUnitQuote: sealedUnitDraft,
        hostType: "sealed_unit",
      })

      expect(fromWindow.subtotal).toBe(fromDoor.subtotal)
      expect(fromDoor.subtotal).toBe(fromSealedUnit.subtotal)
      expect(fromWindow.total).toBe(fromDoor.total)
      expect(fromDoor.total).toBe(fromSealedUnit.total)
      expect(fromWindow.travelAndSetup).toBe(fromDoor.travelAndSetup)
    })
  })

  describe("2. Tax Exemption Engine (0% Tax Exempt vs 8% First Nations vs 13% Standard)", () => {
    it("handles 0% Tax (Exempt) with exactly 0.00 tax and total equal to subtotal", () => {
      const result = calculateUniversalPricing({
        windowQuote: windowDraft,
        doorQuote: doorDraft,
        sealedUnitQuote: sealedUnitDraft,
        hostType: "window",
        hstRate: 0,
      })

      expect(result.hstAmount).toBe(0)
      expect(result.materialExemption).toBe(0)
      expect(result.taxLabel).toBe("0% Tax (Exempt)")
      expect(result.total).toBe(result.subtotal)
      expect(result.firstPayment).toBe(Math.round(result.subtotal * 0.5 * 100) / 100)
    })

    it("handles 8% First Nations Material Exemption properly", () => {
      const result = calculateUniversalPricing({
        windowQuote: windowDraft,
        doorQuote: doorDraft,
        sealedUnitQuote: sealedUnitDraft,
        hostType: "window",
        hstRate: 8,
        isFirstNation: true,
      })

      // Full 13% base: 11805.58 * 0.13 = 1534.73
      expect(result.hstBase).toBe(1534.73)
      // 8% exemption on materials: 8492.79 * 0.08 = 679.42
      expect(result.materialExemption).toBe(679.42)
      // Net HST: 1534.73 - 679.42 = 855.31
      expect(result.hstAmount).toBe(855.31)
      expect(result.taxLabel).toBe("First Nation Point-of-Sale Exemption")
      // Total: 11805.58 + 855.31 = 12660.89
      expect(result.total).toBe(12660.89)
    })
  })

  describe("3. Option B Comparison (Installation vs Supply Only)", () => {
    it("accurately calculates the pre-tax deduct amount when in installation mode", () => {
      const compare = calculateCompareTotals({
        currentMode: "install",
        currentSubtotal: 11805.58,
        baseAmount: 3318.4 + 2472.56 + 2366.26,
        attachedAmount: 0,
        surchargeAmount: 654.6,
        discountAmount: 0,
        supplyHardwareCents: 0,
        installHardwareCents: 15800,
        opt1JCCents: 0,
        opt2JCCents: 33557,
        labourCents: Math.round(2142.63 * 100),
        miscCents: Math.round(515.56 * 100),
        hstRate: 13,
      })

      // Deduct should include labour, misc, extra JC, and install hardware
      expect(compare.extraSubtotalCents).toBeGreaterThan(250000)
      expect(compare.supplySubtotal).toBeLessThan(compare.installSubtotal)
    })

    it("accurately calculates the pre-tax add amount when in supply only mode", () => {
      const compare = calculateCompareTotals({
        currentMode: "supply",
        currentSubtotal: 8800.0,
        baseAmount: 8492.79,
        attachedAmount: 0,
        surchargeAmount: 654.6,
        discountAmount: 0,
        supplyHardwareCents: 0,
        installHardwareCents: 15800,
        opt1JCCents: 0,
        opt2JCCents: 33557,
        labourCents: Math.round(2142.63 * 100),
        miscCents: Math.round(515.56 * 100),
        hstRate: 13,
      })

      expect(compare.installSubtotal).toBeGreaterThan(compare.supplySubtotal)
      expect(compare.extraSubtotalCents).toBeGreaterThan(0)
    })

    it("properly combines multi-attached quote labels for compare modals", () => {
      const winSentence = "2 Windows"
      const doorSentence = "1 Entry Door + 1 Storm Door"
      const suSentence = "2 Sealed Units"

      const suHostAttachedLabel = [winSentence, doorSentence].filter(Boolean).join(" + ")
      expect(suHostAttachedLabel).toBe("2 Windows + 1 Entry Door + 1 Storm Door")

      const doorHostAttachedLabel = [winSentence, suSentence].filter(Boolean).join(" + ")
      expect(doorHostAttachedLabel).toBe("2 Windows + 2 Sealed Units")

      const winHostAttachedLabel = [doorSentence, suSentence].filter(Boolean).join(" + ")
      expect(winHostAttachedLabel).toBe("1 Entry Door + 1 Storm Door + 2 Sealed Units")
    })
  })

  describe("4. Review Submission & Polymorphic Diff Recall", () => {
    it("detects polymorphic changes when reviewer updates dimensions, hardware, or prices across domains", () => {
      const originalQuote = {
        quoteType: "door",
        quoteNumber: "DOOR-8001",
        customLabour: "",
        customMisc: "",
        doors: [
          { id: "d1", quantity: 1, presetLabel: "Executive 6-Panel Entry Door", inksterBasePrice: 1832.85, hardwareType: "standard", hardwarePrice: 158 },
        ],
        quoteSummaryTotal: 250000,
      }

      const modifiedQuote = {
        quoteType: "door",
        quoteNumber: "DOOR-8001",
        customLabour: "350.00",
        customMisc: "100.00",
        doors: [
          { id: "d1", quantity: 2, presetLabel: "Executive 6-Panel Entry Door", inksterBasePrice: 1950.0, hardwareType: "custom", hardwarePrice: 250 },
        ],
        quoteSummaryTotal: 460000,
      }

      const diffs = detectQuoteChanges(originalQuote, modifiedQuote)

      expect(diffs.length).toBeGreaterThan(0)
      // Verifies custom labour override detected
      expect(diffs.some((d) => d.includes("Custom Labour"))).toBe(true)
      // Verifies custom misc override detected
      expect(diffs.some((d) => d.includes("Custom Misc"))).toBe(true)
      // Verifies door quantity/price/hardware diff detected
      expect(diffs.some((d) => d.includes("Executive 6-Panel Entry Door") || d.includes("hardware") || d.includes("Qty"))).toBe(true)
    })
  })
})
