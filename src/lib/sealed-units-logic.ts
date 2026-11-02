export type GlassTreatment = 'annealed' | 'tempered';
export type PaneType = 'dual' | 'triple';

export interface ThicknessPrice {
  dual: number | null;
  triple: number | null;
}

export interface ComboPricing {
  id: string;
  name: string;
  treatment: GlassTreatment; // annealed | tempered
  prices: {
    [thicknessMm: number]: ThicknessPrice;
  };
}

export interface ThicknessBreak {
  upperBoundExclusive: number; // in sqft (e.g. 15, 30, 40, 50)
  thicknessMm: number; // 3, 4, 5, 6
}

export interface SealedUnitFormulaConstants {
  argonPerSqft: number; // default 0.60
  surchargeRate: number; // default 0.27 (27%)
  stepMultiplier: number; // default 2.5
  finalAddonRate: number; // default 0.08 (8%)
  minSqft: number; // default 4.0 sqft minimum charge
}

export interface SealedUnitLabourSettings {
  labourRatePerSqft: number; // default 14.40
  labourMinPerUnit: number; // default 120.00
  miscRatePerSqft: number; // default 2.40
  setupFeeDefault: number; // default 140.00
  setupFeeFarStandard: number; // default 727.50
  setupFeeFarSmall: number; // default 363.50
  vehicleRatePerKm: number; // default 0.98
  crewHourly2Men: number; // default 150
  crewHourly3Men: number; // default 200
}

export type GrillType = 'none' | 'grid' | '3_burst' | '5_burst' | 'customer_own';
export type GrillProfile = '5/8" x 1/4"' | '3/8" x 1/4"' | '8mm x 18mm Georgian';

export interface SealedUnitGrillSettings {
  gridRates: {
    [profile: string]: {
      [color: string]: number | null;
    };
  };
  burst3Rates: {
    white: number;
    brassPewter: number;
    brushedChrome: number;
    black: number;
  };
  burst5Rates: {
    white: number;
    brassPewter: number;
    brushedChrome: number;
    black: number;
  };
  tIntersectionPrice: number; // 5.50
  bentHubPrice: number; // 110.00
  customerOwnGrillPrice: number; // 33.00
}

export interface GrillItemConfig {
  type: GrillType;
  profile?: GrillProfile;
  color?: string;
  colsCount?: number;
  rowsCount?: number;
  squaresCount?: number;
  tIntersectionsCount?: number;
  bentHubsCount?: number;
}

export interface ISealedUnitSettingsData {
  combos: ComboPricing[];
  formula: SealedUnitFormulaConstants;
  labour: SealedUnitLabourSettings;
  thicknessBreaks: ThicknessBreak[];
  grills?: SealedUnitGrillSettings;
}

