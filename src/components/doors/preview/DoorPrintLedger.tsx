'use client';

import React from 'react';
import { DoorLineItem, DoorQuoteTotals } from '@/lib/doors/types';
import { formatDoorItemHeading } from '@/lib/doors/calculations';

export interface DoorPrintLedgerProps {
  lineItems: DoorLineItem[];
  totals: DoorQuoteTotals;
  isFirstNation: boolean;
  hasAttachedWindow: boolean;
  hasAttachedSU: boolean;
  attachedWindowQuote?: any;
  winBase: number;
  winJC: number;
  winJCDescription: string;
  suGlass: number;
  combinedLabour: number;
  combinedMisc: number;
  combinedSurcharge: number;
  winDiscount: number;
  winPromoName: string;
  combinedSubtotal: number;
  combinedTax: number;
  finalGrandTotal: number;
  firstPayment: number;
  secondPayment: number;
}

export function DoorPrintLedger({
  lineItems,
  totals,
  isFirstNation,
  hasAttachedWindow,
  hasAttachedSU,
  attachedWindowQuote,
  winBase,
  winJC,
  winJCDescription,
  suGlass,
  combinedLabour,
  combinedMisc,
  combinedSurcharge,
  winDiscount,
  winPromoName,
  combinedSubtotal,
  combinedTax,
  finalGrandTotal,
  firstPayment,
  secondPayment,
}: DoorPrintLedgerProps) {
  return (
    <div className="border border-slate-300 rounded p-3 bg-slate-50 text-[8pt] space-y-1.5">
      <div className="font-bold text-slate-900 uppercase tracking-wider text-[7.5pt] border-b border-slate-300 pb-1">
        Summary
      </div>

      {lineItems.length > 0 ? (
        lineItems.map((item, idx) => {
          const qty = item.quantity || 1;
          const heading = formatDoorItemHeading(item);
          const itemBaseTotal = item.inksterBasePrice * qty;
          return (
            <div key={item.id || idx} className="flex justify-between text-[7.5pt]">
              <span className="text-slate-600 truncate max-w-[200px]">{heading}:</span>
              <span className="font-mono font-semibold shrink-0">${itemBaseTotal.toFixed(2)}</span>
            </div>
          );
        })
      ) : (
        <div className="flex justify-between text-[7.5pt]">
          <span className="text-slate-600">Door Units:</span>
          <span className="font-mono font-semibold">$0.00</span>
        </div>
      )}

      {hasAttachedWindow && (
        <div className="flex justify-between text-[7.5pt]">
          <span className="text-slate-600 truncate max-w-[200px]">
            {attachedWindowQuote.summarySentence ||
              attachedWindowQuote.summaryLabel ||
              'Attached Window Glass'}
            :
          </span>
          <span className="font-mono font-semibold shrink-0">+${winBase.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedWindow && winJC > 0 && (
        <div className="flex justify-between text-[7.5pt]">
          <span className="text-slate-600 truncate max-w-[200px]">{winJCDescription}:</span>
          <span className="font-mono font-semibold shrink-0">+${winJC.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedSU && (
        <div className="flex justify-between text-[7.5pt]">
          <span className="text-slate-600 truncate max-w-[200px]">Attached Sealed Glass:</span>
          <span className="font-mono font-semibold shrink-0">+${suGlass.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between text-[7.5pt]">
        <span className="text-slate-600">Labour:</span>
        <span className="font-mono font-semibold">${combinedLabour.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-[7.5pt]">
        <span className="text-slate-600">Miscellaneous:</span>
        <span className="font-mono font-semibold">${combinedMisc.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-[7.5pt]">
        <span className="text-slate-600">Surcharge:</span>
        <span className="font-mono font-semibold">${combinedSurcharge.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-[7.5pt] text-emerald-700 font-semibold">
        <span>10% Door Discount:</span>
        <span className="font-mono">-${totals.discountTotal.toFixed(2)}</span>
      </div>

      {winDiscount > 0 && (
        <div className="flex justify-between text-[7.5pt] text-emerald-700 font-semibold">
          <span className="truncate max-w-[200px]">Promo ({winPromoName}):</span>
          <span className="font-mono shrink-0">-${winDiscount.toFixed(2)}</span>
        </div>
      )}

      {totals.hardwareTotal > 0 && (
        <div className="flex justify-between text-[7.5pt]">
          <span className="text-slate-600">Hardware &amp; Lockset:</span>
          <span className="font-mono font-semibold">${totals.hardwareTotal.toFixed(2)}</span>
        </div>
      )}

      <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-[8.5pt]">
        <span>Subtotal:</span>
        <span className="font-mono">${combinedSubtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-[7.5pt] text-slate-600">
        <span>HST ({isFirstNation ? '5% GST FN' : '13%'}):</span>
        <span className="font-mono font-semibold">${combinedTax.toFixed(2)}</span>
      </div>

      {/* Total incl. HST */}
      <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between items-baseline font-black text-[11pt] text-slate-950">
        <span className="uppercase text-[8pt]">Total:</span>
        <span className="font-mono">${finalGrandTotal.toFixed(2)}</span>
      </div>

      {/* Side-by-side First 50% and Final 50% deposit boxes */}
      <div className="grid grid-cols-2 gap-1.5 pt-1.5 mt-1 border-t border-slate-300 text-center text-[7pt]">
        <div className="border border-slate-300 rounded py-1 px-1.5 bg-white">
          <span className="text-slate-500 uppercase block font-bold text-[6pt]">First 50%</span>
          <span className="font-mono font-bold text-slate-900">${firstPayment.toFixed(2)}</span>
        </div>
        <div className="border border-slate-300 rounded py-1 px-1.5 bg-white">
          <span className="text-slate-500 uppercase block font-bold text-[6pt]">Final 50%</span>
          <span className="font-mono font-bold text-slate-900">${secondPayment.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

