import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  buildDraftDocumentPayload,
  formatDraftDto,
} from "@/lib/server/drafts/draft-query-service"
import { buildWindowAttachPayload } from "@/components/calculator/attach/window-attach-payload-builder"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"
import {
  getAttachedDoorItemBaseDollars,
  hasAttachedDoorItemPrices,
  resolveAttachedDoorFallbackBase,
  isAttachedSealedUnitService,
} from "@/components/shared/summary/AttachedQuoteProductRows"
import { executeSaveDraft } from "@/hooks/calculator/drafts/draft-saver"
import { saveQuoteDraftDirectly, saveActiveAutoSave } from "@/lib/quote-drafts-storage"

vi.mock("@/models/SavedQuote", () => ({ default: {} }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock("@/lib/quote-drafts-storage", () => ({
  saveQuoteDraftDirectly: vi.fn().mockImplementation(async (payload) => ({
    id: "draft-123",
    updatedAt: "2026-11-26T10:00:00Z",
    ...payload,
  })),
  saveActiveAutoSave: vi.fn(),
}))
vi.mock("@/hooks/calculator/supply-mode/supply-session-storage", () => ({
  readSessionAttachedInstallOption: vi.fn().mockReturnValue(null),
  readSessionCustomOptions: vi.fn().mockReturnValue([]),
}))

describe("Part 1 — Window Draft Discount Persistence & Sealed Unit Attach Parity", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("executeSaveDraft saves quoteResult + custom/loyalty discounts into MongoDB draft & preserves them via formatDraftDto -> buildWindowAttachPayload", async () => {
    const saved = await executeSaveDraft({
      workspace: {
        quoteNumber: "W-800",
        customerName: "Alex Rivera",
        windows: [{ id: "w1", qty: 1, base: "2000", argon: "0", solar: "0", triple: "0" }] as any,
        activePromoId: "winter_promo",
        surchargeRate: 8,
        isSupplyOnly: false,
        supplyJambId: "none",
        supplyJambRate: "0",
        supplyCasingId: "none",
        supplyCasingRate: "0",
        customJC: "",
        customMisc: "",
        customLabour: "",
        customDiscount: "250",
        customDiscountLabel: "Winter Special",
        loyaltyDiscount: "44.25",
        loyaltyDiscountLabel: "Loyalty Reward",
        discountType: "loyalty",
        loyaltyPoints: 1000,
        loyaltyGrossAmount: 50,
        includeJCInPromo: true,
        includeMiscInPromo: true,
        includeLabourInPromo: true,
        hstRate: 13,
        attachedUpgrade: null,
        attachedSealedUnit: null,
        attachedDoorQuote: null,
        wantsUpgrade: false,
        taxTotals: {
          extras: 140,
          finalLabour: 340,
          finalMisc: 40,
          finalJC: 100,
          customMaterials: [{ id: "cm1", label: "Sill Stop", amount: 50 }],
        } as any,
        setQuoteNumber: vi.fn(),
        setCustomerName: vi.fn(),
        setQuoteNotes: vi.fn(),
        setSurchargeRate: vi.fn(),
        setWindows: vi.fn(),
        setActivePromoId: vi.fn(),
        setIsSupplyOnly: vi.fn(),
        setSupplyJambId: vi.fn(),
        setSupplyJambRate: vi.fn(),
        setSupplyCasingId: vi.fn(),
        setSupplyCasingRate: vi.fn(),
        setCustomJC: vi.fn(),
        setCustomMisc: vi.fn(),
        setCustomLabour: vi.fn(),
        setIncludeJCInPromo: vi.fn(),
        setIncludeMiscInPromo: vi.fn(),
        setIncludeLabourInPromo: vi.fn(),
        setHstRate: vi.fn(),
        setAttachedUpgrade: vi.fn(),
        setAttachedSealedUnit: vi.fn(),
        setAttachedDoorQuote: vi.fn(),
        setWantsUpgrade: vi.fn(),
        setTaxTotals: vi.fn(),
        quoteNotes: "",
      },
      financials: {
        quoteResult: {
          promoId: "winter_promo",
          promoName: "20% Off Base",
          promoDiscount: 40000, // $400.00 promo
          base: 200000, // $2,000.00
          surcharge: 16000, // $160.00
          final: 176000,
          text: "",
          note: "",
        },
        effectiveMisc: 4000,
        effectiveLabour: 34000,
        effectiveJC: 10000,
        afterDiscount: 230000,
        total: 259900,
      },
      loadedDraftId: null,
      setLoadedDraftId: vi.fn(),
    })

    expect(saved).not.toBeNull()
    expect(saveQuoteDraftDirectly).toHaveBeenCalledTimes(1)
    expect(saveActiveAutoSave).toHaveBeenCalledTimes(1)

    const draftSaveArg = vi.mocked(saveQuoteDraftDirectly).mock.calls[0][0]
    expect((draftSaveArg.data as any).quoteResult?.promoDiscount).toBe(40000)

    // Simulate MongoDB POST /api/drafts -> GET /api/drafts roundtrip
    const dbDoc = buildDraftDocumentPayload(
      draftSaveArg,
      "john_sales",
      "john@example.com"
    )
    expect(dbDoc.customDiscount).toBe("250")
    expect(dbDoc.customDiscountLabel).toBe("Winter Special")
    expect(dbDoc.loyaltyDiscount).toBe("44.25")
    expect(dbDoc.loyaltyPoints).toBe(1000)
    expect(dbDoc.loyaltyGrossAmount).toBe(50)
    expect(dbDoc.customMaterials).toEqual([{ id: "cm1", label: "Sill Stop", amount: 50 }])

    const reloadedDto = formatDraftDto({
      ...dbDoc,
      _id: "507f1f77bcf86cd799439011",
      createdAt: "2026-11-26T10:00:00Z",
      updatedAt: "2026-11-26T10:00:00Z",
    })

    const attachedWindow = buildWindowAttachPayload(reloadedDto as any)
    expect(attachedWindow.totals.discount).toBe(250)
    expect(attachedWindow.discountLabel).toBe("Winter Special")
    expect(attachedWindow.totals.loyaltyDiscount).toBe(44.25)

    // Attach Window onto Sealed Unit (both installation and service_only modes)
    const suHost = {
      data: {
        sealedUnitMode: "installation",
        totals: {
          glassBefore8PercentTotal: 500,
          glass8PercentSurchargeTotal: 40,
          unitLabourSum: 100,
          baseSetupFee: 140,
          totalTravelAndSetup: 140,
          combinedLabourTotal: 240,
          miscTotal: 15,
        },
      },
    }

    const combined = calculateUniversalPricing({
      sealedUnitQuote: suHost,
      windowQuote: attachedWindow,
      hostType: "sealed_unit",
      hstRate: 13,
    })

    expect(combined.winNorm?.discount).toBe(250)
    expect(combined.winNorm?.loyaltyDiscount).toBe(44.25)
    expect(combined.discounts).toBe(294.25)
  })

  it("preserves Window Promo Discount when attaching a draft without customDiscount override", async () => {
    await executeSaveDraft({
      workspace: {
        quoteNumber: "W-801",
        customerName: "Promo Only",
        windows: [{ id: "w1", qty: 1, base: "1500" }] as any,
        activePromoId: "spring_promo",
        surchargeRate: 8,
        isSupplyOnly: false,
        supplyJambId: "none",
        supplyJambRate: "0",
        supplyCasingId: "none",
        supplyCasingRate: "0",
        customJC: "",
        customMisc: "",
        customLabour: "",
        customDiscount: "",
        customDiscountLabel: "",
        loyaltyDiscount: "",
        loyaltyDiscountLabel: "",
        discountType: "none",
        loyaltyPoints: 0,
        loyaltyGrossAmount: 0,
        includeJCInPromo: true,
        includeMiscInPromo: true,
        includeLabourInPromo: true,
        hstRate: 13,
        attachedUpgrade: null,
        attachedSealedUnit: null,
        attachedDoorQuote: null,
        wantsUpgrade: false,
        taxTotals: { extras: 140, finalLabour: 240, finalMisc: 20, finalJC: 0 } as any,
        setQuoteNumber: vi.fn(),
        setCustomerName: vi.fn(),
        setQuoteNotes: vi.fn(),
        setSurchargeRate: vi.fn(),
        setWindows: vi.fn(),
        setActivePromoId: vi.fn(),
        setIsSupplyOnly: vi.fn(),
        setSupplyJambId: vi.fn(),
        setSupplyJambRate: vi.fn(),
        setSupplyCasingId: vi.fn(),
        setSupplyCasingRate: vi.fn(),
        setCustomJC: vi.fn(),
        setCustomMisc: vi.fn(),
        setCustomLabour: vi.fn(),
        setIncludeJCInPromo: vi.fn(),
        setIncludeMiscInPromo: vi.fn(),
        setIncludeLabourInPromo: vi.fn(),
        setHstRate: vi.fn(),
        setAttachedUpgrade: vi.fn(),
        setAttachedSealedUnit: vi.fn(),
        setAttachedDoorQuote: vi.fn(),
        setWantsUpgrade: vi.fn(),
        setTaxTotals: vi.fn(),
        quoteNotes: "",
      },
      financials: {
        quoteResult: {
          promoId: "spring_promo",
          promoName: "20% Off Spring",
          promoDiscount: 30000, // $300 promo
          base: 150000,
          surcharge: 12000,
          final: 132000,
          text: "",
          note: "",
        },
        effectiveMisc: 2000,
        effectiveLabour: 24000,
        effectiveJC: 0,
        afterDiscount: 158000,
        total: 178540,
      },
      loadedDraftId: null,
      setLoadedDraftId: vi.fn(),
    })

    const draftArg = vi.mocked(saveQuoteDraftDirectly).mock.calls[0][0]
    const dbDoc = buildDraftDocumentPayload(draftArg, "john_sales", "john@example.com")
    const reloadedDto = formatDraftDto({ ...dbDoc, _id: "507f1f77bcf86cd799439012" })
    const attachedWindow = buildWindowAttachPayload(reloadedDto as any)

    expect(attachedWindow.totals.promoDiscount).toBe(300)
    expect(attachedWindow.promoName).toBe("20% Off Spring")

    const suCombined = calculateUniversalPricing({
      sealedUnitQuote: {
        data: {
          sealedUnitMode: "service_only",
          totals: { serviceLabourTotal: 200, miscTotal: 20, totalTravelAndSetup: 140 },
        },
      },
      windowQuote: attachedWindow,
      hostType: "sealed_unit",
      hstRate: 13,
    })

    expect(suCombined.winNorm?.discount).toBe(300)
    expect(suCombined.discounts).toBe(300)
  })

  it("computeCombinedQuoteFinancials (Window Host) exposes winNorm, doorNorm, suNorm & all promo/loyalty discounts", () => {
    const combined = computeCombinedQuoteFinancials({
      quoteResult: {
        promoDiscount: 40000,
        base: 200000,
        surcharge: 16000,
      },
      afterDiscount: 0,
      total: 0,
      effectiveLabour: 30000,
      effectiveMisc: 4000,
      effectiveJC: 10000,
      taxTotals: {
        extras: 140,
        finalLabour: 300,
        finalMisc: 40,
        finalJC: 100,
        isSupplyOnly: false,
      } as any,
      hstRate: 13,
      customDiscount: 150,
      loyaltyDiscount: 25,
      attachedDoorQuote: {
        id: "door-draft-1",
        type: "door",
        quoteNumber: "D-201",
        totals: {
          mode: "installation",
          rawDoorBaseTotal: 1500,
          surchargeTotal: 120,
          combinedLabourTotal: 400,
          miscTotal: 50,
          discountTotal: 100,
          discountLabel: "Door Promo",
          loyaltyDiscount: 35,
          loyaltyDiscountLabel: "Door Loyalty",
        },
      } as any,
      attachedSealedUnit: {
        id: "su-draft-1",
        type: "sealed_unit",
        quoteNumber: "SU-301",
        totals: {
          sealedUnitMode: "installation",
          materialsTotal: 800,
          surchargeTotal: 64,
          combinedLabourTotal: 200,
          miscTotal: 20,
          discountTotal: 60,
          discountLabel: "Glass Promo",
          loyaltyDiscount: 15,
          loyaltyDiscountLabel: "Glass Loyalty",
        },
      } as any,
    })

    expect(combined.winNorm?.discount).toBe(150) // customDiscount ($150) overrides promo ($400)
    expect(combined.winNorm?.loyaltyDiscount).toBe(25)
    expect(combined.doorNorm?.discount).toBe(100)
    expect(combined.doorNorm?.loyaltyDiscount).toBe(35)
    expect(combined.suNorm?.discount).toBe(60)
    expect(combined.suNorm?.loyaltyDiscount).toBe(15)
    expect(combined.loyaltyDiscountCents).toBe(7500) // $25 + $35 + $15
  })

  it("AttachedQuoteProductRows helpers handle Door fallbacks, Hardware deduplication & SU Service detection cleanly", () => {
    expect(getAttachedDoorItemBaseDollars({ quantity: 2, unitPrice: 450 })).toBe(900)
    expect(getAttachedDoorItemBaseDollars({ quantity: 2, lineTotal: 700 })).toBe(700)
    expect(hasAttachedDoorItemPrices([{ id: "d1", basePrice: 300 }])).toBe(true)
    expect(hasAttachedDoorItemPrices([{ id: "d1" }])).toBe(false)
    expect(resolveAttachedDoorFallbackBase(1158, 158)).toBe(1000)
    expect(resolveAttachedDoorFallbackBase(100, 158)).toBe(100)
    expect(isAttachedSealedUnitService({ sealedUnitMode: "service_only" })).toBe(true)
    expect(isAttachedSealedUnitService({}, { isServiceOnly: true } as any)).toBe(true)
    expect(isAttachedSealedUnitService({ sealedUnitMode: "installation" }, null)).toBe(false)
  })
})
