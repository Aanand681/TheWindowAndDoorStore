'use client';

import React from 'react';
import { DoorSelectedUpcharge, DoorQuoteTotals } from '@/lib/doors/types';

export interface DoorInvoiceUpchargesTableProps {
  isInstallation: boolean;
  globalUpcharges: DoorSelectedUpcharge[];
  totals: DoorQuoteTotals;
}

export function DoorInvoiceUpchargesTable({
  isInstallation,
  globalUpcharges,
  totals,
}: DoorInvoiceUpchargesTableProps) {
  if (!isInstallation) return null;

  return (
    <>
      {globalUpcharges.length > 0 && (
        <div className="border border-slate-300 rounded overflow-hidden">
          <div className="bg-slate-100 px-2 py-1 text-[8pt] font-bold text-slate-800 uppercase tracking-wider flex justify-between items-center">
            <span>Jobsite Labour &amp; Special Site Services</span>
            <span className="text-[7pt] text-slate-500 font-normal">
              {globalUpcharges.length} item{globalUpcharges.length > 1 ? 's' : ''}
            </span>
          </div>
          <table className="w-full text-[7.5pt] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-1 px-1.5 text-left w-8">#</th>
                <th className="py-1 px-1.5 text-left">Service Description</th>
                <th className="py-1 px-1.5 text-center w-12">Qty</th>
                <th className="py-1 px-1.5 text-right w-20">Rate</th>
                <th className="py-1 px-1.5 text-right w-20">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {globalUpcharges.map((u, idx) => (
                <tr key={u.upchargeId || idx}>
                  <td className="py-1 px-1.5 text-slate-500">{idx + 1}</td>
                  <td className="py-1 px-1.5 font-semibold text-slate-900">{u.label}</td>
                  <td className="py-1 px-1.5 text-center font-mono">{u.qty}</td>
                  <td className="py-1 px-1.5 text-right font-mono text-slate-600">
                    ${Number(u.rate || 0).toFixed(2)}
                  </td>
                  <td className="py-1 px-1.5 text-right font-mono font-bold text-slate-950">
                    ${Number(u.total || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Site Mobilization Notice */}
      {totals.totalTravelAndSetup > 0 && (
        <div className="p-1.5 border border-slate-200 rounded bg-slate-50 text-[7.5pt] flex justify-between items-center">
          <div>
            <span className="font-bold text-slate-700">Site Setup &amp; Mobilization:</span>{' '}
            <span className="font-mono font-semibold">
              ${totals.totalTravelAndSetup.toFixed(2)}
            </span>
            {totals.additionalFarFee > 0 && (
              <span className="text-slate-500 ml-1">
                ($140 Base + ${totals.additionalFarFee.toFixed(2)} remote)
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

