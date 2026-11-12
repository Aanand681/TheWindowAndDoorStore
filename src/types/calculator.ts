import type {
  ISavedQuote,
  IQuoteTaxTotals,
  IAttachedUpgrade,
} from "@/models/SavedQuote"
import type { DBPromo } from "@/lib/promo-logic"
import type { UIWindowItem } from "@/hooks/useCalculatorWindows"
import type { QuoteDraftItem } from "@/lib/quote-drafts/types"

export interface StaffMember {
  id?: string
  _id?: string
  username: string
  email?: string
  role?: "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | string
  department?: string
  canAccessAdmin?: boolean
  customPermissions?: Record<string, boolean>
  isActive?: boolean
}

export type { UIWindowItem }
export type QuoteReviewState = ISavedQuote
export type QuoteWindow = UIWindowItem
export type AttachedUpgradeOption = IAttachedUpgrade

export interface CustomMaterialItem {
  id: string
  label: string
  amount: number
}

export interface QuoteResult {
  promoId?: string
  promoName?: string
  promoDiscount?: number
  text?: string
  note?: string
  final?: number
  base?: number
  surcharge?: number
  total?: number
  [key: string]: any
}

export interface TaxCalculatedTotals extends IQuoteTaxTotals {
  isSupplyOnly?: boolean
  isServiceOnly?: boolean
  standardLabourCents?: number
  miscLabourCents?: number
  finalLabour?: number
  finalMisc?: number
  jc?: number
  finalJC?: number
  jcLabourCents?: number
  selectedJamb?: {
    id?: string
    name?: string
    rate?: number
    pricePerFoot?: number
    total?: number
    [key: string]: any
  } | null
  selectedCasing?: {
    id?: string
    name?: string
    rate?: number
    pricePerFoot?: number
    total?: number
    [key: string]: any
  } | null
  jambId?: string
  casingId?: string
  jambName?: string
  casingName?: string
  jambRate?: number
  casingRate?: number
  jambTot?: number
  casingTot?: number
  labourTotal?: number
  miscTotal?: number
  jcTotal?: number
  vehicle?: number
  crewTravel?: number
  setup?: number
  discount?: number
  selectedAddons?: Array<{
    id?: string
    label?: string
    name?: string
    qty?: number
    total?: number
    lab?: number
    misc?: number
  }>
  subtotalPreTax?: number
  taxAmount?: number
  grandTotal?: number
  customMaterials?: CustomMaterialItem[]
  customMaterialsTotal?: number
  customMaterialsCents?: number
  hstBase?: number
  materialExemption?: number
  [key: string]: any
}

export interface AttachedQuoteData {
  id?: string
  quoteNumber?: string
  customerName?: string
  subtotal?: number
  grandTotal?: number
  total?: number
  itemCount?: number
  summaryLabel?: string
  windows?: any[]
  lineItems?: any[]
  sealedUnits?: any[]
  doors?: any[]
  globalUpcharges?: any[]
  totals?: Record<string, any>
  sealedUnitMode?: string
  data?: Record<string, any>
  [key: string]: any
}

export type { DBPromo, QuoteDraftItem }
