'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UseDoorReviewSubmitProps {
  user: any;
  isAdmin: boolean;
  customerName: string;
  quoteNumber: string;
  lineItems: any[];
  mode: any;
  quoteNotes: string;
  isFirstNation: boolean;
  totals: any;
}

export function useDoorReviewSubmit({
  user,
  isAdmin,
  customerName,
  quoteNumber,
  lineItems,
  mode,
  quoteNotes,
  isFirstNation,
  totals,
}: UseDoorReviewSubmitProps) {
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false);
  const [assignedReviewer, setAssignedReviewer] = useState<string>('');
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>('');
  const [adminSubmitMode, setAdminSubmitMode] = useState<'direct_approve' | 'submit_review'>(
    'direct_approve'
  );
  const [preparerNotes, setPreparerNotes] = useState<string>('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [clerkList, setClerkList] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()).catch(() => []),
      fetch('/api/users?canBeAssigned=true').then((r) => r.json()).catch(() => []),
    ]).then(([allUsers, assignees]) => {
      if (Array.isArray(allUsers)) {
        const eligible = allUsers.filter(
          (d: any) =>
            d.role !== 'SUPERADMIN' &&
            d.role !== 'superadmin' &&
            !d.username?.toLowerCase().includes('superadmin')
        );
        setStaffList(eligible);
        if (eligible.length > 0) {
          setAssignedReviewer(eligible[0].username);
        }
      }
      if (Array.isArray(assignees)) {
        const eligible = assignees.filter(
          (d: any) =>
            d.role !== 'SUPERADMIN' &&
            d.role !== 'superadmin' &&
            !d.username?.toLowerCase().includes('superadmin')
        );
        setClerkList(eligible);
        if (eligible.length > 0) {
          setSelectedOdooClerk(eligible[0].username);
        }
      }
    });
  }, []);

  const handleSubmitQuote = async () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required before submitting quote.');
      return;
    }

    if (!quoteNumber.trim()) {
      toast.error('Quote number is required before submitting quote.');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one door to the quote before submitting!');
      return;
    }

    const isDirectApprove = Boolean(isAdmin && adminSubmitMode === 'direct_approve');
    if (isDirectApprove && !selectedOdooClerk && clerkList.length > 0) {
      setSelectedOdooClerk(clerkList[0].username);
    }
    if (!isDirectApprove && !assignedReviewer && staffList.length > 0) {
      setAssignedReviewer(staffList[0].username);
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
          quoteNotes,
          windows: lineItems.map((item) => ({
            id: item.id,
            combinationName: item.customDescription || item.presetLabel,
            doorPresetId: item.presetId,
            category: item.category,
            quantity: item.quantity,
            inksterBasePrice: item.inksterBasePrice,
            finalUnitPrice: item.inksterBasePrice,
            lineTotal:
              mode === 'supply_only'
                ? item.lineSupplyTotal ??
                item.lineDoorSupplyTotal +
                item.lineHardwareTotal +
                item.surchargeAmount * item.quantity -
                item.discountAmount * item.quantity
                : item.lineGrandTotal,
            hardwareType: item.hardwareType,
            hardwarePrice: item.hardwarePrice,
            upgradeOption: item.upgradeOption,
          })),
          taxTotals: {
            isSupplyOnly: mode === 'supply_only',
            isFirstNation,
            totalPrice: totals.rawDoorBaseTotal + totals.stormDoorTotal,
            subtotal: totals.subtotalPreTax,
            combinedLabour: totals.combinedLabourTotal,
            miscTotal: totals.miscTotal,
            surchargeTotal: totals.surchargeTotal,
            discountTotal: totals.discountTotal,
            hstAmount: totals.hstAmount,
            grandTotal: totals.grandTotal,
            depositAmount: totals.depositAmount,
          },
          status: isDirectApprove ? 'APPROVED' : 'PENDING_REVIEW',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit quote');

      toast.success(
        isDirectApprove
          ? 'Door quote approved and assigned!'
          : 'Door quote submitted for review!'
      );
      setShowSubmitModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error submitting quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  return {
    showSubmitModal,
    setShowSubmitModal,
    submittingQuote,
    assignedReviewer,
    setAssignedReviewer,
    selectedOdooClerk,
    setSelectedOdooClerk,
    adminSubmitMode,
    setAdminSubmitMode,
    preparerNotes,
    setPreparerNotes,
    staffList,
    clerkList,
    handleSubmitQuote,
  };
}

