'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const QuotePreviewModal = dynamic(() => import('@/components/quotes/QuotePreviewModal'), {
  ssr: false,
});

export interface PreviewModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  onTemplateChange: (tpl: any) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  spacing: number;
  onSpacingChange: (spacing: number) => void;
  quoteNotes: string;
  onQuoteNotesChange?: (notes: string) => void;
  preparedBy: string;
  customerName: string;
  quoteNumber: string;
  windows: any[];
  taxTotals: any;
  quoteResult: any;
  activePromo: { name: string; discount: number } | null;
  basePrice: number;
  surcharge: number;
  wantsUpgrade: boolean;
  shownUpgrade: number;
  hstRate: number;
  total: number;
  beforeTaxDiscount: number;
  afterDiscount: number;
  firstPayment: number;
  secondPayment: number;
  regionName?: string;
  includeLabourInPromo: boolean;
  includeMiscInPromo: boolean;
  includeJCInPromo: boolean;
  effectiveJC: number;
  effectiveMisc: number;
  effectiveLabour: number;
  attachedUpgrade: any;
  attachedSealedUnit: any;
  attachedDoorQuote: any;
  isSupplyOnly: boolean;
}

export function PreviewModalWrapper(props: PreviewModalWrapperProps) {
  if (!props.isOpen) return null;
  return <QuotePreviewModal {...props} />;
}

