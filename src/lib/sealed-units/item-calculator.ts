import {
  GlassTreatment,
  PaneType,
  GlassShape,
  ShapeChargeResult,
  CalculateSealedUnitParams,
  SealedUnitLineItem,
} from './types';
import {
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_GRILL_SETTINGS,
  calculateGrillRawCost,
} from './grill-data';

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

export function calculateSealedUnitItem(params: CalculateSealedUnitParams): SealedUnitLineItem {
  const formula = params.formula || DEFAULT_FORMULA_CONSTANTS;
  const breaks = params.thicknessBreaks || DEFAULT_THICKNESS_BREAKS;
  const labourSettings = params.labourSettings || DEFAULT_LABOUR_SETTINGS;
  const shape = params.shape || 'rectangle';

  const actualSqft = inchesToSqft(params.widthIn, params.heightIn);
  const roundedSqft = Math.ceil(actualSqft);
  const billableSqft = Math.max(formula.minSqft || 4.0, roundedSqft);
  const linealFt = inchesToLinealFt(params.widthIn, params.heightIn);
  const thicknessMm = getThicknessForArea(billableSqft, breaks);

  const thicknessPrice = params.combo.prices[thicknessMm];
  if (!thicknessPrice) {
    throw new Error(`Pricing not available for ${thicknessMm}mm in combo: ${params.combo.name}`);
  }

  const baseRate = thicknessPrice[params.paneType];
  if (baseRate === null || baseRate === undefined) {
    throw new Error(
      `${params.paneType === 'triple' ? 'Triple' : 'Dual'} pane not available in ${thicknessMm}mm for ${params.combo.name}`
    );
  }

  // Rate + Argon (Argon is $0.60/sqft base)
  const rateWithArgon = baseRate + formula.argonPerSqft;
  const rawGlassCost = rateWithArgon * billableSqft;

  // Grill Cost Calculation
  const grillConfig = params.grill;
  const grillSettings = params.grillSettings || DEFAULT_GRILL_SETTINGS;
  const { rawCost: rawGrillCost, description: grillDescription } = calculateGrillRawCost(
    grillConfig,
    grillSettings
  );

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

  // Installation labour calculation from actual unrounded sq ft:
  const rawUnitLabour = actualSqft * labourSettings.labourRatePerSqft;
  const unitLabour = Math.max(rawUnitLabour, labourSettings.labourMinPerUnit ?? 120.0);
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

export function getSealedUnitServiceSummaryLabel(lineItems?: any[], _totalSqft?: number): string {
  const count =
    lineItems && lineItems.length > 0
      ? lineItems.reduce((acc, item) => acc + Math.max(1, Number(item.quantity) || 1), 0)
      : 1;
  return `${count} Sealed Unit Service`;
}
