import { describe, it, expect } from "vitest"
import {
  calculateSealedUnitTotals as calculateLiveSealedUnitTotals,
  type SealedUnitCalculationParams,
} from "../calculations"
import { calculateSealedUnitTotals as calculateStorageSealedUnitTotals } from "../totals-calculator"
import {
  calculateSealedUnitItem,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  type ComboPricing,
} from "@/lib/sealed-units-logic"
import type { CustomMaterialItem } from "@/types/calculator"

const mockCombo: ComboPricing = {
  id: "double_clear",
  name: "Double Glazed Clear",
  treatment: "annealed",
  prices: {
    3: { dual: 12.0, triple: 18.0 },
    4: { dual: 14.0, triple: 20.0 },
    5: { dual: 16.0, triple: 22.0 },
    6: { dual: 18.0, triple: 24.0 },
  },
}

const sampleMaterials: CustomMaterialItem[] = [
  { id: "sm1", label: "Butyl Sealant", amount: 120 },
  { id: "sm2", label: "Setting Blocks & Trim", amount: 80 },
]

describe("Sealed Units Custom Materials Calculations", () => {
  const sampleLineItem = calculateSealedUnitItem({
    combo: mockCombo,
    paneType: "dual",
    widthIn: 36,
    heightIn: 48,
    quantity: 1,
    formula: DEFAULT_FORMULA_CONSTANTS,
    thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
    labourSettings: DEFAULT_LABOUR_SETTINGS,
  })

  const buildLiveParams = (
    overrides: Partial<SealedUnitCalculationParams> = {}
  ): SealedUnitCalculationParams => ({
    lineItems: [sampleLineItem],
    sealedUnitMode: "installation",
    serviceSqftInput: "",
    serviceLabourRateInput: "",
    serviceMiscRateInput: "",
    travelFeeType: "local_std",
    customTravelFee: "0",
    showOutTownTravel: false,
    travelKm: "",
    crewHours: "",
    crewSize: "2",
    hstRate: 13,
    labour: DEFAULT_LABOUR_SETTINGS,
    ...overrides,
  })

  it("adds customMaterialsTotal to installation mode subtotal and 13% HST", () => {
    const baseline = calculateLiveSealedUnitTotals(buildLiveParams())
    const withMats = calculateLiveSealedUnitTotals(
      buildLiveParams({ customMaterials: sampleMaterials })
    )

    expect(withMats.customMaterials).toHaveLength(2)
    expect(withMats.customMaterialsTotal).toBe(200)
    expect(withMats.subtotalPreTax).toBeCloseTo(baseline.subtotalPreTax + 200, 2)
    expect(withMats.hstAmount - baseline.hstAmount).toBeCloseTo(26, 2)
    expect(withMats.grandTotal).toBeCloseTo(
      withMats.subtotalPreTax + withMats.hstAmount,
      2
    )
  })

  it("includes customMaterials in First Nation 8% material exemption (5% net tax on materials)", () => {
    const baseline = calculateLiveSealedUnitTotals(
      buildLiveParams({ hstRate: 8 })
    )
    const withMats = calculateLiveSealedUnitTotals(
      buildLiveParams({ hstRate: 8, customMaterials: sampleMaterials })
    )

    expect(withMats.customMaterialsTotal).toBe(200)
    expect(withMats.subtotalPreTax).toBeCloseTo(baseline.subtotalPreTax + 200, 2)
    // $200 of material under 8% POS exemption adds $200 * 5% = $10.00 net tax
    expect(withMats.hstAmount - baseline.hstAmount).toBeCloseTo(10, 2)
  })

  it("preserves customMaterials across supply_only and service_only modes and supports 0% tax", () => {
    const supplyBase = calculateLiveSealedUnitTotals(
      buildLiveParams({ sealedUnitMode: "supply_only", hstRate: 0 })
    )
    const supplyWithMats = calculateLiveSealedUnitTotals(
      buildLiveParams({
        sealedUnitMode: "supply_only",
        hstRate: 0,
        customMaterials: sampleMaterials,
      })
    )

    expect(supplyWithMats.combinedLabourTotal).toBe(0)
    expect(supplyWithMats.customMaterialsTotal).toBe(200)
    expect(supplyWithMats.subtotalPreTax).toBeCloseTo(
      supplyBase.subtotalPreTax + 200,
      2
    )
    expect(supplyWithMats.hstAmount).toBe(0)

    const serviceBase = calculateLiveSealedUnitTotals(
      buildLiveParams({
        lineItems: [],
        sealedUnitMode: "service_only",
        serviceSqftInput: "10",
        hstRate: 8,
      })
    )
    const serviceWithMats = calculateLiveSealedUnitTotals(
      buildLiveParams({
        lineItems: [],
        sealedUnitMode: "service_only",
        serviceSqftInput: "10",
        hstRate: 8,
        customMaterials: sampleMaterials,
      })
    )

    expect(serviceWithMats.customMaterialsTotal).toBe(200)
    expect(serviceWithMats.subtotalPreTax).toBeCloseTo(
      serviceBase.subtotalPreTax + 200,
      2
    )
    expect(serviceWithMats.hstAmount - serviceBase.hstAmount).toBeCloseTo(10, 2)
  })

  it("computes hstBase and pre-8%-surcharge materialExemption in storage totals-calculator", () => {
    const baseline = calculateStorageSealedUnitTotals({
      lineItems: [sampleLineItem],
      isInstallation: true,
      isServiceOnly: false,
      travelFeeType: "local_std",
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "",
      crewHours: "",
      crewSize: "2",
      hstRate: 8,
      customMaterials: [],
      labourSettings: DEFAULT_LABOUR_SETTINGS,
    })

    const withMats = calculateStorageSealedUnitTotals({
      lineItems: [sampleLineItem],
      isInstallation: true,
      isServiceOnly: false,
      travelFeeType: "local_std",
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "",
      crewHours: "",
      crewSize: "2",
      hstRate: 8,
      customMaterials: sampleMaterials,
      labourSettings: DEFAULT_LABOUR_SETTINGS,
    })

    expect(withMats.customMaterialsTotal).toBe(200)
    expect(withMats.hstBase - baseline.hstBase).toBeCloseTo(26, 2)
    expect(withMats.materialExemption - baseline.materialExemption).toBeCloseTo(
      16,
      2
    )
    expect(withMats.hstAmount - baseline.hstAmount).toBeCloseTo(10, 2)
  })
})
