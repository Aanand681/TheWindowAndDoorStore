import {
  SealedUnitLabourSettings,
  SealedUnitLineItem,
} from "@/lib/sealed-units-logic"

export interface SealedUnitCalculationParams {
  lineItems: SealedUnitLineItem[]
  sealedUnitMode: "installation" | "supply_only" | "service_only"
  serviceSqftInput: string
  serviceLabourRateInput: string
  serviceMiscRateInput: string
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  hstRate: number
  extraLabour?: string | number
  labour: SealedUnitLabourSettings
}

export interface SealedUnitTotalsResult {
  totalUnits: number
  itemsSqft: number
  totalBillableSqft: number
  totalSqft: number
  effectiveLabourRate: number
  effectiveMiscRate: number
  effectiveServiceSqft: number
  glassBefore8PercentTotal: number
  glass8PercentSurchargeTotal: number
  glassSupplyTotal: number
  unitLabourSum: number
  serviceLabourTotal: number
  baseSetupFee: number
  additionalFarFee: number
  vehicleTravelFee: number
  crewTravelFee: number
  totalAdditionalTravel: number
  totalTravelAndSetup: number
  combinedLabourTotal: number
  fullInstallLabour?: number
  fullInstallMisc?: number
  miscTotal: number
  subtotalPreTax: number
  hstAmount: number
  grandTotal: number
  extraLabour: number
  isInstallation: boolean
  isServiceOnly: boolean
}

/**
 * Calculates complete financial totals for Sealed Units in Installation, Supply Only, or Service Only mode.
 * Industry-standard modular function decoupled from UI components.
 */
