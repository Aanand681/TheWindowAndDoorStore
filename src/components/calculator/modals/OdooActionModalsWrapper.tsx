'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const OdooActionModals = dynamic(
  () => import('@/components/calculator/OdooActionModals').then((m) => m.OdooActionModals),
  { ssr: false }
);

export interface OdooActionModalsWrapperProps {
  showApproveOdooModal: boolean;
  setShowApproveOdooModal: (show: boolean) => void;
  showCompleteOdooModal: boolean;
  setShowCompleteOdooModal: (show: boolean) => void;
  reviewQuote: any;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (clerk: string) => void;
  odooOrderNumberInput: string;
  setOdooOrderNumberInput: (val: string) => void;
  reviewActionLoading: boolean;
  clerkList: any[];
  staffList: any[];
  confirmApproveReviewQuote: () => void;
  handleCompleteOdooEntry: () => void;
}

export function OdooActionModalsWrapper(props: OdooActionModalsWrapperProps) {
  if (!props.showApproveOdooModal && !props.showCompleteOdooModal) {
    return null;
  }
  return <OdooActionModals {...props} />;
}

