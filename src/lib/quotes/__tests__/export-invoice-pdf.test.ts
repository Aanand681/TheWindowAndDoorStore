import { describe, it, expect } from "vitest"
import { computePdfPageSlices } from "../export-invoice-pdf"

describe("computePdfPageSlices", () => {
  it("keeps single-page invoice intact as one slice", () => {
    expect(
      computePdfPageSlices({
        totalHeightPx: 980,
        pageHeightPx: 1100,
      })
    ).toEqual([{ startY: 0, height: 980 }])
  })

  it("snaps page break cleanly to safe block boundary above cutoff", () => {
    const slices = computePdfPageSlices({
      totalHeightPx: 1700,
      pageHeightPx: 1000,
      safeBreakOffsetsPx: [320, 650, 910, 1280],
    })
    expect(slices).toEqual([
      { startY: 0, height: 910 },
      { startY: 910, height: 790 },
    ])
  })

  it("ignores shallow break candidates so pages remain well-filled", () => {
    const slices = computePdfPageSlices({
      totalHeightPx: 1500,
      pageHeightPx: 1000,
      safeBreakOffsetsPx: [120, 200],
    })
    expect(slices).toEqual([
      { startY: 0, height: 1000 },
      { startY: 1000, height: 500 },
    ])
  })
})
