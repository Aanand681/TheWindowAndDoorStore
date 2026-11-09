import React from 'react';
import { SealedUnitLineItem, SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { SealedUnitTotals } from '../types';
import { SealedUnitSpecBadges } from '../SealedUnitSpecBadges';
import { SealedUnitSummaryLedger } from '../SealedUnitSummaryLedger';
import { SealedUnitPrintOfficeCard } from '../SealedUnitPrintOfficeCard';
import { renderRichNotes } from '../SealedUnitRichNotes';

interface SealedUnitProductionTemplateProps {
  lineItems: SealedUnitLineItem[];
  totals: SealedUnitTotals;
  isInstallation: boolean;
  isService: boolean;
  labour: SealedUnitLabourSettings;
  hstRate: number;
  customerName: string;
  quoteNumber: string;
  quoteDate: string;
  quoteNotes?: string;
  firstPayment: number;
  secondPayment: number;
  attachedWindowQuote?: any | null;
  attachedDoorQuote?: any | null;
}

export function SealedUnitProductionTemplate({
  lineItems,
  totals,
  isInstallation,
  isService,
  labour,
  hstRate,
  customerName,
  quoteNumber,
  quoteDate,
  quoteNotes,
  firstPayment,
  secondPayment,
  attachedWindowQuote,
  attachedDoorQuote,
}: SealedUnitProductionTemplateProps) {
  return (
    <div className="space-y-2.5">
      {/* Production Header */}
      <div className="border-b-2 border-zinc-600 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-block border border-zinc-400 bg-zinc-50 text-zinc-900 font-mono text-[7pt] uppercase px-2 py-0.5 rounded font-bold mb-1">
              Glazing &amp; Fabrication Work Order
            </div>
            <h1 className="text-lg font-black tracking-tight text-zinc-900 uppercase">
              The Window &amp; Door Store
            </h1>
            <div className="text-[8pt] text-zinc-600 font-medium">
              Client: <strong className="text-zinc-900">{customerName || 'Direct Client'}</strong> · Scope:{' '}
              <strong className="text-zinc-900">
                {isService ? 'Service Only' : isInstallation ? 'Supply & Install' : 'Supply Only'}
              </strong>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono font-bold text-zinc-500">JOB ORDER #</div>
            <div className="text-lg font-mono font-black text-zinc-950">#{quoteNumber || '------'}</div>
            <div className="text-[7.5pt] text-zinc-500 font-semibold">{quoteDate}</div>
          </div>
        </div>

        {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
        <div className="mt-2">
          <SealedUnitSpecBadges lineItems={lineItems} />
        </div>
      </div>

      {/* Cutting Schedule Table */}
      <div className="border border-zinc-300 rounded overflow-hidden">
        <table className="w-full text-left text-[8pt] border-collapse">
          <thead>
            <tr className="bg-zinc-100 text-zinc-900 border-b-2 border-zinc-400 font-mono text-[7pt] uppercase tracking-wider font-bold">
              <th className="py-1 px-1.5 text-center w-7">Cut</th>
              <th className="py-1 px-1.5">Glass Assembly</th>
              <th className="py-1 px-1.5">Exact Dimensions</th>
              <th className="py-1 px-1.5">Area</th>
              <th className="py-1 px-1.5">Internal Grills &amp; Hubs</th>
              <th className="py-1 px-1.5 text-center w-8">Qty</th>
              {!isService ? (
                <th className="py-1 px-1.5 text-right">Job Subtotal</th>
              ) : (
                <th className="py-1 px-1.5 text-right">Service Sqft</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-mono text-[7.5pt]">
            {lineItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="py-1 px-1.5 text-center font-bold text-zinc-700">{idx + 1}</td>
                <td className="py-1 px-1.5 font-sans">
                  <div className="font-bold text-zinc-900">{item.combinationName}</div>
                  <div className="text-[6.5pt] text-zinc-500 font-mono">
                    {item.treatment} · {item.paneType} · {item.thicknessMm}mm
                  </div>
                </td>
                <td className="py-1 px-1.5 font-bold text-zinc-900">
                  {item.widthIn}&quot; × {item.heightIn}&quot;
                </td>
                <td className="py-1 px-1.5 text-zinc-700">
                  {item.actualSqft.toFixed(2)} sqft
                </td>
                <td className="py-1 px-1.5 font-sans">
                  {item.rawGrillCost > 0 ? (
                    <span className="inline-block bg-amber-50 border border-amber-300 text-amber-900 text-[6.5pt] font-semibold px-1 py-0.2 rounded">
                      {item.grillDescription}
                    </span>
                  ) : (
                    <span className="text-zinc-400 text-[7pt]">No Grills</span>
                  )}
                </td>
                <td className="py-1 px-1.5 text-center font-bold text-zinc-900">{item.quantity}</td>
                {!isService ? (
                  <td className="py-1 px-1.5 text-right font-bold text-zinc-900">
                    ${item.lineGlassTotal.toFixed(2)}
                  </td>
                ) : (
                  <td className="py-1 px-1.5 text-right font-bold">
                    {(item.actualSqft * item.quantity).toFixed(2)} sqft
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FULL-WIDTH COMMERCIAL QUOTATION SUMMARY */}
      <div className="border border-zinc-300 rounded p-2 bg-zinc-50/70 space-y-2">
        <div className="text-[7.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 flex justify-between font-sans">
          <span>Summary</span>
          <span className="font-mono text-[7pt] text-zinc-600">Client Billing Record</span>
        </div>

        <div className="grid grid-cols-12 gap-3 items-start">
          {/* Special Notes & Site Instructions (LEFT 5 cols) */}
          <div className="col-span-5 border-r border-zinc-300 pr-3">
            <span className="text-[7pt] uppercase font-bold text-zinc-500 block mb-1 font-sans">
              Special Notes &amp; Site Instructions
            </span>
            {quoteNotes && quoteNotes.trim() ? (
              renderRichNotes(quoteNotes, 7.5)
            ) : (
              <span className="text-zinc-400 text-[7pt] italic">No special instructions recorded.</span>
            )}
          </div>

          {/* Financial Lines Ledger (RIGHT 7 cols) */}
          <div className="col-span-7 pl-1">
            <SealedUnitSummaryLedger
              lineItems={lineItems}
              totals={totals}
              isInstallation={isInstallation}
              isService={isService}
              hstRate={hstRate}
              firstPayment={firstPayment}
              secondPayment={secondPayment}
              attachedWindowQuote={attachedWindowQuote}
              attachedDoorQuote={attachedDoorQuote}
              textColor="text-zinc-900"
              subtextColor="text-zinc-700"
              borderColor="border-zinc-300"
              totalBorderColor="border-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* FULL-WIDTH OFFICE PRICING REFERENCE */}
      <SealedUnitPrintOfficeCard
        lineItems={lineItems}
        totals={totals}
        labour={labour}
        isService={isService}
      />
    </div>
  );
}