// Default Annealed & Tempered combinations from July 14, 2025 Vitro pricing sheets
export const DEFAULT_SEALED_UNIT_COMBOS: ComboPricing[] = [
  // --- ANNEALED ---
  {
    id: 'ann_clear',
    name: 'Clear',
    treatment: 'annealed',
    prices: {
      3: { dual: 10.65, triple: 17.27 },
      4: { dual: 12.78, triple: 20.28 },
      5: { dual: 13.19, triple: 20.89 },
      6: { dual: 13.42, triple: 22.01 },
    },
  },
  {
    id: 'ann_sungate_1',
    name: 'Vitro Sungate 400 - 1 Lite (Hardcoat)',
    treatment: 'annealed',
    prices: {
      3: { dual: 14.00, triple: 19.70 },
      4: { dual: 15.82, triple: 22.69 },
      5: { dual: 16.51, triple: 25.19 },
      6: { dual: 16.95, triple: 26.61 },
    },
  },
  {
    id: 'ann_sungate_2',
    name: 'Vitro Sungate 400 - 2 Lites',
    treatment: 'annealed',
    prices: {
      3: { dual: null, triple: 22.09 },
      4: { dual: null, triple: 25.63 },
      5: { dual: null, triple: 28.71 },
      6: { dual: null, triple: 30.57 },
    },
  },
  {
    id: 'ann_solarban60_1',
    name: 'Vitro Solarban 60 - 1 Lite (Softcoat)',
    treatment: 'annealed',
    prices: {
      3: { dual: 14.00, triple: 20.39 },
      4: { dual: 16.82, triple: 24.00 },
      5: { dual: 18.31, triple: 27.44 },
      6: { dual: 19.21, triple: 28.10 },
    },
  },
  {
    id: 'ann_solarban60_2',
    name: 'Vitro Solarban 60 - 2 Lites',
    treatment: 'annealed',
    prices: {
      3: { dual: null, triple: 24.22 },
      4: { dual: null, triple: 28.92 },
      5: { dual: null, triple: 31.71 },
      6: { dual: null, triple: 33.20 },
    },
  },
  {
    id: 'ann_solarban70_1',
    name: 'Vitro Solarban 70 - 1 Lite',
    treatment: 'annealed',
    prices: {
      3: { dual: 15.40, triple: 22.43 },
      4: { dual: null, triple: null },
      5: { dual: 20.14, triple: 30.18 },
      6: { dual: 21.13, triple: 30.91 },
    },
  },
  {
    id: 'ann_solarban70_2',
    name: 'Vitro Solarban 70 - 2 Lites',
    treatment: 'annealed',
    prices: {
      3: { dual: null, triple: 27.59 },
      4: { dual: null, triple: null },
      5: { dual: null, triple: 39.47 },
      6: { dual: null, triple: 39.81 },
    },
  },

  // --- TEMPERED ---
  {
    id: 'temp_clear',
    name: 'Clear (All Lites Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: 14.99, triple: 24.65 },
      4: { dual: 19.07, triple: 31.08 },
      5: { dual: 19.80, triple: 32.26 },
      6: { dual: 20.31, triple: 33.02 },
    },
  },
  {
    id: 'temp_solarban60_1',
    name: 'Vitro Solarban 60 - 1 Lite (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: 20.13, triple: 27.27 },
      4: { dual: 24.66, triple: 34.52 },
      5: { dual: 25.64, triple: 35.83 },
      6: { dual: 26.28, triple: 36.69 },
    },
  },
  {
    id: 'temp_solarban60_2',
    name: 'Vitro Solarban 60 - 2 Lites (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: null, triple: 30.64 },
      4: { dual: null, triple: 35.61 },
      5: { dual: null, triple: 38.22 },
      6: { dual: null, triple: 39.67 },
    },
  },
  {
    id: 'temp_solarban70_1',
    name: 'Vitro Solarban 70 - 1 Lite (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: 22.14, triple: 29.99 },
      4: { dual: null, triple: null },
      5: { dual: 28.20, triple: 39.41 },
      6: { dual: 28.91, triple: 40.37 },
    },
  },
  {
    id: 'temp_solarban70_2',
    name: 'Vitro Solarban 70 - 2 Lites (All Tempered)',
    treatment: 'tempered',
    prices: {
      3: { dual: null, triple: 35.35 },
      4: { dual: null, triple: null },
      5: { dual: null, triple: 46.56 },
      6: { dual: null, triple: 47.71 },
    },
  },
];

export const DEFAULT_THICKNESS_BREAKS: ThicknessBreak[] = [
  { upperBoundExclusive: 15, thicknessMm: 3 },
  { upperBoundExclusive: 30, thicknessMm: 4 },
  { upperBoundExclusive: 40, thicknessMm: 5 },
  { upperBoundExclusive: 50, thicknessMm: 6 },
];

export const DEFAULT_FORMULA_CONSTANTS: SealedUnitFormulaConstants = {
  argonPerSqft: 0.60,
  surchargeRate: 0.27,
  stepMultiplier: 2.5,
  finalAddonRate: 0.08,
  minSqft: 4.0,
};

