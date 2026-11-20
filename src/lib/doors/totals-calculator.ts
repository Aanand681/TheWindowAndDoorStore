import { DoorCalculationParams, DoorQuoteTotals } from "./types"

/**
 * Computes complete financial totals for a Door Quote, supporting Supply Only,
 * Supply & Installation, and Office Reference modes with exact spreadsheet math.
 */
export function calculateDoorQuoteTotals(
  params: DoorCalculationParams
): DoorQuoteTotals {
  const {
    lineItems, mode, travelFeeType, customTravelFee, showOutTownTravel,
    travelKm, crewHours, crewSize, hstRate, logistics, customDiscount,
  } = params

  const isInstallation = mode === "installation"
  let totalDoors = 0, totalStormDoors = 0, rawDoorBaseTotal = 0
  let surchargeTotal = 0, doorWithSurchargeTotal = 0, discountTotal = 0
  let netDoorSupplyTotal = 0, stormDoorTotal = 0, hardwareTotal = 0
  let hardwareQty = 0, unitLabourTotal = 0, upchargesTotal = 0, miscTotal = 0

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
    if (item.hardwareType && item.hardwareType !== "none") hardwareQty += q

    unitLabourTotal += (item.unitLabour || 0) * q
    upchargesTotal += (item.upchargesTotal || 0) * q
    miscTotal += item.lineMiscTotal || 0
  })

  // Override standard 10% discount if custom discount specified
  if (customDiscount !== undefined && customDiscount !== "") {
    discountTotal = Math.max(0, parseFloat(customDiscount) || 0)
  }

  const totalUnits = totalDoors + totalStormDoors
  let fullBaseSetupFee = 0, additionalFarFee = 0, vehicleTravelFee = 0, crewTravelFee = 0

  if (totalUnits > 0 && travelFeeType !== "none") {
    fullBaseSetupFee = logistics.setupFeeDefault || 140.0
    if (travelFeeType === "far_std") {
      additionalFarFee = logistics.setupFeeFarStandard || 727.5
    } else if (travelFeeType === "far_small") {
      additionalFarFee = logistics.setupFeeFarSmall || 363.5
    } else if (travelFeeType === "custom") {
      additionalFarFee = Math.max(0, Number(customTravelFee) || 0)
    }

    if (showOutTownTravel) {
      const km = Math.max(0, Number(travelKm) || 0)
      vehicleTravelFee = Math.round(km * (logistics.vehicleRatePerKm || 0.98) * 100) / 100
      const hrs = Math.max(0, Number(crewHours) || 0)
      const hourlyRate = crewSize === "2" ? logistics.crewHourly2Men || 150 : logistics.crewHourly3Men || 200
      crewTravelFee = Math.round(hrs * hourlyRate * 100) / 100
    }
  }

  const totalAdditionalTravel = additionalFarFee + vehicleTravelFee + crewTravelFee
  const fullTravelAndSetup = fullBaseSetupFee + totalAdditionalTravel
  const totalTravelAndSetup = isInstallation ? fullTravelAndSetup : 0
  const baseSetupFee = isInstallation ? fullBaseSetupFee : 0

  const globalUpchargesTotal = Array.isArray(params.globalUpcharges)
    ? params.globalUpcharges.reduce((acc, u) => acc + (u.total || 0), 0)
    : 0
  const combinedUpchargesTotal = Math.round((upchargesTotal + globalUpchargesTotal) * 100) / 100

  const fullInstallLabour = Math.round((unitLabourTotal + combinedUpchargesTotal + fullTravelAndSetup) * 100) / 100
  const fullInstallMisc = Math.round(miscTotal * 100) / 100

  const combinedLabourTotal = isInstallation ? fullInstallLabour : 0
  const activeMiscTotal = isInstallation ? fullInstallMisc : 0

  const totalDoorBase = rawDoorBaseTotal + stormDoorTotal
  const subtotalPreTax = Math.round(
    (totalDoorBase - discountTotal + surchargeTotal + combinedLabourTotal + activeMiscTotal + hardwareTotal) * 100
  ) / 100

  const isNoTax = hstRate === 0
  const isFN = !isNoTax && Boolean(params.isFirstNation || hstRate === 8 || hstRate === 0.05)
  let hstAmount = 0, hstBase = 0, materialExemption = 0

  if (isNoTax) {
    hstAmount = 0; hstBase = 0; materialExemption = 0
  } else if (isFN) {
    const materialsBase = totalDoorBase - discountTotal + hardwareTotal
    hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    materialExemption = Math.round(materialsBase * 0.08 * 100) / 100
    hstAmount = Math.max(0, Math.round((hstBase - materialExemption) * 100) / 100)
  } else {
    hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    hstAmount = hstBase
  }

  const grandTotal = Math.round((subtotalPreTax + hstAmount) * 100) / 100
  const depositAmount = Math.floor((grandTotal / 2) * 100) / 100

  return {
    totalDoors, totalStormDoors, totalUnits, rawDoorBaseTotal, surchargeTotal,
    doorWithSurchargeTotal, discountTotal, netDoorSupplyTotal, stormDoorTotal,
    hardwareTotal, hardwareQty, unitLabourTotal, upchargesTotal, baseSetupFee,
    fullBaseSetupFee, additionalFarFee, vehicleTravelFee, crewTravelFee,
    totalAdditionalTravel, totalTravelAndSetup, fullInstallLabour, fullInstallMisc,
    combinedLabourTotal, miscTotal: activeMiscTotal, subtotalPreTax,
    hstBase, materialExemption, hstAmount, grandTotal, depositAmount,
  }
}

