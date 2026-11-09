import React from 'react';
import { SealedUnitLineItem, SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { SealedUnitTotals } from '../types';
import { SealedUnitSpecBadges } from '../SealedUnitSpecBadges';
import { SealedUnitSummaryLedger } from '../SealedUnitSummaryLedger';
import { SealedUnitPrintOfficeCard } from '../SealedUnitPrintOfficeCard';
import { renderRichNotes } from '../SealedUnitRichNotes';
import { SealedUnitInvoiceTable } from '../tables/SealedUnitInvoiceTable';

interface SealedUnitStandardTemplateProps {
  lineItems: SealedUnitLineItem[];
  totals: SealedUnitTotals;
  isInstallation: boolean;
  isService: boolean;
  labour: SealedUnitLabourSettings;
  hstRate: number;
  customerName: string;
  quoteNumber: string;
  quoteDate: string;
  preparedBy?: string;
  quoteNotes?: string;
  firstPayment: number;
  secondPayment: number;
  attachedWindowQuote?: any | null;
  attachedDoorQuote?: any | null;
}

export function SealedUnitStandardTemplate({
  lineItems,
  totals,
  isInstallation,
  isService,
  labour,
  hstRate,
  customerName,
  quoteNumber,
  quoteDate,
  preparedBy,
  quoteNotes,
  firstPayment,
  secondPayment,
  attachedWindowQuote,
  attachedDoorQuote,
}: SealedUnitStandardTemplateProps) {
  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="border-t-2 border-b-2 border-gray-500 py-1.5">
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-lg font-black tracking-tight text-black m-0 uppercase font-sans">
              The Window &amp; Door Store
            </h1>
            <div className="text-[8.5pt] text-gray-700 font-bold uppercase tracking-wider">
              {isInstallation ? 'Sealed Unit & Glazing Quotation' : 'Supply Only Sealed Unit Quotation'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-black text-black">#{quoteNumber || '------'}</div>
            <div className="text-[7.5pt] text-gray-700 font-semibold">{quoteDate}</div>
          </div>
        </div>

        <div className="mt-1 pt-1 border-t border-gray-300 flex justify-between items-center text-[8pt] text-black">
          <div>
            <span className="text-gray-600 uppercase font-bold text-[7pt] mr-1">Client:</span>
            <span className="font-black text-black">{customerName || 'Valued Customer'}</span>
          </div>
          <div>
            <span className="text-gray-600 uppercase font-bold text-[7pt] mr-1">Scope:</span>
            <span className="font-bold text-black">
              {isService ? 'Service Glazing' : isInstallation ? 'Full Installation & Setup' : 'Supply Only'}
            </span>
          </div>
          {preparedBy && (
            <div>
              <span className="text-gray-600 uppercase font-bold text-[7pt] mr-1">Prepared By:</span>
              <span className="font-bold text-black">{preparedBy}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
      <SealedUnitSpecBadges lineItems={lineItems} />

      {/* Sealed Units Table */}
      <SealedUnitInvoiceTable
        lineItems={lineItems}
        totals={totals}
        isService={isService}
        isInstallation={isInstallation}
        labour={labour}
        variant="standard"
      />

      {/* FULL-WIDTH QUOTATION SUMMARY CARD */}
      <div className="border border-gray-400 rounded p-2 bg-gray-50/50 space-y-2">
        <div className="text-[8pt] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 flex justify-between font-sans">
          <span>Summary</span>
          <span className="font-mono text-[7pt] text-gray-500 font-normal">
            Customer Financial Record
          </span>
        </div>

        <div className="grid grid-cols-12 gap-3 items-start">
          <div className="col-span-7">
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
              textColor="text-gray-900"
              subtextColor="text-gray-700"
              borderColor="border-gray-300"
              totalBorderColor="border-gray-600"
            />
          </div>

          {/* Special Notes & Instructions */}
          <div className="col-span-5 border-l border-gray-300 pl-3">
            <div className="font-bold uppercase tracking-wider text-gray-900 text-[7.5pt] border-b border-gray-300 pb-0.5 mb-1 font-sans">
              Special Notes &amp; Instructions
            </div>
            {quoteNotes && quoteNotes.trim() ? (
              renderRichNotes(quoteNotes, 7.5)
            ) : (
              <span className="text-gray-400 text-[7pt] italic">
                Standard glazing installation terms apply.
              </span>
            )}
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
