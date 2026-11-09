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

export type GlassShape = 'rectangle' | 'rakehead_triangle' | 'roundtop_circle_octagon';

export interface ShapeChargeResult {
  rawCost: number;
  label: string;
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

export interface CalculateSealedUnitTotalsParams {
  lineItems: SealedUnitLineItem[];
  isInstallation?: boolean;
  travelFeeType?: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
  customTravelFee?: string | number;
  showOutTownTravel?: boolean;
  travelKm?: string | number;
  crewHours?: string | number;
  crewSize?: '2' | '3';
  hstRate?: number;
  labourSettings?: Partial<SealedUnitLabourSettings>;
}

