'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export interface UseQuoteReviewSubmissionStateParams {
  user: any;
  quoteNumber: string;
  customerName: string;
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
  attachedUpgrade?: any;
  attachedDoorQuote?: any;
  attachedSealedUnit?: any;
  wantsUpgrade?: boolean;
  isSupplyOnly?: boolean;
  isServiceOnly?: boolean;
  total: number;
}

export function useQuoteReviewSubmissionState({
  user,
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
}: UseQuoteReviewSubmissionStateParams) {
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [assignedReviewer, setAssignedReviewer] = useState<string>('');
  const [preparerNotes, setPreparerNotes] = useState<string>('');
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [clerkList, setClerkList] = useState<any[]>([]);
  const [adminSubmitMode, setAdminSubmitMode] = useState<'direct_approve' | 'submit_review'>('direct_approve');
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>('');

  const handleSubmitForReview = async () => {
    if (!quoteNumber.trim() || !customerName.trim()) {
      toast.error('Please enter a Quote Number and Customer Name');
      return;
    }

    const isDirectApprove = Boolean(
      (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') &&
        adminSubmitMode === 'direct_approve'
    );

    if (isDirectApprove && !selectedOdooClerk) {
      toast.error('Please select an Odoo clerk to assign this quote to');
      return;
    }
    if (!isDirectApprove && !assignedReviewer) {
      toast.error('Please select a reviewer to submit this quote to');
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
          assignedTo: isDirectApprove ? user?.username || '' : assignedReviewer,
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
          attachedUpgrade,
          attachedDoorQuote,
          attachedSealedUnit,
          wantsUpgrade,
          isSupplyOnly,
          isServiceOnly,
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit quote');

      if (isDirectApprove) {
        toast.success(
          `Quote #${quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`
        );
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

  return {
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
    selectedOdooClerk,
    setSelectedOdooClerk,
    handleSubmitForReview,
  };
}