export const DEFAULT_LABOUR_SETTINGS: SealedUnitLabourSettings = {
  labourRatePerSqft: 14.40,
  labourMinPerUnit: 120.00,
  miscRatePerSqft: 2.40,
  setupFeeDefault: 140.00,
  setupFeeFarStandard: 727.50,
  setupFeeFarSmall: 363.50,
  vehicleRatePerKm: 0.98,
  crewHourly2Men: 150,
  crewHourly3Men: 200,
};

export const DEFAULT_GRILL_SETTINGS: SealedUnitGrillSettings = {
  gridRates: {
    '5/8" x 1/4"': {
      White: 5.50,
      Brass: 6.50,
      Pewter: 6.50,
      'Brushed Chrome': 6.50,
      Black: 6.50,
      'Black/White': 11.00,
    },
    '3/8" x 1/4"': {
      White: 5.50,
      Brass: 6.50,
      Pewter: 6.50,
      'Brushed Chrome': 6.50,
      Black: 6.50,
      'Black/White': null,
    },
    '8mm x 18mm Georgian': {
      White: 5.50,
      Brass: null,
      Pewter: null,
      'Brushed Chrome': null,
      Black: null,
      'Black/White': null,
    },
  },
  burst3Rates: {
    white: 34.00,
    brassPewter: 48.00,
    brushedChrome: 53.00,
    black: 53.00,
  },
  burst5Rates: {
    white: 36.00,
    brassPewter: 64.00,
    brushedChrome: 64.00,
    black: 64.00,
  },
  tIntersectionPrice: 5.50,
  bentHubPrice: 110.00,
  customerOwnGrillPrice: 33.00,
};

export function calculateGrillRawCost(
  config: GrillItemConfig | undefined,
  settings: SealedUnitGrillSettings = DEFAULT_GRILL_SETTINGS
): { rawCost: number; description: string } {
  if (!config || config.type === 'none') {
    return { rawCost: 0, description: 'No Grills' };
  }

  if (config.type === 'customer_own') {
    const cost = settings.customerOwnGrillPrice ?? 33.00;
    return {
      rawCost: cost,
      description: `Customer's Own Grills ($${cost.toFixed(2)}/unit)`,
    };
  }

  if (config.type === '3_burst') {
    const bColor = config.color || 'white';
    const burstRates = settings.burst3Rates || DEFAULT_GRILL_SETTINGS.burst3Rates;
    let base = burstRates.white;
    let label = 'White';
    if (bColor === 'brassPewter') {
      base = burstRates.brassPewter;
      label = 'Brass or Pewter';
    } else if (bColor === 'brushedChrome') {
      base = burstRates.brushedChrome;
      label = 'Brushed Chrome';
    } else if (bColor === 'black') {
      base = burstRates.black;
      label = 'Black';
    }
    const bentHubs = Math.max(0, config.bentHubsCount || 0);
    const bentCost = bentHubs * (settings.bentHubPrice ?? 110.00);
    const total = base + bentCost;
    const desc = `3 Burst (${label})${bentHubs > 0 ? ` + ${bentHubs} Bent Hub(s)` : ''}`;
    return { rawCost: total, description: desc };
  }

  if (config.type === '5_burst') {
    const bColor = config.color || 'white';
    const burstRates = settings.burst5Rates || DEFAULT_GRILL_SETTINGS.burst5Rates;
    let base = burstRates.white;
    let label = 'White';
    if (bColor === 'brassPewter') {
      base = burstRates.brassPewter;
      label = 'Brass or Pewter';
    } else if (bColor === 'brushedChrome') {
      base = burstRates.brushedChrome;
      label = 'Brushed Chrome';
    } else if (bColor === 'black') {
      base = burstRates.black;
      label = 'Black';
    }
    const bentHubs = Math.max(0, config.bentHubsCount || 0);
    const bentCost = bentHubs * (settings.bentHubPrice ?? 110.00);
    const total = base + bentCost;
    const desc = `5 Burst (${label})${bentHubs > 0 ? ` + ${bentHubs} Bent Hub(s)` : ''}`;
    return { rawCost: total, description: desc };
  }

  if (config.type === 'grid') {
    const profile = (config.profile || '5/8" x 1/4"') as string;
    const color = config.color || 'White';
    const gridRates = settings.gridRates || DEFAULT_GRILL_SETTINGS.gridRates;
    const rate = gridRates?.[profile]?.[color] ?? 5.50;

    let squares = 0;
    let tIntersections = 0;
    let hasPattern = false;

    if (config.colsCount && config.rowsCount && config.colsCount > 0 && config.rowsCount > 0) {
      squares = config.colsCount * config.rowsCount;
      tIntersections = Math.max(0, config.colsCount - 1) * Math.max(0, config.rowsCount - 1);
      hasPattern = true;
    } else {
      squares = Math.max(0, config.squaresCount || 0);
      tIntersections = Math.max(0, config.tIntersectionsCount || 0);
    }

    // T-section price matches the selected color rate (e.g. White $5.50, Brass $6.50, Black/White $11.00)
    const tRate = rate;
    const gridCost = squares * rate;
    const tCost = tIntersections * tRate;

    const bentHubs = Math.max(0, config.bentHubsCount || 0);
    const bentCost = bentHubs * (settings.bentHubPrice ?? 110.00);

    const total = gridCost + tCost + bentCost;
    const patternPrefix = hasPattern ? `${config.colsCount}×${config.rowsCount} Grid: ` : 'Grid: ';
    const parts = [
      `${squares} sq @ $${rate.toFixed(2)} (${profile}, ${color})`,
      tIntersections > 0 ? `${tIntersections} T-conn @ $${tRate.toFixed(2)}` : null,
      bentHubs > 0 ? `${bentHubs} Bent Hubs` : null,
    ].filter(Boolean);

    return { rawCost: total, description: `${patternPrefix}${parts.join(' + ')}` };
  }

  return { rawCost: 0, description: 'No Grills' };
}

