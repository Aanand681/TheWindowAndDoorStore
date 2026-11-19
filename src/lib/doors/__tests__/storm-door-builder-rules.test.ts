import { describe, it, expect } from "vitest"
import { buildDoorLineItem } from "../calculations"
import { calculateDoorQuoteTotals } from "../totals-calculator"
import {
  DEFAULT_DOOR_FORMULA,
  DEFAULT_DOOR_PRESETS,
  DEFAULT_DOOR_LOGISTICS,
} from "../constants"
import { DoorLineItem } from "../types"

describe("Storm Door & Hardware Business Rules", () => {
  const formula = DEFAULT_DOOR_FORMULA
  const presets = DEFAULT_DOOR_PRESETS
  const logistics = DEFAULT_DOOR_LOGISTICS

  const baseParams = {
    formula,
    logistics,
    travelFeeType: "none" as const,
    customTravelFee: "0",
    showOutTownTravel: false,
    travelKm: "0",
    crewHours: "0",
    crewSize: "2" as const,
    hstRate: 13,
  }

  it("locks hardware to $0 for storm doors (latches/closers included with door)", () => {
    const stormPreset = presets.find((p) => p.id === "storm_same_time")!
    const item = buildDoorLineItem({
      preset: stormPreset,
      category: "storm",
      inksterBasePrice: 803.0, // Self-Storing with Hidden Vent
      quantity: 1,
      unitLabour: stormPreset.labour,
      unitMisc: stormPreset.misc,
      hardwareType: "none",
      formula,
    })

    expect(item.lineHardwareTotal).toBe(0)
    expect(item.discountPercent).toBe(0) // Storm doors are strictly exempt from 10% discount
    expect(item.discountAmount).toBe(0)
    expect(item.surchargeAmount).toBe(64.24) // 8% of 803.00
  })

  it("locks hardware to $0 for patio doors (integrated mortise lock)", () => {
    const patioPreset = presets.find((p) => p.id === "patio_6ft")!
    const item = buildDoorLineItem({
      preset: patioPreset,
      category: "patio",
      inksterBasePrice: 1500.0,
      quantity: 1,
      unitLabour: patioPreset.labour,
      unitMisc: patioPreset.misc,
      hardwareType: "none",
      formula,
    })

    expect(item.lineHardwareTotal).toBe(0)
  })

  it("preserves hardware ($158.00) in both supply and install modes for entry doors", () => {
    const entryPreset = presets.find((p) => p.id === "single_regular")!
    const item: DoorLineItem = buildDoorLineItem({
      preset: entryPreset,
      category: "entry",
      inksterBasePrice: 1200.0,
      quantity: 1,
      unitLabour: entryPreset.labour,
      unitMisc: entryPreset.misc,
      hardwareType: "standard",
      supplyHardwareType: "standard",
      installHardwareType: "standard",
      formula,
    })

    expect(item.lineHardwareTotal).toBe(158.0)

    // Calculate in installation mode
    const installTotals = calculateDoorQuoteTotals({
      ...baseParams,
      lineItems: [item],
      mode: "installation",
    })
    expect(installTotals.hardwareTotal).toBe(158.0)
    expect(installTotals.hardwareQty).toBe(1)
    expect(installTotals.rawDoorBaseTotal + installTotals.hardwareTotal).toBe(1200 + 158) // base + hardware

    // Calculate in supply mode
    const supplyTotals = calculateDoorQuoteTotals({
      ...baseParams,
      lineItems: [item],
      mode: "supply_only",
    })
    expect(supplyTotals.hardwareTotal).toBe(158.0)
    expect(supplyTotals.hardwareQty).toBe(1)
    expect(supplyTotals.combinedLabourTotal).toBe(0) // $0 labour in supply
    expect(supplyTotals.miscTotal).toBe(0) // $0 misc in supply
  })

  it("computes combined quote with entry door and storm door correctly", () => {
    const entryPreset = presets.find((p) => p.id === "single_regular")!
    const stormPreset = presets.find((p) => p.id === "storm_same_time")!

    const entryDoor = buildDoorLineItem({
      preset: entryPreset,
      category: "entry",
      inksterBasePrice: 1500.0,
      quantity: 1,
      unitLabour: entryPreset.labour,
      unitMisc: entryPreset.misc,
      hardwareType: "standard",
      formula,
    })

    const stormDoor = buildDoorLineItem({
      preset: stormPreset,
      category: "storm",
      inksterBasePrice: 803.0,
      quantity: 1,
      unitLabour: stormPreset.labour,
      unitMisc: stormPreset.misc,
      hardwareType: "none",
      formula,
    })

    const totals = calculateDoorQuoteTotals({
      ...baseParams,
      lineItems: [entryDoor, stormDoor],
      mode: "installation",
    })

    expect(totals.totalDoors).toBe(1)
    expect(totals.totalStormDoors).toBe(1)
    expect(totals.totalUnits).toBe(2)
    expect(totals.stormDoorTotal).toBe(803.0)
    expect(totals.rawDoorBaseTotal).toBe(1500.0)
    expect(totals.hardwareTotal).toBe(158.0) // only entry door has hardware
    // 10% discount applies ONLY to standard doors (entry: 10% of 1500 = 150), NOT to storm
    expect(totals.discountTotal).toBe(150.0)
  })
})
