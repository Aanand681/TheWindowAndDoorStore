'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const SubmitReviewModal = dynamic(
  () => import('@/components/calculator/SubmitReviewModal').then((m) => m.SubmitReviewModal),
  { ssr: false }
);

export interface SubmitReviewModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  adminSubmitMode: 'direct_approve' | 'submit_review';
  setAdminSubmitMode: (mode: 'direct_approve' | 'submit_review') => void;
  quoteNumber: string;
  customerName: string;
  windowsCount: number;
  total: number;
  staffList: any[];
  clerkList: any[];
  assignedReviewer: string;
  setAssignedReviewer: (reviewer: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (clerk: string) => void;
  preparerNotes: string;
  setPreparerNotes: (notes: string) => void;
  submittingQuote: boolean;
  onSubmit: () => void;
}

export function SubmitReviewModalWrapper(props: SubmitReviewModalWrapperProps) {
  if (!props.isOpen) return null;
  return <SubmitReviewModal {...props} />;
}