// Inches parser supporting fractions: 30 1/2, 3/4, or decimals: 30.5
export function parseInchesInput(raw: string | undefined | null, fieldLabel = 'dimension'): number {
  const text = String(raw ?? '').trim().replace(/"/g, '');
  if (!text) throw new Error(`Please enter ${fieldLabel}.`);

  const mixed = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = parseInt(mixed[1], 10);
    const num = parseInt(mixed[2], 10);
    const den = parseInt(mixed[3], 10);
    if (den === 0) throw new Error(`Invalid fraction in ${fieldLabel} (division by zero).`);
    return whole + num / den;
  }

  const frac = text.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    const num = parseInt(frac[1], 10);
    const den = parseInt(frac[2], 10);
    if (den === 0) throw new Error(`Invalid fraction in ${fieldLabel} (division by zero).`);
    return num / den;
  }

  const val = parseFloat(text);
  if (isNaN(val) || val <= 0) {
    throw new Error(`Could not parse ${fieldLabel}. Use formats like 30.5, 30 1/2, or 3/4.`);
  }
  return val;
}

export function inchesToSqft(widthIn: number, heightIn: number): number {
  return (widthIn * heightIn) / 144;
}

export function inchesToLinealFt(widthIn: number, heightIn: number): number {
  return (widthIn * 2 + heightIn * 2) / 12;
}

export function getThicknessForArea(area: number, breaks = DEFAULT_THICKNESS_BREAKS): number {
  for (const b of breaks) {
    if (area < b.upperBoundExclusive) return b.thicknessMm;
  }
  return 6; // Max ladder rule or flag manual quote above 50
}

export type GlassShape = 'rectangle' | 'rakehead_triangle' | 'roundtop_circle_octagon';

export interface ShapeChargeResult {
  rawCost: number;
  label: string;
}

