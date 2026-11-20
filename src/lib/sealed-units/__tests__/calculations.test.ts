import { describe, it, expect } from "vitest"
import {
  calculateSealedUnitTotals,
  SealedUnitCalculationParams,
} from "../calculations"
import {
  calculateSealedUnitItem,
  formatSealedUnitSummarySentence,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  ComboPricing,
} from "@/lib/sealed-units-logic"

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

describe("Sealed Units Calculation Engine", () => {
  const sampleLineItem = calculateSealedUnitItem({
    combo: mockCombo,
    paneType: "dual",
    widthIn: 36,
    heightIn: 48, // 12 sqft
    quantity: 1,
    formula: DEFAULT_FORMULA_CONSTANTS,
    thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
    labourSettings: DEFAULT_LABOUR_SETTINGS,
  })

  describe("calculateSealedUnitItem", () => {
    it("should enforce minimum 4.0 billable sqft for small glass units", () => {
      // 12" x 12" = 144 sq in = 1.0 sqft actual
      const item = calculateSealedUnitItem({
        combo: mockCombo,
        paneType: "dual",
        widthIn: 12,
        heightIn: 12,
        quantity: 1,
        formula: DEFAULT_FORMULA_CONSTANTS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        labourSettings: DEFAULT_LABOUR_SETTINGS,
      })

      expect(item.actualSqft).toBe(1.0)
      expect(item.roundedSqft).toBe(1)
      // Enforced minimum billable sqft is 4.0
      expect(item.billableSqft).toBe(4.0)
    })

    it("should apply strict ceiling rounding to actual square footage", () => {
      // 25" x 70" = 1750 sq in / 144 = 12.1527 sqft
      const item = calculateSealedUnitItem({
        combo: mockCombo,
        paneType: "dual",
        widthIn: 25,
        heightIn: 70,
        quantity: 1,
        formula: DEFAULT_FORMULA_CONSTANTS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        labourSettings: DEFAULT_LABOUR_SETTINGS,
      })

      expect(item.actualSqft).toBeCloseTo(12.15, 1)
      // Ceiling rounding: 12.15 -> 13
      expect(item.roundedSqft).toBe(13)
      expect(item.billableSqft).toBe(13)
    })

    it("should enforce minimum labour per unit ($120.00)", () => {
      // 20" x 20" = 400 sq in = 2.78 sqft. 2.78 sqft * $14.40 = $40.03, which is below $120.00 minimum
      const item = calculateSealedUnitItem({
        combo: mockCombo,
        paneType: "dual",
        widthIn: 20,
        heightIn: 20,
        quantity: 1,
        formula: DEFAULT_FORMULA_CONSTANTS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        labourSettings: DEFAULT_LABOUR_SETTINGS,
      })

      expect(item.unitLabour).toBe(120.0)
    })

    it("should compute 8% surcharge cleanly on top of base glass price", () => {
      const item = calculateSealedUnitItem({
        combo: mockCombo,
        paneType: "dual",
        widthIn: 36,
        heightIn: 48,
        quantity: 1,
        formula: DEFAULT_FORMULA_CONSTANTS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        labourSettings: DEFAULT_LABOUR_SETTINGS,
      })

      // 8% surcharge = multipliedAmount * 0.08
      expect(item.surcharge8PercentAmount).toBeCloseTo(
        item.multipliedAmount * 0.08,
        1
      )
      expect(item.finalUnitPrice).toBeCloseTo(
        item.multipliedAmount + item.surcharge8PercentAmount,
        1
      )
    })
  })

  describe("calculateSealedUnitTotals", () => {
    it("should zero out labour and misc in supply_only mode", () => {
      const params: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: "supply_only",
        serviceSqftInput: "",
        serviceLabourRateInput: "",
        serviceMiscRateInput: "",
        travelFeeType: "far_std",
        customTravelFee: "0",
        showOutTownTravel: false,
        travelKm: "",
        crewHours: "",
        crewSize: "2",
        hstRate: 13,
        labour: DEFAULT_LABOUR_SETTINGS,
      }

      const totals = calculateSealedUnitTotals(params)

      expect(totals.combinedLabourTotal).toBe(0)
      expect(totals.miscTotal).toBe(0)
      expect(totals.totalTravelAndSetup).toBe(0)
      expect(totals.subtotalPreTax).toBe(sampleLineItem.lineGlassTotal)
      expect(totals.grandTotal).toBeCloseTo(totals.subtotalPreTax * 1.13, 2)
    })

    it("should calculate installation mode with setup fee, far travel, and 13% HST", () => {
      const params: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: "installation",
        serviceSqftInput: "",
        serviceLabourRateInput: "",
        serviceMiscRateInput: "",
        travelFeeType: "far_std", // $727.50
        customTravelFee: "0",
        showOutTownTravel: false,
        travelKm: "",
        crewHours: "",
        crewSize: "2",
        hstRate: 13,
        labour: DEFAULT_LABOUR_SETTINGS,
      }

      const totals = calculateSealedUnitTotals(params)

      // Base setup fee ($140.00) + Far Standard ($727.50) = $867.50
      expect(totals.totalTravelAndSetup).toBe(867.5)
      expect(totals.combinedLabourTotal).toBe(
        totals.unitLabourSum + totals.totalTravelAndSetup
      )
      expect(totals.subtotalPreTax).toBe(
        totals.glassSupplyTotal + totals.combinedLabourTotal + totals.miscTotal
      )
      expect(totals.hstAmount).toBe(
        Math.round(totals.subtotalPreTax * 0.13 * 100) / 100
      )
      expect(totals.grandTotal).toBe(totals.subtotalPreTax + totals.hstAmount)
    })

    it("should zero out glass manufacturing in service_only mode and enforce strict 13% HST", () => {
      const params: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: "service_only",
        serviceSqftInput: "20",
        serviceLabourRateInput: "15.0",
        serviceMiscRateInput: "3.0",
        travelFeeType: "none",
        customTravelFee: "0",
        showOutTownTravel: false,
        travelKm: "",
        crewHours: "",
        crewSize: "2",
        hstRate: 8, // Attempted 8% PST exemption, but service only must strictly pay 13%
        labour: DEFAULT_LABOUR_SETTINGS,
      }

      const totals = calculateSealedUnitTotals(params)

      // In service only, glass supply is $0.00
      expect(totals.glassSupplyTotal).toBe(0)
      expect(totals.glassBefore8PercentTotal).toBe(0)
      expect(totals.glass8PercentSurchargeTotal).toBe(0)

      // In service only, HST is strictly 13%
      expect(totals.hstAmount).toBe(
        Math.round(totals.subtotalPreTax * 0.13 * 100) / 100
      )
    })

    it("should calculate First Nations 8% Exemption (5% GST on glass supply, 13% HST on labour/misc)", () => {
      const params: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: "installation",
        serviceSqftInput: "",
        serviceLabourRateInput: "",
        serviceMiscRateInput: "",
        travelFeeType: "none",
        customTravelFee: "0",
        showOutTownTravel: false,
        travelKm: "",
        crewHours: "",
        crewSize: "2",
        hstRate: 8, // 8% First Nations exemption
        labour: DEFAULT_LABOUR_SETTINGS,
      }

      const totals = calculateSealedUnitTotals(params)

      const expectedMaterialTax =
        Math.round(totals.glassSupplyTotal * 0.05 * 100) / 100
      const expectedLabourTax =
        Math.round(
          (totals.combinedLabourTotal + totals.miscTotal) * 0.13 * 100
        ) / 100
      const expectedTotalTax =
        Math.round((expectedMaterialTax + expectedLabourTax) * 100) / 100

      expect(totals.hstAmount).toBe(expectedTotalTax)
      expect(totals.grandTotal).toBe(totals.subtotalPreTax + expectedTotalTax)
    })

    it("should calculate and include out-of-town vehicle mileage and transit hours in combinedLabourTotal and grandTotal", () => {
      const paramsWithoutTravel: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: "installation",
        serviceSqftInput: "",
        serviceLabourRateInput: "",
        serviceMiscRateInput: "",
        travelFeeType: "none",
        customTravelFee: "0",
        showOutTownTravel: false,
        travelKm: "",
        crewHours: "",
        crewSize: "3",
        hstRate: 13,
        labour: DEFAULT_LABOUR_SETTINGS,
      }
      const baseTotals = calculateSealedUnitTotals(paramsWithoutTravel)

      const paramsWithTravel: SealedUnitCalculationParams = {
        ...paramsWithoutTravel,
        travelKm: "100", // 100 km @ $0.98/km = $98.00
        crewHours: "2", // 2 hrs @ $200/hr (3-man) = $400.00
        crewSize: "3",
      }
      const travelTotals = calculateSealedUnitTotals(paramsWithTravel)

      expect(travelTotals.vehicleTravelFee).toBe(98.0)
      expect(travelTotals.crewTravelFee).toBe(400.0)
      expect(travelTotals.totalAdditionalTravel).toBe(498.0)
      expect(travelTotals.combinedLabourTotal).toBe(
        baseTotals.combinedLabourTotal + 498.0
      )
      expect(travelTotals.subtotalPreTax).toBe(
        baseTotals.subtotalPreTax + 498.0
      )
      expect(travelTotals.grandTotal).toBeGreaterThan(baseTotals.grandTotal)
    })

    it("should accurately reflect isInstallation flag in returned totals", () => {
      const installTotals = calculateSealedUnitTotals({
        lineItems: [sampleLineItem],
        sealedUnitMode: "installation",
        serviceSqftInput: "",
        serviceLabourRateInput: "",
        serviceMiscRateInput: "",
        travelFeeType: "none",
        customTravelFee: "0",
        showOutTownTravel: false,
        travelKm: "",
        crewHours: "",
        crewSize: "3",
        hstRate: 13,
        labour: DEFAULT_LABOUR_SETTINGS,
      })
      expect(installTotals.isInstallation).toBe(true)
      expect(installTotals.isServiceOnly).toBe(false)
      expect(installTotals.unitLabourSum).toBeGreaterThan(0)
      expect(installTotals.miscTotal).toBeGreaterThan(0)

      const supplyTotals = calculateSealedUnitTotals({
        lineItems: [sampleLineItem],
        sealedUnitMode: "supply_only",
        serviceSqftInput: "",
        serviceLabourRateInput: "",
        serviceMiscRateInput: "",
        travelFeeType: "none",
        customTravelFee: "0",
        showOutTownTravel: false,
        travelKm: "",
        crewHours: "",
        crewSize: "3",
        hstRate: 13,
        labour: DEFAULT_LABOUR_SETTINGS,
      })
      expect(supplyTotals.isInstallation).toBe(false)
      expect(supplyTotals.isServiceOnly).toBe(false)
      expect(supplyTotals.unitLabourSum).toBe(0)
      expect(supplyTotals.miscTotal).toBe(0)
    })

    it("should include extraLabour add-on amount cleanly into combinedLabourTotal, subtotal, and grand total", () => {
      const baseParams: SealedUnitCalculationParams = {
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
      }
      const withoutExtra = calculateSealedUnitTotals(baseParams)

      const withExtra = calculateSealedUnitTotals({
        ...baseParams,
        extraLabour: "150.00",
      })

      expect(withExtra.extraLabour).toBe(150)
      expect(withExtra.combinedLabourTotal).toBe(
        Math.round((withoutExtra.combinedLabourTotal + 150) * 100) / 100
      )
      expect(withExtra.subtotalPreTax).toBe(
        Math.round((withoutExtra.subtotalPreTax + 150) * 100) / 100
      )
    })
  })

  describe("formatSealedUnitSummarySentence", () => {
    it("should format clean summary without 'without grills' suffix", () => {
      const dualItem = {
        ...sampleLineItem,
        paneType: "dual" as const,
        quantity: 2,
        rawGrillCost: 0,
      }
      expect(formatSealedUnitSummarySentence([dualItem])).toBe("2 dual pane sealed units")

      const tripleItem = {
        ...sampleLineItem,
        paneType: "triple" as const,
        quantity: 1,
        rawGrillCost: 0,
      }
      expect(formatSealedUnitSummarySentence([tripleItem])).toBe("1 triple pane sealed unit")

      const grillItem = {
        ...sampleLineItem,
        paneType: "dual" as const,
        quantity: 3,
        rawGrillCost: 25.0,
      }
      expect(formatSealedUnitSummarySentence([grillItem])).toBe(
        "3 dual pane sealed units with grills"
      )

      expect(
        formatSealedUnitSummarySentence([dualItem, grillItem])
      ).toBe("3 dual pane sealed units with grills and 2 dual pane sealed units")
    })
  })
})
