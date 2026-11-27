import { describe, expect, it } from "vitest"
import { computeDeduplicatedInstallCompareAmounts } from "../supply-install-delta"

describe("supply-install-delta", () => {
  it("deduplicates travel to single maximum ($867.50) across Window, Door, and Sealed Unit when comparing Supply vs Install", () => {
    const res = computeDeduplicatedInstallCompareAmounts({
      hasWindows: true,
      isWinSupplyOnly: false,
      winTaxTotals: {
        labourWindows: 632.27,
        extras: 867.5,
        finalLabour: 1499.77,
        finalMisc: 260.58,
        finalJC: 335.57,
      },
      hasDoors: true,
      isDoorSupplyOnly: false,
      doorTotals: {
        unitLabourTotal: 250,
        upchargesTotal: 0,
        fullTravelAndSetup: 867.5,
        fullInstallLabour: 1117.5,
        fullInstallMisc: 180,
      },
      hasSealedUnits: true,
      isSUSupplyOnly: false,
      suTotals: {
        fullUnitLabourSum: 446.43,
        extraLabour: 250,
        fullTravelAndSetup: 503.5,
        fullInstallLabour: 1199.93,
        fullInstallMisc: 74.4,
      },
    })

    // Pure labour = 632.27 + 250 + (446.43 + 250) = 1578.70
    // Max travel = max(867.50, 867.50, 503.50) = 867.50
    // Compare labour = 1578.70 + 867.50 = 2446.20 (NEVER double-counts 867.50 or 503.50!)
    expect(res.maxTravel).toBe(867.5)
    expect(res.compareLabourAmount).toBe(2446.2)
    expect(res.compareMiscAmount).toBe(514.98)
    expect(res.installJCAmount).toBe(335.57)
  })

  it("computes full Option for Installation from DB-saved Supply Only quotes without sessionStorage", () => {
    const res = computeDeduplicatedInstallCompareAmounts({
      hasWindows: true,
      isWinSupplyOnly: true,
      winTaxTotals: {
        isSupplyOnly: true,
        extras: 0,
        finalLabour: 0,
        finalMisc: 0,
        finalJC: 0,
        fullInstallExtrasCents: 86750,
        fullInstallLabourCents: 149977, // 632.27 pure + 867.50 travel
        fullInstallMiscCents: 26058,
        fullInstallJCCents: 33557,
      },
      hasSealedUnits: true,
      isSUSupplyOnly: true,
      suTotals: {
        isSupplyOnly: true,
        unitLabourSum: 0,
        combinedLabourTotal: 0,
        miscTotal: 0,
        fullUnitLabourSum: 446.43,
        extraLabour: 0,
        fullTravelAndSetup: 503.5,
        fullInstallLabour: 949.93,
        fullInstallMisc: 74.4,
      },
      hasDoors: false,
    })

    expect(res.pureWinLabour).toBe(632.27)
    expect(res.pureSULabour).toBe(446.43)
    expect(res.maxTravel).toBe(867.5)
    expect(res.compareLabourAmount).toBe(1946.2)
    expect(res.compareMiscAmount).toBe(334.98)
    expect(res.installJCAmount).toBe(335.57)
  })
})
