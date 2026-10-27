'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { detectQuoteChanges } from '@/lib/quote-diff';
import { QuotesSubTabType } from '@/components/QuotesTab';

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
  quotesSubTab,
  setQuotesSubTab,
  setActiveTab,
  fileInputRef,
  resetCalculatorDefaults,
}: UseCalculatorReviewActionsProps) {
  // Review Mode & Snapshot State
  const [reviewQuoteId, setReviewQuoteId] = useState<string | null>(null);
  const [reviewQuote, setReviewQuote] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [originalSnapshot, setOriginalSnapshot] = useState<any>(null);
  const [reviewActionLoading, setReviewActionLoading] = useState<boolean>(false);

  // Submit Modal State
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [assignedReviewer, setAssignedReviewer] = useState<string>('');
  const [preparerNotes, setPreparerNotes] = useState<string>('');
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [clerkList, setClerkList] = useState<any[]>([]);
  const [adminSubmitMode, setAdminSubmitMode] = useState<'direct_approve' | 'submit_review'>('direct_approve');

  // Reassign Modal State
  const [showReassignModal, setShowReassignModal] = useState<boolean>(false);
  const [reassignTo, setReassignTo] = useState<string>('');
  const [reassignNotes, setReassignNotes] = useState<string>('');

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const [returnNotes, setReturnNotes] = useState<string>('');

  // Odoo Actions State
  const [showApproveOdooModal, setShowApproveOdooModal] = useState<boolean>(false);
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>('');
  const [showCompleteOdooModal, setShowCompleteOdooModal] = useState<boolean>(false);
  const [odooOrderNumberInput, setOdooOrderNumberInput] = useState<string>('');

  // PDF Safety Confirmation
  const [showExitReviewForPdfModal, setShowExitReviewForPdfModal] = useState<boolean>(false);

  // Permissions
  const effectivePerms = user?.permissions || user?.departmentPermissions || {};
  const isSuperAdmin = Boolean(user && user.role === 'SUPERADMIN');
  const isAdmin = Boolean(user && (user.role === 'ADMIN' || isSuperAdmin));
  const canReview = Boolean(isAdmin || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote);
  const canEditApprovedQuote = Boolean(isAdmin || effectivePerms.canEditApprovedQuote);

  const isReviewerOrAdmin = Boolean(
    isAdmin || (user && reviewQuote && reviewQuote.assignedTo === user.username) || canReview
  );

  const isOdooClerk = Boolean(
    !canReview && (
      user?.department === 'CLERK' ||
      ((effectivePerms.canMarkOdooEntry || effectivePerms.canAccessOdooQueue) &&
       (isAdmin || (user && reviewQuote && reviewQuote.odooAssignedTo === user.username)))
    )
  );

  const isApprovedOrModified = reviewQuote?.status === 'APPROVED' || reviewQuote?.status === 'MODIFIED';
  const canEditCurrentQuote = Boolean(!isOdooClerk && (isApprovedOrModified ? canEditApprovedQuote : true));
  const isReadOnly = Boolean(reviewQuote && (!isEditMode || !canEditCurrentQuote));

  // Handlers
  const handleOpenQuoteFromTab = (qId: string, isEdit?: boolean, originSubTab?: QuotesSubTabType) => {
    if (originSubTab) {
      setQuotesSubTab(originSubTab);
    }
    setReviewQuoteId(qId);
    setActiveTab('promo');
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'promo', reviewQuoteId: qId, isEdit }, '', `/?reviewQuoteId=${qId}${isEdit ? '&edit=true' : ''}`);
    }
    fetch(`/api/quotes/${qId}?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(q => {
        if (q && q._id) {
          const isClerk = Boolean(
            !canReview && (user?.department === 'CLERK' || effectivePerms.canMarkOdooEntry || effectivePerms.canAccessOdooQueue)
          );
          const isApproved = q.status === 'APPROVED' || q.status === 'MODIFIED';
          const allowEdit = Boolean(isEdit && !isClerk && (isApproved ? canEditApprovedQuote : true));
          setIsEditMode(allowEdit);

          setReviewQuote(q);
          setOriginalSnapshot(q.initialSnapshot || q);
          if (q.windows?.length) setWindows(q.windows);
          if (q.customerName) setCustomerName(q.customerName);
          if (q.quoteNumber) setQuoteNumber(q.quoteNumber);
          if (q.quoteNotes) setQuoteNotes(q.quoteNotes);
          if (q.surchargeRate !== undefined) setSurchargeRate(q.surchargeRate);
          if (q.activePromoId) {
            setActivePromoId(q.activePromoId);
            setLockedPromoId(q.activePromoId);
          }
          if (q.customJC !== undefined) setCustomJC(String(q.customJC || ''));
          if (q.customMisc !== undefined) setCustomMisc(String(q.customMisc || ''));
          if (q.customLabour !== undefined) setCustomLabour(String(q.customLabour || ''));
          if (q.includeJCInPromo !== undefined) setIncludeJCInPromo(Boolean(q.includeJCInPromo));
          if (q.includeMiscInPromo !== undefined) setIncludeMiscInPromo(Boolean(q.includeMiscInPromo));
          if (q.includeLabourInPromo !== undefined) setIncludeLabourInPromo(Boolean(q.includeLabourInPromo));
          if (q.taxTotals) {
            setTaxTotals({ ...q.taxTotals, _quoteId: q._id, _quoteNumber: q.quoteNumber });
          }
          toast.info(allowEdit ? `Loaded Quote #${q.quoteNumber} in Edit Mode` : `Loaded Quote #${q.quoteNumber} in Review Mode`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch(console.error);
  };

  const handleSubmitForReview = async () => {
    if (!quoteNumber.trim() || !customerName.trim()) {
      toast.error("Please enter a Quote Number and Customer Name");
      return;
    }

    const isDirectApprove = Boolean((user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && adminSubmitMode === 'direct_approve');

    if (isDirectApprove && !selectedOdooClerk) {
      toast.error("Please select an Odoo clerk to assign this quote to");
      return;
    }
    if (!isDirectApprove && !assignedReviewer) {
      toast.error("Please select a reviewer to submit this quote to");
      return;
    }

    setSubmittingQuote(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteNumber,
          customerName,
          assignedTo: isDirectApprove ? (user?.username || '') : assignedReviewer,
          directApprove: isDirectApprove,
          odooAssignedTo: isDirectApprove ? selectedOdooClerk : undefined,
          preparerNotes,
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
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit quote');

      if (isDirectApprove) {
        toast.success(`Quote #${quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`);
      } else {
        toast.success(`Quote #${quoteNumber} submitted to ${assignedReviewer} for review!`);
      }
      setShowSubmitModal(false);
      setPreparerNotes('');
      window.dispatchEvent(new CustomEvent('quote-count-updated'));
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleSaveQuotePrices = async () => {
    if (!reviewQuoteId) return;
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          quoteNumber,
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
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');
      toast.success(`Quote #${quoteNumber} changes saved successfully!`);
      if (data.quote) {
        setReviewQuote(data.quote);
        if (data.quote.initialSnapshot) {
          setOriginalSnapshot(data.quote.initialSnapshot);
        }
      }
      setIsEditMode(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save price updates');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleCancelEdits = () => {
    if (!reviewQuote) {
      setIsEditMode(false);
      return;
    }
    if (reviewQuote.windows?.length) setWindows(reviewQuote.windows);
    if (reviewQuote.customerName) setCustomerName(reviewQuote.customerName);
    if (reviewQuote.quoteNumber) setQuoteNumber(reviewQuote.quoteNumber);
    if (reviewQuote.quoteNotes !== undefined) setQuoteNotes(reviewQuote.quoteNotes);
    if (reviewQuote.surchargeRate !== undefined) setSurchargeRate(reviewQuote.surchargeRate);
    if (reviewQuote.activePromoId) {
      setActivePromoId(reviewQuote.activePromoId);
      setLockedPromoId(reviewQuote.activePromoId);
    }
    setCustomJC(String(reviewQuote.customJC || ''));
    setCustomMisc(String(reviewQuote.customMisc || ''));
    setCustomLabour(String(reviewQuote.customLabour || ''));
    setIncludeJCInPromo(reviewQuote.includeJCInPromo !== false);
    setIncludeMiscInPromo(reviewQuote.includeMiscInPromo !== false);
    setIncludeLabourInPromo(reviewQuote.includeLabourInPromo !== false);
    if (reviewQuote.taxTotals) {
      setTaxTotals({ ...reviewQuote.taxTotals, _quoteId: reviewQuote._id, _quoteNumber: reviewQuote.quoteNumber });
    }
    setIsEditMode(false);
    toast.info("Edits cancelled. Reverted back to saved quote.");
  };

  const handleExitReview = () => {
    setIsEditMode(false);
    setReviewQuote(null);
    setReviewQuoteId(null);
    setOriginalSnapshot(null);
    resetCalculatorDefaults();

    let defaultTab: string = 'my';
    if (canReview) defaultTab = 'review';
    else if (isOdooClerk) defaultTab = 'odoo';

    const targetSubTab = (quotesSubTab || defaultTab) as QuotesSubTabType;
    setQuotesSubTab(targetSubTab);
    setActiveTab('quotes');
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'quotes', sub: targetSubTab }, '', `/?tab=quotes&sub=${targetSubTab}`);
    }
    const tabName = targetSubTab === 'review'
      ? 'Pending Review queue'
      : targetSubTab === 'odoo'
      ? 'Odoo Entry queue'
      : targetSubTab === 'odoo_completed'
      ? 'Completed in Odoo'
      : targetSubTab === 'all'
      ? 'All Quotes'
      : targetSubTab === 'all_assigned'
      ? 'Total Assigned'
      : 'your Quote History';
    toast.info(`Exited review mode. Returned to ${tabName}.`);
  };

  const handleApproveReviewQuote = () => {
    if (!reviewQuoteId) return;
    const defaultClerk = (clerkList.length > 0 ? clerkList : staffList).find((c: any) => c.department === 'CLERK') || (clerkList[0] || staffList[0]);
    setSelectedOdooClerk(reviewQuote?.odooAssignedTo || defaultClerk?.username || '');
    setShowApproveOdooModal(true);
  };

  const confirmApproveReviewQuote = async () => {
    if (!reviewQuoteId) return;
    if (!selectedOdooClerk) {
      toast.error('Please select an Odoo clerk before approving the quote.');
      return;
    }
    setReviewActionLoading(true);

    const currentQuoteState = {
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
      quoteSummaryTotal: total,
    };

    const reviewChanges = detectQuoteChanges(originalSnapshot, currentQuoteState);
    const finalStatus = reviewChanges.length > 0 ? 'MODIFIED' : 'APPROVED';

    try {
      const payload: any = {
        status: finalStatus,
        reviewChanges,
        reviewerNotes: `Reviewed and approved by ${user?.username || 'Admin'}`,
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
        quoteSummaryTotal: total,
        odooAssignedTo: selectedOdooClerk,
      };

      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');
      toast.success(`Quote #${quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`);
      setShowApproveOdooModal(false);
      handleExitReview();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve quote');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleCompleteOdooEntry = async () => {
    if (!reviewQuoteId) return;
    const orderNumber = odooOrderNumberInput.trim();
    if (!orderNumber) {
      toast.error('Please enter the Odoo Sales Order # before confirming.');
      return;
    }
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odooStatus: 'COMPLETED',
          odooOrderNumber: orderNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Quote #${reviewQuote.quoteNumber} marked as entered in Odoo with Order #${orderNumber}!`);
        setShowCompleteOdooModal(false);
        setOdooOrderNumberInput('');
        handleExitReview();
      } else {
        toast.error(data.error || 'Failed to update Odoo status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update Odoo status');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleReturnReviewQuote = () => {
    setReturnNotes('');
    setShowReturnModal(true);
  };

  const submitReturnReviewQuote = async () => {
    if (!reviewQuoteId) return;
    if (!returnNotes.trim()) {
      toast.error("Please enter revision instructions for the preparer.");
      return;
    }
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RETURNED',
          reviewerNotes: returnNotes.trim(),
        }),
      });
      if (res.ok) {
        toast.info(`Quote returned to ${reviewQuote.preparedBy}`);
        setShowReturnModal(false);
        handleExitReview();
      }
    } catch (err) {
      toast.error('Failed to return quote');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handlePdfImportClick = () => {
    if (reviewQuote) {
      setShowExitReviewForPdfModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleExitReviewAndImportPdf = () => {
    setShowExitReviewForPdfModal(false);
    handleExitReview();
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleResubmitReturnedQuote = async () => {
    if (!reviewQuoteId) return;
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PENDING_REVIEW',
          reviewerNotes: '',
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
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resubmit quote');
      toast.success(`Quote #${quoteNumber} resubmitted to ${reviewQuote.assignedTo || 'reviewer'} for review!`);
      handleExitReview();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resubmit quote');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleReassignQuote = async () => {
    if (!reviewQuoteId || !reassignTo) return;
    setReviewActionLoading(true);
    try {
      const updatedNotes = reassignNotes.trim()
        ? (reviewQuote.preparerNotes ? `${reviewQuote.preparerNotes} | Forwarded to ${reassignTo}: ${reassignNotes.trim()}` : `Forwarded to ${reassignTo}: ${reassignNotes.trim()}`)
        : reviewQuote.preparerNotes;

      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: reassignTo,
          status: 'PENDING_REVIEW',
          preparerNotes: updatedNotes,
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
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to forward quote');
      toast.success(`Quote #${quoteNumber} forwarded to ${reassignTo} for review!`);
      setShowReassignModal(false);
      handleExitReview();
    } catch (err: any) {
      toast.error(err.message || 'Failed to forward quote');
    } finally {
      setReviewActionLoading(false);
    }
  };

  return {
    reviewQuoteId,
    setReviewQuoteId,
    reviewQuote,
    setReviewQuote,
    isEditMode,
    setIsEditMode,
    originalSnapshot,
    setOriginalSnapshot,
    reviewActionLoading,
    showSubmitModal,
    setShowSubmitModal,
    assignedReviewer,
    setAssignedReviewer,
    preparerNotes,
    setPreparerNotes,
    submittingQuote,
    staffList,
    setStaffList,
    clerkList,
    setClerkList,
    adminSubmitMode,
    setAdminSubmitMode,
    showReassignModal,
    setShowReassignModal,
    reassignTo,
    setReassignTo,
    reassignNotes,
    setReassignNotes,
    showReturnModal,
    setShowReturnModal,
    returnNotes,
    setReturnNotes,
    showApproveOdooModal,
    setShowApproveOdooModal,
    selectedOdooClerk,
    setSelectedOdooClerk,
    showCompleteOdooModal,
    setShowCompleteOdooModal,
    odooOrderNumberInput,
    setOdooOrderNumberInput,
    showExitReviewForPdfModal,
    setShowExitReviewForPdfModal,
    isReviewerOrAdmin,
    isOdooClerk,
    isApprovedOrModified,
    canEditCurrentQuote,
    canEditApprovedQuote,
    isReadOnly,
    handleOpenQuoteFromTab,
    handleSubmitForReview,
    handleSaveQuotePrices,
    handleCancelEdits,
    handleExitReview,
    handleApproveReviewQuote,
    confirmApproveReviewQuote,
    handleCompleteOdooEntry,
    handleReturnReviewQuote,
    submitReturnReviewQuote,
    handlePdfImportClick,
    handleExitReviewAndImportPdf,
    handleResubmitReturnedQuote,
    handleReassignQuote,
  };
}
