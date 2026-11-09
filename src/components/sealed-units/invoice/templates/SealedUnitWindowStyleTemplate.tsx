import React from 'react';
import { SealedUnitLineItem, SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { SealedUnitTotals } from '../types';
import { SealedUnitSpecBadges } from '../SealedUnitSpecBadges';
import { SealedUnitSummaryLedger } from '../SealedUnitSummaryLedger';
import { SealedUnitPrintOfficeCard } from '../SealedUnitPrintOfficeCard';
import { renderRichNotes } from '../SealedUnitRichNotes';
import { SealedUnitInvoiceTable } from '../tables/SealedUnitInvoiceTable';

interface SealedUnitWindowStyleTemplateProps {
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

export function SealedUnitWindowStyleTemplate({
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
}: SealedUnitWindowStyleTemplateProps) {
  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="border-b-2 border-slate-600 pb-2 flex justify-between items-end">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Official Quotation Proposal
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 m-0 uppercase font-sans">
            The Window &amp; Door Store
          </h1>
          <p className="text-[8.5pt] text-slate-600 font-medium mt-0.5">
            Precision Sealed Unit Fabrication &amp; Glazing Services
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block border border-slate-400 px-2.5 py-1 rounded bg-slate-50">
            <div className="text-[7pt] uppercase font-bold text-slate-500">Quote Reference</div>
            <div className="text-base font-mono font-black text-slate-900">
              #{quoteNumber || '------'}
            </div>
          </div>
          <div className="text-[7.5pt] text-slate-600 font-semibold mt-0.5">
            Issued: {quoteDate}
          </div>
        </div>
      </div>

      {/* Client & Scope Metadata Card */}
      <div className="grid grid-cols-12 gap-2 bg-slate-50/70 border border-slate-300 rounded p-2 text-[8pt]">
        <div className="col-span-6 sm:col-span-5">
          <span className="text-slate-500 uppercase font-bold text-[7pt] block">Prepared For:</span>
          <span className="text-slate-900 font-black text-[9pt] block">
            {customerName || 'Valued Customer'}
          </span>
        </div>
        <div className="col-span-3 sm:col-span-4">
          <span className="text-slate-500 uppercase font-bold text-[7pt] block">Service Scope:</span>
          <span className="font-bold text-slate-800 block">
            {isService ? 'Service Glazing' : isInstallation ? 'Supply & Installation' : 'Supply Only'}
          </span>
        </div>
        <div className="col-span-3 text-right">
          <span className="text-slate-500 uppercase font-bold text-[7pt] block">Prepared By:</span>
          <span className="font-bold text-slate-900">{preparedBy || 'Staff Estimator'}</span>
        </div>
      </div>

      {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
      <SealedUnitSpecBadges lineItems={lineItems} />

      {/* Line Items Table */}
      <SealedUnitInvoiceTable
        lineItems={lineItems}
        totals={totals}
        isService={isService}
        isInstallation={isInstallation}
        labour={labour}
        variant="window_style"
      />

      {/* FULL-WIDTH QUOTATION SUMMARY CARD */}
      <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 space-y-2">
        <div className="text-[8pt] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex justify-between font-sans">
          <span>Summary</span>
          <span className="font-mono text-[7.5pt] font-bold text-slate-600">
            {isService
              ? 'Service Pricing'
              : `${lineItems.reduce((acc, i) => acc + i.quantity, 0)} Units Total`}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-3 items-start">
          {/* Financial Lines Ledger */}
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
              textColor="text-slate-900"
              subtextColor="text-slate-700"
              borderColor="border-slate-300"
              totalBorderColor="border-slate-600"
            />
          </div>

          {/* Rich Customer Notes */}
          <div className="col-span-5 border-l border-slate-200 pl-3 space-y-1">
            <span className="text-[7pt] uppercase font-bold text-slate-500 block tracking-wider font-sans">
              Special Notes &amp; Instructions
            </span>
            {quoteNotes && quoteNotes.trim() ? (
              renderRichNotes(quoteNotes, 7.5)
            ) : (
              <p className="text-[7pt] text-slate-400 italic">
                No special instructions recorded on this proposal.
              </p>
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
