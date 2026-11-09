'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DoorPreviewModalProps } from './preview/types';
import { DoorPrintToolbar } from './preview/DoorPrintToolbar';
import { DoorPrintInvoice } from './preview/DoorPrintInvoice';

export { type DoorPreviewModalProps } from './preview/types';

export function DoorPreviewModal({
  isOpen,
  onClose,
  lineItems,
  totals,
  mode,
  globalUpcharges,
  customerName = 'Valued Customer',
  quoteNumber: propQuoteNumber,
  preparedBy = 'The Window & Door Store',
  quoteNotes,
  onQuoteNotesChange,
  isFirstNation,
  attachedWindowQuote,
  attachedSealedUnit,
}: DoorPreviewModalProps) {
  const quoteNumber = propQuoteNumber || 'DQ-DRAFT';
  const [mounted, setMounted] = useState(false);
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [quoteDate, setQuoteDate] = useState<string>('');

  const hasAttachedWindow = Boolean(attachedWindowQuote);
  const hasAttachedSU = Boolean(attachedSealedUnit);
  const hasAnyAttached = hasAttachedWindow || hasAttachedSU;
  const isInstallation = mode === 'installation';

  const winBase = hasAttachedWindow
    ? attachedWindowQuote.totals?.base || attachedWindowQuote.totals?.subtotal || 0
    : 0;
  const winJC = hasAttachedWindow
    ? attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0
    : 0;
  const winJCDescription = attachedWindowQuote?.jcLabel || 'Jambs & Casing';
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount ||
        attachedWindowQuote.quoteResult?.promoDiscount ||
        attachedWindowQuote.data?.promoDiscount ||
        0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0;
  const winPromoName =
    attachedWindowQuote?.promoName ||
    attachedWindowQuote?.quoteResult?.promoName ||
    'Window Promo';
  const suGlass = hasAttachedSU
    ? attachedSealedUnit.totals?.glassBefore8PercentTotal || 0
    : 0;
  const winLabour = hasAttachedWindow ? attachedWindowQuote.totals?.labour || 0 : 0;
  const suLabour = hasAttachedSU
    ? attachedSealedUnit.totals?.serviceLabourTotal ??
      attachedSealedUnit.totals?.combinedLabourTotal ??
      0
    : 0;
  const winMisc = hasAttachedWindow ? attachedWindowQuote.totals?.misc || 0 : 0;
  const suMisc = hasAttachedSU ? attachedSealedUnit.totals?.miscTotal || 0 : 0;
  const rawWinSurcharge = hasAttachedWindow ? attachedWindowQuote.totals?.surcharge || 0 : 0;
  const winSurcharge =
    rawWinSurcharge > winBase && winBase > 0
      ? Math.round(winBase * 0.08 * 100) / 100
      : rawWinSurcharge;
  const suSurcharge = hasAttachedSU
    ? attachedSealedUnit.totals?.glass8PercentSurchargeTotal || 0
    : 0;

  const netDoorMaterials =
    totals.rawDoorBaseTotal +
    totals.stormDoorTotal +
    totals.hardwareTotal -
    totals.discountTotal;
  const combinedLabour = (isInstallation ? totals.combinedLabourTotal : 0) + winLabour + suLabour;
  const combinedMisc = (isInstallation ? totals.miscTotal : 0) + winMisc + suMisc;
  const combinedSurcharge = totals.surchargeTotal + winSurcharge + suSurcharge;
  const combinedSubtotal = hasAnyAttached
    ? Math.round(
        (netDoorMaterials +
          (winBase - winDiscount) +
          winJC +
          suGlass +
          combinedLabour +
          combinedMisc +
          combinedSurcharge) *
          100
      ) / 100
    : totals.subtotalPreTax;

  let combinedTax = totals.hstAmount;
  if (hasAnyAttached) {
    if (isFirstNation) {
      const mat =
        netDoorMaterials +
        totals.surchargeTotal +
        (winBase - winDiscount + winSurcharge + winJC) +
        (suGlass + suSurcharge);
      const srv = combinedLabour + combinedMisc;
      combinedTax = Math.round((mat * 0.05 + srv * 0.13) * 100) / 100;
    } else {
      combinedTax = Math.round(combinedSubtotal * 0.13 * 100) / 100;
    }
  }

  const finalGrandTotal = hasAnyAttached ? combinedSubtotal + combinedTax : totals.grandTotal;
  const firstPayment = Math.floor((finalGrandTotal / 2) * 100) / 100;
  const secondPayment = Math.round((finalGrandTotal - firstPayment) * 100) / 100;

  useEffect(() => {
    setMounted(true);
    setQuoteDate(
      new Date().toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('quote-modal-open');
      return () => {
        document.body.classList.remove('quote-modal-open');
      };
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const upgradeItems = lineItems.filter((i) => i.upgradeOption?.enabled);

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md overflow-hidden print:p-0 print:m-0 print:bg-white print:static print:overflow-visible">
      <DoorPrintToolbar
        showNotesEditor={showNotesEditor}
        setShowNotesEditor={setShowNotesEditor}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={onQuoteNotesChange}
        onPrint={handlePrint}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-muted/30 print:p-0 print:m-0 print:bg-white print:block print:w-full print:overflow-visible">
        <DoorPrintInvoice
          quoteNumber={quoteNumber}
          quoteDate={quoteDate}
          customerName={customerName}
          preparedBy={preparedBy}
          isInstallation={isInstallation}
          totals={totals}
          lineItems={lineItems}
          globalUpcharges={globalUpcharges}
          upgradeItems={upgradeItems}
          quoteNotes={quoteNotes}
          isFirstNation={isFirstNation}
          hasAttachedWindow={hasAttachedWindow}
          hasAttachedSU={hasAttachedSU}
          attachedWindowQuote={attachedWindowQuote}
          winBase={winBase}
          winJC={winJC}
          winJCDescription={winJCDescription}
          suGlass={suGlass}
          combinedLabour={combinedLabour}
          combinedMisc={combinedMisc}
          combinedSurcharge={combinedSurcharge}
          winDiscount={winDiscount}
          winPromoName={winPromoName}
          combinedSubtotal={combinedSubtotal}
          combinedTax={combinedTax}
          finalGrandTotal={finalGrandTotal}
          firstPayment={firstPayment}
          secondPayment={secondPayment}
        />
      </div>
    </div>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
