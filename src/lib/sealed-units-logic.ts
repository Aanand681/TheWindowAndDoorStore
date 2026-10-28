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
    const squares = Math.max(0, config.squaresCount || 0);
    const gridRates = settings.gridRates || DEFAULT_GRILL_SETTINGS.gridRates;
    const rate = gridRates?.[profile]?.[color] ?? 5.50;
    const gridCost = squares * rate;

    const tIntersections = Math.max(0, config.tIntersectionsCount || 0);
    const tCost = tIntersections * (settings.tIntersectionPrice ?? 5.50);

    const bentHubs = Math.max(0, config.bentHubsCount || 0);
    const bentCost = bentHubs * (settings.bentHubPrice ?? 110.00);

    const total = gridCost + tCost + bentCost;
    const parts = [
      `${squares} sq @ $${rate.toFixed(2)} (${profile}, ${color})`,
      tIntersections > 0 ? `${tIntersections} T-conn` : null,
      bentHubs > 0 ? `${bentHubs} Bent Hubs` : null,
    ].filter(Boolean);

    return { rawCost: total, description: `Grid: ${parts.join(' + ')}` };
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

export interface CalculateSealedUnitParams {
  combo: ComboPricing;
  paneType: PaneType;
  widthIn: number;
  heightIn: number;
  quantity: number;
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
  rawPrice: number; // (rateWithArgon * billableSqft) + rawGrillCost
  surchargeAmount: number;
  subtotalAfterSurcharge: number;
  multipliedAmount: number;
  finalAddonAmount: number;
  finalUnitPrice: number;
  quantity: number;
  lineGlassTotal: number;
  // Installation & Labour per line item
  unitLabour: number; // max(minFee, billableSqft * labourRate)
  totalLabour: number;
  unitMisc: number; // billableSqft * miscRate
  totalMisc: number;
}

export function calculateSealedUnitItem(params: CalculateSealedUnitParams): SealedUnitLineItem {
  const formula = params.formula || DEFAULT_FORMULA_CONSTANTS;
  const breaks = params.thicknessBreaks || DEFAULT_THICKNESS_BREAKS;
  const labourSettings = params.labourSettings || DEFAULT_LABOUR_SETTINGS;

  const actualSqft = inchesToSqft(params.widthIn, params.heightIn);
  // User Rule: round up sq ft (e.g. 12.01 or 12.1 rounds to 13), with 4.0 sq ft min enforced
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

  const rateWithArgon = baseRate + formula.argonPerSqft;
  const rawGlassCost = rateWithArgon * billableSqft;
  // Raw grill cost is added to raw glass cost before 27% surcharge, 2.5 multiplier, and 8% final addon
  const rawPrice = rawGlassCost + rawGrillCost;
  const surchargeAmount = rawPrice * formula.surchargeRate;
  const subtotalAfterSurcharge = rawPrice + surchargeAmount;
  const multipliedAmount = subtotalAfterSurcharge * formula.stepMultiplier;
  const finalAddonAmount = multipliedAmount * formula.finalAddonRate;
  const finalUnitPrice = Math.round((multipliedAmount + finalAddonAmount) * 100) / 100;
  const lineGlassTotal = Math.round(finalUnitPrice * params.quantity * 100) / 100;

  // Installation labour calculation from Excel formula:
  // K6 = SUMIF(J6,"<120",120)+SUMIF(J6,">120",J6) where J6 = SqFt * 14.40
  const rawUnitLabour = billableSqft * labourSettings.labourRatePerSqft;
  const unitLabour = Math.max(rawUnitLabour, labourSettings.labourMinPerUnit);
  const totalLabour = Math.round(unitLabour * params.quantity * 100) / 100;

  // Misc supplies from Excel formula:
  // L6 = SqFt * 2.40
  const unitMisc = Math.round(billableSqft * labourSettings.miscRatePerSqft * 100) / 100;
  const totalMisc = Math.round(unitMisc * params.quantity * 100) / 100;

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
    rawPrice,
    surchargeAmount,
    subtotalAfterSurcharge,
    multipliedAmount,
    finalAddonAmount,
    finalUnitPrice,
    quantity: params.quantity,
    lineGlassTotal,
    unitLabour,
    totalLabour,
    unitMisc,
    totalMisc,
  };
}
