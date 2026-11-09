import {
  ThicknessBreak,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  SealedUnitGrillSettings,
  GrillItemConfig,
  GrillProfile,
} from './types';

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

