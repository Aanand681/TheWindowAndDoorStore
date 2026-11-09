'use client';

import React from 'react';
import QuotePreviewModal from '../../QuotePreviewModal';
import { computeQuotePricing } from '../quote-pricing-helper';
import type { QuoteTemplateType } from '@/components/quotes/invoice/types';

interface QuotePreviewModalWrapperProps {
  previewQuote: any;
  setPreviewQuote: (val: any) => void;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (val: boolean) => void;
  previewTemplate: QuoteTemplateType;
  setPreviewTemplate: (val: QuoteTemplateType) => void;
  previewFontSize: number;
  setPreviewFontSize: (val: number) => void;
  previewSpacing: number;
  setPreviewSpacing: (val: number) => void;
  previewNotes: string;
  setPreviewNotes: (val: string) => void;
  canReview: boolean;
  currentUser: any;
}

export function QuotePreviewModalWrapper({
  previewQuote,
  setPreviewQuote,
  isPreviewOpen,
  setIsPreviewOpen,
  previewTemplate,
  setPreviewTemplate,
  previewFontSize,
  setPreviewFontSize,
  previewSpacing,
  setPreviewSpacing,
  previewNotes,
  setPreviewNotes,
  canReview,
  currentUser,
}: QuotePreviewModalWrapperProps) {
  if (!previewQuote) return null;

  const financials = computeQuotePricing(previewQuote);
  if (!financials) return null;

  return (
    <QuotePreviewModal
      isOpen={isPreviewOpen}
      onClose={() => {
        setIsPreviewOpen(false);
        setPreviewQuote(null);
      }}
      customerName={previewQuote.customerName}
      quoteNumber={previewQuote.quoteNumber}
      windows={previewQuote.windows || []}
      taxTotals={previewQuote.taxTotals}
      quoteResult={previewQuote.quoteResult}
      activePromo={
        financials.promoDiscount > 0
          ? {
              name: previewQuote.quoteResult?.promoName || 'Applied Promo',
              discount: financials.promoDiscount,
            }
          : null
      }
      basePrice={financials.basePrice}
      surcharge={financials.surcharge}
      wantsUpgrade={false}
      shownUpgrade={0}
      hstRate={financials.hstRate}
      total={financials.total}
      beforeTaxDiscount={financials.beforeTaxDiscount}
      afterDiscount={financials.afterDiscount}
      firstPayment={financials.firstPayment}
      secondPayment={financials.secondPayment}
      regionName={previewQuote.taxTotals?.regionName || previewQuote.taxTotals?.city}
      includeLabourInPromo={financials.includeLabourInPromo}
      includeMiscInPromo={financials.includeMiscInPromo}
      includeJCInPromo={financials.includeJCInPromo}
      effectiveJC={financials.effectiveJC}
      effectiveMisc={financials.effectiveMisc}
      effectiveLabour={financials.effectiveLabour}
      template={previewTemplate}
      fontSize={previewFontSize}
      spacing={previewSpacing}
      quoteNotes={previewNotes}
      preparedBy={previewQuote.preparedBy}
      onTemplateChange={setPreviewTemplate}
      onFontSizeChange={setPreviewFontSize}
      onSpacingChange={setPreviewSpacing}
      onQuoteNotesChange={
        !canReview &&
        previewQuote?.odooAssignedTo?.toLowerCase() ===
          currentUser?.username?.toLowerCase()
          ? undefined
          : setPreviewNotes
      }
    />
  );
}
