import React from 'react';
import { formatMoney } from '@/lib/promo-logic';
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from '../types';
import { WindowsScheduleTable } from '../tables/WindowsScheduleTable';
import { SealedUnitsScheduleTable } from '../tables/SealedUnitsScheduleTable';
import { DoorsScheduleTable } from '../tables/DoorsScheduleTable';
import { InvoiceSummaryRows } from '../tables/InvoiceSummaryRows';
import { InvoiceBreakdownTables } from '../tables/InvoiceBreakdownTables';

export interface ExecutiveInvoiceTemplateProps {
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

export function ExecutiveInvoiceTemplate({
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
}: ExecutiveInvoiceTemplateProps) {
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
      {/* Executive Header: Ink-Saving Architectural Corporate Header */}
      <div className="bg-white border-y-2 border-[#0f172a] py-2 px-1 mb-2.5">
        <div className="flex justify-between items-baseline">
          <div>
            <h1
              style={{ fontSize: `${titleFs}px` }}
              className="font-black tracking-wider text-[#0f172a] m-0 uppercase leading-none"
            >
              The Window &amp; Door Store
            </h1>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="text-amber-800 font-bold uppercase tracking-widest mt-1"
            >
              <span>{invoiceSubtitle}</span>
            </div>
          </div>
          <div className="text-right">
            <div
              style={{ fontSize: `${h2Fs}px` }}
              className="font-mono font-bold text-[#0f172a]"
            >
              {quoteNumber || 'REF-QUOTE'}
            </div>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="text-slate-600 font-medium"
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
            className="mt-1.5 pt-1.5 border-t border-slate-300 flex justify-between items-center text-slate-800 flex-wrap gap-2"
          >
            <div className="flex items-center gap-3">
              {customerName && (
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">
                    Client:
                  </span>
                  <span className="font-bold text-[#0f172a]">{customerName}</span>
                </div>
              )}
              {regionName && (
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">
                    Region:
                  </span>
                  <span className="font-semibold text-slate-700">{regionName}</span>
                </div>
              )}
            </div>
            {preparedBy && (
              <div>
                <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">
                  Prepared By:
                </span>
                <span className="font-semibold text-slate-700">{preparedBy}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Schedules */}
      <WindowsScheduleTable theme="executive" calc={calc} />
      <SealedUnitsScheduleTable theme="executive" calc={calc} />
      <DoorsScheduleTable theme="executive" calc={calc} globalUpcharges={globalUpcharges} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-[1.1fr_1.15fr] gap-4 items-start border-t-2 border-[#0f172a] pt-2">
        {/* Left: Project Specifications & Scope */}
        <InvoiceBreakdownTables
          calc={calc}
          wantsUpgrade={wantsUpgrade}
          shownUpgrade={shownUpgrade}
          attachedUpgrade={attachedUpgrade}
          quoteNotes={quoteNotes}
        />

        {/* Right: Exact Financial Summary */}
        <div>
          <div
            style={{ fontSize: `${h2Fs}px` }}
            className="font-bold uppercase tracking-wider text-[#0f172a] mb-1 pb-0.5 border-b-2 border-[#0f172a]"
          >
            Summary
          </div>
          <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
            <tbody>
              <InvoiceSummaryRows calc={calc} textColor="text-[#0f172a]" />
            </tbody>
          </table>

          {/* Total Banner */}
          <div className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded-md p-2 flex justify-between items-center font-extrabold mt-2">
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

          {/* Deposit Terms */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#cbd5e1]">
            <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
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
            <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
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

