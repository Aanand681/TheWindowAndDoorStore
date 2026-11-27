import { CalculateSealedUnitTotalsParams } from "./types"
import { DEFAULT_LABOUR_SETTINGS } from "./grill-data"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"

export function calculateSealedUnitTotals({
  lineItems,
  isInstallation = false,
  isServiceOnly = false,
  travelFeeType = "none",
  customTravelFee = 0,
  showOutTownTravel = false,
  travelKm = 0,
  crewHours = 0,
  crewSize = "2",
  hstRate = 13,
  customMaterials = [],
  loyaltyDiscount = 0,
  loyaltyDiscountLabel = "",
  labourSettings,
}: CalculateSealedUnitTotalsParams) {
  const customMaterialsList = Array.isArray(customMaterials) ? customMaterials : []
  const customMaterialsTotal = Math.round(
    customMaterialsList.reduce((acc, m) => acc + (Number(m?.amount) || 0), 0) * 100
  ) / 100
  const loyaltyDiscountAmount = Math.max(0, parseFloat(String(loyaltyDiscount || 0)) || 0)
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

  const fullUnitLabourSum = !isServiceOnly
    ? lineItems.reduce((acc, item) => acc + (Number(item.totalLabour) || 0), 0)
    : 0
  const unitLabourSum = isInstallation ? fullUnitLabourSum : 0

  const fullInstallMisc = !isServiceOnly
    ? lineItems.reduce((acc, item) => acc + (Number(item.totalMisc) || 0), 0)
    : 0
  const miscTotal = isInstallation ? fullInstallMisc : 0

  const fullBaseSetupFee = !isServiceOnly ? labour.setupFeeDefault || 140.0 : 0
  const baseSetupFee = isInstallation ? fullBaseSetupFee : 0

  let fullAdditionalFarFee = 0
  if (!isServiceOnly) {
    if (travelFeeType === "far_std") {
      fullAdditionalFarFee = labour.setupFeeFarStandard || 727.5
    } else if (travelFeeType === "far_small") {
      fullAdditionalFarFee = labour.setupFeeFarSmall || 363.5
    } else if (travelFeeType === "custom") {
      fullAdditionalFarFee = Math.max(0, Number(customTravelFee) || 0)
    }
  }
  const additionalFarFee = isInstallation ? fullAdditionalFarFee : 0

  let fullVehicleTravelFee = 0
  let fullCrewTravelFee = 0
  const isOutTownActive = Boolean(
    showOutTownTravel ||
      (Number(travelKm) > 0) ||
      (Number(crewHours) > 0)
  )
  if (!isServiceOnly && isOutTownActive) {
    const km = Math.max(0, Number(travelKm) || 0)
    fullVehicleTravelFee =
      Math.round(km * (labour.vehicleRatePerKm || 0.98) * 100) / 100

    const hrs = Math.max(0, Number(crewHours) || 0)
    const hourlyRate =
      crewSize === "2"
        ? labour.crewHourly2Men || 150
        : labour.crewHourly3Men || 200
    fullCrewTravelFee = Math.round(hrs * hourlyRate * 100) / 100
  }
  const vehicleTravelFee = isInstallation ? fullVehicleTravelFee : 0
  const crewTravelFee = isInstallation ? fullCrewTravelFee : 0

  const fullTravelAndSetup = !isServiceOnly
    ? fullBaseSetupFee + fullAdditionalFarFee + fullVehicleTravelFee + fullCrewTravelFee
    : 0
  const fullInstallLabour = !isServiceOnly
    ? fullUnitLabourSum + fullTravelAndSetup
    : 0

  const totalAdditionalTravel =
    additionalFarFee + vehicleTravelFee + crewTravelFee
  const totalTravelAndSetup = isInstallation
    ? baseSetupFee + totalAdditionalTravel
    : 0
  const combinedLabourTotal = isInstallation
    ? unitLabourSum + totalTravelAndSetup
    : 0

  const grossSubtotalPreTax =
    glassSupplyTotal +
    customMaterialsTotal +
    (isInstallation ? combinedLabourTotal + miscTotal : 0)
  const subtotalPreTax = Math.max(
    0,
    Math.round((grossSubtotalPreTax - loyaltyDiscountAmount) * 100) / 100
  )

  let hstAmount = 0
  let hstBase = 0
  let materialExemption = 0

  if (hstRate === 13) {
    hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    hstAmount = hstBase
  } else if (hstRate === 8) {
    // Pure glass & custom materials qualify; 8% glass surcharge is handling/surcharge!
    const materialAmount = Math.max(
      0,
      glassBefore8PercentTotal + customMaterialsTotal - loyaltyDiscountAmount
    )
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
    customMaterials: customMaterialsList,
    customMaterialsTotal,
    loyaltyDiscount: loyaltyDiscountAmount,
    loyaltyDiscountLabel,
    unitLabourSum,
    baseSetupFee,
    additionalFarFee,
    vehicleTravelFee,
    crewTravelFee,
    totalAdditionalTravel,
    totalTravelAndSetup,
    combinedLabourTotal,
    miscTotal,
    fullUnitLabourSum,
    fullInstallLabour,
    fullInstallMisc,
    fullTravelAndSetup,
    subtotalPreTax,
    hstAmount,
    hstBase,
    materialExemption,
    grandTotal,
    isInstallation: Boolean(isInstallation),
    isServiceOnly: Boolean(isServiceOnly),
  }
}

/**
 * Computes combined multi-quote ledger amounts including attached quotes
 * (windows, doors) and loyalty discounts for Sealed Unit quotes.
 */
export function computeEffectiveSealedUnitGrandTotal(p: {
  totals: any
  sealedUnitMode?: "installation" | "supply_only" | "service_only"
  isInstallation?: boolean
  isServiceOnly?: boolean
  loyaltyDiscount?: string
  loyaltyDiscountLabel?: string
  hstRate?: number
  attachedWindowQuote?: any
  attachedDoorQuote?: any
}): { combinedSubtotal: number; combinedTax: number; grandTotal: number } {
  const {
    totals = {},
    sealedUnitMode,
    isInstallation = true,
    isServiceOnly = false,
    loyaltyDiscount = "",
    loyaltyDiscountLabel = "",
    hstRate = 13,
    attachedWindowQuote,
    attachedDoorQuote,
  } = p

  const resolvedMode =
    sealedUnitMode ||
    (isServiceOnly ? "service_only" : isInstallation ? "installation" : "supply_only")
  const hasAnyAttached = Boolean(attachedWindowQuote || attachedDoorQuote)
  const hasMissingLoyalty =
    loyaltyDiscount.trim() !== "" && (totals.loyaltyDiscount || 0) <= 0

  if (!hasAnyAttached && !hasMissingLoyalty) {
    return {
      combinedSubtotal: totals.subtotalPreTax || 0,
      combinedTax: totals.hstAmount || 0,
      grandTotal: totals.grandTotal || 0,
    }
  }

  const universal = calculateUniversalPricing({
    sealedUnitQuote: { data: { totals, sealedUnitMode: resolvedMode } },
    windowQuote: attachedWindowQuote,
    doorQuote: attachedDoorQuote,
    hostType: "sealed_unit",
    isSupplyOnly: resolvedMode === "supply_only",
    hstRate,
    isFirstNation: hstRate === 8,
    overrides: {
      loyaltyDiscount,
      loyaltyDiscountLabel,
    },
  })

  return {
    combinedSubtotal: universal.subtotal,
    combinedTax: universal.hstAmount,
    grandTotal: universal.total,
  }
}
