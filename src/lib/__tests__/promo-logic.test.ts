import { describe, it, expect } from 'vitest';
import {
  toCents,
  formatMoney,
  parseInches,
  calculatePromo,
  calculateUpgrade,
  DBPromo,
  WindowItem,
} from '../promo-logic';

describe('Promo Logic - Core Financial & Mathematical Engine', () => {
  describe('toCents & formatMoney', () => {
    it('should accurately convert numbers and decimal strings to integer cents without floating-point errors', () => {
      expect(toCents(19.99)).toBe(1999);
      expect(toCents('19.99')).toBe(1999);
      expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004 -> 30
      expect(toCents(1250.5)).toBe(125050);
      expect(toCents(0)).toBe(0);
    });

    it('should safely return 0 for negative, invalid, or NaN inputs', () => {
      expect(toCents(-10)).toBe(0);
      expect(toCents('invalid')).toBe(0);
      expect(toCents(NaN)).toBe(0);
    });

    it('should format cents into CAD currency string', () => {
      const formatted = formatMoney(1999);
      expect(formatted).toContain('19.99');
      expect(formatted).toContain('$');
    });
  });

  describe('parseInches', () => {
    it('should parse integers, decimals, and clean quotation marks', () => {
      expect(parseInches('36')).toBe(36);
      expect(parseInches('36.5')).toBe(36.5);
      expect(parseInches('48"')).toBe(48);
      expect(parseInches('  50.25"  ')).toBe(50.25);
    });

    it('should parse mixed fractions correctly', () => {
      expect(parseInches('36 1/2')).toBe(36.5);
      expect(parseInches('48 3/4"')).toBe(48.75);
      expect(parseInches('24 1/8')).toBe(24.125);
    });

    it('should parse pure fractions correctly', () => {
      expect(parseInches('1/2')).toBe(0.5);
      expect(parseInches('3/4')).toBe(0.75);
    });

    it('should return null for empty, undefined, or invalid inputs', () => {
      expect(parseInches('')).toBeNull();
      expect(parseInches(undefined)).toBeNull();
      expect(parseInches(null)).toBeNull();
      expect(parseInches('abc')).toBeNull();
      expect(parseInches('-5')).toBeNull();
    });
  });

  describe('calculatePromo', () => {
    const mockItems: WindowItem[] = [
      { id: '1', qty: 2, base: 200000, argon: 10000, solar: 5000, triple: 0 }, // 2 @ $1,000 base
      { id: '2', qty: 1, base: 150000, argon: 5000, solar: 0, triple: 0 }, // 1 @ $1,500 base
    ];
    // Total base = $3,500.00 (350,000 cents)

    it('should handle null promo with base and surcharge only', () => {
      const result = calculatePromo(null, mockItems, 8);
      expect(result.promoDiscount).toBe(0);
      expect(result.base).toBe(350000);
      // 8% surcharge on 350,000 = 28,000 cents ($280.00)
      expect(result.surcharge).toBe(28000);
      expect(result.final).toBe(378000);
    });

    it('should calculate PERCENTAGE discount correctly', () => {
      const promo: DBPromo = {
        _id: 'p_pct',
        name: '10% Fall Discount',
        type: 'PERCENTAGE',
        isActive: true,
        discountPercentage: 10,
      };

      const result = calculatePromo(promo, mockItems, 8);
      // 10% on 350,000 base = 35,000 cents
      expect(result.promoDiscount).toBe(35000);
      expect(result.final).toBe(350000 - 35000 + 28000);
    });

    it('should calculate FREE_PARTS discount by summing specified components', () => {
      const promo: DBPromo = {
        _id: 'p_parts',
        name: 'Free Argon & Solar',
        type: 'FREE_PARTS',
        isActive: true,
        freeComponents: ['argon', 'solar'],
      };

      const result = calculatePromo(promo, mockItems, 8);
      // Item 1 argon (10,000) + solar (5,000) + Item 2 argon (5,000) = 20,000 cents
      expect(result.promoDiscount).toBe(20000);
    });

    it('should disqualify BOGO if item quantity is below minimum requirement', () => {
      const bogoPromo: DBPromo = {
        _id: 'p_bogo',
        name: 'Buy 3 Get 1 50% Off',
        type: 'BOGO',
        isActive: true,
        buyQty: 3,
        getQty: 1,
      };

      // mockItems total qty = 3 (needs minimum 3 + 1 = 4)
      const result = calculatePromo(bogoPromo, mockItems, 8);
      expect(result.promoDiscount).toBe(0);
      expect(result.text).toContain('Requires minimum 4 windows');
    });

    it('should calculate BOGO 50% off lowest price when quantity qualifies', () => {
      const bogoPromo: DBPromo = {
        _id: 'p_bogo',
        name: 'Buy 2 Get 1 50% Off',
        type: 'BOGO',
        isActive: true,
        buyQty: 2,
        getQty: 1,
      };

      // mockItems: two units @ 100,000, one unit @ 150,000. Total qty = 3.
      // Qualifies! Lowest unit = 100,000. 50% discount = 50,000 cents ($500.00).
      const result = calculatePromo(bogoPromo, mockItems, 8);
      expect(result.promoDiscount).toBe(50000);
    });

    it('should calculate COMBO promo (free parts + percentage off remaining base)', () => {
      const comboPromo: DBPromo = {
        _id: 'p_combo',
        name: 'Super Combo Promo',
        type: 'COMBO',
        isActive: true,
        freeComponents: ['argon'],
        discountPercentage: 10,
        applyPercentageAfterFreeParts: true,
      };

      // Total base = 350,000 cents.
      // Free argon = 15,000 cents.
      // Remaining base = 350,000 - 15,000 = 335,000 cents.
      // 10% on 335,000 = 33,500 cents.
      // Total discount = 15,000 + 33,500 = 48,500 cents.
      const result = calculatePromo(comboPromo, mockItems, 8);
      expect(result.promoDiscount).toBe(48500);
    });
  });

  describe('calculateUpgrade', () => {
    it('should return not available for amounts below $3,000 (300,000 cents)', () => {
      const res = calculateUpgrade(250000);
      expect(res.charge).toBe(0);
      expect(res.rate).toContain('Not available');
    });

    it('should enforce minimum $260 fee in Tier 1 ($3,000 - $5,000)', () => {
      // $3,500 (350,000 cents) * 6% = $210 (21,000 cents), below $260 minimum
      const res = calculateUpgrade(350000);
      expect(res.charge).toBe(26000);
      expect(res.rate).toBe('6% (minimum $260)');
    });

    it('should calculate tier percentages for higher quote values', () => {
      // $6,000 (600,000 cents) -> Tier 2 (7%) = 42,000 cents ($420.00)
      const res2 = calculateUpgrade(600000);
      expect(res2.charge).toBe(42000);
      expect(res2.rate).toBe('7%');

      // $12,000 (1,200,000 cents) -> Tier 4 (8.5%) = 102,000 cents ($1,020.00)
      const res4 = calculateUpgrade(1200000);
      expect(res4.charge).toBe(102000);
      expect(res4.rate).toBe('8.5%');
    });
  });
});

