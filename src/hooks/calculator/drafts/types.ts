"use client"

import { QuoteDraftItem } from "@/lib/quote-drafts-storage"
import type {
  QuoteWindow,
  TaxCalculatedTotals,
  AttachedQuoteData,
  AttachedUpgradeOption,
  QuoteResult,
} from "@/types/calculator"

export interface UseCalculatorDraftsWorkspace {
  quoteNumber: string
  setQuoteNumber: (val: string) => void
  customerName: string
  setCustomerName: (val: string) => void
  quoteNotes: string
  setQuoteNotes: (val: string) => void
  surchargeRate: number
  setSurchargeRate: (val: number) => void
  windows: QuoteWindow[]
  setWindows: (windows: QuoteWindow[]) => void
  activePromoId: string
  setActivePromoId: (id: string) => void
  isSupplyOnly: boolean
  setIsSupplyOnly: (val: boolean) => void
  supplyJambId: string
  setSupplyJambId: (id: string) => void
  supplyJambRate: string
  setSupplyJambRate: (rate: string) => void
  supplyCasingId: string
  setSupplyCasingId: (id: string) => void
  supplyCasingRate: string
  setSupplyCasingRate: (rate: string) => void
  customJC: string
  setCustomJC: (val: string) => void
  customMisc: string
  setCustomMisc: (val: string) => void
  customLabour: string
  setCustomLabour: (val: string) => void
  includeJCInPromo: boolean
  setIncludeJCInPromo: (val: boolean) => void
  includeMiscInPromo: boolean
  setIncludeMiscInPromo: (val: boolean) => void
  includeLabourInPromo: boolean
  setIncludeLabourInPromo: (val: boolean) => void
  hstRate: number
  setHstRate: (rate: number) => void
  attachedUpgrade: AttachedUpgradeOption | null
  setAttachedUpgrade: (val: AttachedUpgradeOption | null) => void
  attachedSealedUnit: AttachedQuoteData | null
  setAttachedSealedUnit: (val: AttachedQuoteData | null) => void
  attachedDoorQuote: AttachedQuoteData | null
  setAttachedDoorQuote: (val: AttachedQuoteData | null) => void
  wantsUpgrade: boolean
  setWantsUpgrade: (val: boolean) => void
  taxTotals: TaxCalculatedTotals | null
  setTaxTotals: (val: any) => void
}

export interface UseCalculatorDraftsFinancials {
  quoteResult: QuoteResult | null
  effectiveMisc: number
  effectiveLabour: number
  effectiveJC: number
  afterDiscount: number
  total: number
}

export interface UseCalculatorDraftsParams {
  initialReviewQuoteId?: string | null
  workspace: UseCalculatorDraftsWorkspace
  financials: UseCalculatorDraftsFinancials
  clearAutoSaveTimer: () => void
  setLastSavedAt: (time: string | null) => void
}

export interface UseCalculatorDraftsReturn {
  savedDraftsCount: number
  loadedDraftId: string | null
  setLoadedDraftId: (id: string | null) => void
  loadedDraftTaxTotals: TaxCalculatedTotals | null
  setLoadedDraftTaxTotals: (totals: TaxCalculatedTotals | null) => void
  isSavedQuotesOpen: boolean
  setIsSavedQuotesOpen: (open: boolean) => void
  initialLoadDone: boolean
  loadDraftIntoWorkspace: (draft: QuoteDraftItem) => void
  restoreAutoSaveIntoWorkspace: (recovered: any) => void
  handleSaveDraft: () => void
  resetDraftState: () => void
}
