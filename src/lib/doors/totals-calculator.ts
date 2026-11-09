import {
  DoorCalculationParams,
  DoorQuoteTotals,
} from './types';

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

