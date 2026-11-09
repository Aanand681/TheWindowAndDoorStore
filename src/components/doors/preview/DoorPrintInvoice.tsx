'use client';

import React from 'react';
import {
  DoorLineItem,
  DoorQuoteTotals,
  DoorSelectedUpcharge,
} from '@/lib/doors/types';
import { DoorInvoiceHeader } from './DoorInvoiceHeader';
import { DoorInvoiceItemsTable } from './DoorInvoiceItemsTable';
import { DoorInvoiceUpchargesTable } from './DoorInvoiceUpchargesTable';
import { DoorRichNotes } from './DoorRichNotes';
import { DoorPrintLedger } from './DoorPrintLedger';

export interface DoorPrintInvoiceProps {
  quoteNumber: string;
  quoteDate: string;
  customerName: string;
  preparedBy: string;
  isInstallation: boolean;
  totals: DoorQuoteTotals;
  lineItems: DoorLineItem[];
  globalUpcharges: DoorSelectedUpcharge[];
  upgradeItems: DoorLineItem[];
  quoteNotes: string;
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

export function DoorPrintInvoice({
  quoteNumber,
  quoteDate,
  customerName,
  preparedBy,
  isInstallation,
  totals,
  lineItems,
  globalUpcharges,
  upgradeItems,
  quoteNotes,
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
}: DoorPrintInvoiceProps) {
  return (
    <div
      id="printable-invoice"
      className="w-full max-w-[8.2in] bg-white text-black font-sans p-6 sm:p-8 rounded-lg shadow-2xl border border-slate-300 print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:w-full print:m-0 print:overflow-visible select-text text-[8.5pt] leading-tight space-y-3"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: letter portrait;
            margin: 0.3in;
          }
          html, body {
            width: 8.5in !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-invoice {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          #printable-invoice * {
            visibility: visible !important;
          }
        }
      `,
        }}
      />

      <DoorInvoiceHeader
        quoteNumber={quoteNumber}
        quoteDate={quoteDate}
        customerName={customerName}
        preparedBy={preparedBy}
        isInstallation={isInstallation}
        totals={totals}
        lineItems={lineItems}
      />

      <DoorInvoiceItemsTable lineItems={lineItems} isInstallation={isInstallation} />

      <DoorInvoiceUpchargesTable
        isInstallation={isInstallation}
        globalUpcharges={globalUpcharges}
        totals={totals}
      />

      {/* Financial Summary Box & Deposit Schedule */}
      <div className="grid grid-cols-12 gap-3 pt-1">
        {/* Left 7 cols: Optional Upgrades list & Warranty Info */}
        <div className="col-span-7 space-y-2">
          {upgradeItems.length > 0 ? (
            <div className="border border-emerald-300 rounded p-2.5 bg-emerald-50/50 text-[7.5pt] space-y-1">
              <div className="font-bold text-emerald-900 uppercase tracking-wider text-[7pt]">
                Optional Door Upgrades (For Customer Record):
              </div>
              {upgradeItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-emerald-800">
                  <span>
                    {item.customDescription || item.presetLabel}:{' '}
                    <strong>{item.upgradeOption?.title}</strong>
                  </span>
                  <span className="font-mono font-bold">
                    +${item.upgradeOption?.subtotalDifference.toFixed(2)}/unit
                    {item.quantity > 1
                      ? ` (+${((item.upgradeOption?.subtotalDifference || 0) * item.quantity).toFixed(2)} total)`
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50 text-[7.5pt] space-y-1 text-slate-600">
              <div className="font-bold text-slate-800 text-[8pt]">
                Comprehensive 5-Year Workmanship Warranty
              </div>
              <div>
                All door systems and installations include our 5-year labour warranty, precision
                perimeter weather-sealing, and factory manufacturer warranty.
              </div>
            </div>
          )}

          <DoorRichNotes notes={quoteNotes} />
        </div>

        {/* Right 5 cols: Exact Summary Breakdown & Side-by-Side 50/50 Deposit */}
        <div className="col-span-5">
          <DoorPrintLedger
            lineItems={lineItems}
            totals={totals}
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

      {/* Signature / Approval Footer */}
      <div className="border-t border-slate-300 pt-3 mt-4 flex justify-between items-end text-[7.5pt] text-slate-500">
        <div className="space-y-3">
          <div className="w-56 border-b border-slate-400 pb-0.5 text-slate-700">
            Customer Signature
          </div>
          <div className="text-[6.5pt] text-slate-400">
            Signature indicates acceptance of door specifications, terms, and deposit schedule.
          </div>
        </div>

        <div className="w-36 border-b border-slate-400 pb-0.5 text-right text-slate-700">Date</div>
      </div>
    </div>
  );
}
