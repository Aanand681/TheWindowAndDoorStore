'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { detectQuoteChanges } from '@/lib/quote-diff';

export interface UseReviewOdooActionsParams {
  user: any;
  reviewQuoteId: string | null;
  reviewQuote: any;
  originalSnapshot: any;
  quoteNumber: string;
  windows: any[];
  taxTotals: any;
  quoteResult: any;
  quoteNotes: string;
  surchargeRate: number;
  activePromoId: string;
  customJC: string;
  customMisc: string;
  customLabour: string;
  includeJCInPromo: boolean;
  includeMiscInPromo: boolean;
  includeLabourInPromo: boolean;
  total: number;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (clerk: string) => void;
  staffList: any[];
  clerkList: any[];
  handleExitReview: () => void;
  setReviewActionLoading: (loading: boolean) => void;
}

export function useReviewOdooActions({
  user,
  reviewQuoteId,
  reviewQuote,
  originalSnapshot,
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
  total,
  selectedOdooClerk,
  setSelectedOdooClerk,
  staffList,
  clerkList,
  handleExitReview,
  setReviewActionLoading,
}: UseReviewOdooActionsParams) {
  const [showApproveOdooModal, setShowApproveOdooModal] = useState<boolean>(false);
  const [showCompleteOdooModal, setShowCompleteOdooModal] = useState<boolean>(false);
  const [odooOrderNumberInput, setOdooOrderNumberInput] = useState<string>('');

  const handleApproveReviewQuote = () => {
    if (!reviewQuoteId) return;
    const defaultClerk =
      (clerkList.length > 0 ? clerkList : staffList).find((c: any) => c.department === 'CLERK') ||
      clerkList[0] ||
      staffList[0];
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
        toast.success(
          `Quote #${reviewQuote.quoteNumber} marked as entered in Odoo with Order #${orderNumber}!`
        );
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

  return {
    showApproveOdooModal,
    setShowApproveOdooModal,
    showCompleteOdooModal,
    setShowCompleteOdooModal,
    odooOrderNumberInput,
    setOdooOrderNumberInput,
    handleApproveReviewQuote,
    confirmApproveReviewQuote,
    handleCompleteOdooEntry,
  };
}