export function calculateSealedUnitTotals(
  params: SealedUnitCalculationParams
): SealedUnitTotalsResult {
  const {
    lineItems, sealedUnitMode, serviceSqftInput, serviceLabourRateInput,
    serviceMiscRateInput, travelFeeType, customTravelFee, showOutTownTravel,
    travelKm, crewHours, crewSize, hstRate, extraLabour = "0", labour,
  } = params

  const extraLabourAmount = Math.max(
    0,
    parseFloat(String(extraLabour || "0")) || 0
  )

  const isInstallation = sealedUnitMode === "installation"
  const isServiceOnly = sealedUnitMode === "service_only"

  const totalUnits = lineItems.reduce((acc, item) => acc + item.quantity, 0)
  const itemsSqft = lineItems.reduce(
    (acc, item) => acc + item.actualSqft * item.quantity,
    0
  )
  const totalBillableSqft = lineItems.reduce(
    (acc, item) => acc + item.billableSqft * item.quantity,
    0
  )

  const effectiveLabourRate =
    serviceLabourRateInput !== ""
      ? parseFloat(serviceLabourRateInput) || 0
      : labour.labourRatePerSqft || 14.4

  const effectiveMiscRate =
    serviceMiscRateInput !== ""
      ? parseFloat(serviceMiscRateInput) || 0
      : labour.miscRatePerSqft || 2.4

  const effectiveServiceSqft =
    isServiceOnly && serviceSqftInput.trim() !== ""
      ? parseFloat(serviceSqftInput) || 0
      : itemsSqft

  const totalSqft = isServiceOnly ? effectiveServiceSqft : itemsSqft

  // Glass manufacturing base: $0.00 in Service Only
  const glassBefore8PercentTotal = isServiceOnly
    ? 0
    : lineItems.reduce((acc, item) => acc + item.multipliedTotal, 0)
  const glass8PercentSurchargeTotal = isServiceOnly
    ? 0
    : lineItems.reduce((acc, item) => acc + item.surcharge8PercentTotal, 0)
  const glassSupplyTotal = isServiceOnly
    ? 0
    : lineItems.reduce((acc, item) => acc + item.lineGlassTotal, 0)

  const minLabourPerUnit = labour.labourMinPerUnit ?? 120.0

  // Sqft-based Service Labour (enforces minimum labour per unit from database settings)
  let serviceLabourTotal = 0
  if (isServiceOnly) {
    if (lineItems.length > 0) {
      serviceLabourTotal = lineItems.reduce((acc, item) => {
        const itemLabour = Math.max(
          item.actualSqft * effectiveLabourRate,
          minLabourPerUnit
        )
        return acc + itemLabour * item.quantity
      }, 0)
      if (serviceSqftInput.trim() !== "") {
        const manualSqft = parseFloat(serviceSqftInput) || 0
        const manualLabour =
          manualSqft > 0
            ? Math.max(manualSqft * effectiveLabourRate, minLabourPerUnit)
            : 0
        serviceLabourTotal = Math.max(serviceLabourTotal, manualLabour)
      }
    } else {
      serviceLabourTotal =
        effectiveServiceSqft > 0
          ? Math.max(
              effectiveServiceSqft * effectiveLabourRate,
              minLabourPerUnit
            )
          : 0
    }
    serviceLabourTotal = Math.round(serviceLabourTotal * 100) / 100
  }

  // Installation unit-based labour baseline
  const fullUnitLabourSum = lineItems.reduce((acc, item) => {
    const unitL =
      item.unitLabour > 0
        ? Math.max(item.unitLabour, minLabourPerUnit)
        : Math.max(
            item.actualSqft * (labour.labourRatePerSqft || 14.4),
            minLabourPerUnit
          )
    return acc + unitL * item.quantity
  }, 0)

  // Misc / consumables baseline
  const fullMiscTotal = lineItems.reduce(
    (acc, item) => acc + (item.totalMisc || 0),
    0
  )

  // Fixed Base Setup Fee baseline: $140 local standard
  const fullBaseSetupFee = labour.setupFeeDefault || 140.0

  // Far Area Surcharges
  let fullAdditionalFarFee = 0
  if (travelFeeType === "far_std") {
    fullAdditionalFarFee = labour.setupFeeFarStandard || 727.5
  } else if (travelFeeType === "far_small") {
    fullAdditionalFarFee = labour.setupFeeFarSmall || 363.5
  } else if (travelFeeType === "custom") {
    fullAdditionalFarFee = Math.max(0, Number(customTravelFee) || 0)
  }

  // Out-of-town vehicle & crew travel
  let fullVehicleTravelFee = 0
  let fullCrewTravelFee = 0
  const isOutTownActive = Boolean(
    showOutTownTravel ||
      Number(travelKm) > 0 ||
      Number(crewHours) > 0
  )
  if (isOutTownActive) {
    const km = Number(travelKm) || 0
    fullVehicleTravelFee =
      Math.round(km * (labour.vehicleRatePerKm || 0.98) * 100) / 100

    const hrs = Number(crewHours) || 0
    const hourlyRate =
      crewSize === "2"
        ? labour.crewHourly2Men || 150
        : labour.crewHourly3Men || 200
    fullCrewTravelFee = Math.round(hrs * hourlyRate * 100) / 100
  }

  const fullTotalAdditionalTravel =
    fullAdditionalFarFee + fullVehicleTravelFee + fullCrewTravelFee
  const fullTravelAndSetup = fullBaseSetupFee + fullTotalAdditionalTravel

  // Full Installation baseline totals (preserved across all modes for comparison & option badges)
  const fullInstallLabour =
    Math.round(
      (fullUnitLabourSum + fullTravelAndSetup + extraLabourAmount) * 100
    ) / 100
  const fullInstallMisc = Math.round(fullMiscTotal * 100) / 100

  // Active mode travel and setup
  const appliesTravelAndSetup = isInstallation || isServiceOnly
  const baseSetupFee = appliesTravelAndSetup ? fullBaseSetupFee : 0
  const additionalFarFee = appliesTravelAndSetup ? fullAdditionalFarFee : 0
  const vehicleTravelFee = appliesTravelAndSetup ? fullVehicleTravelFee : 0
  const crewTravelFee = appliesTravelAndSetup ? fullCrewTravelFee : 0
  const totalAdditionalTravel = appliesTravelAndSetup ? fullTotalAdditionalTravel : 0
  const totalTravelAndSetup = appliesTravelAndSetup ? fullTravelAndSetup : 0

  const unitLabourSum = isInstallation ? fullUnitLabourSum : 0
  const miscTotal = isInstallation
    ? fullMiscTotal
    : isServiceOnly
      ? Math.round(effectiveServiceSqft * effectiveMiscRate * 100) / 100
      : 0

  const combinedLabourTotal = isInstallation
    ? fullInstallLabour
    : isServiceOnly
      ? Math.round(
          (serviceLabourTotal + totalTravelAndSetup + extraLabourAmount) * 100
        ) / 100
      : Math.round(extraLabourAmount * 100) / 100

  const subtotalPreTax = isServiceOnly
    ? Math.round((combinedLabourTotal + miscTotal) * 100) / 100
    : Math.round(
        (glassSupplyTotal +
          (isInstallation || extraLabourAmount > 0
            ? combinedLabourTotal + miscTotal
            : 0)) *
          100
      ) / 100

  // Exact Tax: In Service Only, strictly 13% HST (no point-of-sale material rebate)
  let hstAmount = 0
  if (isServiceOnly) {
    hstAmount = Math.round(subtotalPreTax * 0.13 * 100) / 100
  } else if (hstRate === 13) {
    hstAmount = Math.round(subtotalPreTax * 0.13 * 100) / 100
  } else if (hstRate === 8) {
    const materialAmount = glassSupplyTotal
    const serviceAmount = isInstallation ? combinedLabourTotal + miscTotal : 0
    const materialTax = Math.round(materialAmount * 0.05 * 100) / 100
    const serviceTax = Math.round(serviceAmount * 0.13 * 100) / 100
    hstAmount = Math.round((materialTax + serviceTax) * 100) / 100
  } else {
    hstAmount = 0
  }

  const grandTotal = Math.round((subtotalPreTax + hstAmount) * 100) / 100

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
    fullInstallLabour,
    fullInstallMisc,
    miscTotal,
    subtotalPreTax,
    hstAmount,
    grandTotal,
    extraLabour: extraLabourAmount,
    isInstallation: Boolean(isInstallation),
    isServiceOnly: Boolean(isServiceOnly),
  }
}
