'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SealedUnitLineItem } from '@/lib/sealed-units-logic';
import { SealedUnitTotals } from '@/components/sealed-units/invoice/types';

interface UseSealedUnitsReviewSubmitProps {
  user: any;
  quoteNumber: string;
  customerName: string;
  quoteNotes: string;
  lineItems: SealedUnitLineItem[];
  isInstallation: boolean;
  isServiceOnly: boolean;
  hstRate: number;
  totals: SealedUnitTotals;
  assignedReviewer: string;
  selectedOdooClerk: string;
}

export function useSealedUnitsReviewSubmit({
  user,
  quoteNumber,
  customerName,
  quoteNotes,
  lineItems,
  isInstallation,
  isServiceOnly,
  hstRate,
  totals,
  assignedReviewer,
  selectedOdooClerk,
}: UseSealedUnitsReviewSubmitProps) {
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false);
  const [adminSubmitMode, setAdminSubmitMode] = useState<'direct_approve' | 'submit_review'>('direct_approve');
  const [preparerNotes, setPreparerNotes] = useState<string>('');

  const handleSubmitForReview = async () => {
    if (!quoteNumber.trim() || !customerName.trim()) {
      toast.error('Please enter Customer Name and Quote Number before submitting!');
      return;
    }
    if (lineItems.length === 0 && !(isServiceOnly && (totals.totalSqft || 0) > 0)) {
      toast.error('Please add at least one sealed unit or enter service sq ft before submitting!');
      return;
    }

    const isDirectApprove = Boolean(
      (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && adminSubmitMode === 'direct_approve'
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
      const effectiveLineItems =
        lineItems.length > 0
          ? lineItems
          : [
              {
                id: 'service-unit-1',
                combinationName: 'On-Site Sealed Unit Glazing Service',
                paneType: 'dual',
                treatment: 'annealed',
                thicknessMm: 0,
                widthIn: 0,
                heightIn: 0,
                actualSqft: totals.totalSqft,
                billableSqft: Math.ceil(totals.totalSqft),
                quantity: 1,
                finalUnitPrice: 0,
                multipliedAmount: 0,
                multipliedTotal: 0,
                lineGlassTotal: 0,
                totalLabour: totals.serviceLabourTotal,
                totalMisc: totals.miscTotal,
              } as any,
            ];

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
          quoteNotes,
          windows: effectiveLineItems,
          taxTotals: {
            isSupplyOnly: !isInstallation,
            subtotalPreTax: totals.subtotalPreTax,
            grandTotal: totals.grandTotal,
            hstAmount: totals.hstAmount,
            hstRate,
            totalUnits: totals.totalUnits,
            totalSqft: totals.totalSqft,
            glassSupplyTotal: totals.glassSupplyTotal,
            combinedLabourTotal: totals.combinedLabourTotal,
            miscTotal: totals.miscTotal,
            baseSetupFee: totals.baseSetupFee,
            totalAdditionalTravel: totals.totalAdditionalTravel,
            isSealedUnitQuote: true,
          },
          quoteResult: {
            base: totals.glassBefore8PercentTotal,
            surcharge: totals.glass8PercentSurchargeTotal,
            total: totals.grandTotal,
            isSealedUnit: true,
          },
          quoteSummaryTotal: totals.grandTotal,
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

  return {
    showSubmitModal,
    setShowSubmitModal,
    submittingQuote,
    adminSubmitMode,
    setAdminSubmitMode,
    preparerNotes,
    setPreparerNotes,
    handleSubmitForReview,
  };
}

