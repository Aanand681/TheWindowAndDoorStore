import React from 'react';
import { formatMoney } from '@/lib/promo-logic';
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from '../types';
import { WindowsScheduleTable } from '../tables/WindowsScheduleTable';
import { SealedUnitsScheduleTable } from '../tables/SealedUnitsScheduleTable';
import { DoorsScheduleTable } from '../tables/DoorsScheduleTable';
import { InvoiceSummaryRows } from '../tables/InvoiceSummaryRows';
import { InvoiceBreakdownTables } from '../tables/InvoiceBreakdownTables';

export interface ModernInvoiceTemplateProps {
  calc: InvoiceCalculationsResult;
  customerName?: string;
  quoteNumber?: string;
  regionName?: string;
  preparedBy?: string;
  wantsUpgrade?: boolean;
  shownUpgrade?: number;
  attachedUpgrade?: AttachedUpgradeOption | null;
  quoteNotes?: string;
  globalUpcharges?: any[];
}

export function ModernInvoiceTemplate({
  calc,
  customerName,
  quoteNumber,
  regionName,
  preparedBy,
  wantsUpgrade,
  shownUpgrade,
  attachedUpgrade,
  quoteNotes,
  globalUpcharges,
}: ModernInvoiceTemplateProps) {
  const {
    titleFs,
    smallFs,
    invoiceSubtitle,
    h2Fs,
    currentDate,
    bodyFs,
    baseFs,
    microFs,
    finalTotalCents,
    finalFirstPayment,
    finalSecondPayment,
  } = calc;

  return (
    <>
      {/* Header: Modern Minimalist Header */}
      <div className="border-t-4 border-indigo-600 border-b border-slate-300 py-2.5 mb-3 bg-slate-50/50 px-2 rounded-t">
        <div className="flex justify-between items-baseline">
          <div>
            <h1
              style={{ fontSize: `${titleFs}px` }}
              className="font-extrabold tracking-tight text-slate-900 m-0 uppercase leading-none"
            >
              The Window &amp; Door Store
            </h1>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="text-indigo-600 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2 flex-wrap"
            >
              <span>{invoiceSubtitle}</span>
            </div>
          </div>
          <div className="text-right">
            <div
              style={{ fontSize: `${h2Fs}px` }}
              className="font-mono font-bold text-slate-900"
            >
              {quoteNumber || 'REF-QUOTE'}
            </div>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="text-slate-500 font-medium"
              suppressHydrationWarning
            >
              {currentDate}
            </div>
          </div>
        </div>

        {/* Compact Inline Customer & Region Bar */}
        {(customerName || regionName || preparedBy) && (
          <div
            style={{ fontSize: `${bodyFs}px` }}
            className="mt-1 pt-1 border-t border-slate-200 flex justify-between items-center text-[#0f172a] flex-wrap gap-2"
          >
            <div className="flex items-center gap-3">
              {customerName && (
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">
                    Client:
                  </span>
                  <span className="font-bold text-slate-900">{customerName}</span>
                </div>
              )}
              {regionName && (
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">
                    Region:
                  </span>
                  <span className="font-semibold text-slate-800">{regionName}</span>
                </div>
              )}
            </div>
            {preparedBy && (
              <div>
                <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">
                  Prepared By:
                </span>
                <span className="font-semibold text-slate-800">{preparedBy}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Schedules */}
      <WindowsScheduleTable theme="modern" calc={calc} />
      <SealedUnitsScheduleTable theme="modern" calc={calc} />
      <DoorsScheduleTable theme="modern" calc={calc} globalUpcharges={globalUpcharges} />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-[1.1fr_1.15fr] gap-4 items-start border-t border-[#cbd5e1] pt-2">
        {/* Left Column: Details & Extras */}
        <InvoiceBreakdownTables
          calc={calc}
          wantsUpgrade={wantsUpgrade}
          shownUpgrade={shownUpgrade}
          attachedUpgrade={attachedUpgrade}
          quoteNotes={quoteNotes}
        />

        {/* Right Column: Financial Summary */}
        <div>
          <div
            style={{ fontSize: `${h2Fs}px` }}
            className="font-bold uppercase tracking-wider text-[#0f172a] mb-1 pb-0.5 border-b-[1.5px] border-[#0f172a]"
          >
            Summary
          </div>

          <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
            <tbody>
              <InvoiceSummaryRows calc={calc} textColor="text-[#0f172a]" />
            </tbody>
          </table>

          {/* Total */}
          <div className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded p-2 flex justify-between items-center font-extrabold mt-2">
            <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase text-[#0f172a]">
              Total
            </span>
            <span
              style={{ fontSize: `${Math.round(baseFs * 1.35)}px` }}
              className="font-mono font-black text-[#0f172a]"
            >
              {formatMoney(finalTotalCents)}
            </span>
          </div>

          {/* 50% Deposit & Final 50% Balance */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#cbd5e1]">
            <div className="bg-white p-1.5 rounded border border-[#cbd5e1]">
              <div
                style={{ fontSize: `${microFs}px` }}
                className="text-[#334155] uppercase tracking-wider font-semibold"
              >
                50% Deposit
              </div>
              <div
                style={{ fontSize: `${bodyFs}px` }}
                className="font-mono font-bold text-[#0f172a] mt-0.5"
              >
                {formatMoney(finalFirstPayment)}
              </div>
            </div>
            <div className="bg-white p-1.5 rounded border border-[#cbd5e1]">
              <div
                style={{ fontSize: `${microFs}px` }}
                className="text-[#334155] uppercase tracking-wider font-semibold"
              >
                Final 50% Balance
              </div>
              <div
                style={{ fontSize: `${bodyFs}px` }}
                className="font-mono font-bold text-[#0f172a] mt-0.5"
              >
                {formatMoney(finalSecondPayment)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

