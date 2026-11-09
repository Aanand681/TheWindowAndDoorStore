import { describe, it, expect } from 'vitest';
import { buildDoorLineItem, calculateDoorQuoteTotals } from '../calculations';
import { DoorPreset, DoorFormulaSettings, DoorCalculationParams } from '../types';

const defaultFormula: DoorFormulaSettings = {
  surchargeRate: 8,
  doorDiscountPercent: 10,
  locksetDeadboltPrice: 158.0,
  customerSuppliedHardwareFee: 80.0,
};

const defaultLogistics = {
  setupFeeDefault: 140.0,
  setupFeeFarStandard: 727.5,
  setupFeeFarSmall: 363.5,
  vehicleRatePerKm: 0.98,
  crewHourly2Men: 150.0,
  crewHourly3Men: 200.0,
};

const mockEntryPreset: DoorPreset = {
  id: 'single_entry',
  label: 'Single Entry Door',
  category: 'entry',
  labour: 250,
  misc: 30,
};

const mockStormPreset: DoorPreset = {
  id: 'storm_door',
  label: 'Deluxe Storm Door',
  category: 'storm',
  labour: 180,
  misc: 20,
};

describe('Door Calculations Engine', () => {
  describe('buildDoorLineItem', () => {
    it('should correctly calculate Entry Door with 8% surcharge and 10% discount on base price', () => {
      const item = buildDoorLineItem({
        preset: mockEntryPreset,
        inksterBasePrice: 2000,
        formula: defaultFormula,
        quantity: 1,
        hardwareType: 'none',
      });

      // 8% surcharge on $2,000 = $160
      expect(item.surchargeAmount).toBe(160);
      expect(item.priceWithSurcharge).toBe(2160);

      // 10% discount on $2,000 = $200
      expect(item.discountAmount).toBe(200);
      expect(item.netDoorPrice).toBe(1800);

      // Line grand total = base ($2000) + surcharge ($160) - discount ($200) + labour ($250) + misc ($30) = $2240
      expect(item.lineGrandTotal).toBe(2240);
    });

    it('should STRICTLY exempt Storm Doors from the 10% discount (0% discount)', () => {
      const item = buildDoorLineItem({
        preset: mockStormPreset,
        category: 'storm',
        inksterBasePrice: 1200,
        formula: defaultFormula,
        quantity: 1,
        hardwareType: 'none',
      });

      // 8% surcharge on $1,200 = $96
      expect(item.surchargeAmount).toBe(96);
      expect(item.priceWithSurcharge).toBe(1296);

      // Storm door discount must be strictly 0
      expect(item.discountPercent).toBe(0);
      expect(item.discountAmount).toBe(0);
      expect(item.netDoorPrice).toBe(1200);

      // Line grand total = base ($1200) + surcharge ($96) - discount ($0) + labour ($180) + misc ($20) = $1496
      expect(item.lineGrandTotal).toBe(1496);
    });

    it('should handle standard hardware ($158.00 materials)', () => {
      const item = buildDoorLineItem({
        preset: mockEntryPreset,
        inksterBasePrice: 1000,
        formula: defaultFormula,
        quantity: 1,
        hardwareType: 'standard',
      });

      expect(item.hardwarePrice).toBe(158.0);
      expect(item.customerHardwareFee).toBe(0);
      expect(item.lineHardwareTotal).toBe(158.0);
    });

    it('should handle customer supplied hardware ($0.00 materials, $80.00 labour fee added to unitLabour)', () => {
      const item = buildDoorLineItem({
        preset: mockEntryPreset,
        inksterBasePrice: 1000,
        formula: defaultFormula,
        quantity: 1,
        hardwareType: 'customer_supplied',
      });

      expect(item.hardwarePrice).toBe(0);
      expect(item.customerHardwareFee).toBe(80.0);
      // Unit labour = preset.labour ($250) + customerHardwareFee ($80) = $330
      expect(item.unitLabour).toBe(330);
    });

    it('should scale line totals properly with quantity', () => {
      const item = buildDoorLineItem({
        preset: mockEntryPreset,
        inksterBasePrice: 1000,
        formula: defaultFormula,
        quantity: 3,
        hardwareType: 'standard',
      });

      expect(item.quantity).toBe(3);
      expect(item.lineDoorSupplyTotal).toBe(3000);
      expect(item.lineHardwareTotal).toBe(474); // 158 * 3
      expect(item.lineLabourTotal).toBe(750); // 250 * 3
      expect(item.lineMiscTotal).toBe(90); // 30 * 3
    });
  });

  describe('calculateDoorQuoteTotals', () => {
    it('should zero out labour, misc, and travel fees in supply_only mode', () => {
      const lineItem = buildDoorLineItem({
        preset: mockEntryPreset,
        inksterBasePrice: 2000,
        formula: defaultFormula,
        quantity: 1,
        hardwareType: 'standard',
      });

      const params: DoorCalculationParams = {
        lineItems: [lineItem],
        formula: defaultFormula,
        mode: 'supply_only',
        travelFeeType: 'far_std',
        customTravelFee: '0',
        showOutTownTravel: true,
        travelKm: '100',
        crewHours: '2',
        crewSize: '2',
        hstRate: 13,
        logistics: defaultLogistics,
      };

      const totals = calculateDoorQuoteTotals(params);

      expect(totals.combinedLabourTotal).toBe(0);
      expect(totals.miscTotal).toBe(0);
      expect(totals.totalTravelAndSetup).toBe(0);

      // Subtotal = Base ($2000) - Discount ($200) + Surcharge ($160) + Hardware ($158) = $2118
      expect(totals.subtotalPreTax).toBe(2118);
      // 13% HST on $2118 = $275.34
      expect(totals.hstAmount).toBe(275.34);
      expect(totals.grandTotal).toBe(2393.34);
    });

    it('should calculate complete installation totals with travel, far setup, and 13% HST', () => {
      const lineItem = buildDoorLineItem({
        preset: mockEntryPreset,
        inksterBasePrice: 2000,
        formula: defaultFormula,
        quantity: 1,
        hardwareType: 'none',
      });

      const params: DoorCalculationParams = {
        lineItems: [lineItem],
        formula: defaultFormula,
        mode: 'installation',
        travelFeeType: 'far_std',
        customTravelFee: '0',
        showOutTownTravel: true,
        travelKm: '100', // 100 * 0.98 = $98.00
        crewHours: '2', // 2 * $150 (2 men) = $300.00
        crewSize: '2',
        hstRate: 13,
        logistics: defaultLogistics,
      };

      const totals = calculateDoorQuoteTotals(params);

      // Travel & Setup: Base Setup ($140) + Far Standard ($727.50) + Vehicle ($98) + Crew ($300) = $1265.50
      expect(totals.totalTravelAndSetup).toBe(1265.5);

      // Unit labour ($250) + Travel/Setup ($1265.50) = $1515.50
      expect(totals.combinedLabourTotal).toBe(1515.5);

      // Subtotal = Base ($2000) - Discount ($200) + Surcharge ($160) + Labour ($1515.50) + Misc ($30) = $3505.50
      expect(totals.subtotalPreTax).toBe(3505.5);
      // 13% HST on $3505.50 = $455.72
      expect(totals.hstAmount).toBe(455.72);
      expect(totals.grandTotal).toBe(3961.22);
    });

    it('should calculate First Nations 8% Point-of-Sale Exemption (5% GST on materials, 13% on labour)', () => {
      const lineItem = buildDoorLineItem({
        preset: mockEntryPreset,
        inksterBasePrice: 2000,
        formula: defaultFormula,
        quantity: 1,
        hardwareType: 'none',
      });

      const params: DoorCalculationParams = {
        lineItems: [lineItem],
        formula: defaultFormula,
        mode: 'installation',
        travelFeeType: 'none',
        customTravelFee: '0',
        showOutTownTravel: false,
        travelKm: '0',
        crewHours: '0',
        crewSize: '2',
        hstRate: 8, // First Nation Point-of-Sale
        logistics: defaultLogistics,
      };

      const totals = calculateDoorQuoteTotals(params);

      // Materials base = Base ($2000) - Discount ($200) + Surcharge ($160) + Misc ($30) = $1990
      // 5% GST on $1990 = $99.50
      // Labour = $250 -> 13% HST on $250 = $32.50
      // Total Tax = $99.50 + $32.50 = $132.00
      expect(totals.hstAmount).toBe(132);
      expect(totals.grandTotal).toBe(totals.subtotalPreTax + 132);
    });
  });
});
