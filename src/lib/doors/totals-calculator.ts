import { DoorCalculationParams, DoorQuoteTotals } from "./types"

/**
 * Computes complete financial totals for a Door Quote, supporting Supply Only,
 * Supply & Installation, and Office Reference modes with exact spreadsheet math.
 */
export function calculateDoorQuoteTotals(
  params: DoorCalculationParams
): DoorQuoteTotals {
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
  } = params

  const isInstallation = mode === "installation"
  const isSupplyOnly = mode === "supply_only"

  let totalDoors = 0
  let totalStormDoors = 0
  let rawDoorBaseTotal = 0
  let surchargeTotal = 0
  let doorWithSurchargeTotal = 0
  let discountTotal = 0
  let netDoorSupplyTotal = 0
  let stormDoorTotal = 0
  let hardwareTotal = 0
  let unitLabourTotal = 0
  let upchargesTotal = 0
  let miscTotal = 0

  lineItems.forEach((item) => {
    const q = item.quantity
    const itemBaseTotal = item.inksterBasePrice * q
    const itemSurchargeTotal = item.surchargeAmount * q

    if (item.category === "storm") {
      totalStormDoors += q
      stormDoorTotal += itemBaseTotal
    } else {
      totalDoors += q
      rawDoorBaseTotal += itemBaseTotal
      discountTotal += item.discountAmount * q
    }

    surchargeTotal += itemSurchargeTotal
    doorWithSurchargeTotal += itemBaseTotal + itemSurchargeTotal
    netDoorSupplyTotal += itemBaseTotal
    hardwareTotal += item.lineHardwareTotal

    if (!isSupplyOnly) {
      unitLabourTotal += item.unitLabour * q
      upchargesTotal += item.upchargesTotal * q
      miscTotal += item.lineMiscTotal
    }
  })

  const totalUnits = totalDoors + totalStormDoors

  // Travel & Setup Logistics (Only apply when installation is active and at least 1 unit exists)
  let baseSetupFee = 0
  let additionalFarFee = 0
  let vehicleTravelFee = 0
  let crewTravelFee = 0

  if (isInstallation && totalUnits > 0 && travelFeeType !== "none") {
    // Local setup fee default ($140.00)
    baseSetupFee = logistics.setupFeeDefault || 140.0

    // Far area setup (Dryden / Sioux Lookout $727.50, Small $363.50, or Custom)
    if (travelFeeType === "far_std") {
      additionalFarFee = logistics.setupFeeFarStandard || 727.5
    } else if (travelFeeType === "far_small") {
      additionalFarFee = logistics.setupFeeFarSmall || 363.5
    } else if (travelFeeType === "custom") {
      additionalFarFee = Math.max(0, Number(customTravelFee) || 0)
    }

    // Out of town vehicle and crew travel
    if (showOutTownTravel) {
      const km = Number(travelKm) || 0
      vehicleTravelFee =
        Math.round(km * (logistics.vehicleRatePerKm || 0.98) * 100) / 100

      const hrs = Number(crewHours) || 0
      const hourlyRate =
        crewSize === "2"
          ? logistics.crewHourly2Men || 150
          : logistics.crewHourly3Men || 200
      crewTravelFee = Math.round(hrs * hourlyRate * 100) / 100
    }
  }

  const totalAdditionalTravel =
    additionalFarFee + vehicleTravelFee + crewTravelFee
  const totalTravelAndSetup = baseSetupFee + totalAdditionalTravel

  // Global jobsite upcharges applied once for the entire quote
  const globalUpchargesTotal =
    isInstallation && Array.isArray(params.globalUpcharges)
      ? params.globalUpcharges.reduce((acc, u) => acc + (u.total || 0), 0)
      : 0
  const combinedUpchargesTotal =
    Math.round((upchargesTotal + globalUpchargesTotal) * 100) / 100

  // Combined Labour = Unit labour + Jobsite upcharges + Travel & Setup
  const combinedLabourTotal = isInstallation
    ? Math.round(
        (unitLabourTotal + combinedUpchargesTotal + totalTravelAndSetup) * 100
      ) / 100
    : 0

  // In Supply Only: zero out misc, labour, travel
  if (isSupplyOnly) {
    miscTotal = 0
  }

  // Pre-tax Subtotal: Clean Door Base Total - Door Discount + Surcharge + Labour + Misc + Hardware
  const totalDoorBase = rawDoorBaseTotal + stormDoorTotal
  const subtotalPreTax =
    Math.round(
      (totalDoorBase -
        discountTotal +
        surchargeTotal +
        (isInstallation ? combinedLabourTotal + miscTotal : 0) +
        hardwareTotal) *
        100
    ) / 100

  // Taxes: First Nations 8% exemption vs standard 13% HST vs 0% No Tax
  const isNoTax = hstRate === 0
  const isFN =
    !isNoTax &&
    Boolean(params.isFirstNation || hstRate === 8 || hstRate === 0.05)
  let hstAmount = 0
  let hstBase = 0
  let materialExemption = 0

  if (isNoTax) {
    hstAmount = 0
    hstBase = 0
    materialExemption = 0
  } else if (isFN) {
    // 8% First Nations Material Exemption:
    // (13% on all) - (8% on materials)
    // Surcharge and misc are handling/services, EXCLUDED from materials!
    const materialsBase = totalDoorBase - discountTotal + hardwareTotal
    hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    materialExemption = Math.round(materialsBase * 0.08 * 100) / 100
    hstAmount = Math.max(
      0,
      Math.round((hstBase - materialExemption) * 100) / 100
    )
  } else {
    // Standard 13% HST
    hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    hstAmount = hstBase
  }

  const grandTotal = Math.round((subtotalPreTax + hstAmount) * 100) / 100

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
    hstBase,
    materialExemption,
    grandTotal,
    depositAmount: Math.round(grandTotal * 0.5 * 100) / 100,
  }
}

