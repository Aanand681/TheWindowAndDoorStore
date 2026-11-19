import { describe, it, expect } from "vitest"
import { calculateOptionBFinancials } from "@/hooks/calculator/quote-comparison-calc"

describe("Comparison Card Option B Materials Calculation", () => {
  const defaultParams = {
    effectiveOptionBWindows: [
      {
        id: "1",
        qty: "1",
        base: "500",
        argon: "",
        solar: "",
        triple: "",
        w: "36",
        h: "48",
        color: "White",
      },
    ],
    surchargeRate: 8,
    extraLinPerWindow: 2.17,
    effectiveJambRateB: 0,
    effectiveCasingRateB: 0,
    overrideJambId: "none",
    overrideCasingId: "none",
    effectiveJC: 0,
    effectiveMisc: 5000,
    effectiveLabour: 15000,
    availablePromos: [],
    activePromoId: "none",
    hstRate: 13,
  }

  it("calculates Option B financials with custom materials included in subtotal and total", () => {
    const customMaterials = [
      { id: "m1", label: "Jamb as stop", amount: 100 },
      { id: "m2", label: "Aluminum sill extender", amount: 50 },
    ]

    const result = calculateOptionBFinancials({
      ...defaultParams,
      customMaterials,
    })

    expect(result).not.toBeNull()
    if (!result) return

    // Base: 50000 cents ($500.00)
    // Surcharge (8% on base): 4000 cents ($40.00)
    // Custom Materials: 15000 cents ($150.00)
    // Labour: 15000 cents ($150.00)
    // Misc: 5000 cents ($50.00)
    // Pre-Tax Subtotal: 50000 + 4000 + 15000 + 15000 + 5000 = 89000 cents ($890.00)
    expect(result.customMaterialsTotalCents).toBe(15000)
    expect(result.beforeTaxDiscount).toBe(89000)
    expect(result.afterDiscount).toBe(89000)
    expect(result.hst).toBe(Math.round(89000 * 0.13))
    expect(result.total).toBe(89000 + Math.round(89000 * 0.13))
  })

  it("includes custom materials in 8% First Nations material exemption calculation", () => {
    const customMaterials = [{ id: "m1", label: "Special Stop", amount: 100 }]

    const result = calculateOptionBFinancials({
      ...defaultParams,
      hstRate: 8,
      customMaterials,
    })

    expect(result).not.toBeNull()
    if (!result) return

    // Base: 50000
    // Surcharge: 4000
    // Materials: 10000
    // Labour: 15000
    // Misc: 5000
    // Subtotal: 84000
    // HST base (13%): round(84000 * 0.13) = 10920
    // Material exemption (8% on base + materials): round((50000 + 10000) * 0.08) = 4800
    // HST: 10920 - 4800 = 6120 cents
    expect(result.customMaterialsTotalCents).toBe(10000)
    expect(result.beforeTaxDiscount).toBe(84000)
    expect(result.hst).toBe(6120)
    expect(result.total).toBe(84000 + 6120)
  })

  it("returns zero materials total when customMaterials is empty or none", () => {
    const result = calculateOptionBFinancials({
      ...defaultParams,
      customMaterials: [],
    })

    expect(result).not.toBeNull()
    if (!result) return
    expect(result.customMaterialsTotalCents).toBe(0)
    // 50000 + 4000 + 15000 + 5000 = 74000
    expect(result.beforeTaxDiscount).toBe(74000)
  })
})
