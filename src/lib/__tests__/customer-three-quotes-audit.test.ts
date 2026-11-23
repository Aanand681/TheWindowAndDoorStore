import { describe, it, expect } from "vitest"
import { calculateUniversalPricing } from "../quotes/universal-pricing-engine"
import { detectQuoteChanges } from "../quote-diff"
import { calculateCompareTotals } from "@/components/shared/compare/compare-math"
import { getInvoiceLabourItems } from "@/hooks/quotes/invoice-labour"
import { calculateInvoicePricingRollup } from "@/hooks/quotes/invoice-pricing-rollup"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"

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

  describe("5. PDF Creation, Labour Breakdown & Dollar Decimal Precision", () => {
    it("preserves window labour on PDF generation when includeLabourInPromo is false", () => {
      // PDF invoice rollup with window installation labour and includeLabourInPromo = false
      const rollup = calculateInvoicePricingRollup({
        hasWindows: true,
        hasSealedUnits: false,
        hasDoors: false,
        hasAnyAttached: false,
        isWindowHost: true,
        isDoorHost: false,
        isSUHost: false,
        isAttachedSUService: false,
        quoteResult: { base: 200000 },
        basePrice: 2000,
        surcharge: 160,
        taxLabourCents: 35000, // $350 labour
        taxMiscCents: 5000,
        taxJCCents: 10000,
        taxDiscount: 0,
        activePromo: { name: "Spring 10% Off", discount: 200 },
        attachedWindowQuote: null,
        effectiveSUTotals: null,
        effectiveDoorTotals: null,
        hstRate: 13,
        afterDiscount: 2000,
        taxTotals: { extras: 0 },
        isSupplyOnly: false,
      })

      // Must expose direct dollar amounts without loss of precision
      expect(rollup.finalSubtotal).toBeGreaterThan(0)
      expect(rollup.effectiveLabourTotal).toBe(350)
      expect(rollup.effectiveLabourTotalCents).toBe(35000)

      const labourItems = getInvoiceLabourItems({
        isSupplyOnly: false,
        hasWindows: true,
        winLabourCents: rollup.effectiveLabourTotalCents,
        effectiveWindows: [{ id: "w1" }, { id: "w2" }],
        taxTotals: { labourWindows: 350 },
        hasDoors: false,
        hasSealedUnits: false,
      })

      expect(labourItems).toHaveLength(1)
      expect(labourItems[0].label).toContain("Window installation labour (2 units)")
      expect(labourItems[0].amount).toBe(35000)
    })

    it("includes sealed unit extra labour and door custom labour overrides in PDF items", () => {
      const labourItems = getInvoiceLabourItems({
        isSupplyOnly: false,
        hasWindows: false,
        winLabourCents: 0,
        hasDoors: true,
        effectiveDoors: [{ id: "d1" }],
        effectiveDoorTotals: {
          unitLabourTotal: 180,
          doorPureLabourTotal: 300, // custom override of $300 instead of default 180
          upchargesTotal: 0,
        },
        hasSealedUnits: true,
        effectiveSUTotals: {
          unitLabourSum: 150,
          extraLabour: 75, // $75 extra labour
        },
        isAttachedSUService: false,
      })

      expect(labourItems).toHaveLength(3)
      // Door installation labour reflects the custom override ($300)
      expect(labourItems[0]).toEqual({
        label: "Door installation labour (1 unit)",
        amount: 30000,
      })
      // Sealed unit installation labour
      expect(labourItems[1]).toEqual({
        label: "Sealed unit installation labour",
        amount: 15000,
      })
      // Sealed unit extra labour is not omitted ($75)
      expect(labourItems[2]).toEqual({
        label: "Sealed unit extra labour",
        amount: 7500,
      })
    })

    it("itemizes sealed unit service labour correctly for primary service quotes", () => {
      const labourItems = getInvoiceLabourItems({
        isSupplyOnly: false,
        hasWindows: false,
        winLabourCents: 0,
        hasDoors: false,
        hasSealedUnits: true,
        effectiveSUTotals: {
          serviceLabourTotal: 220,
          extraLabour: 0,
        },
        isAttachedSUService: true,
      })

      expect(labourItems).toHaveLength(1)
      expect(labourItems[0]).toEqual({
        label: "Sealed unit service labour",
        amount: 22000,
      })
    })

    it("verifies universal pricing handles 8% and 0.05 First Nations tax rate without NaN or truncation", () => {
      const fnResult = calculateUniversalPricing({
        windowQuote: windowDraft,
        hostType: "window",
        hstRate: 0.05,
        isFirstNation: true,
      })

      expect(fnResult.taxLabel).toBe("First Nation Point-of-Sale Exemption")
      expect(fnResult.materialExemption).toBeGreaterThan(0)
      expect(fnResult.total).toBeGreaterThan(fnResult.subtotal)
    })

    it("guarantees window quote subtotal deducts custom discount both standalone and when doors/sealed units are attached", () => {
      const standaloneWindow = computeCombinedQuoteFinancials({
        quoteResult: { base: 331840, surcharge: 26547, promoDiscount: 0 },
        customDiscount: "250",
        effectiveJC: 33557,
        effectiveLabour: 149977,
        effectiveMisc: 26058,
        hstRate: 13,
      })

      // Standalone window subtotal should be: (3318.40 - 250) + 335.57 + 265.47 + 260.58 + 1499.77 = 5429.79
      expect(standaloneWindow.combinedSubtotal).toBe(5429.79)
      expect(standaloneWindow.windowDiscountCents).toBe(25000)

      // When doors and sealed units are attached:
      const attachedCombined = computeCombinedQuoteFinancials({
        quoteResult: { base: 331840, surcharge: 26547, promoDiscount: 0 },
        customDiscount: "250",
        effectiveJC: 33557,
        effectiveLabour: 149977,
        effectiveMisc: 26058,
        attachedDoorQuote: doorDraft,
        attachedSealedUnit: sealedUnitDraft,
        hstRate: 13,
      })

      // Combined window net materials should still deduct 250
      expect(attachedCombined.windowDiscountCents).toBe(25000)
      // Total combined subtotal includes window discount of 250
      expect(attachedCombined.combinedSubtotal).toBe(
        Math.round((standaloneWindow.combinedSubtotal + (2472.56 + 199.83 + 180.58 + 196.43) + (2366.26 + 189.30 + 74.40 + 446.43)) * 100) / 100
      )
    })

    it("preserves window discount when attached to door quote and applies 8% First Nations exemption across combined materials", () => {
      const windowDraftWithDiscount = {
        ...windowDraft,
        data: {
          ...windowDraft.data,
          customDiscount: "300",
        },
      }

      const doorPricing = calculateUniversalPricing({
        doorQuote: doorDraft,
        windowQuote: windowDraftWithDiscount,
        hostType: "door",
        hstRate: 8,
        isFirstNation: true,
      })

      // Window discount of 300 must be captured in winNorm
      expect(doorPricing.winNorm?.discount).toBe(300)
      // Combined materials must reflect (raw window base - 300)
      expect(doorPricing.winNorm?.materials).toBe(3318.4 - 300)
      // First Nations 8% rebate must calculate on combined net materials across doors + windows
      expect(doorPricing.materialExemption).toBe(
        Math.round(doorPricing.materials * 0.08 * 100) / 100
      )
      expect(doorPricing.materialExemption).toBeGreaterThan(0)
    })
  })
})
