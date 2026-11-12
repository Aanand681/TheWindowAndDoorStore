import {
  DoorLineItem,
  DoorPreset,
  DoorSelectedUpcharge,
  DoorHardwareType,
  DoorCategory,
  DoorFormulaSettings,
  DoorUpgradeOption,
} from "./types"

/**
 * Computes a single door line item with Inkster price, 8% surcharge, 10% discount,
 * hardware, unit labour, and selected upcharges.
 */
export function buildDoorLineItem(params: {
  id?: string
  preset: DoorPreset
  customDescription?: string
  category?: DoorCategory
  inksterBasePrice: number
  widthIn?: number
  heightIn?: number
  quantity?: number
  unitLabour?: number
  unitMisc?: number
  formula: DoorFormulaSettings
  hardwareType?: DoorHardwareType
  customHardwareName?: string
  customHardwarePrice?: number
  upcharges?: DoorSelectedUpcharge[]
  upgradeOption?: DoorUpgradeOption
  notes?: string
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
    unitLabour: paramLabour,
    unitMisc: paramMisc,
    formula,
    hardwareType = "none",
    customHardwareName,
    customHardwarePrice,
    upcharges = [],
    upgradeOption,
    notes = "",
  } = params

  const validQty = Math.max(1, Number(quantity) || 1)
  const basePrice = Math.max(0, Number(inksterBasePrice) || 0)
  const surchargeRate = Number(formula.surchargeRate) || 8

  // Surcharge (8% default) is kept completely separate on top of basePrice
  const surchargeAmount =
    Math.round(basePrice * (surchargeRate / 100) * 100) / 100
  const priceWithSurcharge = basePrice + surchargeAmount

  // Discount rule: 10% discount applies to Entry, Patio, Garden, and other doors.
  // STORM DOORS ARE STRICTLY 0% DISCOUNT (Exempt from door discount).
  const isStorm = category === "storm"
  const discountPercent = isStorm
    ? 0
    : Number(formula.doorDiscountPercent) || 10
  // 10% discount applies strictly to clean base price
  const discountAmount =
    Math.round(basePrice * (discountPercent / 100) * 100) / 100
  const netDoorPrice = Math.round((basePrice - discountAmount) * 100) / 100

  // Hardware Price (Standard $158.00 materials, Customer Supplied $80.00 labour, Custom, None $0.00)
  let hardwarePrice = 0
  let customerHardwareFee = 0
  if (hardwareType === "custom") {
    hardwarePrice = Math.max(0, Number(customHardwarePrice) || 0)
  } else if (hardwareType === "standard") {
    hardwarePrice = Number(formula.locksetDeadboltPrice) || 158.0
  } else if (hardwareType === "customer_supplied") {
    hardwarePrice = 0 // Customer provides materials ($0.00 supply)
    customerHardwareFee = Number(formula.customerSuppliedHardwareFee) || 80.0 // Reinstallation fee is pure labour
  } else if (customHardwarePrice !== undefined) {
    hardwarePrice = Math.max(0, Number(customHardwarePrice) || 0)
  }

  // Upcharges calculation
  const calculatedUpcharges: DoorSelectedUpcharge[] = upcharges.map((up) => {
    const qty = Math.max(0, Number(up.qty) || 0)
    const rate = Math.max(0, Number(up.rate) || 0)
    return {
      ...up,
      qty,
      rate,
      total: Math.round(qty * rate * 100) / 100,
    }
  })
  const upchargesTotal = calculatedUpcharges.reduce(
    (acc, u) => acc + u.total,
    0
  )

  // Line calculations: customerHardwareFee is factored into unitLabour
  const baseLabour =
    paramLabour !== undefined
      ? Math.max(0, Number(paramLabour))
      : Math.max(0, Number(preset.labour) || 0)
  const unitLabour = baseLabour + customerHardwareFee
  const unitMisc =
    paramMisc !== undefined
      ? Math.max(0, Number(paramMisc))
      : Math.max(0, Number(preset.misc) || 0)

  // Line door supply total is purely basePrice * quantity (clean base price entered)
  const lineDoorSupplyTotal = Math.round(basePrice * validQty * 100) / 100
  const lineLabourTotal =
    Math.round((unitLabour + upchargesTotal) * validQty * 100) / 100
  const lineMiscTotal = Math.round(unitMisc * validQty * 100) / 100
  const lineHardwareTotal = Math.round(hardwarePrice * validQty * 100) / 100
  const lineSupplyTotal =
    Math.round(
      (lineDoorSupplyTotal +
        surchargeAmount * validQty -
        discountAmount * validQty +
        lineHardwareTotal) *
        100
    ) / 100
  const lineGrandTotal =
    Math.round(
      (lineDoorSupplyTotal +
        surchargeAmount * validQty -
        discountAmount * validQty +
        lineLabourTotal +
        lineMiscTotal +
        lineHardwareTotal) *
        100
    ) / 100

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
  }
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
  baseNetPrice: number
  optionNetPrice: number
  subtotalDifference: number
  taxDifference: number
  totalDifference: number
} {
  const isStorm = category === "storm"
  const effectiveDiscount = isStorm ? 0 : doorDiscountPercent

  const baseSurcharge =
    Math.round(baseInksterPrice * (surchargePercent / 100) * 100) / 100
  const baseWithSurcharge =
    Math.round((baseInksterPrice + baseSurcharge) * 100) / 100
  const baseDiscount =
    Math.round(baseWithSurcharge * (effectiveDiscount / 100) * 100) / 100
  const baseNetPrice =
    Math.round((baseWithSurcharge - baseDiscount) * 100) / 100

  const optionSurcharge =
    Math.round(optionInksterPrice * (surchargePercent / 100) * 100) / 100
  const optionWithSurcharge =
    Math.round((optionInksterPrice + optionSurcharge) * 100) / 100
  const optionDiscount =
    Math.round(optionWithSurcharge * (effectiveDiscount / 100) * 100) / 100
  const optionNetPrice =
    Math.round((optionWithSurcharge - optionDiscount) * 100) / 100

  const subtotalDifference =
    Math.round((optionNetPrice - baseNetPrice) * 100) / 100
  const taxDifference = Math.round(subtotalDifference * hstRate * 100) / 100
  const totalDifference =
    Math.round((subtotalDifference + taxDifference) * 100) / 100

  return {
    baseNetPrice,
    optionNetPrice,
    subtotalDifference,
    taxDifference,
    totalDifference,
  }
}
