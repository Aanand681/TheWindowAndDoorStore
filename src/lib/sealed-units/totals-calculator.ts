import { CalculateSealedUnitTotalsParams } from "./types"
import { DEFAULT_LABOUR_SETTINGS } from "./grill-data"

export function calculateSealedUnitTotals({
  lineItems,
  isInstallation = false,
  travelFeeType = "none",
  customTravelFee = 0,
  showOutTownTravel = false,
  travelKm = 0,
  crewHours = 0,
  crewSize = "2",
  hstRate = 13,
  labourSettings,
}: CalculateSealedUnitTotalsParams) {
  const labour = { ...DEFAULT_LABOUR_SETTINGS, ...labourSettings }
  const totalUnits = lineItems.reduce(
    (acc, item) => acc + (Number(item.quantity) || 1),
    0
  )
  const totalSqft = lineItems.reduce(
    (acc, item) =>
      acc + (Number(item.actualSqft) || 0) * (Number(item.quantity) || 1),
    0
  )
  const totalBillableSqft = lineItems.reduce(
    (acc, item) =>
      acc + (Number(item.billableSqft) || 0) * (Number(item.quantity) || 1),
    0
  )

  const glassBefore8PercentTotal = lineItems.reduce(
    (acc, item) => acc + (Number(item.multipliedTotal) || 0),
    0
  )
  const glass8PercentSurchargeTotal = lineItems.reduce(
    (acc, item) => acc + (Number(item.surcharge8PercentTotal) || 0),
    0
  )
  const glassSupplyTotal = lineItems.reduce(
    (acc, item) => acc + (Number(item.lineGlassTotal) || 0),
    0
  )

  const unitLabourSum = isInstallation
    ? lineItems.reduce((acc, item) => acc + (Number(item.totalLabour) || 0), 0)
    : 0

  const miscTotal = isInstallation
    ? lineItems.reduce((acc, item) => acc + (Number(item.totalMisc) || 0), 0)
    : 0

  const baseSetupFee = isInstallation ? labour.setupFeeDefault || 140.0 : 0

  let additionalFarFee = 0
  if (isInstallation) {
    if (travelFeeType === "far_std") {
      additionalFarFee = labour.setupFeeFarStandard || 727.5
    } else if (travelFeeType === "far_small") {
      additionalFarFee = labour.setupFeeFarSmall || 363.5
    } else if (travelFeeType === "custom") {
      additionalFarFee = Math.max(0, Number(customTravelFee) || 0)
    }
  }

  let vehicleTravelFee = 0
  let crewTravelFee = 0
  if (isInstallation && showOutTownTravel) {
    const km = Number(travelKm) || 0
    vehicleTravelFee =
      Math.round(km * (labour.vehicleRatePerKm || 0.98) * 100) / 100

    const hrs = Number(crewHours) || 0
    const hourlyRate =
      crewSize === "2"
        ? labour.crewHourly2Men || 150
        : labour.crewHourly3Men || 200
    crewTravelFee = Math.round(hrs * hourlyRate * 100) / 100
  }

  const totalAdditionalTravel =
    additionalFarFee + vehicleTravelFee + crewTravelFee
  const totalTravelAndSetup = isInstallation
    ? baseSetupFee + totalAdditionalTravel
    : 0
  const combinedLabourTotal = isInstallation
    ? unitLabourSum + totalTravelAndSetup
    : 0

  const subtotalPreTax =
    glassSupplyTotal + (isInstallation ? combinedLabourTotal + miscTotal : 0)

  let hstAmount = 0
  let hstBase = 0
  let materialExemption = 0

  if (hstRate === 13) {
    hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    hstAmount = hstBase
  } else if (hstRate === 8) {
    // Pure glass is material; 8% glass surcharge is handling/surcharge!
    const materialAmount = glassBefore8PercentTotal
    hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    materialExemption = Math.round(materialAmount * 0.08 * 100) / 100
    hstAmount = Math.max(
      0,
      Math.round((hstBase - materialExemption) * 100) / 100
    )
  } else {
    // 0% No Tax (Exempt)
    hstAmount = 0
    hstBase = 0
    materialExemption = 0
  }

  const grandTotal = Math.round((subtotalPreTax + hstAmount) * 100) / 100

  return {
    totalUnits,
    totalSqft,
    totalBillableSqft,
    glassBefore8PercentTotal,
    glass8PercentSurchargeTotal,
    glassSupplyTotal,
    unitLabourSum,
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
    hstBase,
    materialExemption,
    grandTotal,
  }
}
