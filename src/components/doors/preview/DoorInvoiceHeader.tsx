'use client';

import React from 'react';
import { DoorQuoteTotals, DoorLineItem } from '@/lib/doors/types';

export interface DoorInvoiceHeaderProps {
  quoteNumber: string;
  quoteDate: string;
  customerName: string;
  preparedBy: string;
  isInstallation: boolean;
  totals: DoorQuoteTotals;
  lineItems: DoorLineItem[];
}

export function DoorInvoiceHeader({
  quoteNumber,
  quoteDate,
  customerName,
  preparedBy,
  isInstallation,
  totals,
  lineItems,
}: DoorInvoiceHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-slate-600 pb-2.5 flex justify-between items-end">
        <div>
          <div className="text-[9pt] font-bold tracking-widest text-slate-500 uppercase">
            Official Quotation Proposal
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 m-0 uppercase font-sans">
            The Window &amp; Door Store
          </h1>
          <p className="text-[8.5pt] text-slate-600 font-medium mt-0.5">
            Exterior Door Systems, Glazing &amp; Professional Installation
          </p>
          <div className="text-[7.5pt] text-slate-500 mt-1 space-x-2">
            <span>1054 Ellis St, Thunder Bay, ON</span>
            <span>•</span>
            <span>(807) 623-1456</span>
            <span>•</span>
            <span>info@windowanddoorstore.ca</span>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block border border-slate-400 px-3 py-1 rounded bg-slate-50">
            <div className="text-[7pt] uppercase font-bold text-slate-500">Quote Reference</div>
            <div className="text-base font-mono font-black text-slate-900">
              #{quoteNumber || '------'}
            </div>
          </div>
          <div className="text-[7.5pt] text-slate-600 font-semibold mt-0.5">Issued: {quoteDate}</div>
        </div>
      </div>

      {/* Client & Scope Metadata Card */}
      <div className="grid grid-cols-12 gap-2 bg-slate-50/70 border border-slate-300 rounded p-2.5 text-[8pt]">
        <div className="col-span-6 sm:col-span-5">
          <span className="text-slate-500 uppercase font-bold text-[7pt] block">Prepared For:</span>
          <span className="text-slate-900 font-black text-[9pt] block">
            {customerName || 'Valued Customer'}
          </span>
        </div>
        <div className="col-span-3 sm:col-span-4">
          <span className="text-slate-500 uppercase font-bold text-[7pt] block">Service Scope:</span>
          <span className="font-bold text-slate-800 block">
            {isInstallation ? 'Door Supply & Installation' : 'Door Supply Only'}
          </span>
        </div>
        <div className="col-span-3 text-right">
          <span className="text-slate-500 uppercase font-bold text-[7pt] block">Prepared By:</span>
          <span className="font-semibold text-slate-800 block">{preparedBy}</span>
        </div>
      </div>

      {/* Top Specification Badges */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[7pt] font-mono">
        <div className="border border-slate-300 rounded p-1 bg-white">
          <span className="text-[6pt] text-slate-500 font-sans uppercase block">Total Doors</span>
          <span className="font-bold text-slate-900 uppercase">
            {totals.totalUnits} {totals.totalUnits === 1 ? 'Unit' : 'Units'}
          </span>
        </div>
        <div className="border border-slate-300 rounded p-1 bg-white">
          <span className="text-[6pt] text-slate-500 font-sans uppercase block">Category</span>
          <span className="font-bold text-slate-900 uppercase">
            {lineItems[0]?.category || 'Entry'} Door
          </span>
        </div>
        <div className="border border-slate-300 rounded p-1 bg-white">
          <span className="text-[6pt] text-slate-500 font-sans uppercase block">
            Manufacturer Surcharge
          </span>
          <span className="font-bold text-slate-900">8% Applied</span>
        </div>
        <div className="border border-slate-300 rounded p-1 bg-white">
          <span className="text-[6pt] text-slate-500 font-sans uppercase block">Door Discount</span>
          <span className="font-bold text-emerald-700">10% Included</span>
        </div>
      </div>
    </>
  );
}

