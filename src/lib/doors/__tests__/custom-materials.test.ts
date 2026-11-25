import { describe, it, expect } from "vitest"
import { buildDoorLineItem } from "../calculations"
import {
  calculateDoorQuoteTotals,
  computeEffectiveDoorGrandTotal,
} from "../totals-calculator"
import type {
  DoorFormulaSettings,
  DoorLogisticsSettings,
  DoorPreset,
} from "../types"
import type { CustomMaterialItem } from "@/types/calculator"

const defaultFormula: DoorFormulaSettings = {
  surchargeRate: 8,
  doorDiscountPercent: 10,
  locksetDeadboltPrice: 158.0,
  customerSuppliedHardwareFee: 80.0,
}

const defaultLogistics: DoorLogisticsSettings = {
  setupFeeDefault: 140.0,
  setupFeeFarStandard: 727.5,
  setupFeeFarSmall: 363.5,
  vehicleRatePerKm: 0.98,
  crewHourly2Men: 150.0,
  crewHourly3Men: 200.0,
}

const mockEntryPreset: DoorPreset = {
  id: "single_entry",
  label: "Single Entry Door",
  category: "entry",
  labour: 250,
  misc: 30,
}

const sampleCustomMaterials: CustomMaterialItem[] = [
  { id: "dm1", label: "Custom Brickmould", amount: 150 },
  { id: "dm2", label: "Sill Extension", amount: 50 },
]

describe("Door Custom Materials & Effective Tax Calculations", () => {
  const sampleItem = buildDoorLineItem({
    preset: mockEntryPreset,
    inksterBasePrice: 1000,
    formula: defaultFormula,
    quantity: 1,
    hardwareType: "none",
  })

  const baseParams = {
    lineItems: [sampleItem],
    mode: "installation" as const,
    travelFeeType: "local_std" as const,
    customTravelFee: "0",
    showOutTownTravel: false,
    travelKm: "",
    crewHours: "",
    crewSize: "2" as const,
    formula: defaultFormula,
    logistics: defaultLogistics,
  }

  it("adds customMaterialsTotal to subtotalPreTax and taxes at 13% HST", () => {
    const baseline = calculateDoorQuoteTotals({
      ...baseParams,
      hstRate: 13,
      customMaterials: [],
    })
    const withMats = calculateDoorQuoteTotals({
      ...baseParams,
      hstRate: 13,
      customMaterials: sampleCustomMaterials,
    })

    expect(withMats.customMaterials).toHaveLength(2)
    expect(withMats.customMaterialsTotal).toBe(200)
    expect(withMats.subtotalPreTax).toBeCloseTo(baseline.subtotalPreTax + 200, 2)
    expect(withMats.materialExemption).toBe(0)
    expect(withMats.hstAmount).toBeCloseTo(withMats.subtotalPreTax * 0.13, 2)
    expect(withMats.grandTotal).toBeCloseTo(
      withMats.subtotalPreTax + withMats.hstAmount,
      2
    )
  })

  it("includes customMaterials in First Nation 8% Point-of-Sale material exemption", () => {
    const baseline = calculateDoorQuoteTotals({
      ...baseParams,
      hstRate: 8,
      isFirstNation: true,
      customMaterials: [],
    })
    const withMats = calculateDoorQuoteTotals({
      ...baseParams,
      hstRate: 8,
      isFirstNation: true,
      customMaterials: sampleCustomMaterials,
    })

    expect(withMats.customMaterialsTotal).toBe(200)
    expect((withMats.hstBase ?? 0) - (baseline.hstBase ?? 0)).toBeCloseTo(
      26,
      2
    )
    expect(
      (withMats.materialExemption ?? 0) - (baseline.materialExemption ?? 0)
    ).toBeCloseTo(16, 2)
    expect(withMats.hstAmount - baseline.hstAmount).toBeCloseTo(10, 2)
    expect(withMats.hstAmount).toBeCloseTo(
      (withMats.hstBase ?? 0) - (withMats.materialExemption ?? 0),
      2
    )
  })

  it("preserves customMaterials in supply_only mode and supports 0% tax exempt", () => {
    const supplyBaseline = calculateDoorQuoteTotals({
      ...baseParams,
      mode: "supply_only",
      hstRate: 0,
      customMaterials: [],
    })
    const supplyWithMats = calculateDoorQuoteTotals({
      ...baseParams,
      mode: "supply_only",
      hstRate: 0,
      customMaterials: sampleCustomMaterials,
    })

    expect(supplyWithMats.customMaterialsTotal).toBe(200)
    expect(supplyWithMats.subtotalPreTax).toBeCloseTo(
      supplyBaseline.subtotalPreTax + 200,
      2
    )
    expect(supplyWithMats.hstAmount).toBe(0)
    expect(supplyWithMats.grandTotal).toBeCloseTo(
      supplyWithMats.subtotalPreTax,
      2
    )
  })

  it("applies stacked discounts and explicit 0% HST in computeEffectiveDoorGrandTotal", () => {
    const baseTotals = calculateDoorQuoteTotals({
      ...baseParams,
      hstRate: 13,
      customMaterials: sampleCustomMaterials,
    })

    const noDiscount = computeEffectiveDoorGrandTotal({
      totals: baseTotals,
      mode: "installation",
      hstRate: 13,
    })

    const withStackedDiscounts = computeEffectiveDoorGrandTotal({
      totals: baseTotals,
      mode: "installation",
      customDiscount: "250",
      customDiscountLabel: "Manager Promo",
      loyaltyDiscount: "44.25",
      loyaltyDiscountLabel: "Loyalty Reward",
      hstRate: 13,
    })

    // Built-in 10% door discount ($100) is replaced by customDiscount ($250 => -$150) + loyalty ($44.25 => -$194.25)
    expect(withStackedDiscounts.combinedSubtotal).toBeCloseTo(
      noDiscount.combinedSubtotal - 194.25,
      2
    )
    expect(withStackedDiscounts.combinedTax).toBeCloseTo(
      withStackedDiscounts.combinedSubtotal * 0.13,
      2
    )

    const zeroTax = computeEffectiveDoorGrandTotal({
      totals: baseTotals,
      mode: "installation",
      customDiscount: "250",
      loyaltyDiscount: "44.25",
      hstRate: 0,
    })
    expect(zeroTax.combinedTax).toBe(0)
    expect(zeroTax.grandTotal).toBeCloseTo(zeroTax.combinedSubtotal, 2)
  })
})
