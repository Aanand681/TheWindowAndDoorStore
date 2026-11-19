import { describe, it, expect } from "vitest"

export function getQuoteDomainAndCount(quote: any) {
  const isDoor =
    quote.quoteType === "door" ||
    (Array.isArray(quote.windows) &&
      quote.windows.some((w: any) => Boolean(w.doorPresetId || w.systemType)))

  const isSealedUnit =
    quote.quoteType === "sealed_unit" ||
    Boolean(quote.taxTotals?.isSealedUnitQuote) ||
    Boolean(quote.sealedUnitMode) ||
    (Array.isArray(quote.windows) &&
      quote.windows.some((w: any) =>
        Boolean(w.glassType || w.overallThickness || w.spacerType)
      ))

  const itemsList = Array.isArray(quote.windows)
    ? quote.windows
    : Array.isArray(quote.lineItems)
      ? quote.lineItems
      : []

  const totalItemQty = itemsList.reduce(
    (sum: number, item: any) => sum + (Number(item.quantity || item.qty) || 1),
    0
  )

  const domain = isDoor ? "door" : isSealedUnit ? "sealed_unit" : "window"
  const itemNoun = isDoor
    ? totalItemQty === 1 ? "Door" : "Doors"
    : isSealedUnit
      ? totalItemQty === 1 ? "Sealed Unit" : "Sealed Units"
      : totalItemQty === 1 ? "Window" : "Windows"

  return { domain, totalItemQty, itemNoun, label: `${totalItemQty} ${itemNoun}` }
}

describe("Quote Card Domain & Item Count Logic", () => {
  it("correctly identifies door quotes and computes door counts", () => {
    const doorQuote = {
      quoteType: "door",
      windows: [
        { doorPresetId: "entry_1", quantity: 2 },
        { doorPresetId: "storm_1", quantity: 1 },
      ],
    }
    const result = getQuoteDomainAndCount(doorQuote)
    expect(result.domain).toBe("door")
    expect(result.totalItemQty).toBe(3)
    expect(result.label).toBe("3 Doors")
  })

  it("handles singular Door correctly", () => {
    const singleDoor = {
      windows: [{ doorPresetId: "entry_1", qty: 1 }],
    }
    const result = getQuoteDomainAndCount(singleDoor)
    expect(result.domain).toBe("door")
    expect(result.totalItemQty).toBe(1)
    expect(result.label).toBe("1 Door")
  })

  it("correctly identifies sealed unit quotes and computes counts", () => {
    const sealedUnitQuote = {
      quoteType: "sealed_unit",
      windows: [
        { glassType: "Clear / LowE", quantity: 5 },
      ],
    }
    const result = getQuoteDomainAndCount(sealedUnitQuote)
    expect(result.domain).toBe("sealed_unit")
    expect(result.totalItemQty).toBe(5)
    expect(result.label).toBe("5 Sealed Units")
  })

  it("handles singular Sealed Unit correctly", () => {
    const singleSU = {
      taxTotals: { isSealedUnitQuote: true },
      windows: [{ glassType: "Clear", qty: 1 }],
    }
    const result = getQuoteDomainAndCount(singleSU)
    expect(result.domain).toBe("sealed_unit")
    expect(result.totalItemQty).toBe(1)
    expect(result.label).toBe("1 Sealed Unit")
  })

  it("correctly identifies window quotes and computes window counts", () => {
    const windowQuote = {
      quoteType: "window",
      windows: [
        { combinationName: "Picture Window", quantity: 2 },
        { combinationName: "Casement Window", quantity: 2 },
      ],
    }
    const result = getQuoteDomainAndCount(windowQuote)
    expect(result.domain).toBe("window")
    expect(result.totalItemQty).toBe(4)
    expect(result.label).toBe("4 Windows")
  })
})
