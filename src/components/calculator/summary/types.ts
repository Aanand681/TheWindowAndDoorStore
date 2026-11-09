import type {
  StaffMember,
  QuoteReviewState,
  QuoteWindow,
  TaxCalculatedTotals,
  AttachedQuoteData,
  AttachedUpgradeOption,
  QuoteResult,
} from '@/types/calculator';

export interface QuoteSummaryCardProps {
  quoteResult: QuoteResult | null;
  summaryWindowGroups: any[];
  surchargeRate: number;
  taxTotals: TaxCalculatedTotals | null;
  taxJC: number;
  taxMisc: number;
  taxLabour: number;
  customJC: string;
  setCustomJC: (val: string) => void;
  customMisc: string;
  setCustomMisc: (val: string) => void;
  customLabour: string;
  setCustomLabour: (val: string) => void;
  includeJCInPromo: boolean;
  setIncludeJCInPromo: (val: boolean) => void;
  includeMiscInPromo: boolean;
  setIncludeMiscInPromo: (val: boolean) => void;
  includeLabourInPromo: boolean;
  setIncludeLabourInPromo: (val: boolean) => void;
  wantsUpgrade: boolean;
  setWantsUpgrade: (val: boolean) => void;
  upgrade: AttachedUpgradeOption | null;
  shownUpgrade: number;
  beforeTaxDiscount: number;
  afterDiscount: number;
  hstRate: number;
  setHstRate: (val: number) => void;
  total: number;
  firstPayment: number;
  secondPayment: number;
  quoteNotes: string;
  setQuoteNotes: (val: string) => void;
  isReadOnly: boolean;
  user: StaffMember | null;
  reviewQuote: QuoteReviewState | null;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  canEditApprovedQuote: boolean;
  canEditCurrentQuote: boolean;
  isReviewerOrAdmin: boolean;
  reviewActionLoading: boolean;
  staffList: StaffMember[];
  clerkList: StaffMember[];
  quoteNumber: string;
  customerName: string;
  assignedReviewer: string;
  setAssignedReviewer: (val: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (val: string) => void;
  setShowSubmitModal: (val: boolean) => void;
  handleResubmitReturnedQuote: () => void;
  handleSaveQuotePrices: () => void;
  handleExitReview: () => void;
  handleCancelEdits: () => void;
  setOdooOrderNumberInput: (val: string) => void;
  setShowCompleteOdooModal: (val: boolean) => void;
  setIsPreviewOpen: (val: boolean) => void;
  handleApproveReviewQuote: () => void;
  setReassignTo: (val: string) => void;
  setReassignNotes: (val: string) => void;
  setShowReassignModal: (val: boolean) => void;
  handleReturnReviewQuote: () => void;
  isSupplyOnly?: boolean;
  setIsSupplyOnly?: (val: boolean) => void;
  attachedSealedUnit?: AttachedQuoteData | null;
  attachedDoorQuote?: AttachedQuoteData | null;
  attachedUpgrade?: AttachedUpgradeOption | null;
  onOpenAttachSealedUnitModal?: () => void;
  onRemoveAttachedSealedUnit?: () => void;
  onRemoveAttachedDoorQuote?: () => void;
  onRemoveAttachedUpgrade?: () => void;
  onSaveDraft?: () => void;
  onOpenSavedQuotes?: () => void;
}

