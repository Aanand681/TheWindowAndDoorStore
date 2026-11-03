import {
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  SealedUnitLineItem,
} from '@/lib/sealed-units-logic';

export interface SealedUnitCalculationParams {
  lineItems: SealedUnitLineItem[];
  sealedUnitMode: 'installation' | 'supply_only' | 'service_only';
  serviceSqftInput: string;
  serviceLabourRateInput: string;
  serviceMiscRateInput: string;
  travelFeeType: 'none' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  hstRate: number;
  labour: SealedUnitLabourSettings;
}

export interface SealedUnitTotalsResult {
  totalUnits: number;
  itemsSqft: number;
  totalBillableSqft: number;
  totalSqft: number;
  effectiveLabourRate: number;
  effectiveMiscRate: number;
  effectiveServiceSqft: number;
  glassBefore8PercentTotal: number;
  glass8PercentSurchargeTotal: number;
  glassSupplyTotal: number;
  unitLabourSum: number;
  serviceLabourTotal: number;
  baseSetupFee: number;
  additionalFarFee: number;
  vehicleTravelFee: number;
  crewTravelFee: number;
  totalAdditionalTravel: number;
  totalTravelAndSetup: number;
  combinedLabourTotal: number;
  miscTotal: number;
  subtotalPreTax: number;
  hstAmount: number;
  grandTotal: number;
}

/**
 * Calculates complete financial totals for Sealed Units in Installation, Supply Only, or Service Only mode.
 * Industry-standard modular function decoupled from UI components.
 */
export function calculateSealedUnitTotals(params: SealedUnitCalculationParams): SealedUnitTotalsResult {
  const {
    lineItems,
    sealedUnitMode,
    serviceSqftInput,
    serviceLabourRateInput,
    serviceMiscRateInput,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    hstRate,
    labour,
  } = params;

  const isInstallation = sealedUnitMode === 'installation';
  const isServiceOnly = sealedUnitMode === 'service_only';

  const totalUnits = lineItems.reduce((acc, item) => acc + item.quantity, 0);
  const itemsSqft = lineItems.reduce((acc, item) => acc + item.actualSqft * item.quantity, 0);
  const totalBillableSqft = lineItems.reduce((acc, item) => acc + item.billableSqft * item.quantity, 0);

  const effectiveLabourRate =
    serviceLabourRateInput !== ''
      ? parseFloat(serviceLabourRateInput) || 0
      : labour.labourRatePerSqft || 14.4;

  const effectiveMiscRate =
    serviceMiscRateInput !== ''
      ? parseFloat(serviceMiscRateInput) || 0
      : labour.miscRatePerSqft || 2.4;

  const effectiveServiceSqft =
    isServiceOnly && serviceSqftInput.trim() !== ''
      ? parseFloat(serviceSqftInput) || 0
      : itemsSqft;

  const totalSqft = isServiceOnly ? effectiveServiceSqft : itemsSqft;

  // Glass manufacturing base: $0.00 in Service Only
  const glassBefore8PercentTotal = isServiceOnly
    ? 0
    : lineItems.reduce((acc, item) => acc + item.multipliedTotal, 0);
  const glass8PercentSurchargeTotal = isServiceOnly
    ? 0
    : lineItems.reduce((acc, item) => acc + item.surcharge8PercentTotal, 0);
  const glassSupplyTotal = isServiceOnly
    ? 0
    : lineItems.reduce((acc, item) => acc + item.lineGlassTotal, 0);

  // Sqft-based Service Labour
  const serviceLabourTotal = isServiceOnly
    ? Math.round(effectiveServiceSqft * effectiveLabourRate * 100) / 100
    : 0;

  // Installation unit-based labour
  const unitLabourSum = isInstallation
    ? lineItems.reduce((acc, item) => acc + item.totalLabour, 0)
    : 0;

  // Misc / consumables
  const miscTotal = isInstallation
    ? lineItems.reduce((acc, item) => acc + item.totalMisc, 0)
    : isServiceOnly
    ? Math.round(effectiveServiceSqft * effectiveMiscRate * 100) / 100
    : 0;

  // Fixed Base Setup Fee: $140 for both Installation and Service Only (local standard)
  const appliesTravelAndSetup = isInstallation || isServiceOnly;
  const baseSetupFee = appliesTravelAndSetup ? labour.setupFeeDefault || 140.0 : 0;

  // Far Area Surcharges (Far Standard / Dryden / Sioux Lookout = $727.50, Far Small = $363.50, Custom)
  let additionalFarFee = 0;
  if (appliesTravelAndSetup) {
    if (travelFeeType === 'far_std') {
      additionalFarFee = labour.setupFeeFarStandard || 727.5;
    } else if (travelFeeType === 'far_small') {
      additionalFarFee = labour.setupFeeFarSmall || 363.5;
    } else if (travelFeeType === 'custom') {
      additionalFarFee = Math.max(0, Number(customTravelFee) || 0);
    }
  }

  // Out-of-town vehicle & crew travel (manual km & crew hours)
  let vehicleTravelFee = 0;
  let crewTravelFee = 0;
  if (appliesTravelAndSetup && showOutTownTravel) {
    const km = Number(travelKm) || 0;
    vehicleTravelFee = Math.round(km * (labour.vehicleRatePerKm || 0.98) * 100) / 100;

    const hrs = Number(crewHours) || 0;
    const hourlyRate =
      crewSize === '2' ? labour.crewHourly2Men || 150 : labour.crewHourly3Men || 200;
    crewTravelFee = Math.round(hrs * hourlyRate * 100) / 100;
  }

  const totalAdditionalTravel = additionalFarFee + vehicleTravelFee + crewTravelFee;
  const totalTravelAndSetup = appliesTravelAndSetup ? baseSetupFee + totalAdditionalTravel : 0;

  // Per user specification: For service only, travel charges roll under Labour
  const combinedLabourTotal = isInstallation
    ? unitLabourSum + totalTravelAndSetup
    : isServiceOnly
    ? serviceLabourTotal + totalTravelAndSetup
    : 0;

  const subtotalPreTax = isServiceOnly
    ? Math.round((combinedLabourTotal + miscTotal) * 100) / 100
    : Math.round((glassSupplyTotal + (isInstallation ? combinedLabourTotal + miscTotal : 0)) * 100) / 100;

  // Exact Tax: In Service Only, strictly 13% HST (no point-of-sale material rebate)
  let hstAmount = 0;
  if (isServiceOnly) {
    hstAmount = Math.round(subtotalPreTax * 0.13 * 100) / 100;
  } else if (hstRate === 13) {
    hstAmount = Math.round(subtotalPreTax * 0.13 * 100) / 100;
  } else if (hstRate === 8) {
    const materialAmount = glassSupplyTotal;
    const serviceAmount = isInstallation ? combinedLabourTotal + miscTotal : 0;
    const materialTax = Math.round(materialAmount * 0.05 * 100) / 100;
    const serviceTax = Math.round(serviceAmount * 0.13 * 100) / 100;
    hstAmount = Math.round((materialTax + serviceTax) * 100) / 100;
  } else {
    hstAmount = 0;
  }

  const grandTotal = Math.round((subtotalPreTax + hstAmount) * 100) / 100;

  return {
    totalUnits,
    itemsSqft,
    totalBillableSqft,
    totalSqft,
    effectiveLabourRate,
    effectiveMiscRate,
    effectiveServiceSqft,
    glassBefore8PercentTotal,
    glass8PercentSurchargeTotal,
    glassSupplyTotal,
    unitLabourSum,
    serviceLabourTotal,
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
