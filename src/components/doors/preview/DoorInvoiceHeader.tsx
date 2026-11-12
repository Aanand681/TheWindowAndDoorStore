"use client"

import React from "react"
import { DoorQuoteTotals, DoorLineItem } from "@/lib/doors/types"

export interface DoorInvoiceHeaderProps {
  quoteNumber: string
  quoteDate: string
  customerName: string
  preparedBy: string
  isInstallation: boolean
  totals: DoorQuoteTotals
  lineItems: DoorLineItem[]
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
      <div className="flex items-end justify-between border-b-2 border-slate-600 pb-2.5">
        <div>
          <div className="text-[9pt] font-bold tracking-widest text-slate-500 uppercase">
            Official Quotation Proposal
          </div>
          <h1 className="m-0 font-sans text-xl font-black tracking-tight text-slate-900 uppercase">
            The Window &amp; Door Store
          </h1>
          <p className="mt-0.5 text-[8.5pt] font-medium text-slate-600">
            Exterior Door Systems, Glazing &amp; Professional Installation
          </p>
          <div className="mt-1 space-x-2 text-[7.5pt] text-slate-500">
            <span>1054 Ellis St, Thunder Bay, ON</span>
            <span>•</span>
            <span>(807) 623-1456</span>
            <span>•</span>
            <span>info@windowanddoorstore.ca</span>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block rounded border border-slate-400 bg-slate-50 px-3 py-1">
            <div className="text-[7pt] font-bold text-slate-500 uppercase">
              Quote Reference
            </div>
            <div className="font-mono text-base font-black text-slate-900">
              #{quoteNumber || "------"}
            </div>
          </div>
          <div className="mt-0.5 text-[7.5pt] font-semibold text-slate-600">
            Issued: {quoteDate}
          </div>
        </div>
      </div>

      {/* Client & Scope Metadata Card */}
      <div className="grid grid-cols-12 gap-2 rounded border border-slate-300 bg-slate-50/70 p-2.5 text-[8pt]">
        <div className="col-span-6 sm:col-span-5">
          <span className="block text-[7pt] font-bold text-slate-500 uppercase">
            Prepared For:
          </span>
          <span className="block text-[9pt] font-black text-slate-900">
            {customerName || "Valued Customer"}
          </span>
        </div>
        <div className="col-span-3 sm:col-span-4">
          <span className="block text-[7pt] font-bold text-slate-500 uppercase">
            Service Scope:
          </span>
          <span className="block font-bold text-slate-800">
            {isInstallation ? "Door Supply & Installation" : "Door Supply Only"}
          </span>
        </div>
        <div className="col-span-3 text-right">
          <span className="block text-[7pt] font-bold text-slate-500 uppercase">
            Prepared By:
          </span>
          <span className="block font-semibold text-slate-800">
            {preparedBy}
          </span>
        </div>
      </div>

      {/* Top Specification Badges */}
      <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[7pt]">
        <div className="rounded border border-slate-300 bg-white p-1">
          <span className="block font-sans text-[6pt] text-slate-500 uppercase">
            Total Doors
          </span>
          <span className="font-bold text-slate-900 uppercase">
            {totals.totalUnits} {totals.totalUnits === 1 ? "Unit" : "Units"}
          </span>
        </div>
        <div className="rounded border border-slate-300 bg-white p-1">
          <span className="block font-sans text-[6pt] text-slate-500 uppercase">
            Category
          </span>
          <span className="font-bold text-slate-900 uppercase">
            {lineItems[0]?.category || "Entry"} Door
          </span>
        </div>
        <div className="rounded border border-slate-300 bg-white p-1">
          <span className="block font-sans text-[6pt] text-slate-500 uppercase">
            Manufacturer Surcharge
          </span>
          <span className="font-bold text-slate-900">8% Applied</span>
        </div>
        <div className="rounded border border-slate-300 bg-white p-1">
          <span className="block font-sans text-[6pt] text-slate-500 uppercase">
            Door Discount
          </span>
          <span className="font-bold text-emerald-700">10% Included</span>
        </div>
      </div>
    </>
  )
}
