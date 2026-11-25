import { describe, it, expect, vi } from "vitest"
import {
  calculateSealedUnitTotals as calculateLiveSealedUnitTotals,
  type SealedUnitCalculationParams,
} from "../calculations"
import { calculateSealedUnitTotals as calculateStorageSealedUnitTotals } from "../totals-calculator"
import {
  calculateSealedUnitItem,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  type ComboPricing,
} from "@/lib/sealed-units-logic"
import { calculateLoyaltyPreTaxDiscount } from "@/lib/loyalty/loyalty-engine"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"
import { calculateInvoicePricingRollup } from "@/hooks/quotes/invoice-pricing-rollup"
import { buildSealedUnitAttachPayload } from "@/components/calculator/attach/sealed-unit-attach-payload-builder"
import { buildSealedUnitsUpdatePayload } from "@/hooks/sealed-units/sealed-units-review-payload"
import {
  applyDraftDataToWorkspace,
  createDraftSavePayload,
  serializeSealedUnitSnapshot,
} from "@/hooks/sealed-units/sealed-units-storage-helpers"
import { computeQuotePricing } from "@/components/quotes/tab/quote-pricing-helper"

const mockCombo: ComboPricing = {
  id: "double_clear",
  name: "Double Glazed Clear",
  treatment: "annealed",
  prices: {
    3: { dual: 12.0, triple: 18.0 },
    4: { dual: 14.0, triple: 20.0 },
    5: { dual: 16.0, triple: 22.0 },
    6: { dual: 18.0, triple: 24.0 },
  },
}

