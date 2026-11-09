import { describe, it, expect } from 'vitest';
import { calculateSealedUnitTotals, SealedUnitCalculationParams } from '../calculations';
import {
  calculateSealedUnitItem,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  ComboPricing,
} from '@/lib/sealed-units-logic';

const mockCombo: ComboPricing = {
  id: 'double_clear',
  name: 'Double Glazed Clear',
  treatment: 'annealed',
  prices: {
    3: { dual: 12.0, triple: 18.0 },
    4: { dual: 14.0, triple: 20.0 },
    5: { dual: 16.0, triple: 22.0 },
    6: { dual: 18.0, triple: 24.0 },
  },
};

describe('Sealed Units Calculation Engine', () => {
  describe('calculateSealedUnitItem', () => {
    it('should enforce minimum 4.0 billable sqft for small glass units', () => {
      // 12" x 12" = 144 sq in = 1.0 sqft actual
      const item = calculateSealedUnitItem({
        combo: mockCombo,
        paneType: 'dual',
        widthIn: 12,
        heightIn: 12,
        quantity: 1,
        formula: DEFAULT_FORMULA_CONSTANTS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        labourSettings: DEFAULT_LABOUR_SETTINGS,
      });

      expect(item.actualSqft).toBe(1.0);
      expect(item.roundedSqft).toBe(1);
      // Enforced minimum billable sqft is 4.0
      expect(item.billableSqft).toBe(4.0);
    });

    it('should apply strict ceiling rounding to actual square footage', () => {
      // 25" x 70" = 1750 sq in / 144 = 12.1527 sqft
      const item = calculateSealedUnitItem({
        combo: mockCombo,
        paneType: 'dual',
        widthIn: 25,
        heightIn: 70,
        quantity: 1,
        formula: DEFAULT_FORMULA_CONSTANTS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        labourSettings: DEFAULT_LABOUR_SETTINGS,
      });

      expect(item.actualSqft).toBeCloseTo(12.15, 1);
      // Ceiling rounding: 12.15 -> 13
      expect(item.roundedSqft).toBe(13);
      expect(item.billableSqft).toBe(13);
    });

    it('should enforce minimum labour per unit ($120.00)', () => {
      // 20" x 20" = 400 sq in = 2.78 sqft. 2.78 sqft * $14.40 = $40.03, which is below $120.00 minimum
      const item = calculateSealedUnitItem({
        combo: mockCombo,
        paneType: 'dual',
        widthIn: 20,
        heightIn: 20,
        quantity: 1,
        formula: DEFAULT_FORMULA_CONSTANTS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        labourSettings: DEFAULT_LABOUR_SETTINGS,
      });

      expect(item.unitLabour).toBe(120.0);
    });

    it('should compute 8% surcharge cleanly on top of base glass price', () => {
      const item = calculateSealedUnitItem({
        combo: mockCombo,
        paneType: 'dual',
        widthIn: 36,
        heightIn: 48,
        quantity: 1,
        formula: DEFAULT_FORMULA_CONSTANTS,
        thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
        labourSettings: DEFAULT_LABOUR_SETTINGS,
      });

      // 8% surcharge = multipliedAmount * 0.08
      expect(item.surcharge8PercentAmount).toBeCloseTo(item.multipliedAmount * 0.08, 1);
      expect(item.finalUnitPrice).toBeCloseTo(item.multipliedAmount + item.surcharge8PercentAmount, 1);
    });
  });

  describe('calculateSealedUnitTotals', () => {
    const sampleLineItem = calculateSealedUnitItem({
      combo: mockCombo,
      paneType: 'dual',
      widthIn: 36,
      heightIn: 48, // 12 sqft
      quantity: 1,
      formula: DEFAULT_FORMULA_CONSTANTS,
      thicknessBreaks: DEFAULT_THICKNESS_BREAKS,
      labourSettings: DEFAULT_LABOUR_SETTINGS,
    });

    it('should zero out labour and misc in supply_only mode', () => {
      const params: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: 'supply_only',
        serviceSqftInput: '',
        serviceLabourRateInput: '',
        serviceMiscRateInput: '',
        travelFeeType: 'far_std',
        customTravelFee: '0',
        showOutTownTravel: false,
        travelKm: '',
        crewHours: '',
        crewSize: '2',
        hstRate: 13,
        labour: DEFAULT_LABOUR_SETTINGS,
      };

      const totals = calculateSealedUnitTotals(params);

      expect(totals.combinedLabourTotal).toBe(0);
      expect(totals.miscTotal).toBe(0);
      expect(totals.totalTravelAndSetup).toBe(0);
      expect(totals.subtotalPreTax).toBe(sampleLineItem.lineGlassTotal);
      expect(totals.grandTotal).toBeCloseTo(totals.subtotalPreTax * 1.13, 2);
    });

    it('should calculate installation mode with setup fee, far travel, and 13% HST', () => {
      const params: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: 'installation',
        serviceSqftInput: '',
        serviceLabourRateInput: '',
        serviceMiscRateInput: '',
        travelFeeType: 'far_std', // $727.50
        customTravelFee: '0',
        showOutTownTravel: false,
        travelKm: '',
        crewHours: '',
        crewSize: '2',
        hstRate: 13,
        labour: DEFAULT_LABOUR_SETTINGS,
      };

      const totals = calculateSealedUnitTotals(params);

      // Base setup fee ($140.00) + Far Standard ($727.50) = $867.50
      expect(totals.totalTravelAndSetup).toBe(867.5);
      expect(totals.combinedLabourTotal).toBe(totals.unitLabourSum + totals.totalTravelAndSetup);
      expect(totals.subtotalPreTax).toBe(
        totals.glassSupplyTotal + totals.combinedLabourTotal + totals.miscTotal
      );
      expect(totals.hstAmount).toBe(Math.round(totals.subtotalPreTax * 0.13 * 100) / 100);
      expect(totals.grandTotal).toBe(totals.subtotalPreTax + totals.hstAmount);
    });

    it('should zero out glass manufacturing in service_only mode and enforce strict 13% HST', () => {
      const params: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: 'service_only',
        serviceSqftInput: '20',
        serviceLabourRateInput: '15.0',
        serviceMiscRateInput: '3.0',
        travelFeeType: 'none',
        customTravelFee: '0',
        showOutTownTravel: false,
        travelKm: '',
        crewHours: '',
        crewSize: '2',
        hstRate: 8, // Attempted 8% PST exemption, but service only must strictly pay 13%
        labour: DEFAULT_LABOUR_SETTINGS,
      };

      const totals = calculateSealedUnitTotals(params);

      // In service only, glass supply is $0.00
      expect(totals.glassSupplyTotal).toBe(0);
      expect(totals.glassBefore8PercentTotal).toBe(0);
      expect(totals.glass8PercentSurchargeTotal).toBe(0);

      // In service only, HST is strictly 13%
      expect(totals.hstAmount).toBe(Math.round(totals.subtotalPreTax * 0.13 * 100) / 100);
    });

    it('should calculate First Nations 8% Exemption (5% GST on glass supply, 13% HST on labour/misc)', () => {
      const params: SealedUnitCalculationParams = {
        lineItems: [sampleLineItem],
        sealedUnitMode: 'installation',
        serviceSqftInput: '',
        serviceLabourRateInput: '',
        serviceMiscRateInput: '',
        travelFeeType: 'none',
        customTravelFee: '0',
        showOutTownTravel: false,
        travelKm: '',
        crewHours: '',
        crewSize: '2',
        hstRate: 8, // 8% First Nations exemption
        labour: DEFAULT_LABOUR_SETTINGS,
      };

      const totals = calculateSealedUnitTotals(params);

      const expectedMaterialTax = Math.round(totals.glassSupplyTotal * 0.05 * 100) / 100;
      const expectedLabourTax =
        Math.round((totals.combinedLabourTotal + totals.miscTotal) * 0.13 * 100) / 100;
      const expectedTotalTax = Math.round((expectedMaterialTax + expectedLabourTax) * 100) / 100;

      expect(totals.hstAmount).toBe(expectedTotalTax);
      expect(totals.grandTotal).toBe(totals.subtotalPreTax + expectedTotalTax);
    });
  });
});
