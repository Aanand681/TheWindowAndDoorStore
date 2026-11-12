import type {
  QuoteWindow,
  TaxCalculatedTotals,
  AttachedQuoteData,
  AttachedUpgradeOption,
  QuoteResult,
} from "@/types/calculator"

export type QuoteTemplateType = "modern" | "executive" | "cards"

export type { AttachedUpgradeOption }

export interface QuoteInvoiceProps {
  customerName?: string
  quoteNumber?: string
  primaryQuoteType?: "window" | "sealed_unit" | "door"
  windows?: QuoteWindow[]
  sealedUnits?: any[]
  doors?: any[]
  taxTotals?: TaxCalculatedTotals
  quoteResult?: QuoteResult | null
  sealedUnitTotals?: any
  doorTotals?: any
  activePromo?: { name: string; discount: number } | null
  basePrice?: number // cents
  surcharge?: number // cents
  wantsUpgrade?: boolean
  shownUpgrade?: number // cents
  hstRate?: number
  total?: number // cents
  beforeTaxDiscount?: number // cents
  afterDiscount?: number // cents
  firstPayment?: number // cents
  secondPayment?: number // cents
  regionName?: string
  includeLabourInPromo?: boolean
  includeMiscInPromo?: boolean
  includeJCInPromo?: boolean
  effectiveJC?: number // cents (custom or calculated)
  effectiveMisc?: number // cents (custom or calculated)
  effectiveLabour?: number // cents (custom or calculated)
  template?: QuoteTemplateType
  fontSize?: number // px, default 11.5
  spacing?: number // multiplier, default 1.0
  isInteractivePreview?: boolean
  quoteNotes?: string
  preparedBy?: string
  orientation?: "portrait" | "landscape"
  attachedUpgrade?: AttachedUpgradeOption | null
  attachedSealedUnit?: AttachedQuoteData | null
  attachedDoorQuote?: AttachedQuoteData | null
  attachedWindowQuote?: AttachedQuoteData | null
  globalUpcharges?: any[]
  isSupplyOnly?: boolean
  isDualOption?: boolean
}

export interface InvoiceCalculationsResult {
  currentDate: string
  invoiceSubtitle: string
  hasWindows: boolean
  hasSealedUnits: boolean
  hasDoors: boolean
  isWindowHost: boolean
  isDoorHost: boolean
  isSUHost: boolean
  isSupplyOnly: boolean
  isLooseSupplyJC: boolean
  effectiveWindows: QuoteWindow[]
  effectiveSealedUnits: any[]
  effectiveDoors: any[]
  effectiveSUTotals: any
  effectiveDoorTotals: any
  attachedWindowQuote?: AttachedQuoteData | null
  attachedSealedUnit?: AttachedQuoteData | null
  attachedDoorQuote?: AttachedQuoteData | null
  isAttachedSUService: boolean
  travelItems: { label: string; amount: number }[]
  jcItems: { label: string; amount: number }[]
  detailedExtrasList: {
    key: string
    label: string
    qty: number
    amount: number
  }[]
  doorUpgradeItems: any[]
  finalTotalCents: number
  finalFirstPayment: number
  finalSecondPayment: number
  baseFs: number
  titleFs: number
  h2Fs: number
  thFs: number
  bodyFs: number
  smallFs: number
  microFs: number
  rowPy: number
  cardGap: number
  sectionMb: number
  taxTotals?: TaxCalculatedTotals
  quoteResult?: QuoteResult | null
  winMaterialsCents: number
  totalWindowBaseCents: number
  windowSummarySentence: string
  suGlassCents: number
  suSummarySentence: string
  doorNetMaterialsCents: number
  doorSummarySentence: string
  promoDiscountCents: number
  monthlyDiscountCents: number
  activePromo?: { name: string; discount: number } | null
  finalSubtotalCents: number
  finalHstAmountCents: number
  finalHstBaseCents?: number
  finalMaterialExemptionCents?: number
  hstRate?: number
  finalHstLabel: string
  effectiveLabourTotalCents: number
  effectiveMiscTotalCents: number
  effectiveSurchargeTotalCents: number
  surchargeRate: number
  isSingleLineMergedItem: boolean
}
