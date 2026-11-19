"use client"

import React, { useState, useEffect } from "react"
import {
  DoorLineItem,
  DoorQuoteTotals,
  DoorSelectedUpcharge,
} from "@/lib/doors/types"
import { DoorInvoiceHeader } from "./DoorInvoiceHeader"
import { DoorInvoiceItemsTable } from "./DoorInvoiceItemsTable"
import { DoorInvoiceUpchargesTable } from "./DoorInvoiceUpchargesTable"
import { DoorRichNotes } from "./DoorRichNotes"
import { DoorPrintLedger } from "./DoorPrintLedger"
import { readSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface DoorPrintInvoiceProps {
  quoteNumber: string
  quoteDate: string
  customerName: string
  preparedBy: string
  isInstallation: boolean
  isDualOption?: boolean
  totals: DoorQuoteTotals
  lineItems: DoorLineItem[]
  globalUpcharges: DoorSelectedUpcharge[]
  upgradeItems: DoorLineItem[]
  quoteNotes: string
  isFirstNation: boolean
  hasAttachedWindow: boolean
  hasAttachedSU: boolean
  attachedWindowQuote?: any
  winBase: number
  winJC: number
  winJCDescription: string
  suGlass: number
  combinedLabour: number
  combinedMisc: number
  combinedSurcharge: number
  winDiscount: number
  winPromoName: string
  combinedSubtotal: number
  combinedTax: number
  finalGrandTotal: number
  firstPayment: number
  secondPayment: number
  customOptions?: any[]
}

export function DoorPrintInvoice({
  quoteNumber,
  quoteDate,
  customerName,
  preparedBy,
  isInstallation,
  isDualOption = false,
  totals,
  lineItems,
  globalUpcharges,
  upgradeItems,
  quoteNotes,
  isFirstNation,
  hasAttachedWindow,
  hasAttachedSU,
  attachedWindowQuote,
  winBase,
  winJC,
  winJCDescription,
  suGlass,
  combinedLabour,
  combinedMisc,
  combinedSurcharge,
  winDiscount,
  winPromoName,
  combinedSubtotal,
  combinedTax,
  finalGrandTotal,
  firstPayment,
  secondPayment,
  customOptions,
}: DoorPrintInvoiceProps) {
  const [sessionAttachedAmount, setSessionAttachedAmount] = useState<
    number | null
  >(null)

  useEffect(() => {
    const cached = readSessionAttachedInstallOption()
    if (cached?.amountPreTaxCents && cached.amountPreTaxCents > 0) {
      setSessionAttachedAmount(cached.amountPreTaxCents / 100)
    }
  }, [])
  return (
    <div
      id="printable-invoice"
      className="w-full max-w-[8.2in] space-y-3 rounded-lg border border-slate-300 bg-white p-6 font-sans text-[8.5pt] leading-tight text-black shadow-2xl select-text sm:p-8 print:m-0 print:w-full print:max-w-none print:overflow-visible print:rounded-none print:border-none print:p-0 print:shadow-none"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: letter portrait;
            margin: 0.3in;
          }
          html, body {
            width: 8.5in !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-invoice {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          #printable-invoice * {
            visibility: visible !important;
          }
        }
      `,
        }}
      />

      <DoorInvoiceHeader
        quoteNumber={quoteNumber}
        quoteDate={quoteDate}
        customerName={customerName}
        preparedBy={preparedBy}
        isInstallation={isInstallation}
        totals={totals}
        lineItems={lineItems}
      />

      <DoorInvoiceItemsTable
        lineItems={lineItems}
        isInstallation={isInstallation}
      />

      <DoorInvoiceUpchargesTable
        isInstallation={isInstallation}
        globalUpcharges={globalUpcharges}
        totals={totals}
      />

      {/* Financial Summary Box & Deposit Schedule */}
      <div className="grid grid-cols-12 gap-3 pt-1">
        {/* Left 7 cols: Optional Upgrades list & Warranty Info */}
        <div className="col-span-7 space-y-2">
          {/* Unified Options Section */}
          {(isDualOption || upgradeItems.length > 0) && (
            <div className="space-y-1 rounded border border-slate-300 bg-white p-2.5 text-[8pt] text-slate-800 shadow-2xs">
              <div className="border-b border-slate-200 pb-1 text-[7.5pt] font-bold tracking-wider text-slate-900 uppercase">
                Options
              </div>
              <div className="space-y-1 pt-0.5">
                {isDualOption && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 shrink-0 rounded-xs border border-slate-600 bg-white" />
                      <span className="text-[7.5pt] font-medium text-slate-700">
                        {hasAttachedWindow && hasAttachedSU
                          ? "Windows / Sealed Units / Doors"
                          : hasAttachedWindow
                            ? "Windows / Doors"
                            : hasAttachedSU
                              ? "Doors / Sealed Units"
                              : "Doors"}{" "}
                        {isInstallation
                          ? "for Supply Only deduct:"
                          : "with Installation add:"}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        isInstallation ? "text-sky-700" : "text-slate-900"
                      }`}
                    >
                      {isInstallation ? "-$" : "+$"}
                      {(sessionAttachedAmount !== null
                        ? sessionAttachedAmount
                        : combinedLabour + combinedMisc
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                {upgradeItems.map((item, idx) => {
                  const diff =
                    (item.upgradeOption?.subtotalDifference || 0) *
                    (item.quantity || 1)
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-slate-900"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 shrink-0 rounded-xs border border-slate-600 bg-white" />
                        <span className="text-[7.5pt] font-medium text-slate-700">
                          {item.upgradeOption?.title ||
                            item.customDescription ||
                            item.presetLabel}
                        </span>
                      </div>
                      <span className="font-mono font-bold">
                        {diff < 0 ? "-$" : "+$"}
                        {Math.abs(diff).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {!isDualOption && upgradeItems.length === 0 && (
            <div className="space-y-1 rounded border border-slate-300 bg-slate-50 p-2.5 text-[7.5pt] text-slate-600">
              <div className="text-[8pt] font-bold text-slate-800">
                Comprehensive 5-Year Workmanship Warranty
              </div>
              <div>
                All door systems and installations include our 5-year labour
                warranty, precision perimeter weather-sealing, and factory
                manufacturer warranty.
              </div>
            </div>
          )}

          <DoorRichNotes notes={quoteNotes} />
        </div>

        {/* Right 5 cols: Exact Summary Breakdown & Side-by-Side 50/50 Deposit */}
        <div className="col-span-5">
          <DoorPrintLedger
            lineItems={lineItems}
            totals={totals}
            isFirstNation={isFirstNation}
            hasAttachedWindow={hasAttachedWindow}
            hasAttachedSU={hasAttachedSU}
            attachedWindowQuote={attachedWindowQuote}
            winBase={winBase}
            winJC={winJC}
            winJCDescription={winJCDescription}
            suGlass={suGlass}
            combinedLabour={combinedLabour}
            combinedMisc={combinedMisc}
            combinedSurcharge={combinedSurcharge}
            winDiscount={winDiscount}
            winPromoName={winPromoName}
            combinedSubtotal={combinedSubtotal}
            combinedTax={combinedTax}
            finalGrandTotal={finalGrandTotal}
            firstPayment={firstPayment}
            secondPayment={secondPayment}
            customOptions={customOptions}
          />
        </div>
      </div>

      {/* Signature / Approval Footer */}
      <div className="mt-4 flex items-end justify-between border-t border-slate-300 pt-3 text-[7.5pt] text-slate-500">
        <div className="space-y-3">
          <div className="w-56 border-b border-slate-400 pb-0.5 text-slate-700">
            Customer Signature
          </div>
          <div className="text-[6.5pt] text-slate-400">
            Signature indicates acceptance of door specifications, terms, and
            deposit schedule.
          </div>
        </div>

        <div className="w-36 border-b border-slate-400 pb-0.5 text-right text-slate-700">
          Date
        </div>
      </div>
    </div>
  )
}
