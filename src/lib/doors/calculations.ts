import {
  DoorLineItem,
  DoorPreset,
  DoorUpchargeConfig,
  DoorSelectedUpcharge,
  DoorHardwareType,
  DoorCategory,
  DoorCalculationParams,
  DoorQuoteTotals,
  DoorFormulaSettings,
  DoorUpgradeOption,
} from './types';

/**
 * Computes a single door line item with Inkster price, 8% surcharge, 10% discount,
 * hardware, unit labour, and selected upcharges.
 */
export function buildDoorLineItem(params: {
  id?: string;
  preset: DoorPreset;
  customDescription?: string;
  category?: DoorCategory;
  inksterBasePrice: number;
  widthIn?: number;
  heightIn?: number;
  quantity?: number;
  formula: DoorFormulaSettings;
  hardwareType?: DoorHardwareType;
  customHardwareName?: string;
  customHardwarePrice?: number;
  upcharges?: DoorSelectedUpcharge[];
  upgradeOption?: DoorUpgradeOption;
  notes?: string;
}): DoorLineItem {
  const {
    id = `door_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    preset,
    customDescription,
    category = preset.category,
    inksterBasePrice,
    widthIn,
    heightIn,
    quantity = 1,
    formula,
    hardwareType = 'none',
    customHardwareName,
    customHardwarePrice,
    upcharges = [],
    upgradeOption,
    notes = '',
  } = params;

  const validQty = Math.max(1, Number(quantity) || 1);
  const basePrice = Math.max(0, Number(inksterBasePrice) || 0);
  const surchargeRate = Number(formula.surchargeRate) || 8;

  // Surcharge (8% default) is kept completely separate on top of basePrice
  const surchargeAmount = Math.round(basePrice * (surchargeRate / 100) * 100) / 100;
  const priceWithSurcharge = basePrice + surchargeAmount;

  // Discount rule: 10% discount applies to Entry, Patio, Garden, and other doors.
  // STORM DOORS ARE STRICTLY 0% DISCOUNT (Exempt from door discount).
  const isStorm = category === 'storm';
  const discountPercent = isStorm ? 0 : Number(formula.doorDiscountPercent) || 10;
  // 10% discount applies strictly to clean base price
  const discountAmount = Math.round(basePrice * (discountPercent / 100) * 100) / 100;
  const netDoorPrice = Math.round((basePrice - discountAmount) * 100) / 100;

  // Hardware Price (Standard $158.00 materials, Customer Supplied $80.00 labour, Custom, None $0.00)
  let hardwarePrice = 0;
  let customerHardwareFee = 0;
  if (hardwareType === 'custom') {
    hardwarePrice = Math.max(0, Number(customHardwarePrice) || 0);
  } else if (hardwareType === 'standard') {
    hardwarePrice = Number(formula.locksetDeadboltPrice) || 158.0;
  } else if (hardwareType === 'customer_supplied') {
    hardwarePrice = 0; // Customer provides materials ($0.00 supply)
    customerHardwareFee = Number(formula.customerSuppliedHardwareFee) || 80.0; // Reinstallation fee is pure labour
  } else if (customHardwarePrice !== undefined) {
    hardwarePrice = Math.max(0, Number(customHardwarePrice) || 0);
  }

  // Upcharges calculation
  const calculatedUpcharges: DoorSelectedUpcharge[] = upcharges.map((up) => {
    const qty = Math.max(0, Number(up.qty) || 0);
    const rate = Math.max(0, Number(up.rate) || 0);
    return {
      ...up,
      qty,
      rate,
      total: Math.round(qty * rate * 100) / 100,
    };
  });
  const upchargesTotal = calculatedUpcharges.reduce((acc, u) => acc + u.total, 0);

  // Line calculations: customerHardwareFee is factored into unitLabour
  const unitLabour = Math.max(0, Number(preset.labour) || 0) + customerHardwareFee;
  const unitMisc = Math.max(0, Number(preset.misc) || 0);

  // Line door supply total is purely basePrice * quantity (clean base price entered)
  const lineDoorSupplyTotal = Math.round(basePrice * validQty * 100) / 100;
  const lineLabourTotal = Math.round((unitLabour + upchargesTotal) * validQty * 100) / 100;
  const lineMiscTotal = Math.round(unitMisc * validQty * 100) / 100;
  const lineHardwareTotal = Math.round(hardwarePrice * validQty * 100) / 100;
  const lineSupplyTotal =
    Math.round(
      (lineDoorSupplyTotal +
        surchargeAmount * validQty -
        discountAmount * validQty +
        lineHardwareTotal) *
        100
    ) / 100;
  const lineGrandTotal =
    Math.round(
      (lineDoorSupplyTotal +
        surchargeAmount * validQty -
        discountAmount * validQty +
        lineLabourTotal +
        lineMiscTotal +
        lineHardwareTotal) *
        100
    ) / 100;

  return {
    id,
    presetId: preset.id,
    presetLabel: preset.label,
    category,
    customDescription: customDescription || preset.label,
    widthIn,
    heightIn,
    inksterBasePrice: basePrice,
    surchargePercent: surchargeRate,
    surchargeAmount,
    priceWithSurcharge,
    discountPercent,
    discountAmount,
    netDoorPrice,
    quantity: validQty,
    unitLabour,
    unitMisc,
    hardwareType,
    hardwarePrice,
    customerHardwareFee,
    customHardwareName,
    customHardwarePrice,
    upcharges: calculatedUpcharges,
    upchargesTotal,
    lineDoorSupplyTotal,
    lineLabourTotal,
    lineMiscTotal,
    lineHardwareTotal,
    lineSupplyTotal,
    lineGrandTotal,
    upgradeOption,
    notes,
  };
}

/**
 * Computes complete financial totals for a Door Quote, supporting Supply Only,
 * Supply & Installation, and Office Reference modes with exact spreadsheet math.
 */
export function calculateDoorQuoteTotals(params: DoorCalculationParams): DoorQuoteTotals {
  const {
    lineItems,
    mode,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    hstRate,
    logistics,
  } = params;

  const isInstallation = mode === 'installation';
  const isSupplyOnly = mode === 'supply_only';

  let totalDoors = 0;
  let totalStormDoors = 0;
  let rawDoorBaseTotal = 0;
  let surchargeTotal = 0;
  let doorWithSurchargeTotal = 0;
  let discountTotal = 0;
  let netDoorSupplyTotal = 0;
  let stormDoorTotal = 0;
  let hardwareTotal = 0;
  let unitLabourTotal = 0;
  let upchargesTotal = 0;
  let miscTotal = 0;

  lineItems.forEach((item) => {
    const q = item.quantity;
    const itemBaseTotal = item.inksterBasePrice * q;
    const itemSurchargeTotal = item.surchargeAmount * q;

    if (item.category === 'storm') {
      totalStormDoors += q;
      stormDoorTotal += itemBaseTotal;
    } else {
      totalDoors += q;
      rawDoorBaseTotal += itemBaseTotal;
      discountTotal += item.discountAmount * q;
    }

    surchargeTotal += itemSurchargeTotal;
    doorWithSurchargeTotal += itemBaseTotal + itemSurchargeTotal;
    netDoorSupplyTotal += itemBaseTotal;
    hardwareTotal += item.lineHardwareTotal;

    if (!isSupplyOnly) {
      unitLabourTotal += item.unitLabour * q;
      upchargesTotal += item.upchargesTotal * q;
      miscTotal += item.lineMiscTotal;
    }
  });

  const totalUnits = totalDoors + totalStormDoors;

  // Travel & Setup Logistics (Only apply when installation is active and at least 1 unit exists)
  let baseSetupFee = 0;
  let additionalFarFee = 0;
  let vehicleTravelFee = 0;
  let crewTravelFee = 0;

  if (isInstallation && totalUnits > 0 && travelFeeType !== 'none') {
    // Local setup fee default ($140.00)
    baseSetupFee = logistics.setupFeeDefault || 140.0;

    // Far area setup (Dryden / Sioux Lookout $727.50, Small $363.50, or Custom)
    if (travelFeeType === 'far_std') {
      additionalFarFee = logistics.setupFeeFarStandard || 727.5;
    } else if (travelFeeType === 'far_small') {
      additionalFarFee = logistics.setupFeeFarSmall || 363.5;
    } else if (travelFeeType === 'custom') {
      additionalFarFee = Math.max(0, Number(customTravelFee) || 0);
    }

    // Out of town vehicle and crew travel
    if (showOutTownTravel) {
      const km = Number(travelKm) || 0;
      vehicleTravelFee = Math.round(km * (logistics.vehicleRatePerKm || 0.98) * 100) / 100;

      const hrs = Number(crewHours) || 0;
      const hourlyRate =
        crewSize === '2' ? logistics.crewHourly2Men || 150 : logistics.crewHourly3Men || 200;
      crewTravelFee = Math.round(hrs * hourlyRate * 100) / 100;
    }
  }

  const totalAdditionalTravel = additionalFarFee + vehicleTravelFee + crewTravelFee;
  const totalTravelAndSetup = baseSetupFee + totalAdditionalTravel;

  // Global jobsite upcharges applied once for the entire quote
  const globalUpchargesTotal =
    isInstallation && Array.isArray(params.globalUpcharges)
      ? params.globalUpcharges.reduce((acc, u) => acc + (u.total || 0), 0)
      : 0;
  const combinedUpchargesTotal = Math.round((upchargesTotal + globalUpchargesTotal) * 100) / 100;

  // Combined Labour = Unit labour + Jobsite upcharges + Travel & Setup
  const combinedLabourTotal = isInstallation
    ? Math.round((unitLabourTotal + combinedUpchargesTotal + totalTravelAndSetup) * 100) / 100
    : 0;

  // In Supply Only: zero out misc, labour, travel
  if (isSupplyOnly) {
    miscTotal = 0;
  }

  // Pre-tax Subtotal: Clean Door Base Total - Door Discount + Surcharge + Labour + Misc + Hardware
  const totalDoorBase = rawDoorBaseTotal + stormDoorTotal;
  const subtotalPreTax = Math.round(
    (totalDoorBase -
      discountTotal +
      surchargeTotal +
      (isInstallation ? combinedLabourTotal + miscTotal : 0) +
      hardwareTotal) *
    100
  ) / 100;

  // Taxes: First Nations 8% exemption vs standard 13% HST
  const isFN = Boolean(params.isFirstNation || hstRate === 8 || hstRate === 0.05);
  let hstAmount = 0;
  if (isFN) {
    // 8% First Nations Material Exemption:
    // Materials (Door Base - Discount + Surcharge + Hardware + Misc) pay 5% GST (8% PST rebate)
    // Installation Labour pays standard 13% HST
    const materialsBase = (totalDoorBase - discountTotal + surchargeTotal) + hardwareTotal + (isInstallation ? miscTotal : 0);
    const materialTax = Math.round(materialsBase * 0.05 * 100) / 100;
    const labourTax = isInstallation ? Math.round(combinedLabourTotal * 0.13 * 100) / 100 : 0;
    hstAmount = Math.round((materialTax + labourTax) * 100) / 100;
  } else {
    // Standard 13% HST
    hstAmount = Math.round(subtotalPreTax * 0.13 * 100) / 100;
  }

  const grandTotal = Math.round((subtotalPreTax + hstAmount) * 100) / 100;

  return {
    totalDoors,
    totalStormDoors,
    totalUnits,
    rawDoorBaseTotal: Math.round(rawDoorBaseTotal * 100) / 100,
    surchargeTotal: Math.round(surchargeTotal * 100) / 100,
    doorWithSurchargeTotal: Math.round(doorWithSurchargeTotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    netDoorSupplyTotal: Math.round(netDoorSupplyTotal * 100) / 100,
    stormDoorTotal: Math.round(stormDoorTotal * 100) / 100,
    hardwareTotal: Math.round(hardwareTotal * 100) / 100,
    unitLabourTotal: Math.round(unitLabourTotal * 100) / 100,
    upchargesTotal: combinedUpchargesTotal,
    baseSetupFee: Math.round(baseSetupFee * 100) / 100,
    additionalFarFee: Math.round(additionalFarFee * 100) / 100,
    vehicleTravelFee: Math.round(vehicleTravelFee * 100) / 100,
    crewTravelFee: Math.round(crewTravelFee * 100) / 100,
    totalAdditionalTravel: Math.round(totalAdditionalTravel * 100) / 100,
    totalTravelAndSetup: Math.round(totalTravelAndSetup * 100) / 100,
    combinedLabourTotal,
    miscTotal: Math.round(miscTotal * 100) / 100,
    subtotalPreTax,
    hstAmount,
    grandTotal,
    depositAmount: Math.round(grandTotal * 0.5 * 100) / 100,
  };
}

/**
 * Calculates price differences between a base door and an alternative upgrade option
 * (e.g. dual pane vs triple pane, or standard finish vs custom tint/color).
 */
export function calculateDoorUpgradeDifference(
  baseInksterPrice: number,
  optionInksterPrice: number,
  category: DoorCategory,
  surchargePercent: number,
  doorDiscountPercent: number,
  hstRate: number = 0.13
): {
  baseNetPrice: number;
  optionNetPrice: number;
  subtotalDifference: number;
  taxDifference: number;
  totalDifference: number;
} {
  const isStorm = category === 'storm';
  const effectiveDiscount = isStorm ? 0 : doorDiscountPercent;

  const baseSurcharge = Math.round(baseInksterPrice * (surchargePercent / 100) * 100) / 100;
  const baseWithSurcharge = Math.round((baseInksterPrice + baseSurcharge) * 100) / 100;
  const baseDiscount = Math.round(baseWithSurcharge * (effectiveDiscount / 100) * 100) / 100;
  const baseNetPrice = Math.round((baseWithSurcharge - baseDiscount) * 100) / 100;

  const optionSurcharge = Math.round(optionInksterPrice * (surchargePercent / 100) * 100) / 100;
  const optionWithSurcharge = Math.round((optionInksterPrice + optionSurcharge) * 100) / 100;
  const optionDiscount = Math.round(optionWithSurcharge * (effectiveDiscount / 100) * 100) / 100;
  const optionNetPrice = Math.round((optionWithSurcharge - optionDiscount) * 100) / 100;

  const subtotalDifference = Math.round((optionNetPrice - baseNetPrice) * 100) / 100;
  const taxDifference = Math.round(subtotalDifference * hstRate * 100) / 100;
  const totalDifference = Math.round((subtotalDifference + taxDifference) * 100) / 100;

  return {
    baseNetPrice,
    optionNetPrice,
    subtotalDifference,
    taxDifference,
    totalDifference,
  };
}

/**
 * Formats a single door line item heading using its quantity and description.
 * e.g. quantity = 2, desc = "Steel Entry Door" => "2 Steel Entry Door"
 * e.g. quantity = 1, desc = "garden door" => "1 garden door"
 * Avoids duplicate quantity if desc already starts with a number matching qty.
 */
export function formatDoorItemHeading(item: {
  quantity?: number;
  customDescription?: string;
  presetLabel?: string;
}): string {
  const qty = Math.max(1, Number(item?.quantity) || 1);
  const rawDesc =
    (item?.customDescription && item.customDescription.trim()) ||
    item?.presetLabel ||
    'Door';

  // If description already starts with a number (e.g. "2 Steel Entry Door")
  if (/^\d+\s+/.test(rawDesc)) {
    return rawDesc;
  }
  return `${qty} ${rawDesc}`;
}

/**
 * Natural language sentence formatter for door line items.
 * e.g. "2 Steel Entry Door and 1 garden door"
 */
export function formatDoorSummarySentence(lineItems: DoorLineItem[]): string {
  if (!lineItems || lineItems.length === 0) return 'Doors & Systems';

  const parts = lineItems.map((item) => formatDoorItemHeading(item));

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

