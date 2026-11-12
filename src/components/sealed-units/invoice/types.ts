import {
  SealedUnitLineItem,
  SealedUnitLabourSettings,
} from "@/lib/sealed-units-logic"

export type SealedUnitTemplateType = "window_style" | "standard" | "production"

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
}

export interface SealedUnitPrintInvoiceProps {
  lineItems: SealedUnitLineItem[]
  mode?: "installation" | "supply_only" | "service_only"
  isInstallation: boolean
  labour: SealedUnitLabourSettings
  hstRate: number
  customerName: string
  quoteNumber: string
  quoteNotes?: string
  preparedBy?: string
  template?: SealedUnitTemplateType
  fontSize?: number // pt, default 8.5
  spacing?: number // multiplier, default 1.0
  orientation?: "portrait" | "landscape"
  isInteractivePreview?: boolean
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  totals: SealedUnitTotals
}
