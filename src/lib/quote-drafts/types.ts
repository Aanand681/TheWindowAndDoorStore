import type {
  QuoteWindow,
  TaxCalculatedTotals,
  AttachedQuoteData,
  AttachedUpgradeOption,
  QuoteResult,
} from "@/types/calculator"

export type QuoteType = "window" | "sealed_unit" | "door"

export interface WindowQuoteDraftPayload {
  quoteNumber: string
  customerName: string
  quoteNotes: string
  surchargeRate: number
  windows: QuoteWindow[]
  activePromoId: string
  isSupplyOnly: boolean
  supplyJambId?: string
  supplyJambRate?: string
  supplyCasingId?: string
  supplyCasingRate?: string
  customJC?: string | number
  customMisc?: string | number
  customLabour?: string | number
  includeJCInPromo?: boolean
  includeMiscInPromo?: boolean
  includeLabourInPromo?: boolean
  hstRate?: number
  attachedUpgrade?: AttachedUpgradeOption | null
  attachedSealedUnit?: AttachedQuoteData | null
  attachedDoorQuote?: AttachedQuoteData | null
  wantsUpgrade?: boolean
  subtotal: number
  grandTotal: number
  itemCount: number
  effectiveBase?: number
  effectiveSurcharge?: number
  effectiveLabour?: number
  effectiveMisc?: number
  effectiveJC?: number
  taxTotals?: TaxCalculatedTotals
  quoteResult?: QuoteResult | null
}

export interface SealedUnitQuoteDraftPayload {
  quoteNumber: string
  customerName: string
  quoteNotes: string
  lineItems: any[]
  isInstallation: boolean
  sealedUnitMode?: "installation" | "supply_only" | "service_only"
  serviceSqftInput?: string
  serviceLabourRateInput?: string
  serviceMiscRateInput?: string
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  hstRate: number
  selectedRegionId?: string
  attachedWindowQuote?: AttachedQuoteData | null
  attachedDoorQuote?: AttachedQuoteData | null
  wantsUpgrade?: boolean
  subtotal: number
  grandTotal: number
  itemCount: number
  totals?: any
}

export interface DoorQuoteDraftPayload {
  quoteNumber: string
  customerName: string
  quoteNotes: string
  mode: "installation" | "supply_only" | "office_reference"
  lineItems: any[]
  globalUpcharges: any[]
  selectedRegionId?: string
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  isFirstNation: boolean
  customLabour?: string | number
  customMisc?: string | number
  attachedWindowQuote?: AttachedQuoteData | null
  attachedSealedUnit?: AttachedQuoteData | null
  subtotal: number
  grandTotal: number
  itemCount: number
  totals?: any
}

export interface QuoteDraftItem {
  id: string
  type: QuoteType
  quoteNumber: string
  customerName: string
  createdAt: string
  updatedAt: string
  itemCount: number
  subtotal: number
  grandTotal: number
  summaryLabel: string
  data:
    | WindowQuoteDraftPayload
    | SealedUnitQuoteDraftPayload
    | DoorQuoteDraftPayload
}

export interface ActiveAutoSaveDraft {
  timestamp: string
  type: QuoteType
  quoteNumber: string
  customerName: string
  itemCount: number
  grandTotal: number
  summaryLabel: string
  data:
    | WindowQuoteDraftPayload
    | SealedUnitQuoteDraftPayload
    | DoorQuoteDraftPayload
}
