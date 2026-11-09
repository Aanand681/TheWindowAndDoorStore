import React from 'react';
import {
  SealedUnitLineItem,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from '@/lib/sealed-units-logic';
import { formatDoorItemHeading } from '@/lib/doors/calculations';
import { SealedUnitTotals } from './types';

interface SealedUnitSummaryLedgerProps {
  lineItems: SealedUnitLineItem[];
  totals: SealedUnitTotals;
  isInstallation: boolean;
  isService: boolean;
  hstRate: number;
  firstPayment?: number;
  secondPayment?: number;
  attachedWindowQuote?: any | null;
  attachedDoorQuote?: any | null;
  textColor?: string;
  subtextColor?: string;
  borderColor?: string;
  totalBorderColor?: string;
}

export function SealedUnitSummaryLedger({
  lineItems,
  totals,
  isInstallation,
  isService,
  hstRate,
  attachedWindowQuote,
  attachedDoorQuote,
  textColor = 'text-gray-900',
  subtextColor = 'text-gray-700',
  borderColor = 'border-gray-300',
  totalBorderColor = 'border-gray-600',
}: SealedUnitSummaryLedgerProps) {
  const hasAttachedWindow = Boolean(attachedWindowQuote);
  const hasAttachedDoor = Boolean(attachedDoorQuote);
  const hasAnyAttached = hasAttachedWindow || hasAttachedDoor;

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
  const doorDiscount = hasAttachedDoor ? attachedDoorQuote.totals?.discountTotal || 0 : 0;
  const doorMat = hasAttachedDoor
    ? (attachedDoorQuote.totals?.rawDoorBaseTotal || 0) +
      (attachedDoorQuote.totals?.stormDoorTotal || 0) +
      (attachedDoorQuote.totals?.hardwareTotal || 0) -
      doorDiscount
    : 0;

  const winLabour = hasAttachedWindow ? attachedWindowQuote.totals?.labour || 0 : 0;
  const doorLabour = hasAttachedDoor ? attachedDoorQuote.totals?.combinedLabourTotal || 0 : 0;
  const winMisc = hasAttachedWindow ? attachedWindowQuote.totals?.misc || 0 : 0;
  const doorMisc = hasAttachedDoor ? attachedDoorQuote.totals?.miscTotal || 0 : 0;
  const rawWinSurcharge = hasAttachedWindow ? attachedWindowQuote.totals?.surcharge || 0 : 0;
  const winSurcharge =
    rawWinSurcharge > winBase && winBase > 0
      ? Math.round(winBase * 0.08 * 100) / 100
      : rawWinSurcharge;
  const doorSurcharge = hasAttachedDoor ? attachedDoorQuote.totals?.surchargeTotal || 0 : 0;

  const suMaterials = isService ? 0 : totals.glassBefore8PercentTotal;
  const combinedLabour = totals.combinedLabourTotal + winLabour + doorLabour;
  const combinedMisc = (totals.miscTotal || 0) + winMisc + doorMisc;
  const combinedSurcharge = totals.glass8PercentSurchargeTotal + winSurcharge + doorSurcharge;
  const combinedSubtotal = hasAnyAttached
    ? Math.round(
        (suMaterials +
          (winBase - winDiscount) +
          winJC +
          doorMat +
          combinedLabour +
          combinedMisc +
          combinedSurcharge) *
          100
      ) / 100
    : totals.subtotalPreTax;

  let combinedTax = totals.hstAmount;
  if (hasAnyAttached) {
    if (hstRate === 8) {
      const mat =
        totals.glassBefore8PercentTotal +
        totals.glass8PercentSurchargeTotal +
        (winBase - winDiscount + winJC + winSurcharge) +
        (doorMat + doorSurcharge);
      const srv = combinedLabour + combinedMisc;
      combinedTax = Math.round((mat * 0.05 + srv * 0.13) * 100) / 100;
    } else if (hstRate === 13) {
      combinedTax = Math.round(combinedSubtotal * 0.13 * 100) / 100;
    } else {
      combinedTax = 0;
    }
  }

  const grandTotal = hasAnyAttached ? combinedSubtotal + combinedTax : totals.grandTotal;
  const fp = Math.floor((grandTotal / 2) * 100) / 100;
  const sp = Math.round((grandTotal - fp) * 100) / 100;

  return (
    <div className={`space-y-1 font-mono text-[7.5pt] ${textColor}`}>
      {!isService ? (
        <>
          {/* 1. Unified Glass Summary Sentence */}
          {lineItems.length > 0 && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans font-medium capitalize truncate max-w-[200px]">
                {formatSealedUnitSummarySentence(lineItems)}
              </span>
              <span className="font-bold">${totals.glassBefore8PercentTotal.toFixed(2)}</span>
            </div>
          )}

          {/* Attached Window Units */}
          {hasAttachedWindow && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans font-medium truncate max-w-[200px]">
                {attachedWindowQuote.summarySentence ||
                  attachedWindowQuote.summaryLabel ||
                  `Attached Windows (#${attachedWindowQuote.quoteNumber})`}
              </span>
              <span className="font-bold">+${winBase.toFixed(2)}</span>
            </div>
          )}

          {/* Attached Window Jambs & Casing */}
          {hasAttachedWindow && winJC > 0 && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans font-medium truncate max-w-[200px]">
                {winJCDescription}
              </span>
              <span className="font-bold">+${winJC.toFixed(2)}</span>
            </div>
          )}

          {/* Attached Door Units (Itemized as Headings) */}
          {hasAttachedDoor &&
            (attachedDoorQuote?.lineItems && attachedDoorQuote.lineItems.length > 0 ? (
              attachedDoorQuote.lineItems.map((dItem: any, dIdx: number) => {
                const q = dItem.quantity || 1;
                const heading = formatDoorItemHeading(dItem);
                const itemBase = (dItem.inksterBasePrice || 0) * q;
                return (
                  <div key={dItem.id || dIdx} className="flex justify-between items-baseline py-0.5">
                    <span className="font-sans font-medium truncate max-w-[200px]">
                      {heading}
                    </span>
                    <span className="font-bold">+${itemBase.toFixed(2)}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-between items-baseline py-0.5">
                <span className="font-sans font-medium truncate max-w-[200px]">
                  Attached Doors (#{attachedDoorQuote.quoteNumber})
                </span>
                <span className="font-bold">+${doorMat.toFixed(2)}</span>
              </div>
            ))}

          {/* 2. Labour (installation or attached) */}
          {(isInstallation || hasAnyAttached) && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans">Labour {hasAnyAttached ? '(all quotes)' : ''}</span>
              <span className="font-semibold">+${combinedLabour.toFixed(2)}</span>
            </div>
          )}

          {/* 3. Miscellaneous */}
          {(isInstallation || hasAnyAttached) && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans">Miscellaneous {hasAnyAttached ? '(all quotes)' : ''}</span>
              <span className="font-semibold">+${combinedMisc.toFixed(2)}</span>
            </div>
          )}

          {/* 4. Surcharge (8%) */}
          <div className="flex justify-between items-baseline py-0.5">
            <span className="font-sans">
              Surcharge {hasAnyAttached ? '(8% on materials)' : '(8%)'}
            </span>
            <span className="font-semibold">+${combinedSurcharge.toFixed(2)}</span>
          </div>

          {/* Window Promo Discount */}
          {winDiscount > 0 && (
            <div className="flex justify-between items-baseline py-0.5 text-emerald-700 font-semibold">
              <span className="font-sans truncate max-w-[200px]">
                Promo ({winPromoName})
              </span>
              <span className="font-bold">-${winDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Door Discount */}
          {doorDiscount > 0 && (
            <div className="flex justify-between items-baseline py-0.5 text-emerald-700 font-semibold">
              <span className="font-sans truncate max-w-[200px]">
                10% Door Discount
              </span>
              <span className="font-bold">-${doorDiscount.toFixed(2)}</span>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Service Mode with Dynamic Units Count */}
          <div className="flex justify-between items-baseline py-0.5">
            <span className="font-sans font-medium">
              {getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)} (Labour)
            </span>
            <span className="font-bold">${combinedLabour.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline py-0.5">
            <span className="font-sans">Miscellaneous (Supplies)</span>
            <span className="font-semibold">+${combinedMisc.toFixed(2)}</span>
          </div>
        </>
      )}

      {/* 5. Subtotal */}
      <div className={`flex justify-between items-baseline border-t ${borderColor} pt-0.5 font-bold`}>
        <span className="font-sans">Subtotal</span>
        <span>${combinedSubtotal.toFixed(2)}</span>
      </div>

      {/* 6. Tax */}
      <div className={`flex justify-between items-baseline py-0.5 ${subtextColor}`}>
        <span className="font-sans">
          {hstRate === 8
            ? 'HST (8% First Nations)'
            : hstRate === 0
            ? 'Tax (Exempt)'
            : 'HST (13%)'}
        </span>
        <span>${combinedTax.toFixed(2)}</span>
      </div>

      {/* 7. Total */}
      <div
        className={`flex justify-between items-baseline border-t-2 ${totalBorderColor} pt-0.5 font-black text-[9pt]`}
      >
        <span className="font-sans uppercase">Total:</span>
        <span>${grandTotal.toFixed(2)}</span>
      </div>

      {/* 8. 50/50 Deposit */}
      <div
        className={`grid grid-cols-2 gap-1.5 pt-1 mt-0.5 border-t ${borderColor} font-sans text-center text-[7pt]`}
      >
        <div className="border border-gray-300 rounded py-0.5 px-1 bg-white">
          <span className="text-gray-500 uppercase block font-bold text-[6pt]">First 50%</span>
          <span className="font-mono font-bold">${fp.toFixed(2)}</span>
        </div>
        <div className="border border-gray-300 rounded py-0.5 px-1 bg-white">
          <span className="text-gray-500 uppercase block font-bold text-[6pt]">Final 50%</span>
          <span className="font-mono font-bold">${sp.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

