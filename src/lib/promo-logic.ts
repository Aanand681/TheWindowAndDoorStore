export type WindowItem = {
  id: string;
  qty: number;
  base: number;
  argon: number;
  solar: number;
  triple: number;
  w?: string;
  h?: string;
  color?: string; // 'White' | 'Painted'
};

export type DBPromo = {
  _id: string;
  name: string;
  type: 'BOGO' | 'FREE_PARTS' | 'PERCENTAGE' | 'COMBO';
  isActive: boolean;
  buyQty?: number;
  getQty?: number;
  freeComponents?: string[];
  discountPercentage?: number;
  applyPercentageAfterFreeParts?: boolean;
  order?: number;
};

export const formatMoney = (cents: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
};

export const toCents = (val: number | string) => {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
};

export function parseInches(v: string | undefined | null): number | null {
  const s = String(v ?? '').trim().replace(/"/g, '');
  if (!s) return null;
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function getUnits(items: WindowItem[]) {
  const units: number[] = [];
  items.forEach((item) => {
    const one = item.base / item.qty;
    for (let i = 0; i < item.qty; i++) units.push(one);
  });
  return units;
}

function calcBOGO(prices: number[], buyQty: number, getQty: number) {
  const sorted = [...prices].sort((a, b) => a - b);
  let d = 0;
  let l = 0;
  let r = sorted.length - 1;
  const groupSize = buyQty + getQty;
  
  while (r - l + 1 >= groupSize) {
    let groupDiscount = 0;
    for(let i = 0; i < getQty; i++) {
      groupDiscount += sorted[l + i];
    }
    d += Math.round(groupDiscount * 50) / 100;
    l += getQty;
    r -= buyQty;
  }
  
  const restCount = r - l + 1;
  if (restCount > buyQty) {
    const freeQty = restCount - buyQty;
    let groupDiscount = 0;
    for(let i = 0; i < freeQty; i++) {
      groupDiscount += sorted[l + i];
    }
    d += Math.round(groupDiscount * 50) / 100;
  }
  
  return Math.round(d);
}

export function calculatePromo(
  promo: DBPromo | null,
  items: WindowItem[],
  surchargeRate: number
) {
  const base = items.reduce((a, x) => a + x.base, 0);
  const sur = Math.round((base * surchargeRate) / 100);
  
  let promoDiscount = 0;
  let text = 'No promotion applied.';
  let note = 'No promo: base, surcharge, and $0.00 promo discount carried into Tax calculation.';

  if (!promo) {
    return {
      promoId: 'none',
      promoName: 'No promo',
      promoDiscount: 0,
      text,
      note,
      final: base + sur,
      base,
      surcharge: sur,
    };
  }

  if (promo.type === 'BOGO' && promo.buyQty && promo.getQty) {
    const requiredMin = promo.buyQty + promo.getQty;
    const totalQty = items.reduce((a, x) => a + x.qty, 0);
    
    if (totalQty < requiredMin) {
      return {
        promoId: promo._id,
        promoName: promo.name,
        promoDiscount: 0,
        text: `Requires minimum ${requiredMin} windows to qualify for ${promo.name}.`,
        note: `BOGO disqualified. Minimum required: ${requiredMin}, actual: ${totalQty}.`,
        final: base + sur,
        base,
        surcharge: sur,
      };
    }

    promoDiscount = calcBOGO(getUnits(items), promo.buyQty, promo.getQty);
    text = `${promo.name} discount: ${formatMoney(promoDiscount)}.`;
    note = `${promo.name}: Tax calculation carries base ${formatMoney(base)}, surcharge ${formatMoney(sur)}, and promo discount ${formatMoney(promoDiscount)}.`;
  } 
  else if (promo.type === 'FREE_PARTS' && promo.freeComponents) {
    let partsSum = 0;
    items.forEach(item => {
      promo.freeComponents!.forEach(part => {
        // @ts-ignore
        if (item[part]) partsSum += item[part];
      });
    });
    promoDiscount = partsSum;
    text = `Free parts (${promo.freeComponents.join(', ')}): ${formatMoney(partsSum)} removed.`;
    note = `Free Parts promo: Tax calculation carries base ${formatMoney(base)}, surcharge ${formatMoney(sur)}, and promo discount ${formatMoney(promoDiscount)}.`;
  }
  else if (promo.type === 'PERCENTAGE' && promo.discountPercentage) {
    promoDiscount = Math.round(base * (promo.discountPercentage / 100));
    text = `${promo.discountPercentage}% off base price: ${formatMoney(promoDiscount)}.`;
    note = `Percentage promo: Tax calculation carries base ${formatMoney(base)}, surcharge ${formatMoney(sur)}, and promo discount ${formatMoney(promoDiscount)}.`;
  }
  else if (promo.type === 'COMBO' && promo.discountPercentage && promo.freeComponents) {
    let partsSum = 0;
    items.forEach(item => {
      promo.freeComponents!.forEach(part => {
        // @ts-ignore
        if (item[part]) partsSum += item[part];
      });
    });
    
    let percentDiscount = 0;
    if (promo.applyPercentageAfterFreeParts) {
      const remainingBase = Math.max(0, base - partsSum);
      percentDiscount = Math.round(remainingBase * (promo.discountPercentage / 100));
    } else {
      percentDiscount = Math.round(base * (promo.discountPercentage / 100));
    }
    
    promoDiscount = partsSum + percentDiscount;
    text = `Free parts (${promo.freeComponents.join(', ')}): ${formatMoney(partsSum)}; Plus ${promo.discountPercentage}% off: ${formatMoney(percentDiscount)}. Total discount: ${formatMoney(promoDiscount)}.`;
    note = `Combo promo: Tax calculation carries base ${formatMoney(base)}, surcharge ${formatMoney(sur)}, and full promo discount ${formatMoney(promoDiscount)}.`;
  }

  return {
    promoId: promo._id,
    promoName: promo.name,
    promoDiscount,
    text,
    note,
    final: base - promoDiscount + sur,
    base,
    surcharge: sur,
  };
}

export interface ILabourUpgradeTier {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  ratePercent: number;
  minFee: number;
  isAvailable: boolean;
  label?: string;
}

export const DEFAULT_LABOUR_UPGRADE_TIERS: ILabourUpgradeTier[] = [
  { id: 'tier_0', minAmount: 0, maxAmount: 3000, ratePercent: 0, minFee: 0, isAvailable: false, label: 'Not available below $3,000' },
  { id: 'tier_1', minAmount: 3000, maxAmount: 5000, ratePercent: 6, minFee: 260, isAvailable: true, label: '6% (minimum $260)' },
  { id: 'tier_2', minAmount: 5000, maxAmount: 7500, ratePercent: 7, minFee: 0, isAvailable: true, label: '7%' },
  { id: 'tier_3', minAmount: 7500, maxAmount: 10000, ratePercent: 8, minFee: 0, isAvailable: true, label: '8%' },
  { id: 'tier_4', minAmount: 10000, maxAmount: 15000, ratePercent: 8.5, minFee: 0, isAvailable: true, label: '8.5%' },
  { id: 'tier_5', minAmount: 15000, maxAmount: 20000, ratePercent: 9, minFee: 0, isAvailable: true, label: '9%' },
  { id: 'tier_6', minAmount: 20000, maxAmount: 25000, ratePercent: 10, minFee: 0, isAvailable: true, label: '10%' },
  { id: 'tier_7', minAmount: 25000, maxAmount: null, ratePercent: 11, minFee: 0, isAvailable: true, label: '11%' },
];

export function calculateUpgrade(afterDiscount: number, customTiers?: ILabourUpgradeTier[]) {
  if (customTiers && customTiers.length > 0) {
    const amountDollars = afterDiscount / 100;
    const tier = customTiers.find((t) => {
      const minOk = amountDollars >= t.minAmount;
      const maxOk = t.maxAmount === null || t.maxAmount === undefined || amountDollars < t.maxAmount;
      return minOk && maxOk;
    });

    if (tier) {
      if (!tier.isAvailable) {
        return {
          charge: 0,
          rate: tier.label || `Not available below $${tier.maxAmount?.toLocaleString() || '3,000'}`,
        };
      }
      const rawFee = (amountDollars * tier.ratePercent) / 100;
      const feeInDollars = Math.max(rawFee, tier.minFee || 0);
      const charge = Math.round(feeInDollars * 100);
      const rateLabel =
        tier.label ||
        (tier.minFee > 0
          ? `${tier.ratePercent}% (minimum $${tier.minFee})`
          : `${tier.ratePercent}%`);
      return { charge, rate: rateLabel };
    }
  }

  // Default fallback tiers if customTiers not passed
  if (afterDiscount < 300000) return { charge: 0, rate: 'Not available below $3,000' };
  if (afterDiscount < 500000) return { charge: Math.max(Math.round(afterDiscount * 0.06), 26000), rate: '6% (minimum $260)' };
  if (afterDiscount < 750000) return { charge: Math.round(afterDiscount * 0.07), rate: '7%' };
  if (afterDiscount < 1000000) return { charge: Math.round(afterDiscount * 0.08), rate: '8%' };
  if (afterDiscount < 1500000) return { charge: Math.round(afterDiscount * 0.085), rate: '8.5%' };
  if (afterDiscount < 2000000) return { charge: Math.round(afterDiscount * 0.09), rate: '9%' };
  if (afterDiscount < 2500000) return { charge: Math.round(afterDiscount * 0.10), rate: '10%' };
  return { charge: Math.round(afterDiscount * 0.11), rate: '11%' };
}