export function calculateShapeRawCost(
  shape: GlassShape | undefined,
  treatment: GlassTreatment,
  paneType: PaneType,
  rawGlassCost: number
): ShapeChargeResult {
  if (!shape || shape === 'rectangle') {
    return { rawCost: 0, label: 'Standard Rectangle' };
  }

  if (treatment === 'annealed') {
    if (shape === 'rakehead_triangle') {
      const cost = paneType === 'triple' ? 40.0 : 20.0;
      return { rawCost: cost, label: `Rakehead / Triangle ($${cost.toFixed(2)}/unit)` };
    }
    if (shape === 'roundtop_circle_octagon') {
      const cost = paneType === 'triple' ? 50.0 : 30.0;
      return { rawCost: cost, label: `Roundtop / Circle / Octagon ($${cost.toFixed(2)}/unit)` };
    }
  } else {
    // Tempered: 10% or 20% of glass cost
    if (shape === 'rakehead_triangle') {
      const cost = Math.round(rawGlassCost * 0.10 * 100) / 100;
      return { rawCost: cost, label: `Rakehead / Triangle (10% of glass: $${cost.toFixed(2)})` };
    }
    if (shape === 'roundtop_circle_octagon') {
      const cost = Math.round(rawGlassCost * 0.20 * 100) / 100;
      return { rawCost: cost, label: `Roundtop / Circle / Octagon (20% of glass: $${cost.toFixed(2)})` };
    }
  }

  return { rawCost: 0, label: 'Standard Rectangle' };
}

export function getAvailableGrillColors(profile: GrillProfile): string[] {
  if (profile === '8mm x 18mm Georgian') {
    return ['White'];
  }
  if (profile === '3/8" x 1/4"') {
    return ['White', 'Brass', 'Pewter', 'Brushed Chrome', 'Black'];
  }
  // 5/8" x 1/4"
  return ['White', 'Brass', 'Pewter', 'Brushed Chrome', 'Black', 'Black/White'];
}

export interface CalculateSealedUnitParams {
  combo: ComboPricing;
  paneType: PaneType;
  widthIn: number;
  heightIn: number;
  quantity: number;
  shape?: GlassShape;
  formula?: SealedUnitFormulaConstants;
  thicknessBreaks?: ThicknessBreak[];
  labourSettings?: SealedUnitLabourSettings;
  grill?: GrillItemConfig;
  grillSettings?: SealedUnitGrillSettings;
}

export interface SealedUnitLineItem {
  id: string;
  combinationId: string;
  combinationName: string;
  treatment: GlassTreatment;
  paneType: PaneType;
  widthIn: number;
  heightIn: number;
  actualSqft: number;
  roundedSqft: number; // strict ceiling rounding: 12.01 -> 13
  billableSqft: number; // min 4.0 sqft enforced
  linealFt: number;
  thicknessMm: number;
  baseRate: number;
  rateWithArgon: number;
  rawGlassCost: number;
  rawGrillCost: number;
  grillDescription: string;
  grill?: GrillItemConfig;
  shape: GlassShape;
  rawShapeCost: number;
  shapeDescription: string;
  rawPrice: number; // (rateWithArgon * billableSqft) + rawGrillCost + rawShapeCost
  surchargeAmount: number;
  subtotalAfterSurcharge: number;
  multipliedAmount: number; // unit price BEFORE 8% surcharge
  surcharge8PercentAmount: number; // 8% surcharge amount per unit
  finalAddonAmount: number; // backward compatibility alias for 8% surcharge
  finalUnitPrice: number; // multipliedAmount + surcharge8PercentAmount
  quantity: number;
  lineGlassTotal: number;
  multipliedTotal: number; // multipliedAmount * quantity (before 8% surcharge)
  surcharge8PercentTotal: number; // 8% surcharge total
  finalAddonTotal: number; // backward compatibility alias for 8% surcharge total
  // Installation & Labour per line item (Calculated on ACTUAL unrounded sq ft)
  unitLabour: number; // max(minFee, actualSqft * labourRate)
  totalLabour: number;
  unitMisc: number; // actualSqft * miscRate
  totalMisc: number;
}

