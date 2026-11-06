import { describe, it, expect } from 'vitest';
import { computeCombinedQuoteFinancials } from '../pricing-engine';

describe('Pricing Engine - computeCombinedQuoteFinancials', () => {
  it('should correctly calculate standalone window quote financials with 13% HST', () => {
    const result = computeCombinedQuoteFinancials({
      quoteResult: {
        base: 100000, // $1,000.00
        surcharge: 8000, // $80.00 (8%)
        promoDiscount: 0,
      },
      afterDiscount: 163000, // $1,630.00
      total: 184190, // $1,841.90 ($1,630 + 13% HST)
      effectiveJC: 20000, // $200.00
      effectiveMisc: 5000, // $50.00
      effectiveLabour: 30000, // $300.00
      hstRate: 13,
    });

    expect(result.combinedSubtotalCents).toBe(163000);
    expect(result.combinedTotalCents).toBe(184190);
    expect(result.subtotalDollars).toBe(1630);
    expect(result.grandTotalDollars).toBe(1841.9);
  });

  it('should correctly add attached door quote and deduct 10% non-storm door discount', () => {
    const result = computeCombinedQuoteFinancials({
      quoteResult: {
        base: 200000, // $2,000.00
        surcharge: 16000, // $160.00
        promoDiscount: 0,
      },
      attachedDoorQuote: {
        totals: {
          rawDoorBaseTotal: 1200, // $1,200.00
          stormDoorTotal: 0,
          hardwareTotal: 150, // $150.00
          discountTotal: 120, // $120.00 (10% discount on $1,200 base)
          surchargeTotal: 96, // $96.00 (8% surcharge on $1,200)
          combinedLabourTotal: 350, // $350.00
          miscTotal: 40, // $40.00
        },
      },
      effectiveJC: 10000, // $100.00
      effectiveMisc: 2000, // $20.00
      effectiveLabour: 50000, // $500.00
      hstRate: 13,
    });

    // Materials:
    // Window: 2,000.00
    // Door net base + hardware: (1,200 + 150 - 120) = 1,230.00 (123,000 cents)
    // JC: 100.00
    // Misc: Window 20.00 + Door 40.00 = 60.00 (6,000 cents)
    // Labour: Window 500.00 + Door 350.00 = 850.00 (85,000 cents)
    // Surcharge: Window 160.00 + Door 96.00 = 256.00 (25,600 cents)
    // Expected Subtotal = 2,000 + 1,230 + 100 + 60 + 850 + 256 = $4,496.00 (449,600 cents)
    expect(result.combinedSubtotalCents).toBe(449600);
    expect(result.doorMaterialsCents).toBe(123000);
    expect(result.combinedMiscCents).toBe(6000);
    expect(result.combinedLabourCents).toBe(85000);
    expect(result.combinedSurchargeCents).toBe(25600);

    // HST @ 13%: 449600 * 0.13 = 58448 cents ($584.48)
    expect(result.combinedTaxCents).toBe(58448);
    expect(result.combinedTotalCents).toBe(449600 + 58448);
  });

  it('should correctly separate pure glass and 8% surcharge for attached sealed unit', () => {
    const result = computeCombinedQuoteFinancials({
      quoteResult: {
        base: 100000,
        surcharge: 8000,
        promoDiscount: 0,
      },
      attachedSealedUnit: {
        totals: {
          glassBefore8PercentTotal: 500, // $500.00 pure glass base
          glass8PercentSurchargeTotal: 40, // $40.00 surcharge
          combinedLabourTotal: 150, // $150.00
          miscTotal: 25, // $25.00
        },
      },
      effectiveJC: 0,
      effectiveMisc: 1000,
      effectiveLabour: 20000,
      hstRate: 13,
    });

    expect(result.suGlassCents).toBe(50000);
    expect(result.suSurchargeCents).toBe(4000);
    expect(result.suLabourCents).toBe(15000);
    expect(result.suMiscCents).toBe(2500);

    // Subtotal: Window 1,000 + SU Glass 500 + Window Surcharge 80 + SU Surcharge 40 + Labour (200 + 150) + Misc (10 + 25)
    // 1000 + 500 + 80 + 40 + 350 + 35 = $2,005.00 (200,500 cents)
    expect(result.combinedSubtotalCents).toBe(200500);
  });

  it('should calculate First Nation Point-of-Sale Exemption (8% HST rate: 5% GST on materials, 13% on labour)', () => {
    const result = computeCombinedQuoteFinancials({
      quoteResult: {
        base: 100000, // $1,000.00 materials
        surcharge: 8000, // $80.00 materials surcharge
        promoDiscount: 0,
      },
      effectiveJC: 20000, // $200.00 materials
      effectiveMisc: 0,
      effectiveLabour: 50000, // $500.00 services
      hstRate: 8, // Triggers Point-of-Sale Exemption
    });

    // Subtotal = 100,000 + 8,000 + 20,000 + 50,000 = 178,000 cents ($1,780.00)
    expect(result.combinedSubtotalCents).toBe(178000);

    // Materials = 100,000 + 8,000 + 20,000 = 128,000 cents
    // GST on materials (5%) = 128,000 * 0.05 = 6,400 cents ($64.00)
    // Services = 50,000 cents
    // HST on services (13%) = 50,000 * 0.13 = 6,500 cents ($65.00)
    // Total Tax = 6,400 + 6,500 = 12,900 cents ($129.00)
    expect(result.combinedTaxCents).toBe(12900);
    expect(result.combinedTotalCents).toBe(178000 + 12900);
  });
});

