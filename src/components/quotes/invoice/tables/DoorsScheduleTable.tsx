import React from 'react';
import { formatMoney } from '@/lib/promo-logic';
import type { QuoteTemplateType, InvoiceCalculationsResult } from '../types';

export interface DoorsScheduleTableProps {
  theme: QuoteTemplateType;
  calc: InvoiceCalculationsResult;
  globalUpcharges?: any[];
}

export function DoorsScheduleTable({ theme, calc, globalUpcharges = [] }: DoorsScheduleTableProps) {
  const {
    hasDoors,
    effectiveDoors,
    isDoorHost,
    attachedDoorQuote,
    h2Fs,
    microFs,
    bodyFs,
    thFs,
    rowPy,
  } = calc;

  const effectiveDoorUpcharges =
    globalUpcharges && globalUpcharges.length > 0
      ? globalUpcharges
      : attachedDoorQuote?.globalUpcharges || [];

  if (!hasDoors || effectiveDoors.length === 0) return null;

  const isModern = theme === 'modern';
  const isExecutive = theme === 'executive';
  const isCards = theme === 'cards';

  return (
    <div
      className={
        isCards
          ? 'mb-4 border border-[#cbd5e1] rounded bg-white shadow-sm overflow-hidden'
          : 'mb-4'
      }
    >
      <div
        className={`flex items-center justify-between ${
          isCards
            ? 'p-2 bg-[#f8fafc] border-b border-[#cbd5e1]'
            : 'mb-1 pb-1 border-b-[1.5px] border-[#0f172a]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            style={{ fontSize: `${h2Fs}px` }}
            className="font-bold uppercase tracking-wider text-[#0f172a]"
          >
            Configured Doors
          </span>
          {!isDoorHost && attachedDoorQuote?.quoteNumber && (
            <span
              style={{ fontSize: `${microFs}px` }}
              className="px-1.5 py-0.5 rounded bg-muted text-[#334155] font-mono font-medium"
            >
              #{attachedDoorQuote.quoteNumber}
            </span>
          )}
        </div>
        <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] font-medium">
          {effectiveDoors.length} item{effectiveDoors.length > 1 ? 's' : ''}
        </span>
      </div>

      <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
        <thead>
          <tr
            className={
              isModern
                ? 'border-b-2 border-[#0f172a] text-[#0f172a]'
                : isExecutive
                  ? 'border-b-2 border-[#0f172a] text-[#0f172a]'
                  : 'border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]'
            }
          >
            <th className="py-1 px-1.5 text-left font-bold w-[5%]">#</th>
            <th className="py-1 px-1.5 text-left font-bold w-[45%]">Door Specifications</th>
            <th className="py-1 px-1.5 text-left font-bold w-[25%]">Hardware &amp; Options</th>
            <th className="py-1 px-1.5 text-center font-bold w-[10%]">Qty</th>
            <th className="py-1 px-1.5 text-right font-mono font-bold w-[15%]">Price</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: `${bodyFs}px` }}>
          {effectiveDoors.map((item: any, idx: number) => {
            const qty = Number(item.quantity) || 1;
            const unitNetPrice = item.netBasePrice || item.inksterBasePrice || 0;
            const lineTotal = item.totalPrice || unitNetPrice * qty;

            return (
              <tr key={item.id || idx} className="border-b border-[#cbd5e1] bg-white">
                <td
                  style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                  className="px-1.5 text-[#334155] font-semibold"
                >
                  {idx + 1}
                </td>
                <td
                  style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                  className="px-1.5 font-bold text-[#0f172a]"
                >
                  <div>{item.customDescription || item.presetLabel}</div>
                  {item.notes && (
                    <div className="text-[#64748b] text-[10px] font-normal">{item.notes}</div>
                  )}
                </td>
                <td
                  style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                  className="px-1.5 text-[#1e293b]"
                >
                  <div className="capitalize">
                    {item.hardwareType === 'standard'
                      ? 'Standard Lockset'
                      : item.hardwareType === 'customer'
                        ? 'Customer Supplied'
                        : item.customHardwareName || 'None'}
                  </div>
                  {item.upgradeOption?.enabled && (
                    <div className="text-amber-700 font-semibold text-[10px]">
                      Option: {item.upgradeOption.title} (+
                      {formatMoney(
                        Math.round((item.upgradeOption.subtotalDifference || 0) * 100)
                      )}
                      )
                    </div>
                  )}
                </td>
                <td
                  style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                  className="px-1.5 text-center font-bold text-[#0f172a]"
                >
                  {qty}
                </td>
                <td
                  style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                  className="px-1.5 text-right font-mono"
                >
                  <span className="font-bold text-[#0f172a]">
                    {formatMoney(Math.round(lineTotal * 100))}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Itemized Jobsite Labour & Special Site Services (if selected for doors) */}
      {effectiveDoorUpcharges.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#cbd5e1]">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span
              style={{ fontSize: `${h2Fs}px` }}
              className="font-bold uppercase tracking-wider text-[#0f172a]"
            >
              Jobsite Labour &amp; Special Site Services
            </span>
            <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] font-medium">
              {effectiveDoorUpcharges.length} service
              {effectiveDoorUpcharges.length > 1 ? 's' : ''}
            </span>
          </div>
          <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
            <thead>
              <tr
                className={
                  isModern
                    ? 'border-b-2 border-[#0f172a] text-[#0f172a]'
                    : isExecutive
                      ? 'border-b-2 border-[#0f172a] text-[#0f172a]'
                      : 'border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]'
                }
              >
                <th className="py-1 px-1.5 text-left font-bold w-[5%]">#</th>
                <th className="py-1 px-1.5 text-left font-bold w-[55%]">Service Description</th>
                <th className="py-1 px-1.5 text-center font-bold w-[12%]">Qty</th>
                <th className="py-1 px-1.5 text-right font-mono font-bold w-[13%]">Rate</th>
                <th className="py-1 px-1.5 text-right font-mono font-bold w-[15%]">Total</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: `${bodyFs}px` }}>
              {effectiveDoorUpcharges.map((u: any, uIdx: number) => {
                const qty = Number(u.qty) || 1;
                const rate = Number(u.rate) || 0;
                const total = Number(u.total ?? rate * qty);
                return (
                  <tr
                    key={u.upchargeId || u.id || uIdx}
                    className="border-b border-[#cbd5e1] bg-white"
                  >
                    <td
                      style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                      className="px-1.5 text-[#334155] font-semibold"
                    >
                      {uIdx + 1}
                    </td>
                    <td
                      style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                      className="px-1.5 font-bold text-[#0f172a]"
                    >
                      {u.label}
                    </td>
                    <td
                      style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                      className="px-1.5 text-center font-bold text-[#0f172a]"
                    >
                      {qty}
                    </td>
                    <td
                      style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                      className="px-1.5 text-right font-mono text-[#334155]"
                    >
                      {formatMoney(Math.round(rate * 100))}
                    </td>
                    <td
                      style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
                      className="px-1.5 text-right font-mono font-bold text-[#0f172a]"
                    >
                      {formatMoney(Math.round(total * 100))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