export function calculateSealedUnitItem(params: CalculateSealedUnitParams): SealedUnitLineItem {
  const formula = params.formula || DEFAULT_FORMULA_CONSTANTS;
  const breaks = params.thicknessBreaks || DEFAULT_THICKNESS_BREAKS;
  const labourSettings = params.labourSettings || DEFAULT_LABOUR_SETTINGS;
  const shape = params.shape || 'rectangle';

  const actualSqft = inchesToSqft(params.widthIn, params.heightIn);
  // User Rule: round up sq ft (e.g. 12.01 or 12.1 rounds to 13), with 4.0 sq ft min enforced for glass
  const roundedSqft = Math.ceil(actualSqft);
  const billableSqft = Math.max(formula.minSqft || 4.0, roundedSqft);
  const linealFt = inchesToLinealFt(params.widthIn, params.heightIn);

  let thicknessMm = getThicknessForArea(actualSqft, breaks);

  const getPrice = (t: number) => {
    const p = params.combo.prices as any;
    return p?.[t] ?? p?.[String(t)] ?? null;
  };

  // Check if thickness is available for this combo, if not step up (e.g. Solarban 70 has no 4mm, uses 5mm)
  let tPrice = getPrice(thicknessMm);
  if (!tPrice || tPrice[params.paneType] === null || tPrice[params.paneType] === undefined) {
    if (thicknessMm === 4 && getPrice(5)?.[params.paneType] != null) {
      thicknessMm = 5;
      tPrice = getPrice(5);
    } else if (getPrice(6)?.[params.paneType] != null) {
      thicknessMm = 6;
      tPrice = getPrice(6);
    } else if (getPrice(3)?.[params.paneType] != null) {
      thicknessMm = 3;
      tPrice = getPrice(3);
    }
  }

  const baseRate = tPrice?.[params.paneType];
  if (baseRate === null || baseRate === undefined) {
    throw new Error(
      `'${params.combo.name}' has no listed price for ${params.paneType.toUpperCase()} at ${thicknessMm}mm.`
    );
  }

  // Grill Cost Calculation
  const { rawCost: rawGrillCost, description: grillDescription } = calculateGrillRawCost(
    params.grill,
    params.grillSettings
  );

  // Argon is added directly to base price per sqft (e.g. 19.70 + 0.60 = 20.30)
  const rateWithArgon = baseRate + formula.argonPerSqft;
  const rawGlassCost = rateWithArgon * billableSqft;

  // Shape Charge Calculation (Flat fee on Annealed or % on Tempered)
  const { rawCost: rawShapeCost, label: shapeDescription } = calculateShapeRawCost(
    shape,
    params.combo.treatment,
    params.paneType,
    rawGlassCost
  );

  // Raw costs combined before 27% surcharge, 2.5 multiplier, and 8% surcharge
  const rawPrice = rawGlassCost + rawGrillCost + rawShapeCost;
  const surchargeAmount = rawPrice * formula.surchargeRate;
  const subtotalAfterSurcharge = rawPrice + surchargeAmount;
  const multipliedAmount = subtotalAfterSurcharge * formula.stepMultiplier;
  const surcharge8PercentAmount = multipliedAmount * formula.finalAddonRate;
  const finalAddonAmount = surcharge8PercentAmount;
  const finalUnitPrice = Math.round((multipliedAmount + surcharge8PercentAmount) * 100) / 100;
  const lineGlassTotal = Math.round(finalUnitPrice * params.quantity * 100) / 100;

  // Installation labour calculation from actual unrounded sq ft (User Rule: take actual, do not round):
  const rawUnitLabour = actualSqft * labourSettings.labourRatePerSqft;
  const unitLabour = Math.max(rawUnitLabour, labourSettings.labourMinPerUnit);
  const totalLabour = Math.round(unitLabour * params.quantity * 100) / 100;

  // Misc supplies from actual unrounded sq ft:
  const unitMisc = Math.round(actualSqft * labourSettings.miscRatePerSqft * 100) / 100;
  const totalMisc = Math.round(unitMisc * params.quantity * 100) / 100;
  const multipliedTotal = Math.round(multipliedAmount * params.quantity * 100) / 100;
  const surcharge8PercentTotal = Math.round(surcharge8PercentAmount * params.quantity * 100) / 100;
  const finalAddonTotal = surcharge8PercentTotal;

  return {
    id: `su_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    combinationId: params.combo.id,
    combinationName: params.combo.name,
    treatment: params.combo.treatment,
    paneType: params.paneType,
    widthIn: params.widthIn,
    heightIn: params.heightIn,
    actualSqft,
    roundedSqft,
    billableSqft,
    linealFt,
    thicknessMm,
    baseRate,
    rateWithArgon,
    rawGlassCost,
    rawGrillCost,
    grillDescription,
    grill: params.grill,
    shape,
    rawShapeCost,
    shapeDescription,
    rawPrice,
    surchargeAmount,
    subtotalAfterSurcharge,
    multipliedAmount,
    surcharge8PercentAmount,
    finalAddonAmount,
    finalUnitPrice,
    quantity: params.quantity,
    lineGlassTotal,
    multipliedTotal,
    surcharge8PercentTotal,
    finalAddonTotal,
    unitLabour,
    totalLabour,
    unitMisc,
    totalMisc,
  };
}

/**
 * Generates unified single-sentence summary of sealed units
 * Examples:
 * - "4 dual pane SU with grills and 2 triple pane SU without grills"
 * - "4 triple pane SU with grills and 2 dual pane SU without grills"
 * - "4 dual pane SU without grills and 2 triple pane SU with grills"
 */
export function formatSealedUnitSummarySentence(lineItems: SealedUnitLineItem[]): string {
  if (!lineItems || lineItems.length === 0) return 'Sealed Units';

  let dWithGrills = 0;
  let dNoGrills = 0;
  let tWithGrills = 0;
  let tNoGrills = 0;

  lineItems.forEach((item) => {
    const q = Math.max(1, Number(item.quantity) || 1);
    const hasG = Number(item.rawGrillCost) > 0;
    if (item.paneType === 'triple') {
      if (hasG) tWithGrills += q;
      else tNoGrills += q;
    } else {
      if (hasG) dWithGrills += q;
      else dNoGrills += q;
    }
  });

  interface PartGroup {
    text: string;
    count: number;
    hasGrills: boolean;
  }

  const groups: PartGroup[] = [];

  if (dWithGrills > 0) {
    groups.push({
      text: `${dWithGrills} dual pane SU with grills`,
      count: dWithGrills,
      hasGrills: true,
    });
  }
  if (dNoGrills > 0) {
    groups.push({
      text: `${dNoGrills} dual pane SU without grills`,
      count: dNoGrills,
      hasGrills: false,
    });
  }
  if (tWithGrills > 0) {
    groups.push({
      text: `${tWithGrills} triple pane SU with grills`,
      count: tWithGrills,
      hasGrills: true,
    });
  }
  if (tNoGrills > 0) {
    groups.push({
      text: `${tNoGrills} triple pane SU without grills`,
      count: tNoGrills,
      hasGrills: false,
    });
  }

  if (groups.length === 0) return 'Sealed Units';

  // Sort groups: primary by count descending (so 4 comes before 2), secondary by hasGrills descending
  groups.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return (b.hasGrills ? 1 : 0) - (a.hasGrills ? 1 : 0);
  });

  const texts = groups.map((g) => g.text);
  if (texts.length === 1) return texts[0];
  if (texts.length === 2) return `${texts[0]} and ${texts[1]}`;
  return texts.slice(0, -1).join(', ') + ' and ' + texts[texts.length - 1];
}

export interface CalculateSealedUnitTotalsParams {
  lineItems: SealedUnitLineItem[];
  isInstallation?: boolean;
  travelFeeType?: 'none' | 'far_std' | 'far_small' | 'custom';
  customTravelFee?: string | number;
  showOutTownTravel?: boolean;
  travelKm?: string | number;
  crewHours?: string | number;
  crewSize?: '2' | '3';
  hstRate?: number;
  labourSettings?: Partial<SealedUnitLabourSettings>;
}

export function calculateSealedUnitTotals({
  lineItems,
  isInstallation = false,
  travelFeeType = 'none',
  customTravelFee = 0,
  showOutTownTravel = false,
  travelKm = 0,
  crewHours = 0,
  crewSize = '2',
  hstRate = 13,
  labourSettings,
}: CalculateSealedUnitTotalsParams) {
  const labour = { ...DEFAULT_LABOUR_SETTINGS, ...labourSettings };
  const totalUnits = lineItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const totalSqft = lineItems.reduce((acc, item) => acc + (Number(item.actualSqft) || 0) * (Number(item.quantity) || 1), 0);
  const totalBillableSqft = lineItems.reduce((acc, item) => acc + (Number(item.billableSqft) || 0) * (Number(item.quantity) || 1), 0);

  const glassBefore8PercentTotal = lineItems.reduce((acc, item) => acc + (Number(item.multipliedTotal) || 0), 0);
  const glass8PercentSurchargeTotal = lineItems.reduce((acc, item) => acc + (Number(item.surcharge8PercentTotal) || 0), 0);
  const glassSupplyTotal = lineItems.reduce((acc, item) => acc + (Number(item.lineGlassTotal) || 0), 0);

  const unitLabourSum = isInstallation
    ? lineItems.reduce((acc, item) => acc + (Number(item.totalLabour) || 0), 0)
    : 0;

  const miscTotal = isInstallation
    ? lineItems.reduce((acc, item) => acc + (Number(item.totalMisc) || 0), 0)
    : 0;

  const baseSetupFee = isInstallation ? (labour.setupFeeDefault || 140.0) : 0;

  let additionalFarFee = 0;
  if (isInstallation) {
    if (travelFeeType === 'far_std') {
      additionalFarFee = labour.setupFeeFarStandard || 727.5;
    } else if (travelFeeType === 'far_small') {
      additionalFarFee = labour.setupFeeFarSmall || 363.5;
    } else if (travelFeeType === 'custom') {
      additionalFarFee = Math.max(0, Number(customTravelFee) || 0);
    }
  }

  let vehicleTravelFee = 0;
  let crewTravelFee = 0;
  if (isInstallation && showOutTownTravel) {
    const km = Number(travelKm) || 0;
    vehicleTravelFee = Math.round(km * (labour.vehicleRatePerKm || 0.98) * 100) / 100;

    const hrs = Number(crewHours) || 0;
    const hourlyRate = crewSize === '2' ? (labour.crewHourly2Men || 150) : (labour.crewHourly3Men || 200);
    crewTravelFee = Math.round(hrs * hourlyRate * 100) / 100;
  }

  const totalAdditionalTravel = additionalFarFee + vehicleTravelFee + crewTravelFee;
  const totalTravelAndSetup = isInstallation ? (baseSetupFee + totalAdditionalTravel) : 0;
  const combinedLabourTotal = isInstallation ? (unitLabourSum + totalTravelAndSetup) : 0;

  const subtotalPreTax = glassSupplyTotal + (isInstallation ? (combinedLabourTotal + miscTotal) : 0);

  let hstAmount = 0;
  if (hstRate === 13) {
    hstAmount = Math.round(subtotalPreTax * 0.13 * 100) / 100;
  } else if (hstRate === 8) {
    const materialAmount = glassSupplyTotal;
    const serviceAmount = isInstallation ? (combinedLabourTotal + miscTotal) : 0;
    const materialTax = Math.round(materialAmount * 0.05 * 100) / 100;
    const serviceTax = Math.round(serviceAmount * 0.13 * 100) / 100;
    hstAmount = Math.round((materialTax + serviceTax) * 100) / 100;
  } else {
    hstAmount = 0;
  }

  const grandTotal = Math.round((subtotalPreTax + hstAmount) * 100) / 100;

  return {
    totalUnits,
    totalSqft,
    totalBillableSqft,
    glassBefore8PercentTotal,
    glass8PercentSurchargeTotal,
    glassSupplyTotal,
    unitLabourSum,
    baseSetupFee,
    additionalFarFee,
    vehicleTravelFee,
    crewTravelFee,
    totalAdditionalTravel,
    totalTravelAndSetup,
    combinedLabourTotal,
    miscTotal,
    subtotalPreTax,
    hstAmount,
    grandTotal,
  };
}



