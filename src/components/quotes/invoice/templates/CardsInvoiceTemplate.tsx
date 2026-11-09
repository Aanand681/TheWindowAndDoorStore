import React from 'react';
import { formatMoney } from '@/lib/promo-logic';
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from '../types';
import { WindowsScheduleTable } from '../tables/WindowsScheduleTable';
import { SealedUnitsScheduleTable } from '../tables/SealedUnitsScheduleTable';
import { DoorsScheduleTable } from '../tables/DoorsScheduleTable';
import { InvoiceSummaryRows } from '../tables/InvoiceSummaryRows';
import { InvoiceBreakdownTables } from '../tables/InvoiceBreakdownTables';

export interface CardsInvoiceTemplateProps {
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

export function CardsInvoiceTemplate({
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
}: CardsInvoiceTemplateProps) {
  const {
    titleFs,
    smallFs,
    invoiceSubtitle,
    h2Fs,
    currentDate,
    bodyFs,
    microFs,
    rowPy,
    finalTotalCents,
    finalFirstPayment,
    finalSecondPayment,
  } = calc;

  return (
    <>
      {/* Header: Standardized Architectural Header */}
      <div className="border-t-2 border-b-2 border-[#0f172a] py-2 mb-2.5">
        <div className="flex justify-between items-baseline">
          <div>
            <h1
              style={{ fontSize: `${titleFs}px` }}
              className="font-black tracking-tight text-[#0f172a] m-0 uppercase leading-none"
            >
              The Window &amp; Door Store
            </h1>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="text-[#334155] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2 flex-wrap"
            >
              <span>{invoiceSubtitle}</span>
            </div>
          </div>
          <div className="text-right">
            <div
              style={{ fontSize: `${h2Fs}px` }}
              className="font-mono font-black text-[#0f172a]"
            >
              {quoteNumber || 'REF-QUOTE'}
            </div>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="text-[#334155] font-semibold"
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
            className="mt-1 pt-1 border-t border-[#cbd5e1] flex justify-between items-center text-[#0f172a] flex-wrap gap-2"
          >
            <div className="flex items-center gap-3">
              {customerName && (
                <div>
                  <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">
                    Client:
                  </span>
                  <span className="font-black text-[#0f172a]">{customerName}</span>
                </div>
              )}
              {regionName && (
                <div>
                  <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">
                    Region:
                  </span>
                  <span className="font-bold text-[#0f172a]">{regionName}</span>
                </div>
              )}
            </div>
            {preparedBy && (
              <div>
                <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">
                  Prepared By:
                </span>
                <span className="font-bold text-[#0f172a]">{preparedBy}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Schedules */}
      <WindowsScheduleTable theme="cards" calc={calc} />
      <SealedUnitsScheduleTable theme="cards" calc={calc} />
      <DoorsScheduleTable theme="cards" calc={calc} globalUpcharges={globalUpcharges} />

      {/* Two-Column Specification & Accounting Cards */}
      <div className="grid grid-cols-[1.1fr_1.15fr] gap-4 items-start border-t-2 border-[#0f172a] pt-2">
        {/* Left Column: Scope Specifications */}
        <InvoiceBreakdownTables
          calc={calc}
          wantsUpgrade={wantsUpgrade}
          shownUpgrade={shownUpgrade}
          attachedUpgrade={attachedUpgrade}
          quoteNotes={quoteNotes}
        />

        {/* Right Column: Financial Summary Card */}
        <div
          className="border border-[#cbd5e1] rounded bg-white shadow-sm"
          style={{ padding: `${rowPy * 1.25}px` }}
        >
          <div
            style={{ fontSize: `${h2Fs}px` }}
            className="font-bold uppercase tracking-wider text-[#0f172a] mb-1 pb-0.5 border-b-2 border-[#0f172a]"
          >
            Summary
          </div>

          <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
            <tbody>
              <InvoiceSummaryRows
                calc={calc}
                textColor="text-[#0f172a]"
                rowPyOverride={rowPy * 0.6}
              />
            </tbody>
          </table>

          {/* Total Banner */}
          <div
            className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded-md flex justify-between items-center font-extrabold mt-2"
            style={{ padding: `${rowPy}px` }}
          >
            <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase text-[#0f172a]">
              Total
            </span>
            <span
              style={{ fontSize: `${titleFs}px` }}
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

