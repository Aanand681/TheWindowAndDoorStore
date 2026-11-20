export type SealedUnitTemplateType = "window_style" | "standard" | "production"

export interface SealedUnitUpcharge {
  id: string
  label: string
  price: string | number
}

export interface SealedUnitTotals {
  totalUnits: number
  totalSqft: number
  totalBillableSqft: number
  glassBefore8PercentTotal: number
  glass8PercentSurchargeTotal: number
  glassSupplyTotal: number
  unitLabourSum: number
  baseSetupFee: number
  additionalFarFee: number
  vehicleTravelFee: number
  crewTravelFee: number
  totalAdditionalTravel: number
  totalTravelAndSetup: number
  combinedLabourTotal: number
  miscTotal: number
  serviceLabourTotal?: number
  subtotalPreTax: number
  hstAmount: number
  grandTotal: number
  effectiveLabourRate?: number
  effectiveMiscRate?: number
  isInstallation?: boolean
  isServiceOnly?: boolean
  extraLabour?: number
  globalUpcharges?: SealedUnitUpcharge[]
}
