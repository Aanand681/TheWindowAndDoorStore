import { describe, it, expect } from "vitest"
import {
  YORK_STORM_DOORS,
  YORK_STORM_ADDONS,
  computeStormDoorPrice,
  buildStormDoorDescription,
  CUSTOM_PAINT_PRICE,
  CUSTOM_PAINT_DOUBLE_PRICE,
} from "../storm-door-catalog"

describe("York Aluminum Storm Doors Catalog & Pricing Engine", () => {
  it("contains all 9 York Aluminum storm door styles", () => {
    const styles = new Set(YORK_STORM_DOORS.map((d) => d.style))
    expect(styles.has("one_lite")).toBe(true)
    expect(styles.has("full_view")).toBe(true)
    expect(styles.has("self_storing")).toBe(true)
    expect(styles.has("hi_view")).toBe(true)
    expect(styles.has("extended_view")).toBe(true)
    expect(styles.has("tri_lite")).toBe(true)
    expect(styles.has("true_view_half")).toBe(true)
    expect(styles.has("true_view_three_quarter")).toBe(true)
    expect(styles.has("project_self_storing")).toBe(true)
  })

  it("calculates exact fixed price for Self-Storing 2\" with Hidden Vent ($803.00)", () => {
    const item = YORK_STORM_DOORS.find(
      (d) => d.style === "self_storing" && d.profile === '2"'
    )!
    expect(item).toBeDefined()

    const result = computeStormDoorPrice(item, {
      ventType: "hidden_vent",
      swing: "outswing",
      color: "White",
      selectedAddonIds: [],
    })
    expect(result.totalPrice).toBe(803.0)

    const desc = buildStormDoorDescription(item, {
      ventType: "hidden_vent",
      swing: "outswing",
      color: "White",
      selectedAddonIds: [],
    })
    expect(desc).toBe('York Aluminum 2" Self-Storing - w/ Hidden Vent - White')
  })

  it("calculates exact fixed price for Self-Storing 2-1/4\" with Hidden Vent ($844.00)", () => {
    const item = YORK_STORM_DOORS.find(
      (d) => d.style === "self_storing" && d.profile === '2-1/4"'
    )!
    expect(item).toBeDefined()

    const result = computeStormDoorPrice(item, {
      ventType: "hidden_vent",
      swing: "outswing",
      color: "Chocolate Brown",
      selectedAddonIds: [],
    })
    expect(result.totalPrice).toBe(844.0)
  })

  it("calculates exact fixed price for Inswing Full-View ($1,056.64)", () => {
    const item = YORK_STORM_DOORS.find(
      (d) => d.style === "full_view" && d.profile === '2"'
    )!
    const result = computeStormDoorPrice(item, {
      ventType: "standard",
      swing: "inswing",
      color: "Black",
      selectedAddonIds: [],
    })
    expect(result.totalPrice).toBe(1056.64)
  })

  it("adds custom paint option ($1,113.00 single & $2,184.00 double) properly", () => {
    const item = YORK_STORM_DOORS.find(
      (d) => d.style === "hi_view" && d.profile === '2"'
    )!
    const singleRes = computeStormDoorPrice(item, {
      ventType: "standard",
      swing: "outswing",
      color: "Sherwin Williams Custom Green",
      isCustomPaint: true,
      selectedAddonIds: [],
    })
    // 686 (base) + 1113 (paint) = 1799.00
    expect(singleRes.totalPrice).toBe(1799.0)
    expect(singleRes.addonsTotal).toBe(CUSTOM_PAINT_PRICE)

    const doubleRes = computeStormDoorPrice(item, {
      ventType: "standard",
      swing: "outswing",
      color: "Custom Blue",
      isCustomPaint: true,
      isDoubleDoorCustomPaint: true,
      selectedAddonIds: [],
    })
    // 686 (base) + 2184 (double paint) = 2870.00
    expect(doubleRes.totalPrice).toBe(2870.0)
    expect(doubleRes.addonsTotal).toBe(CUSTOM_PAINT_DOUBLE_PRICE)
  })

  it("calculates 1-1/4\" Project Door Mill Finish ($559.00) vs White ($589.00)", () => {
    const item = YORK_STORM_DOORS.find((d) => d.style === "project_self_storing")!
    const whiteRes = computeStormDoorPrice(item, {
      ventType: "standard",
      swing: "outswing",
      color: "White",
      selectedAddonIds: [],
    })
    expect(whiteRes.totalPrice).toBe(589.0)

    const millRes = computeStormDoorPrice(item, {
      ventType: "standard",
      swing: "outswing",
      color: "Mill Finish",
      selectedAddonIds: [],
    })
    expect(millRes.totalPrice).toBe(559.0)
  })

  it("adds the interchangeable screen insert ($73.00) to Full-View doors", () => {
    const item = YORK_STORM_DOORS.find(
      (d) => d.style === "full_view" && d.profile === '2"'
    )!
    const screenAddon = YORK_STORM_ADDONS.find((a) => a.id === "screen_interchangeable")
    expect(screenAddon).toBeDefined()
    expect(screenAddon?.price).toBe(73.0)

    const res = computeStormDoorPrice(item, {
      ventType: "standard",
      swing: "outswing",
      color: "Black",
      selectedAddonIds: ["screen_interchangeable"],
    })
    // 772 (base) + 73 (screen) = 845.00
    expect(res.totalPrice).toBe(845.0)
    expect(res.addonsTotal).toBe(73.0)

    const desc = buildStormDoorDescription(item, {
      ventType: "standard",
      swing: "outswing",
      color: "Black",
      selectedAddonIds: ["screen_interchangeable"],
    })
    expect(desc).toContain("[Interchangeable Screen Insert]")
  })
})