/**
 * Computes combined financial totals for a door quote including attached quotes
 * (windows, sealed units) and custom overrides, ensuring 100% parity across cards, drafts, and PDF.
 */
export function computeEffectiveDoorGrandTotal(p: {
  totals: DoorQuoteTotals
  mode: any
  customLabour?: string
  customMisc?: string
  isFirstNation?: boolean
  attachedWindowQuote?: any
  attachedSealedUnit?: any
}): { combinedSubtotal: number; combinedTax: number; grandTotal: number } {
  const {
    totals,
    mode,
    customLabour = "",
    customMisc = "",
    isFirstNation = false,
    attachedWindowQuote,
    attachedSealedUnit,
  } = p

  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedSU = Boolean(attachedSealedUnit)
  const hasAnyAttached = hasAttachedWindow || hasAttachedSU
  const isInstallation = mode === "installation"

  if (!hasAnyAttached && customLabour === "" && customMisc === "") {
    return {
      combinedSubtotal: totals.subtotalPreTax,
      combinedTax: totals.hstAmount,
      grandTotal: totals.grandTotal,
    }
  }

  const winBase = hasAttachedWindow
    ? attachedWindowQuote.totals?.base ||
      attachedWindowQuote.totals?.subtotal ||
      0
    : 0
  const winJC = hasAttachedWindow
    ? (attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0)
    : 0
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount ||
        attachedWindowQuote.quoteResult?.promoDiscount ||
        attachedWindowQuote.data?.promoDiscount ||
        0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0
  const suGlass = hasAttachedSU
    ? attachedSealedUnit.totals?.glassBefore8PercentTotal || 0
    : 0
  const winLabour = hasAttachedWindow
    ? attachedWindowQuote.totals?.labour || 0
    : 0
  const suLabour = hasAttachedSU
    ? (attachedSealedUnit.totals?.serviceLabourTotal ??
      attachedSealedUnit.totals?.combinedLabourTotal ??
      0)
    : 0
  const winMisc = hasAttachedWindow ? attachedWindowQuote.totals?.misc || 0 : 0
  const suMisc = hasAttachedSU ? attachedSealedUnit.totals?.miscTotal || 0 : 0
  const winSurcharge = hasAttachedWindow
    ? attachedWindowQuote.totals?.surcharge || 0
    : 0
  const suSurcharge = hasAttachedSU
    ? attachedSealedUnit.totals?.glass8PercentSurchargeTotal || 0
    : 0

  const netDoorMaterials =
    totals.rawDoorBaseTotal +
    totals.stormDoorTotal +
    totals.hardwareTotal -
    totals.discountTotal

  const defaultDoorLabour = isInstallation ? totals.combinedLabourTotal : 0
  const effectiveDoorLabour =
    customLabour !== "" ? parseFloat(customLabour) || 0 : defaultDoorLabour
  const combinedLabour = effectiveDoorLabour + winLabour + suLabour

  const defaultDoorMisc = isInstallation ? totals.miscTotal : 0
  const effectiveDoorMisc =
    customMisc !== "" ? parseFloat(customMisc) || 0 : defaultDoorMisc
  const combinedMisc = effectiveDoorMisc + winMisc + suMisc

  const combinedSurcharge = totals.surchargeTotal + winSurcharge + suSurcharge
  const combinedSubtotal =
    Math.round(
      (netDoorMaterials +
        (winBase - winDiscount) +
        winJC +
        suGlass +
        combinedLabour +
        combinedMisc +
        combinedSurcharge) *
        100
    ) / 100

  let combinedTax = totals.hstAmount
  const combinedHstBase = Math.round(combinedSubtotal * 0.13 * 100) / 100
  let combinedMaterialExemption = 0

  if (totals.hstAmount === 0 && !isFirstNation) {
    combinedTax = 0
  } else if (isFirstNation) {
    // Surcharges are EXCLUDED from materials base (treated as handling/service).
    const mat = netDoorMaterials + (winBase - winDiscount + winJC) + suGlass
    combinedMaterialExemption = Math.round(mat * 0.08 * 100) / 100
    combinedTax = Math.max(
      0,
      Math.round((combinedHstBase - combinedMaterialExemption) * 100) / 100
    )
  } else {
    combinedTax = combinedHstBase
  }

  const grandTotal = Math.round((combinedSubtotal + combinedTax) * 100) / 100

  return {
    combinedSubtotal,
    combinedTax,
    grandTotal,
  }
}
