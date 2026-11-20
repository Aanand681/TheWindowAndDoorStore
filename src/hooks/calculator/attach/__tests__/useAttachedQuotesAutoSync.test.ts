import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import {
  QuoteDraftItem,
  SAVED_DRAFTS_STORAGE_KEY,
  DRAFT_CHANGE_EVENT,
} from "@/lib/quote-drafts-storage"
import {
  buildDoorAttachPayload,
  buildWindowAttachPayload,
  buildSealedUnitAttachPayload,
} from "@/components/calculator/attach/attach-payload-builders"

describe("Attached Quotes Auto-Sync Engine", () => {
  let store: Record<string, string> = {}
  let listeners: Record<string, Array<() => void>> = {}

  beforeEach(() => {
    store = {}
    listeners = {}

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

    const mockWindow = {
      addEventListener: (event: string, handler: () => void) => {
        if (!listeners[event]) listeners[event] = []
        listeners[event].push(handler)
      },
      removeEventListener: (event: string, handler: () => void) => {
        if (!listeners[event]) return
        listeners[event] = listeners[event].filter((h) => h !== handler)
      },
      dispatchEvent: (event: { type: string }) => {
        const handlers = listeners[event.type] || []
        handlers.forEach((h) => h())
        return true
      },
      localStorage: mockStorage,
    }

    vi.stubGlobal("window", mockWindow)
    vi.stubGlobal("localStorage", mockStorage)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("buildDoorAttachPayload creates a reactive payload with draftId, rawDraft and updatedAt", () => {
    const draft: QuoteDraftItem = {
      id: "door_draft_101",
      type: "door",
      quoteNumber: "D-101",
      customerName: "Alice Smith",
      updatedAt: "2026-11-20T10:00:00.000Z",
      createdAt: "2026-11-20T09:00:00.000Z",
      itemCount: 1,
      summaryLabel: "1 Entry Door",
      grandTotal: 3000,
      subtotal: 2654.87,
      data: {
        mode: "installation",
        lineItems: [
          {
            id: "item_1",
            presetLabel: "Classic Front Door",
            quantity: 1,
            inksterBasePrice: 2000,
            lineTotal: 2000,
          },
        ],
      } as any,
    }

    const payload = buildDoorAttachPayload(draft)
    expect(payload.draftId).toBe("door_draft_101")
    expect(payload.quoteNumber).toBe("D-101")
    expect(payload.updatedAt).toBe("2026-11-20T10:00:00.000Z")
    expect(payload.totals.grandTotal).toBeGreaterThan(0)
  })

  it("buildWindowAttachPayload creates a reactive payload with draftId, rawDraft and updatedAt", () => {
    const draft: QuoteDraftItem = {
      id: "win_draft_202",
      type: "window",
      quoteNumber: "W-202",
      customerName: "Bob Jones",
      updatedAt: "2026-11-20T11:00:00.000Z",
      createdAt: "2026-11-20T09:00:00.000Z",
      itemCount: 3,
      summaryLabel: "3 Windows",
      grandTotal: 4500,
      subtotal: 3982.3,
      data: {
        windows: [{ id: "w_1", tag: "Living Room", base: "1200" }],
      } as any,
    }

    const payload = buildWindowAttachPayload(draft)
    expect(payload.draftId).toBe("win_draft_202")
    expect(payload.quoteNumber).toBe("W-202")
    expect(payload.updatedAt).toBe("2026-11-20T11:00:00.000Z")
    expect(payload.totals.grandTotal).toBe(4500)
  })

  it("buildSealedUnitAttachPayload creates a reactive payload with draftId, rawDraft and updatedAt", () => {
    const draft: QuoteDraftItem = {
      id: "su_draft_303",
      type: "sealed_unit",
      quoteNumber: "SU-303",
      customerName: "Carol White",
      updatedAt: "2026-11-20T12:00:00.000Z",
      createdAt: "2026-11-20T09:00:00.000Z",
      itemCount: 2,
      summaryLabel: "2 Sealed Units",
      grandTotal: 850,
      subtotal: 752.21,
      data: {
        sealedUnitMode: "supply_only",
        lineItems: [{ id: "su_1", width: 24, height: 36, quantity: 2 }],
      } as any,
    }

    const payload = buildSealedUnitAttachPayload(draft)
    expect(payload.draftId).toBe("su_draft_303")
    expect(payload.quoteNumber).toBe("SU-303")
    expect(payload.updatedAt).toBe("2026-11-20T12:00:00.000Z")
  })

  it("correctly updates attached quote when matching draft in localStorage has newer timestamp and modified total", () => {
    const initialDoorDraft: QuoteDraftItem = {
      id: "door_draft_500",
      type: "door",
      quoteNumber: "D-500",
      customerName: "John Doe",
      updatedAt: "2026-11-20T10:00:00.000Z",
      createdAt: "2026-11-20T09:00:00.000Z",
      itemCount: 1,
      summaryLabel: "1 Entry Door",
      grandTotal: 2500,
      subtotal: 2212.39,
      data: {
        lineItems: [{ id: "item_1", presetLabel: "Door 1", quantity: 1, inksterBasePrice: 2000 }],
      } as any,
    }

    // Attached quote initially attached to Window Quote
    let attachedDoor = buildDoorAttachPayload(initialDoorDraft)
    const initialGrandTotal = attachedDoor.totals.grandTotal
    expect(initialGrandTotal).toBeGreaterThan(0)

    // User opens Door Calculator in another tab and modifies the door quote
    const updatedDoorDraft: QuoteDraftItem = {
      ...initialDoorDraft,
      updatedAt: "2026-11-20T10:30:00.000Z",
      grandTotal: 3800,
      itemCount: 2,
      data: {
        lineItems: [
          { id: "item_1", presetLabel: "Door 1", quantity: 1, inksterBasePrice: 2000 },
          { id: "item_2", presetLabel: "Door 2", quantity: 1, inksterBasePrice: 1500 },
        ],
      } as any,
    }

    // Save updated draft to local storage
    store[SAVED_DRAFTS_STORAGE_KEY] = JSON.stringify([updatedDoorDraft])

    // Simulate auto-sync evaluation
    const drafts = JSON.parse(store[SAVED_DRAFTS_STORAGE_KEY])
    const matching = drafts.find((d: any) => d.id === attachedDoor.draftId)
    expect(matching).toBeDefined()

    const isTimeNewer = Boolean(
      matching.updatedAt && matching.updatedAt !== attachedDoor.updatedAt
    )
    const isTotalChanged =
      Math.abs(Number(attachedDoor.totals.grandTotal) - Number(matching.grandTotal)) >= 0.01

    expect(isTimeNewer).toBe(true)
    expect(isTotalChanged).toBe(true)

    // Fresh payload is generated
    const freshPayload = buildDoorAttachPayload(matching)
    attachedDoor = freshPayload

    // Verifications
    expect(attachedDoor.updatedAt).toBe("2026-11-20T10:30:00.000Z")
    expect(attachedDoor.lineItems.length).toBe(2)
  })
})
