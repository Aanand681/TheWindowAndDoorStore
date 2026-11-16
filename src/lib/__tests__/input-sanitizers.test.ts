import { describe, it, expect } from "vitest"
import {
  sanitizeNonNegativeNumber,
  sanitizePositiveInteger,
  clampNonNegative,
  clampPositiveInteger,
} from "../input-sanitizers"

describe("Input Sanitizers and Industrial Safety Guards", () => {
  describe("sanitizeNonNegativeNumber", () => {
    it("strips minus signs from negative strings", () => {
      expect(sanitizeNonNegativeNumber("-50")).toBe("50")
      expect(sanitizeNonNegativeNumber("-125.75")).toBe("125.75")
      expect(sanitizeNonNegativeNumber("---10")).toBe("10")
    })

    it("preserves valid decimals and single decimal points", () => {
      expect(sanitizeNonNegativeNumber("14.50")).toBe("14.50")
      expect(sanitizeNonNegativeNumber("14.50.25")).toBe("14.5025")
    })

    it("handles empty or zero inputs cleanly", () => {
      expect(sanitizeNonNegativeNumber("")).toBe("")
      expect(sanitizeNonNegativeNumber("0")).toBe("0")
      expect(sanitizeNonNegativeNumber("-0")).toBe("0")
    })

    it("strips non-numeric characters", () => {
      expect(sanitizeNonNegativeNumber("$150.00")).toBe("150.00")
      expect(sanitizeNonNegativeNumber("abc-20.5xyz")).toBe("20.5")
    })
  })

  describe("sanitizePositiveInteger", () => {
    it("enforces minimum value of 1 for quantities", () => {
      expect(sanitizePositiveInteger("0")).toBe("1")
      expect(sanitizePositiveInteger("-5")).toBe("5")
      expect(sanitizePositiveInteger("")).toBe("")
      expect(sanitizePositiveInteger("3")).toBe("3")
    })

    it("removes decimal points from integer quantities", () => {
      expect(sanitizePositiveInteger("2.5")).toBe("25")
    })
  })

  describe("clampNonNegative", () => {
    it("clamps negative numbers to 0", () => {
      expect(clampNonNegative(-10)).toBe(0)
      expect(clampNonNegative("-50.5")).toBe(0)
      expect(clampNonNegative(150.25)).toBe(150.25)
      expect(clampNonNegative(0)).toBe(0)
    })

    it("returns fallback for invalid inputs", () => {
      expect(clampNonNegative(null, 10)).toBe(10)
      expect(clampNonNegative(undefined, 0)).toBe(0)
      expect(clampNonNegative("invalid", 0)).toBe(0)
    })
  })

  describe("clampPositiveInteger", () => {
    it("clamps values below 1 to 1", () => {
      expect(clampPositiveInteger(0)).toBe(1)
      expect(clampPositiveInteger(-5)).toBe(1)
      expect(clampPositiveInteger(4)).toBe(4)
      expect(clampPositiveInteger(3.9)).toBe(3)
    })
  })
})