/**
 * Computes combined multi-quote ledger amounts including attached quotes
 * (windows, sealed units) and custom overrides, ensuring 100% parity across cards, drafts, and PDF.
 */
export function computeEffectiveDoorGrandTotal(p: {
  totals: DoorQuoteTotals
  mode: any
  customLabour?: string
  customMisc?: string
  customDiscount?: string
  isFirstNation?: boolean
  attachedWindowQuote?: any
  attachedSealedUnit?: any
}): { combinedSubtotal: number; combinedTax: number; grandTotal: number } {
  const {
    totals, mode, customLabour = "", customMisc = "", customDiscount = "",
    isFirstNation = false, attachedWindowQuote, attachedSealedUnit,
  } = p

  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedSU = Boolean(attachedSealedUnit)
  const hasAnyAttached = hasAttachedWindow || hasAttachedSU
  const isInstallation = mode === "installation"

  if (!hasAnyAttached && customLabour === "" && customMisc === "" && customDiscount === "") {
    return {
      combinedSubtotal: totals.subtotalPreTax,
      combinedTax: totals.hstAmount,
      grandTotal: totals.grandTotal,
    }
  }

  const winBase = hasAttachedWindow
    ? attachedWindowQuote.totals?.base || attachedWindowQuote.totals?.subtotal || 0
    : 0
  const winJC = hasAttachedWindow
    ? (attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0)
    : 0
  const winCustomMaterials = hasAttachedWindow
    ? Number(
        attachedWindowQuote.totals?.customMaterials ??
          (Array.isArray(attachedWindowQuote.taxTotals?.customMaterials)
            ? attachedWindowQuote.taxTotals.customMaterials.reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0)
            : 0)
      )
    : 0
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount ||
        attachedWindowQuote.quoteResult?.promoDiscount ||
        attachedWindowQuote.data?.promoDiscount || 0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0
  const suGlass = hasAttachedSU ? attachedSealedUnit.totals?.glassBefore8PercentTotal || 0 : 0
  const winLabour = hasAttachedWindow ? Number(attachedWindowQuote.totals?.labour || 0) : 0
  const suExtraLabour = hasAttachedSU ? Number(attachedSealedUnit.totals?.extraLabour || 0) : 0
  const suLabour = hasAttachedSU
    ? (attachedSealedUnit.sealedUnitMode === "service_only"
      ? Number(attachedSealedUnit.totals?.serviceLabourTotal || 0) + suExtraLabour
      : Number(attachedSealedUnit.totals?.unitLabourSum || attachedSealedUnit.totals?.combinedLabourTotal || 0) + suExtraLabour)
    : 0
  const winMisc = hasAttachedWindow ? Number(attachedWindowQuote.totals?.misc || 0) : 0
  const suMisc = hasAttachedSU ? Number(attachedSealedUnit.totals?.miscTotal || 0) : 0
  const winSurcharge = hasAttachedWindow ? Number(attachedWindowQuote.totals?.surcharge || 0) : 0
  const suSurcharge = hasAttachedSU ? Number(attachedSealedUnit.totals?.glass8PercentSurchargeTotal || 0) : 0

  const effectiveDoorDiscount = customDiscount !== ""
    ? Math.max(0, parseFloat(customDiscount) || 0)
    : totals.discountTotal

  const netDoorMaterials =
    totals.rawDoorBaseTotal +
    totals.stormDoorTotal +
    totals.hardwareTotal -
    effectiveDoorDiscount

  const defaultDoorLabour = isInstallation ? totals.combinedLabourTotal : 0
  const effectiveDoorLabour = customLabour !== "" ? parseFloat(customLabour) || 0 : defaultDoorLabour
  const combinedLabour = effectiveDoorLabour + winLabour + suLabour

  const defaultDoorMisc = isInstallation ? totals.miscTotal : 0
  const effectiveDoorMisc = customMisc !== "" ? parseFloat(customMisc) || 0 : defaultDoorMisc
  const combinedMisc = effectiveDoorMisc + winMisc + suMisc

  const combinedSurcharge = totals.surchargeTotal + winSurcharge + suSurcharge
  const combinedSubtotal = Math.round(
    (netDoorMaterials + (winBase - winDiscount) + winJC + winCustomMaterials + suGlass + combinedLabour + combinedMisc + combinedSurcharge) * 100
  ) / 100

  let combinedTax = totals.hstAmount
  const combinedHstBase = Math.round(combinedSubtotal * 0.13 * 100) / 100

  if (totals.hstAmount === 0 && !isFirstNation) {
    combinedTax = 0
  } else if (isFirstNation) {
    const mat = netDoorMaterials + (winBase - winDiscount + winJC + winCustomMaterials) + suGlass
    const combinedMaterialExemption = Math.round(mat * 0.08 * 100) / 100
    combinedTax = Math.max(0, Math.round((combinedHstBase - combinedMaterialExemption) * 100) / 100)
  } else {
    combinedTax = combinedHstBase
  }

  const grandTotal = Math.round((combinedSubtotal + combinedTax) * 100) / 100
  return { combinedSubtotal, combinedTax, grandTotal }
}
