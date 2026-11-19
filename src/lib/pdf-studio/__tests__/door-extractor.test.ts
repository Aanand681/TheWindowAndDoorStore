import { describe, it, expect } from "vitest"
import {
  toSixteenths,
  fromSixteenths,
  parseDoorPage,
} from "../door-extractor"

describe("Door Rough Opening Calculations", () => {
  it("converts dimensions to sixteenths correctly", () => {
    expect(toSixteenths("36")).toBe(576)
    expect(toSixteenths("35 1/2")).toBe(568)
    expect(toSixteenths("81 1/4")).toBe(1300)
    expect(toSixteenths("invalid")).toBeNull()
  })

  it("converts sixteenths back to simplified fraction strings", () => {
    expect(fromSixteenths(576)).toBe("36")
    expect(fromSixteenths(576 + 16)).toBe("37") // +1"
    expect(fromSixteenths(576 + 12)).toBe("36 3/4") // +3/4"
  })

  it("correctly adds 1 inch to rough opening width and 3/4 inch to rough opening height", () => {
    const lines = [
      "Product Description 101",
      "Order Notes: Front Entry Door",
      "*** Wrapping - Overall Dimensions ***",
      "Overall Frame Width = 35 1/2,",
      "Overall Frame Height = 81 1/4,",
      "Cut Down = No",
    ]

    const parsed = parseDoorPage(lines)
    const specTexts = parsed.spec.map((s) => s.text)

    // Frame Width = 35 1/2 -> Rough Opening Width = 35 1/2 + 1" = 36 1/2"
    expect(specTexts).toContain("Overall Rough Opening Width = 36 1/2,")

    // Frame Height = 81 1/4 -> Rough Opening Height = 81 1/4 + 3/4" = 82"
    expect(specTexts).toContain("Overall Rough Opening Height = 82,")
  })
})
