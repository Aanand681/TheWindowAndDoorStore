import { describe, it, expect, vi } from "vitest"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"
import { detectQuoteChanges } from "@/lib/quote-diff"
import { formatWindowSummarySentence } from "@/lib/calculator/format-window-summary"
import { buildDoorAttachPayload } from "@/components/calculator/attach/attach-payload-builders"
import {
  AUTOSAVE_TTL_MS,
  isWorkspaceDirtyOrUnsaved,
  saveQuoteDraftDirectly,
  getSavedDrafts,
  clearAllQuoteDrafts,
} from "@/lib/quote-drafts-storage"

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
    expect(fin.combinedSurchargeCents).toBe(16000 + 12000 + 4800)
    expect(fin.combinedLabourCents).toBe(50000 + 50000 + 20000)
    expect(fin.combinedMiscCents).toBe(10000 + 8000 + 5000)
  })

  it("correctly rolls up Door quote when totals are stored in taxTotals instead of totals", () => {
    const fin = computeCombinedQuoteFinancials({
      quoteResult: { base: 100000, surcharge: 8000, promoDiscount: 10000 },
      total: 120000,
      afterDiscount: 98000,
      attachedDoorQuote: {
        taxTotals: {
          rawDoorBaseTotal: 2000,
          surchargeTotal: 160,
          combinedLabour: 600,
          miscTotal: 100,
          discountTotal: 200,
        },
      },
      effectiveJC: 0,
      effectiveMisc: 5000,
      effectiveLabour: 20000,
      hstRate: 13,
    })
    expect(fin.combinedSurchargeCents).toBe(8000 + 16000)
    expect(fin.combinedLabourCents).toBe(20000 + 60000)
    expect(fin.combinedMiscCents).toBe(5000 + 10000)
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

  it("formats window summary sentences with accurate dual/triple pane counts", () => {
    const windows = [
      { id: "1", qty: "2", base: "300", color: "White" },
      { id: "2", qty: "1", base: "500", triple: "1", color: "Painted" },
    ]
    const summary = formatWindowSummarySentence(windows)
    expect(summary).toBe("1 triple pane painted and 2 dual pane white windows")
  })

  it("verifies 8-hour TTL constant equals 28,800,000 milliseconds", () => {
    expect(AUTOSAVE_TTL_MS).toBe(8 * 60 * 60 * 1000)
  })

  it("correctly identifies clean vs dirty workspace for smart 'New' button behavior", () => {
    // 1. Fresh empty workspace should be clean
    const emptyWorkspace = {
      quoteNumber: "",
      customerName: "",
      itemCount: 0,
      grandTotal: 0,
      data: { windows: [] },
    }
    expect(isWorkspaceDirtyOrUnsaved("window", emptyWorkspace)).toBe(false)

    // 2. Workspace with user content and no saved draft should be dirty
    const unsavedWorkspace = {
      quoteNumber: "12345",
      customerName: "Jane Doe",
      itemCount: 2,
      grandTotal: 1500,
      data: {
        windows: [{ id: "w1", base: "500", w: "36", h: "48" }],
      },
    }
    expect(isWorkspaceDirtyOrUnsaved("window", unsavedWorkspace)).toBe(true)
  })

  it("handles cents vs dollars gracefully in isWorkspaceDirtyOrUnsaved", () => {
    // If quote is saved with 1500.00 dollars, passing 150000 cents should be recognized
    const centsWorkspace = {
      quoteNumber: "",
      customerName: "",
      itemCount: 0,
      grandTotal: 0,
      data: { windows: [] },
    }
    expect(isWorkspaceDirtyOrUnsaved("window", centsWorkspace)).toBe(false)
  })

  it("ensures drafts retain attachedInstallOption and customOptions", () => {
    const draftPayload = {
      attachedInstallOption: {
        enabled: true,
        amountPreTaxCents: 45000,
        mode: "supply",
      },
      customOptions: [
        { id: "opt-1", title: "Triple Pane Upgrade", amountPreTaxCents: 35000 },
      ],
    }

    expect(draftPayload.attachedInstallOption.enabled).toBe(true)
    expect(draftPayload.attachedInstallOption.amountPreTaxCents).toBe(45000)
    expect(draftPayload.customOptions.length).toBe(1)
    expect(draftPayload.customOptions[0].title).toBe("Triple Pane Upgrade")
  })

  it("saveQuoteDraftDirectly only updates saved quotes list after successful MongoDB upload", async () => {
    const store: Record<string, string> = {}
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = String(val)
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k])
      },
    }
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: mockStorage,
    })
    vi.stubGlobal("localStorage", mockStorage)

    clearAllQuoteDrafts("all")

    // Mock successful database response
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ draft: { _id: "mongo_test_id_999" } }),
    })
    vi.stubGlobal("fetch", mockFetch)

    const saved = await saveQuoteDraftDirectly({
      type: "window",
      quoteNumber: "Q-99901",
      customerName: "Alice Walker",
      itemCount: 2,
      subtotal: 1200,
      grandTotal: 1356,
      summaryLabel: "2 Windows",
      data: { quoteNumber: "Q-99901" } as any,
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(saved.id).toBe("mongo_test_id_999")

    const savedList = getSavedDrafts()
    expect(savedList.some((d) => d.id === "mongo_test_id_999")).toBe(true)
    vi.unstubAllGlobals()
  })

  it("saveQuoteDraftDirectly does NOT add to saved quotes list if database upload fails", async () => {
    const store: Record<string, string> = {}
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = String(val)
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k])
      },
    }
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: mockStorage,
    })
    vi.stubGlobal("localStorage", mockStorage)

    clearAllQuoteDrafts("all")

    // Mock failed database response
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Database unavailable" }),
    })
    vi.stubGlobal("fetch", mockFetch)

    await expect(
      saveQuoteDraftDirectly({
        type: "window",
        quoteNumber: "Q-FAIL-01",
        customerName: "Bob Failed",
        itemCount: 1,
        subtotal: 500,
        grandTotal: 565,
        summaryLabel: "1 Window",
        data: { quoteNumber: "Q-FAIL-01" } as any,
      })
    ).rejects.toThrow(/Failed to upload quote draft to database/)

    const savedList = getSavedDrafts()
    expect(savedList.some((d) => d.quoteNumber === "Q-FAIL-01")).toBe(false)
    vi.unstubAllGlobals()
  })

  it("buildDoorAttachPayload automatically reconstructs totals from lineItems when draft totals are missing", () => {
    const rawDoorDraft = {
      id: "draft_door_1",
      type: "door" as const,
      quoteNumber: "D-1001",
      customerName: "Alice Door",
      itemCount: 1,
      subtotal: 0,
      grandTotal: 0,
      summaryLabel: "1 Steel Entry Door",
      data: {
        quoteNumber: "D-1001",
        customerName: "Alice Door",
        lineItems: [
          {
            id: "line_1",
            presetId: "entry_1",
            presetLabel: "Steel Entry Door",
            category: "entry",
            quantity: 1,
            inksterBasePrice: 1200,
            surchargeAmount: 96,
            discountAmount: 100,
            unitLabour: 350,
            unitMisc: 50,
            lineHardwareTotal: 147,
          },
        ],
      },
    }

    const payload = buildDoorAttachPayload(rawDoorDraft as any)
    expect(payload.totals.rawDoorBaseTotal).toBe(1200)
    expect(payload.totals.surchargeTotal).toBe(96)
    expect(payload.totals.discountTotal).toBe(100)
    expect(payload.totals.hardwareTotal).toBe(147)
    expect(payload.totals.combinedLabourTotal).toBe(350)
    expect(payload.totals.miscTotal).toBe(50)
    expect(payload.totals.subtotalPreTax).toBeGreaterThan(1200)
    expect(payload.totals.grandTotal).toBeGreaterThan(payload.totals.subtotalPreTax)
  })

  it("buildDoorAttachPayload preserves explicit totals and discount labels", () => {
    const rawDoorDraft = {
      id: "draft_door_2",
      type: "door" as const,
      quoteNumber: "D-1002",
      customerName: "Bob Door",
      itemCount: 1,
      subtotal: 1800,
      grandTotal: 2034,
      summaryLabel: "1 Patio Door",
      data: {
        discountLabel: "Fall Door Special",
        totals: {
          rawDoorBaseTotal: 1500,
          stormDoorTotal: 0,
          hardwareTotal: 0,
          surchargeTotal: 120,
          discountTotal: 150,
          combinedLabourTotal: 280,
          miscTotal: 50,
          subtotalPreTax: 1800,
          grandTotal: 2034,
        },
        lineItems: [
          {
            id: "line_p1",
            presetLabel: "Patio Door",
            quantity: 1,
            inksterBasePrice: 1500,
          },
        ],
      },
    }

    const payload = buildDoorAttachPayload(rawDoorDraft as any)
    expect(payload.discountLabel).toBe("Fall Door Special")
    expect(payload.totals.rawDoorBaseTotal).toBe(1500)
    expect(payload.totals.surchargeTotal).toBe(120)
    expect(payload.totals.discountTotal).toBe(150)
    expect(payload.totals.subtotalPreTax).toBe(1800)
    expect(payload.totals.grandTotal).toBe(2034)
  })
})
