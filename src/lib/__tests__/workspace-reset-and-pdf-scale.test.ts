import { describe, it, expect, vi } from "vitest"
import { resetDoorWorkspace } from "@/hooks/doors/door-draft-applier"
import { parseManufacturerPdfItems } from "@/lib/pdf-parser"
import { validateQuoteUpdateFields } from "@/lib/server/quotes/quote-update-validation"

describe("Workspace Reset & Multi-Page Window PDF Scale", () => {
  it("resetDoorWorkspace clears mode, region, travel, materials, and loyalty fields", () => {
    const setters = {
      setCustomerName: vi.fn(),
      setQuoteNumber: vi.fn(),
      setMode: vi.fn(),
      setLineItems: vi.fn(),
      setGlobalUpcharges: vi.fn(),
      resetRegionToDefault: vi.fn(),
      setTravelFeeType: vi.fn(),
      setCustomTravelFee: vi.fn(),
      setShowOutTownTravel: vi.fn(),
      setTravelKm: vi.fn(),
      setCrewHours: vi.fn(),
      setCrewSize: vi.fn(),
      setQuoteNotes: vi.fn(),
      setIsFirstNation: vi.fn(),
      setCustomLabour: vi.fn(),
      setCustomMisc: vi.fn(),
      setCustomDiscount: vi.fn(),
      setCustomDiscountLabel: vi.fn(),
      setLoyaltyDiscount: vi.fn(),
      setLoyaltyDiscountLabel: vi.fn(),
      setDiscountType: vi.fn(),
      setLoyaltyPoints: vi.fn(),
      setLoyaltyGrossAmount: vi.fn(),
      setCustomMaterials: vi.fn(),
      setHstRate: vi.fn(),
      setAttachedWindowQuote: vi.fn(),
      setAttachedSealedUnit: vi.fn(),
    }

    resetDoorWorkspace({
      setters,
      setEditingItem: vi.fn(),
      setLastSavedAt: vi.fn(),
      setShowResetModal: vi.fn(),
    })

    expect(setters.setMode).toHaveBeenCalledWith("installation")
    expect(setters.resetRegionToDefault).toHaveBeenCalledOnce()
    expect(setters.setTravelFeeType).toHaveBeenCalledWith("local_std")
    expect(setters.setCustomTravelFee).toHaveBeenCalledWith("")
    expect(setters.setShowOutTownTravel).toHaveBeenCalledWith(false)
    expect(setters.setTravelKm).toHaveBeenCalledWith("")
    expect(setters.setCrewHours).toHaveBeenCalledWith("")
    expect(setters.setCrewSize).toHaveBeenCalledWith("3")
    expect(setters.setGlobalUpcharges).toHaveBeenCalledWith([])
    expect(setters.setCustomMaterials).toHaveBeenCalledWith([])
    expect(setters.setLoyaltyDiscount).toHaveBeenCalledWith("")
    expect(setters.setHstRate).toHaveBeenCalledWith(13)
  })

  it("parses 25 windows across multiple PDF pages and validates save bounds cleanly", () => {
    const items: any[] = []
    for (let i = 1; i <= 25; i++) {
      const page = Math.floor((i - 1) / 5)
      const baseY = 100 + ((i - 1) % 5) * 110
      items.push(
        { page, x: 30, y: baseY, str: String(i) },
        { page, x: 80, y: baseY, str: `Casement Window #${i}` },
        { page, x: 260, y: baseY, str: "1" },
        { page, x: 300, y: baseY, str: "FR: 30 X 40" },
        { page, x: 80, y: baseY + 25, str: "LINE ITEM TOTAL" },
        { page, x: 450, y: baseY + 25, str: "$500.00" }
      )
    }

    const parsed = parseManufacturerPdfItems(items)
    expect(parsed).toHaveLength(25)
    expect(parsed[18].base).toBe(50000)

    expect(validateQuoteUpdateFields({ windows: parsed })).toBeNull()
    const tooMany = Array.from({ length: 201 }, () => ({ id: "w" }))
    expect(validateQuoteUpdateFields({ windows: tooMany })?.statusCode).toBe(400)
  })
})