describe("Sealed Units Loyalty Points & Manual Discount", () => {
  const sampleItem = calculateSealedUnitItem({
    combo: mockCombo,
    paneType: "dual",
    widthIn: 48,
    heightIn: 48, // 16 sqft (>= $167 qualifying base)
    quantity: 1,
    formula: DEFAULT_FORMULA_CONSTANTS,
    thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
    labourSettings: DEFAULT_LABOUR_SETTINGS,
  })

  const baseLive = (
    overrides: Partial<SealedUnitCalculationParams> = {}
  ): SealedUnitCalculationParams => ({
    lineItems: [sampleItem],
    sealedUnitMode: "installation",
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
    labour: DEFAULT_LABOUR_SETTINGS,
    ...overrides,
  })

  it("delivers exact $50.00 off grandTotal across 13% HST, 8% First Nation POS, and 0% Exempt", () => {
    // Standard 13% HST
    const preTax13 = calculateLoyaltyPreTaxDiscount(50, true, 13, false) // 44.25
    const base13 = calculateLiveSealedUnitTotals(baseLive({ hstRate: 13 }))
    const disc13 = calculateLiveSealedUnitTotals(
      baseLive({
        hstRate: 13,
        loyaltyDiscount: preTax13,
        loyaltyDiscountLabel: "Loyalty Points (1,000 pts — $50.00 incl. tax)",
      })
    )
    expect(disc13.loyaltyDiscount).toBe(44.25)
    expect(base13.subtotalPreTax - disc13.subtotalPreTax).toBeCloseTo(44.25, 2)
    expect(Math.abs((base13.grandTotal - disc13.grandTotal) - 50.0)).toBeLessThanOrEqual(0.01)

    // First Nation 8% POS (5% net tax on materials)
    const preTaxFN = calculateLoyaltyPreTaxDiscount(50, true, 8, true) // 47.62
    const baseFN = calculateLiveSealedUnitTotals(baseLive({ hstRate: 8 }))
    const discFN = calculateLiveSealedUnitTotals(
      baseLive({ hstRate: 8, loyaltyDiscount: preTaxFN })
    )
    expect(baseFN.subtotalPreTax - discFN.subtotalPreTax).toBeCloseTo(47.62, 2)
    expect(Math.abs((baseFN.grandTotal - discFN.grandTotal) - 50.0)).toBeLessThanOrEqual(0.01)

    // 0% Tax Exempt
    const preTax0 = calculateLoyaltyPreTaxDiscount(50, true, 0, false) // 50.00
    const base0 = calculateLiveSealedUnitTotals(baseLive({ hstRate: 0 }))
    const disc0 = calculateLiveSealedUnitTotals(
      baseLive({ hstRate: 0, loyaltyDiscount: preTax0 })
    )
    expect(base0.subtotalPreTax - disc0.subtotalPreTax).toBe(50.0)
    expect(base0.grandTotal - disc0.grandTotal).toBe(50.0)
  })

  it("applies discounts accurately in supply_only and service_only modes + storage totals-calculator", () => {
    const supplyBase = calculateLiveSealedUnitTotals(
      baseLive({ sealedUnitMode: "supply_only", hstRate: 13 })
    )
    const supplyDisc = calculateLiveSealedUnitTotals(
      baseLive({ sealedUnitMode: "supply_only", hstRate: 13, loyaltyDiscount: "44.25" })
    )
    expect(supplyBase.subtotalPreTax - supplyDisc.subtotalPreTax).toBe(44.25)
    expect(supplyBase.grandTotal - supplyDisc.grandTotal).toBeCloseTo(50.0, 2)

    const serviceBase = calculateLiveSealedUnitTotals(
      baseLive({
        lineItems: [],
        sealedUnitMode: "service_only",
        serviceSqftInput: "20",
        hstRate: 13,
      })
    )
    const serviceDisc = calculateLiveSealedUnitTotals(
      baseLive({
        lineItems: [],
        sealedUnitMode: "service_only",
        serviceSqftInput: "20",
        hstRate: 13,
        loyaltyDiscount: "100",
        loyaltyDiscountLabel: "Service Courtesy Discount",
      })
    )
    expect(serviceBase.subtotalPreTax - serviceDisc.subtotalPreTax).toBe(100)
    expect(serviceBase.grandTotal - serviceDisc.grandTotal).toBe(113)

    const storageBase = calculateStorageSealedUnitTotals({
      lineItems: [sampleItem],
      isInstallation: true,
      hstRate: 8,
      labourSettings: DEFAULT_LABOUR_SETTINGS,
    })
    const storageDisc = calculateStorageSealedUnitTotals({
      lineItems: [sampleItem],
      isInstallation: true,
      hstRate: 8,
      loyaltyDiscount: 47.62,
      loyaltyDiscountLabel: "Loyalty 1000",
      labourSettings: DEFAULT_LABOUR_SETTINGS,
    })
    expect(storageBase.subtotalPreTax - storageDisc.subtotalPreTax).toBeCloseTo(47.62, 2)
    expect(Math.abs((storageBase.grandTotal - storageDisc.grandTotal) - 50.0)).toBeLessThanOrEqual(0.01)
  })

  it("flows Sealed Unit loyalty & service discounts into PDF Universal Engine & Rollup", () => {
    const suTotals = calculateLiveSealedUnitTotals(
      baseLive({
        hstRate: 13,
        loyaltyDiscount: "44.25",
        loyaltyDiscountLabel: "Loyalty Points (1,000 pts — $50.00 incl. tax)",
      })
    )

    const uni = calculateUniversalPricing({
      sealedUnitQuote: { data: { totals: suTotals, sealedUnitMode: "installation" } },
      hostType: "sealed_unit",
      hstRate: 13,
      overrides: {
        loyaltyDiscount: "44.25",
        loyaltyDiscountLabel: "Loyalty Points (1,000 pts — $50.00 incl. tax)",
      },
    })
    expect(uni.discounts).toBe(44.25)
    expect(uni.discountLineItems).toEqual([
      {
        label: "Loyalty Points (1,000 pts — $50.00 incl. tax)",
        amount: 44.25,
        category: "discount",
      },
    ])

    // Service Only PDF Rollup keeps service labour and deducts manual discount via overflow
    const serviceTotals = calculateLiveSealedUnitTotals(
      baseLive({
        lineItems: [],
        sealedUnitMode: "service_only",
        serviceSqftInput: "20",
        hstRate: 13,
      })
    )
    const rollupNoDisc = calculateInvoicePricingRollup({
      hasWindows: false,
      hasSealedUnits: true,
      hasDoors: false,
      hasAnyAttached: false,
      isWindowHost: false,
      isDoorHost: false,
      isSUHost: true,
      isAttachedSUService: true,
      quoteResult: { base: 0 },
      basePrice: 0,
      surcharge: 0,
      taxLabourCents: 0,
      taxMiscCents: 0,
      taxJCCents: 0,
      taxDiscount: 0,
      activePromo: null,
      attachedWindowQuote: null,
      effectiveSUTotals: serviceTotals,
      effectiveDoorTotals: null,
      hstRate: 13,
      afterDiscount: 0,
      taxTotals: { ...serviceTotals, isSupplyOnly: true, isServiceOnly: true },
      isSupplyOnly: true,
    })
    const rollupWithDisc = calculateInvoicePricingRollup({
      hasWindows: false,
      hasSealedUnits: true,
      hasDoors: false,
      hasAnyAttached: false,
      isWindowHost: false,
      isDoorHost: false,
      isSUHost: true,
      isAttachedSUService: true,
      quoteResult: { base: 0 },
      basePrice: 0,
      surcharge: 0,
      taxLabourCents: 0,
      taxMiscCents: 0,
      taxJCCents: 0,
      taxDiscount: 0,
      loyaltyDiscount: "50",
      loyaltyDiscountLabel: "Service Promo",
      activePromo: null,
      attachedWindowQuote: null,
      effectiveSUTotals: serviceTotals,
      effectiveDoorTotals: null,
      hstRate: 13,
      afterDiscount: 0,
      taxTotals: { ...serviceTotals, isSupplyOnly: true, isServiceOnly: true },
      isSupplyOnly: true,
    })
    expect(rollupNoDisc.effectiveLabourTotal).toBeGreaterThan(0)
    expect(rollupNoDisc.finalSubtotalCents - rollupWithDisc.finalSubtotalCents).toBe(5000)
  })

  it("persists and restores Sealed Unit loyalty fields across attach payloads, drafts, review & quotes tab", () => {
    const totals = calculateLiveSealedUnitTotals(
      baseLive({ loyaltyDiscount: "44.25", loyaltyDiscountLabel: "Loyalty Reward" })
    )
    const draft = {
      id: "draft_su_1",
      quoteNumber: "551122",
      customerName: "Test Customer",
      type: "sealed_unit" as const,
      updatedAt: "2026-11-25T15:00:00Z",
      itemCount: 1,
      subtotal: totals.subtotalPreTax,
      grandTotal: totals.grandTotal,
      data: createDraftSavePayload({
        quoteNumber: "551122",
        customerName: "Test Customer",
        quoteNotes: "Note",
        lineItems: [sampleItem],
        sealedUnitMode: "installation",
        isInstallation: true,
        serviceSqftInput: "",
        serviceLabourRateInput: "",
        serviceMiscRateInput: "",
        travelFeeType: "local_std",
        customTravelFee: "0",
        showOutTownTravel: false,
        travelKm: "",
        crewHours: "",
        crewSize: "2",
        loyaltyDiscount: "44.25",
        loyaltyDiscountLabel: "Loyalty Reward",
        discountType: "loyalty",
        loyaltyPoints: 1000,
        loyaltyGrossAmount: 50,
        hstRate: 13,
        totals,
      }),
    }

    const snap = serializeSealedUnitSnapshot({
      quoteNumber: "551122",
      customerName: "Test Customer",
      lineItems: [sampleItem],
      sealedUnitMode: "installation",
      isInstallation: true,
      serviceSqftInput: "",
      serviceLabourRateInput: "",
      serviceMiscRateInput: "",
      travelFeeType: "local_std",
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "",
      crewHours: "",
      crewSize: "2",
      loyaltyDiscount: "44.25",
      loyaltyDiscountLabel: "Loyalty Reward",
      discountType: "loyalty",
      loyaltyPoints: 1000,
      loyaltyGrossAmount: 50,
      hstRate: 13,
    })
    expect(snap).toContain("Loyalty Reward")

    const setLoyaltyDiscount = vi.fn()
    const setLoyaltyPoints = vi.fn()
    applyDraftDataToWorkspace(draft.data, {
      setQuoteNumber: vi.fn(),
      setCustomerName: vi.fn(),
      setQuoteNotes: vi.fn(),
      setLineItems: vi.fn(),
      setSealedUnitMode: vi.fn(),
      setIsInstallation: vi.fn(),
      setServiceSqftInput: vi.fn(),
      setServiceLabourRateInput: vi.fn(),
      setServiceMiscRateInput: vi.fn(),
      setTravelFeeType: vi.fn(),
      setCustomTravelFee: vi.fn(),
      setShowOutTownTravel: vi.fn(),
      setTravelKm: vi.fn(),
      setCrewHours: vi.fn(),
      setCrewSize: vi.fn(),
      setLoyaltyDiscount,
      setLoyaltyPoints,
      setHstRate: vi.fn(),
      setAttachedWindowQuote: vi.fn(),
      setAttachedDoorQuote: vi.fn(),
    })
    expect(setLoyaltyDiscount).toHaveBeenCalledWith("44.25")
    expect(setLoyaltyPoints).toHaveBeenCalledWith(1000)

    const attached = buildSealedUnitAttachPayload(draft as any)
    expect(attached.loyaltyDiscount).toBe(44.25)
    expect(attached.loyaltyDiscountLabel).toBe("Loyalty Reward")

    const reviewPayload = buildSealedUnitsUpdatePayload({
      customerName: "Test Customer",
      quoteNumber: "551122",
      quoteNotes: "",
      sealedUnitMode: "installation",
      isInstallation: true,
      isServiceOnly: false,
      lineItems: [sampleItem],
      totals,
      serviceSqftInput: "",
      serviceLabourRateInput: "",
      serviceMiscRateInput: "",
      travelFeeType: "local_std",
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "",
      crewHours: "",
      crewSize: "2",
      loyaltyDiscount: "44.25",
      loyaltyDiscountLabel: "Loyalty Reward",
      discountType: "loyalty",
      loyaltyPoints: 1000,
      loyaltyGrossAmount: 50,
      hstRate: 13,
      attachedWindowQuote: null,
      attachedDoorQuote: null,
    })
    expect(reviewPayload.loyaltyDiscount).toBe("44.25")
    expect(reviewPayload.taxTotals.loyaltyDiscount).toBe(44.25)

    const cardPricing = computeQuotePricing({
      quoteType: "sealed_unit",
      taxTotals: reviewPayload.taxTotals,
      loyaltyDiscount: "44.25",
    })!
    expect(cardPricing.promoDiscount).toBe(4425)
  })
})
