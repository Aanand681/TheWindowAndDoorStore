import type { CustomMaterialItem } from "@/types/calculator"

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
  customMaterials?: CustomMaterialItem[]
  customMaterialsTotal?: number
  loyaltyDiscount?: number
  loyaltyDiscountLabel?: string
  discountType?: "none" | "custom" | "loyalty"
  loyaltyPoints?: number
  loyaltyGrossAmount?: number
  subtotalPreTax: number
  hstBase?: number
  materialExemption?: number
  hstAmount: number
  grandTotal: number
  effectiveLabourRate?: number
  effectiveMiscRate?: number
  isInstallation?: boolean
  isServiceOnly?: boolean
  extraLabour?: number
  globalUpcharges?: SealedUnitUpcharge[]
}
