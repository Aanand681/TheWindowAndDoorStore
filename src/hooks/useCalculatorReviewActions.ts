'use client';

import { QuotesSubTabType } from '@/components/quotes/QuotesTab';
import { useReviewPermissions } from '@/hooks/calculator/review/useReviewPermissions';
import { useReviewQuoteLoader } from '@/hooks/calculator/review/useReviewQuoteLoader';
import { useReviewQuoteSubmissions } from '@/hooks/calculator/review/useReviewQuoteSubmissions';

export interface UseCalculatorReviewActionsProps {
  user: any;
  quoteNumber: string;
  setQuoteNumber: (num: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  surchargeRate: number;
  setSurchargeRate: (rate: number) => void;
  windows: any[];
  setWindows: (windows: any[]) => void;
  taxTotals: any;
  setTaxTotals: (totals: any) => void;
  quoteResult: any;
  activePromoId: string;
  setActivePromoId: (id: string) => void;
  setLockedPromoId: (id: string | null) => void;
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
  total: number;
  attachedUpgrade?: any;
  setAttachedUpgrade?: (val: any) => void;
  attachedDoorQuote?: any;
  setAttachedDoorQuote?: (val: any) => void;
  attachedSealedUnit?: any;
  setAttachedSealedUnit?: (val: any) => void;
  wantsUpgrade?: boolean;
  setWantsUpgrade?: (val: boolean) => void;
  isSupplyOnly?: boolean;
  setIsSupplyOnly?: (val: boolean) => void;
  isServiceOnly?: boolean;
  setIsServiceOnly?: (val: boolean) => void;
  quotesSubTab?: QuotesSubTabType;
  setQuotesSubTab: (tab: QuotesSubTabType) => void;
  setActiveTab: (tab: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  resetCalculatorDefaults: () => void;
}

export function useCalculatorReviewActions({
  user,
  quoteNumber,
  setQuoteNumber,
  customerName,
  setCustomerName,
  quoteNotes,
  setQuoteNotes,
  surchargeRate,
  setSurchargeRate,
  windows,
  setWindows,
  taxTotals,
  setTaxTotals,
  quoteResult,
  activePromoId,
  setActivePromoId,
  setLockedPromoId,
  customJC,
  setCustomJC,
  customMisc,
  setCustomMisc,
  customLabour,
  setCustomLabour,
  includeJCInPromo,
  setIncludeJCInPromo,
  includeMiscInPromo,
  setIncludeMiscInPromo,
  includeLabourInPromo,
  setIncludeLabourInPromo,
  total,
  attachedUpgrade,
  setAttachedUpgrade,
  attachedDoorQuote,
  setAttachedDoorQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  wantsUpgrade,
  setWantsUpgrade,
  isSupplyOnly,
  setIsSupplyOnly,
  isServiceOnly,
  setIsServiceOnly,
  quotesSubTab,
  setQuotesSubTab,
  setActiveTab,
  fileInputRef,
  resetCalculatorDefaults,
}: UseCalculatorReviewActionsProps) {
  // Pre-calculate permissions base
  const effectivePerms = user?.permissions || user?.departmentPermissions || {};
  const isSuperAdmin = Boolean(user && user.role === 'SUPERADMIN');
  const isAdmin = Boolean(user && (user.role === 'ADMIN' || isSuperAdmin));
  const canReview = Boolean(isAdmin || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote);
  const canEditApprovedQuote = Boolean(isAdmin || effectivePerms.canEditApprovedQuote);

  // 1. Review Quote Lifecycle & Loader Hook
  const {
    reviewQuoteId,
    setReviewQuoteId,
    reviewQuote,
    setReviewQuote,
    isEditMode,
    setIsEditMode,
    originalSnapshot,
    setOriginalSnapshot,
    handleOpenQuoteFromTab,
    handleCancelEdits,
    handleExitReview,
  } = useReviewQuoteLoader({
    user,
    canReview,
    canEditApprovedQuote,
    isOdooClerk: false,
    effectivePerms,
    quotesSubTab,
    setQuotesSubTab,
    setActiveTab,
    resetCalculatorDefaults,
    setWindows,
    setCustomerName,
    setQuoteNumber,
    setQuoteNotes,
    setSurchargeRate,
    setActivePromoId,
    setLockedPromoId,
    setCustomJC,
    setCustomMisc,
    setCustomLabour,
    setIncludeJCInPromo,
    setIncludeMiscInPromo,
    setIncludeLabourInPromo,
    setAttachedUpgrade,
    setAttachedDoorQuote,
    setAttachedSealedUnit,
    setWantsUpgrade,
    setIsSupplyOnly,
    setIsServiceOnly,
    setTaxTotals,
  });

  // 2. Computed Permissions & Role Checks Hook
  const permissions = useReviewPermissions({
    user,
    reviewQuote,
    isEditMode,
  });

  // 3. Submissions, Modals & Workflow Hook
  const submissions = useReviewQuoteSubmissions({
    user,
    reviewQuoteId,
    reviewQuote,
    originalSnapshot,
    isOdooCompleted: permissions.isOdooCompleted,
    setReviewQuote,
    setOriginalSnapshot,
    setIsEditMode,
    handleExitReview,
    quoteNumber,
    customerName,
    windows,
    taxTotals,
    quoteResult,
    quoteNotes,
    surchargeRate,
    activePromoId,
    customJC,
    customMisc,
    customLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    attachedUpgrade,
    attachedDoorQuote,
    attachedSealedUnit,
    wantsUpgrade,
    isSupplyOnly,
    isServiceOnly,
    total,
    fileInputRef,
  });

  return {
    reviewQuoteId,
    setReviewQuoteId,
    reviewQuote,
    setReviewQuote,
    isEditMode,
    setIsEditMode,
    originalSnapshot,
    setOriginalSnapshot,
    reviewActionLoading: submissions.reviewActionLoading,
    showSubmitModal: submissions.showSubmitModal,
    setShowSubmitModal: submissions.setShowSubmitModal,
    assignedReviewer: submissions.assignedReviewer,
    setAssignedReviewer: submissions.setAssignedReviewer,
    preparerNotes: submissions.preparerNotes,
    setPreparerNotes: submissions.setPreparerNotes,
    submittingQuote: submissions.submittingQuote,
    staffList: submissions.staffList,
    setStaffList: submissions.setStaffList,
    clerkList: submissions.clerkList,
    setClerkList: submissions.setClerkList,
    adminSubmitMode: submissions.adminSubmitMode,
    setAdminSubmitMode: submissions.setAdminSubmitMode,
    showReassignModal: submissions.showReassignModal,
    setShowReassignModal: submissions.setShowReassignModal,
    reassignTo: submissions.reassignTo,
    setReassignTo: submissions.setReassignTo,
    reassignNotes: submissions.reassignNotes,
    setReassignNotes: submissions.setReassignNotes,
    showReturnModal: submissions.showReturnModal,
    setShowReturnModal: submissions.setShowReturnModal,
    returnNotes: submissions.returnNotes,
    setReturnNotes: submissions.setReturnNotes,
    showApproveOdooModal: submissions.showApproveOdooModal,
    setShowApproveOdooModal: submissions.setShowApproveOdooModal,
    selectedOdooClerk: submissions.selectedOdooClerk,
    setSelectedOdooClerk: submissions.setSelectedOdooClerk,
    showCompleteOdooModal: submissions.showCompleteOdooModal,
    setShowCompleteOdooModal: submissions.setShowCompleteOdooModal,
    odooOrderNumberInput: submissions.odooOrderNumberInput,
    setOdooOrderNumberInput: submissions.setOdooOrderNumberInput,
    showExitReviewForPdfModal: submissions.showExitReviewForPdfModal,
    setShowExitReviewForPdfModal: submissions.setShowExitReviewForPdfModal,
    isReviewerOrAdmin: permissions.isReviewerOrAdmin,
    isOdooClerk: permissions.isOdooClerk,
    isApprovedOrModified: permissions.isApprovedOrModified,
    canEditCurrentQuote: permissions.canEditCurrentQuote,
    canEditApprovedQuote: permissions.canEditApprovedQuote,
    isReadOnly: permissions.isReadOnly,
    handleOpenQuoteFromTab,
    handleSubmitForReview: submissions.handleSubmitForReview,
    handleSaveQuotePrices: submissions.handleSaveQuotePrices,
    handleCancelEdits,
    handleExitReview,
    handleApproveReviewQuote: submissions.handleApproveReviewQuote,
    confirmApproveReviewQuote: submissions.confirmApproveReviewQuote,
    handleCompleteOdooEntry: submissions.handleCompleteOdooEntry,
    handleReturnReviewQuote: submissions.handleReturnReviewQuote,
    submitReturnReviewQuote: submissions.submitReturnReviewQuote,
    handlePdfImportClick: submissions.handlePdfImportClick,
    handleExitReviewAndImportPdf: submissions.handleExitReviewAndImportPdf,
    handleResubmitReturnedQuote: submissions.handleResubmitReturnedQuote,
    handleReassignQuote: submissions.handleReassignQuote,
  };
}
