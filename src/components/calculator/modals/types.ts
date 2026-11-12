"use client"

import type {
  StaffMember,
  QuoteReviewState,
  QuoteWindow,
  TaxCalculatedTotals,
  AttachedQuoteData,
  QuoteDraftItem,
  AttachedUpgradeOption,
  DBPromo,
  QuoteResult,
} from "@/types/calculator"
import type { QuoteTemplateType } from "@/components/quotes/invoice/types"

export interface CalculatorReviewModalsProps {
  // Submit Review
  showSubmitModal: boolean
  setShowSubmitModal: (show: boolean) => void
  user: StaffMember | null
  adminSubmitMode: "direct_approve" | "submit_review"
  setAdminSubmitMode: (mode: "direct_approve" | "submit_review") => void
  staffList: StaffMember[]
  clerkList: StaffMember[]
  assignedReviewer: string
  setAssignedReviewer: (reviewer: string) => void
  selectedOdooClerk: string
  setSelectedOdooClerk: (clerk: string) => void
  preparerNotes: string
  setPreparerNotes: (notes: string) => void
  submittingQuote: boolean
  handleSubmitForReview: () => void
  quoteNumber: string
  customerName: string
  windows: QuoteWindow[]
  total: number

  // Workflow Dialogs
  showReassignModal: boolean
  setShowReassignModal: (show: boolean) => void
  reviewQuote: QuoteReviewState | null
  reassignTo: string
  setReassignTo: (user: string) => void
  reassignNotes: string
  setReassignNotes: (notes: string) => void
  handleReassignQuote: () => void
  showReturnModal: boolean
  setShowReturnModal: (show: boolean) => void
  returnNotes: string
  setReturnNotes: (notes: string) => void
  submitReturnReviewQuote: () => void
  showExitReviewForPdfModal: boolean
  setShowExitReviewForPdfModal: (show: boolean) => void
  handleExitReviewAndImportPdf: () => void
  reviewActionLoading: boolean

  // Odoo Action Modals
  showApproveOdooModal: boolean
  setShowApproveOdooModal: (show: boolean) => void
  showCompleteOdooModal: boolean
  setShowCompleteOdooModal: (show: boolean) => void
  odooOrderNumberInput: string
  setOdooOrderNumberInput: (val: string) => void
  confirmApproveReviewQuote: () => void
  handleCompleteOdooEntry: () => void
}

export interface CalculatorUtilityModalsProps {
  // Saved Quotes
  isSavedQuotesOpen: boolean
  setIsSavedQuotesOpen: (open: boolean) => void
  loadDraftIntoWorkspace: (draft: QuoteDraftItem) => void

  // Attach Quote
  isAttachModalOpen: boolean
  setIsAttachModalOpen: (open: boolean) => void
  attachedSealedUnit: AttachedQuoteData | null
  attachedDoorQuote: AttachedQuoteData | null
  setAttachedSealedUnit: (su: AttachedQuoteData | null) => void
  setAttachedDoorQuote: (door: AttachedQuoteData | null) => void

  // Reset Modal
  showResetModal: boolean
  setShowResetModal: (show: boolean) => void
  handleConfirmReset: () => void
}

export interface CalculatorComparisonModalProps {
  isCompareModalOpen: boolean
  setIsCompareModalOpen: (open: boolean) => void
  baseSnapshotA: Record<string, any> | null
  appliedOption: "A" | "B"
  baseWindowsA: QuoteWindow[]
  windows: QuoteWindow[]
  customerName: string
  quoteNumber: string
  surchargeRate: number
  isSupplyOnly: boolean
  supplyJambId: string
  supplyJambName: string
  supplyJambRate: string
  supplyCasingId: string
  supplyCasingName: string
  supplyCasingRate: string
  customJC: string
  effectiveJC: number
  effectiveMisc: number
  effectiveLabour: number
  availablePromos: DBPromo[]
  activePromoId: string
  hstRate: number
  quoteResult: QuoteResult | null
  afterDiscount: number
  total: number
  firstPayment: number
  secondPayment: number
  taxTotals: TaxCalculatedTotals | null
  isComparisonStaging: boolean
  handleApplyOption: (
    target: "A" | "B",
    windows: QuoteWindow[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: {
      jambId?: string
      jambRate?: string
      casingId?: string
      casingRate?: string
      extraLabour?: string
    }
  ) => void
  handleApplyAndCustomize?: (
    windows: QuoteWindow[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: {
      jambId?: string
      jambRate?: string
      casingId?: string
      casingRate?: string
      extraLabour?: string
    }
  ) => void
  handleKeepOptionB?: () => void
  attachedUpgrade: AttachedUpgradeOption | null
  setAttachedUpgrade: (val: AttachedUpgradeOption | null) => void
}

export interface CalculatorModalsGroupProps
  extends
    CalculatorReviewModalsProps,
    CalculatorUtilityModalsProps,
    CalculatorComparisonModalProps {
  // Preview
  isPreviewOpen: boolean
  setIsPreviewOpen: (open: boolean) => void
  quoteTemplate: QuoteTemplateType
  setQuoteTemplate: (tpl: QuoteTemplateType) => void
  quoteFontSize: number
  setQuoteFontSize: (size: number) => void
  quoteSpacing: number
  setQuoteSpacing: (spacing: number) => void
  quoteNotes: string
  setQuoteNotes: (notes: string) => void
  isReadOnly: boolean
  preparedBy: string
  basePrice: number
  surcharge: number
  wantsUpgrade: boolean
  shownUpgrade: number
  beforeTaxDiscount: number
  includeLabourInPromo: boolean
  includeMiscInPromo: boolean
  includeJCInPromo: boolean
}
