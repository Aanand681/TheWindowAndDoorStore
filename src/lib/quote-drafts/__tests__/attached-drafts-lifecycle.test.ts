import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import {
  restoreAttachedQuoteDraft,
  purgeSubmittedDrafts,
  getSavedDrafts,
  saveQuoteDraft,
} from "../index"

describe("Attached Quotes Lifecycle - Restore & Purge Engine", () => {
  let store: Record<string, string> = {}

  beforeEach(() => {
    store = {}
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = String(val)
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
    }
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: mockStorage,
    })
    vi.stubGlobal("localStorage", mockStorage)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("restores an attached door quote back into saved drafts when detached", () => {
    const attachedDoor = {
      quoteNumber: "D-909",
      customerName: "Jane Doe",
      itemCount: 2,
      type: "door",
      lineItems: [{ id: "door_1", presetLabel: "Modern Entry Door", quantity: 1 }],
      totals: { subtotalPreTax: 2500, grandTotal: 2825 },
    }

    const restored = restoreAttachedQuoteDraft("door", attachedDoor)

    expect(restored).toBeDefined()
    expect(restored.quoteNumber).toBe("D-909")
    expect(restored.type).toBe("door")
    expect(restored.customerName).toBe("Jane Doe")
    expect(restored.grandTotal).toBe(2825)

    const allDrafts = getSavedDrafts()
    expect(allDrafts.some((d) => d.quoteNumber === "D-909" && d.type === "door")).toBe(true)
  })

  it("purges both parent and attached child drafts from saved drafts upon submit", () => {
    // 1. Pre-populate window and door drafts
    saveQuoteDraft({
      id: "draft_win_1",
      type: "window",
      quoteNumber: "W-500",
      customerName: "Acme Corp",
      itemCount: 4,
      subtotal: 4000,
      grandTotal: 4520,
      summaryLabel: "4 Windows",
      data: { windows: [] } as any,
    })

    saveQuoteDraft({
      id: "draft_door_1",
      type: "door",
      quoteNumber: "D-600",
      customerName: "Acme Corp",
      itemCount: 1,
      subtotal: 2000,
      grandTotal: 2260,
      summaryLabel: "1 Entry Door",
      data: { lineItems: [] } as any,
    })

    expect(getSavedDrafts().length).toBe(2)

    // 2. Submit W-500 with D-600 attached
    purgeSubmittedDrafts({
      mainQuoteNumber: "W-500",
      mainType: "window",
      attachedDoorQuote: { quoteNumber: "D-600" },
    })

    // 3. Both must be removed from saved drafts registry
    const remaining = getSavedDrafts()
    expect(remaining.find((d) => d.quoteNumber === "W-500")).toBeUndefined()
    expect(remaining.find((d) => d.quoteNumber === "D-600")).toBeUndefined()
    expect(remaining.length).toBe(0)
  })
})
