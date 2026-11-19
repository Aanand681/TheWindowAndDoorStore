import { describe, it, expect, beforeEach, vi } from "vitest"
import { isWorkspaceDirtyOrUnsaved } from "@/lib/quote-drafts/autosave-drafts"
import * as savedDraftsModule from "@/lib/quote-drafts/saved-drafts"

describe("Workspace Dirty / Clean Detection (isWorkspaceDirtyOrUnsaved)", () => {
  const mockSavedWindowWithDoor = {
    id: "draft_win_123",
    type: "window" as const,
    quoteNumber: "W-5555",
    customerName: "Jane Doe",
    itemCount: 2,
    subtotal: 3666,
    grandTotal: 4142.58, // Combined total (Windows $2,160 + Attached Door $1,506 + Tax)
    summaryLabel: "2 Windows",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      quoteNumber: "W-5555",
      customerName: "Jane Doe",
      windows: [
        { id: "w1", base: "1000", w: "36", h: "48" },
        { id: "w2", base: "1000", w: "36", h: "48" },
      ],
      attachedDoorQuote: {
        id: "door_456",
        quoteNumber: "D-999",
        totals: {
          rawDoorBaseTotal: 1200,
          surchargeTotal: 96,
          unitLabourTotal: 150,
          upchargesTotal: 60,
          grandTotal: 1701.78,
        },
      },
    },
  }

  beforeEach(() => {
    vi.spyOn(savedDraftsModule, "getSavedDrafts").mockReturnValue([
      mockSavedWindowWithDoor as any,
    ])
  })

  it("returns false (clean) when window quote with attached door is loaded and untouched", () => {
    // Current workspace matches the saved draft exactly
    const currentWorkspace = {
      id: "draft_win_123",
      quoteNumber: "W-5555",
      customerName: "Jane Doe",
      itemCount: 2,
      grandTotal: 4142.58, // Exact combined total in dollars
      data: {
        windows: [
          { id: "w1", base: "1000", w: "36", h: "48" },
          { id: "w2", base: "1000", w: "36", h: "48" },
        ],
        attachedDoorQuote: {
          id: "door_456",
          quoteNumber: "D-999",
          totals: {
            rawDoorBaseTotal: 1200,
            surchargeTotal: 96,
            unitLabourTotal: 150,
            upchargesTotal: 60,
            grandTotal: 1506,
          },
        },
      },
    }

    const isDirty = isWorkspaceDirtyOrUnsaved("window", currentWorkspace)
    expect(isDirty).toBe(false)
  })

  it("returns false (clean) even if caller passed standalone window grandTotal, computing combined total as resilient fallback", () => {
    // Caller only had standalone window total ($2,449), but attached door is present
    const currentWorkspace = {
      id: "draft_win_123",
      quoteNumber: "W-5555",
      customerName: "Jane Doe",
      itemCount: 2,
      grandTotal: 2449, // Standalone window total
      data: {
        quoteResult: { base: 200000, surcharge: 16000 },
        subtotal: 2160,
        windows: [
          { id: "w1", base: "1000", w: "36", h: "48" },
          { id: "w2", base: "1000", w: "36", h: "48" },
        ],
        attachedDoorQuote: {
          id: "door_456",
          quoteNumber: "D-999",
          totals: {
            rawDoorBaseTotal: 1200,
            surchargeTotal: 96,
            unitLabourTotal: 150,
            upchargesTotal: 60,
            grandTotal: 1506,
          },
        },
      },
    }

    const isDirty = isWorkspaceDirtyOrUnsaved("window", currentWorkspace)
    expect(isDirty).toBe(false)
  })

  it("does not treat 'Unnamed Customer' vs empty customer name as dirty", () => {
    vi.spyOn(savedDraftsModule, "getSavedDrafts").mockReturnValue([
      {
        ...mockSavedWindowWithDoor,
        customerName: "Unnamed Customer",
      } as any,
    ])

    const currentWorkspace = {
      id: "draft_win_123",
      quoteNumber: "W-5555",
      customerName: "", // User left name blank
      itemCount: 2,
      grandTotal: 4142.58,
      data: {
        windows: [
          { id: "w1", base: "1000", w: "36", h: "48" },
          { id: "w2", base: "1000", w: "36", h: "48" },
        ],
        attachedDoorQuote: {
          id: "door_456",
          quoteNumber: "D-999",
        },
      },
    }

    const isDirty = isWorkspaceDirtyOrUnsaved("window", currentWorkspace)
    expect(isDirty).toBe(false)
  })

  it("returns true (dirty) when user actually detaches or changes the attached door quote", () => {
    // User detached the door quote
    const currentWorkspace = {
      id: "draft_win_123",
      quoteNumber: "W-5555",
      customerName: "Jane Doe",
      itemCount: 2,
      grandTotal: 2449,
      data: {
        windows: [
          { id: "w1", base: "1000", w: "36", h: "48" },
          { id: "w2", base: "1000", w: "36", h: "48" },
        ],
        attachedDoorQuote: null, // Detached!
      },
    }

    const isDirty = isWorkspaceDirtyOrUnsaved("window", currentWorkspace)
    expect(isDirty).toBe(true)
  })

  it("returns true (dirty) when item count or customer name changes", () => {
    const currentWorkspace = {
      id: "draft_win_123",
      quoteNumber: "W-5555",
      customerName: "Different Name", // Changed name
      itemCount: 2,
      grandTotal: 4142.58,
      data: {
        windows: [
          { id: "w1", base: "1000", w: "36", h: "48" },
          { id: "w2", base: "1000", w: "36", h: "48" },
        ],
        attachedDoorQuote: {
          id: "door_456",
          quoteNumber: "D-999",
        },
      },
    }

    expect(isWorkspaceDirtyOrUnsaved("window", currentWorkspace)).toBe(true)
  })
})
