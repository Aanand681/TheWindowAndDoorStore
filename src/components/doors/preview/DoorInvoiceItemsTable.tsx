'use client';

import React from 'react';
import { DoorLineItem } from '@/lib/doors/types';
import { formatDoorSummarySentence } from '@/lib/doors/calculations';

export interface DoorInvoiceItemsTableProps {
  lineItems: DoorLineItem[];
  isInstallation: boolean;
}

export function DoorInvoiceItemsTable({ lineItems, isInstallation }: DoorInvoiceItemsTableProps) {
  const doorSentence = formatDoorSummarySentence(lineItems);

  return (
    <div className="border border-slate-300 rounded overflow-hidden">
      <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 font-bold text-slate-700 uppercase text-[7.5pt] tracking-wider flex justify-between">
        <span>Itemized Door Specifications</span>
        <span>{doorSentence}</span>
      </div>

      <table className="w-full text-[8pt] text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-300 text-slate-600 font-bold uppercase text-[7pt] bg-slate-50">
            <th className="py-1.5 px-2.5 w-10 text-center border-r border-slate-300">Qty</th>
            <th className="py-1.5 px-2.5 border-r border-slate-300">Description &amp; Style</th>
            <th className="py-1.5 px-2.5 w-28 border-r border-slate-300">Category</th>
            <th className="py-1.5 px-2.5 w-32 border-r border-slate-300">Hardware</th>
            <th className="py-1.5 px-2.5 w-24 text-right border-r border-slate-300">Unit Base</th>
            <th className="py-1.5 px-2.5 w-24 text-right">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {lineItems.map((item, idx) => {
            let hwLabel = 'None';
            if (item.hardwareType === 'standard') {
              hwLabel = `Standard Set ($${item.hardwarePrice.toFixed(0)})`;
            } else if (item.hardwareType === 'customer_supplied') {
              hwLabel = `Customer ($${(item.customerHardwareFee || 80).toFixed(0)} Reinstall Labour)`;
            } else if (item.hardwareType === 'custom') {
              hwLabel = `${item.customHardwareName || 'Custom'} ($${item.hardwarePrice.toFixed(0)})`;
            }

            return (
              <React.Fragment key={item.id || idx}>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2 px-2.5 text-center font-mono font-bold border-r border-slate-200">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200">
                    <div className="font-bold text-slate-900">
                      {item.customDescription || item.presetLabel}
                    </div>
                    <div className="text-[7pt] text-slate-500">Preset: {item.presetLabel}</div>
                  </td>
                  <td className="py-2 px-2.5 uppercase text-[7pt] font-semibold text-slate-600 border-r border-slate-200">
                    {item.category}
                  </td>
                  <td className="py-2 px-2.5 text-[7.5pt] border-r border-slate-200">
                    {hwLabel}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono border-r border-slate-200">
                    ${item.inksterBasePrice.toFixed(2)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-950">
                    $
                    {(isInstallation
                      ? item.lineGrandTotal
                      : item.lineSupplyTotal ??
                        item.lineDoorSupplyTotal +
                          item.lineHardwareTotal +
                          item.surchargeAmount * item.quantity -
                          item.discountAmount * item.quantity
                    ).toFixed(2)}
                  </td>
                </tr>

                {/* Option for door Row */}
                {item.upgradeOption?.enabled && (
                  <tr className="bg-emerald-50/70 border-b border-emerald-200">
                    <td colSpan={6} className="py-1.5 px-3 text-emerald-950 text-[7.5pt]">
                      <span className="font-bold text-emerald-800">Option for door:</span>{' '}
                      {item.upgradeOption.title} —{' '}
                      <strong className="font-mono text-emerald-700">
                        Diff: +${item.upgradeOption.subtotalDifference.toFixed(2)}/unit
                        {item.quantity > 1
                          ? ` (+${((item.upgradeOption.subtotalDifference || 0) * item.quantity).toFixed(2)} total)`
                          : ''}
                      </strong>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

