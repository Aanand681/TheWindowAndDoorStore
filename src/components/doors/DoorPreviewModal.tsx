'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Printer,
  X,
  FileText,
  DoorClosed,
} from 'lucide-react';
import QuoteNotesEditor from '@/components/quotes/QuoteNotesEditor';
import {
  DoorLineItem,
  DoorQuoteTotals,
  DoorQuotingMode,
  DoorSelectedUpcharge,
} from '@/lib/doors/types';
import { formatDoorSummarySentence, formatDoorItemHeading } from '@/lib/doors/calculations';

export interface DoorPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineItems: DoorLineItem[];
  totals: DoorQuoteTotals;
  mode: DoorQuotingMode;
  globalUpcharges: DoorSelectedUpcharge[];
  customerName?: string;
  quoteNumber?: string;
  preparedBy?: string;
  quoteNotes: string;
  onQuoteNotesChange: (notes: string) => void;
  isFirstNation: boolean;
  attachedWindowQuote?: any | null;
  attachedSealedUnit?: any | null;
}

/**
 * Rich Formatted Notes Parser (Matching Sealed Units and Window proposal):
 * Supports bold (<b>, <strong>, **text**), bullet points (•, -, *), and line breaks.
 */
function renderRichNotes(notes?: string) {
  if (!notes || !notes.trim()) return null;

  const lines = notes.split('\n');
  return (
    <div className="space-y-1 text-[8pt] text-slate-800 leading-snug">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />;
        const isBullet =
          line.trim().startsWith('•') ||
          line.trim().startsWith('- ') ||
          line.trim().startsWith('* ');
        const text = isBullet ? line.trim().replace(/^[•\-\*]\s*/, '') : line;

        const parts = text.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-950">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5">
              <span className="text-slate-900 font-bold shrink-0">•</span>
              <span>{renderedLine}</span>
            </div>
          );
        }

        return <div key={idx}>{renderedLine}</div>;
      })}
    </div>
  );
}

export function DoorPreviewModal({
  isOpen,
  onClose,
  lineItems,
  totals,
  mode,
  globalUpcharges,
  customerName = 'Valued Customer',
  quoteNumber = `DQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  preparedBy = 'The Window & Door Store',
  quoteNotes,
  onQuoteNotesChange,
  isFirstNation,
  attachedWindowQuote,
  attachedSealedUnit,
}: DoorPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [quoteDate, setQuoteDate] = useState<string>('');

  const hasAttachedWindow = Boolean(attachedWindowQuote);
  const hasAttachedSU = Boolean(attachedSealedUnit);
  const hasAnyAttached = hasAttachedWindow || hasAttachedSU;
  const isInstallation = mode === 'installation';

  const winBase = hasAttachedWindow ? (attachedWindowQuote.totals?.base || attachedWindowQuote.totals?.subtotal || 0) : 0;
  const winJC = hasAttachedWindow ? (attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0) : 0;
  const winJCDescription = attachedWindowQuote?.jcLabel || 'Jambs & Casing';
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount || attachedWindowQuote.quoteResult?.promoDiscount || attachedWindowQuote.data?.promoDiscount || 0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0;
  const winPromoName = attachedWindowQuote?.promoName || attachedWindowQuote?.quoteResult?.promoName || 'Window Promo';
  const suGlass = hasAttachedSU ? (attachedSealedUnit.totals?.glassBefore8PercentTotal || 0) : 0;
  const winLabour = hasAttachedWindow ? (attachedWindowQuote.totals?.labour || 0) : 0;
  const suLabour = hasAttachedSU ? (attachedSealedUnit.totals?.serviceLabourTotal ?? attachedSealedUnit.totals?.combinedLabourTotal ?? 0) : 0;
  const winMisc = hasAttachedWindow ? (attachedWindowQuote.totals?.misc || 0) : 0;
  const suMisc = hasAttachedSU ? (attachedSealedUnit.totals?.miscTotal || 0) : 0;
  const rawWinSurcharge = hasAttachedWindow ? (attachedWindowQuote.totals?.surcharge || 0) : 0;
  const winSurcharge = (rawWinSurcharge > winBase && winBase > 0)
    ? Math.round(winBase * 0.08 * 100) / 100
    : rawWinSurcharge;
  const suSurcharge = hasAttachedSU ? (attachedSealedUnit.totals?.glass8PercentSurchargeTotal || 0) : 0;

  const netDoorMaterials = (totals.rawDoorBaseTotal + totals.stormDoorTotal + totals.hardwareTotal - totals.discountTotal);
  const combinedLabour = (isInstallation ? totals.combinedLabourTotal : 0) + winLabour + suLabour;
  const combinedMisc = (isInstallation ? totals.miscTotal : 0) + winMisc + suMisc;
  const combinedSurcharge = totals.surchargeTotal + winSurcharge + suSurcharge;
  const combinedSubtotal = hasAnyAttached
    ? Math.round((netDoorMaterials + (winBase - winDiscount) + winJC + suGlass + combinedLabour + combinedMisc + combinedSurcharge) * 100) / 100
    : totals.subtotalPreTax;

  let combinedTax = totals.hstAmount;
  if (hasAnyAttached) {
    if (isFirstNation) {
      const mat = (netDoorMaterials + totals.surchargeTotal) +
        ((winBase - winDiscount) + winSurcharge + winJC) + (suGlass + suSurcharge);
      const srv = combinedLabour + combinedMisc;
      combinedTax = Math.round((mat * 0.05 + srv * 0.13) * 100) / 100;
    } else {
      combinedTax = Math.round(combinedSubtotal * 0.13 * 100) / 100;
    }
  }

  const finalGrandTotal = hasAnyAttached ? (combinedSubtotal + combinedTax) : totals.grandTotal;
  const firstPayment = Math.floor((finalGrandTotal / 2) * 100) / 100;
  const secondPayment = Math.round((finalGrandTotal - firstPayment) * 100) / 100;

  useEffect(() => {
    setMounted(true);
    setQuoteDate(
      new Date().toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('quote-modal-open');
      return () => {
        document.body.classList.remove('quote-modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const doorSentence = formatDoorSummarySentence(lineItems);
  const upgradeItems = lineItems.filter((i) => i.upgradeOption?.enabled);

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md overflow-hidden print:p-0 print:m-0 print:bg-white print:static print:overflow-visible">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print bg-card/90 border-b border-border px-4 sm:px-6 py-2.5 shadow-md shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <DoorClosed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Door Quote Preview &amp; Print</h2>
              <p className="text-[11px] text-muted-foreground">
                Official architectural proposal matching window and sealed unit specifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNotesEditor(!showNotesEditor)}
              className="gap-1.5 text-xs h-8 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showNotesEditor ? 'Hide Notes' : 'Edit Special Notes'}</span>
              {quoteNotes && quoteNotes.trim() && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
              )}
            </Button>

            <Button
              type="button"
              onClick={handlePrint}
              className="gap-1.5 text-xs h-8 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Quote</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Inline Rich Notes Editor inside Modal */}
        {showNotesEditor && (
          <div className="max-w-5xl mx-auto mt-2.5 pt-2.5 border-t border-border/60 animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-foreground">
                Special Notes &amp; Site Instructions (Supports bold &amp; bullet points)
              </span>
              <button
                type="button"
                onClick={() => setShowNotesEditor(false)}
                className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close Editor
              </button>
            </div>
            <QuoteNotesEditor
              id="doorQuoteModalNotes"
              value={quoteNotes}
              onChange={onQuoteNotesChange}
              placeholder="Enter special site instructions, door warranty details, or customer notes..."
            />
          </div>
        )}
      </div>

      {/* Main Printable Document Viewport (Letter format matching Sealed Units & Windows) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-muted/30 print:p-0 print:m-0 print:bg-white print:block print:w-full print:overflow-visible">
        <div
          id="printable-invoice"
          className="w-full max-w-[8.2in] bg-white text-black font-sans p-6 sm:p-8 rounded-lg shadow-2xl border border-slate-300 print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:w-full print:m-0 print:overflow-visible select-text text-[8.5pt] leading-tight space-y-3"
        >
          {/* Print CSS Rules matching Window & Sealed Unit Style */}
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

          {/* Header matching SealedUnitPrintInvoice */}
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
              <div className="text-[7.5pt] text-slate-600 font-semibold mt-0.5">
                Issued: {quoteDate}
              </div>
            </div>
          </div>

          {/* Client & Scope Metadata Card */}
          <div className="grid grid-cols-12 gap-2 bg-slate-50/70 border border-slate-300 rounded p-2.5 text-[8pt]">
            <div className="col-span-6 sm:col-span-5">
              <span className="text-slate-500 uppercase font-bold text-[7pt] block">Prepared For:</span>
              <span className="text-slate-900 font-black text-[9pt] block">{customerName || 'Valued Customer'}</span>
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

          {/* Top Specification Badges matching Window / Sealed Unit layout */}
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
              <span className="text-[6pt] text-slate-500 font-sans uppercase block">Manufacturer Surcharge</span>
              <span className="font-bold text-slate-900">8% Applied</span>
            </div>
            <div className="border border-slate-300 rounded p-1 bg-white">
              <span className="text-[6pt] text-slate-500 font-sans uppercase block">Door Discount</span>
              <span className="font-bold text-emerald-700">10% Included</span>
            </div>
          </div>

          {/* Configured Door Units Table */}
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
                  if (item.hardwareType === 'standard') hwLabel = `Standard Set ($${item.hardwarePrice.toFixed(0)})`;
                  else if (item.hardwareType === 'customer_supplied') hwLabel = `Customer ($${(item.customerHardwareFee || 80).toFixed(0)} Reinstall Labour)`;
                  else if (item.hardwareType === 'custom') hwLabel = `${item.customHardwareName || 'Custom'} ($${item.hardwarePrice.toFixed(0)})`;

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
                          <div className="text-[7pt] text-slate-500">
                            Preset: {item.presetLabel}
                          </div>
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
                          ${(isInstallation ? item.lineGrandTotal : (item.lineSupplyTotal ?? (item.lineDoorSupplyTotal + item.lineHardwareTotal + (item.surchargeAmount * item.quantity) - (item.discountAmount * item.quantity)))).toFixed(2)}
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
                              {item.quantity > 1 ? ` (+${((item.upgradeOption.subtotalDifference || 0) * item.quantity).toFixed(2)} total)` : ''}
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

          {/* Jobsite Labour & Special Site Services Table */}
          {isInstallation && globalUpcharges.length > 0 && (
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 px-2 py-1 text-[8pt] font-bold text-slate-800 uppercase tracking-wider flex justify-between items-center">
                <span>Jobsite Labour &amp; Special Site Services</span>
                <span className="text-[7pt] text-slate-500 font-normal">{globalUpcharges.length} item{globalUpcharges.length > 1 ? 's' : ''}</span>
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
                      <td className="py-1 px-1.5 text-right font-mono text-slate-600">${Number(u.rate || 0).toFixed(2)}</td>
                      <td className="py-1 px-1.5 text-right font-mono font-bold text-slate-950">${Number(u.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Site Mobilization Notice */}
          {isInstallation && totals.totalTravelAndSetup > 0 && (
            <div className="p-1.5 border border-slate-200 rounded bg-slate-50 text-[7.5pt] flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-700">Site Setup &amp; Mobilization:</span>{' '}
                <span className="font-mono font-semibold">${totals.totalTravelAndSetup.toFixed(2)}</span>
                {totals.additionalFarFee > 0 && (
                  <span className="text-slate-500 ml-1">
                    ($140 Base + ${totals.additionalFarFee.toFixed(2)} remote)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Financial Summary Box & Deposit Schedule (Matching SealedUnit & Window Proposal Layout) */}
          <div className="grid grid-cols-12 gap-3 pt-1">
            {/* Left 7 cols: Optional Upgrades list & Warranty Info */}
            <div className="col-span-7 space-y-2">
              {upgradeItems.length > 0 ? (
                <div className="border border-emerald-300 rounded p-2.5 bg-emerald-50/50 text-[7.5pt] space-y-1">
                  <div className="font-bold text-emerald-900 uppercase tracking-wider text-[7pt]">
                    Optional Door Upgrades (For Customer Record):
                  </div>
                  {upgradeItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-emerald-800">
                      <span>{item.customDescription || item.presetLabel}: <strong>{item.upgradeOption?.title}</strong></span>
                      <span className="font-mono font-bold">
                        +${item.upgradeOption?.subtotalDifference.toFixed(2)}/unit
                        {item.quantity > 1 ? ` (+${((item.upgradeOption?.subtotalDifference || 0) * item.quantity).toFixed(2)} total)` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-300 rounded p-2.5 bg-slate-50 text-[7.5pt] space-y-1 text-slate-600">
                  <div className="font-bold text-slate-800 text-[8pt]">Comprehensive 5-Year Workmanship Warranty</div>
                  <div>All door systems and installations include our 5-year labour warranty, precision perimeter weather-sealing, and factory manufacturer warranty.</div>
                </div>
              )}

              {/* Special Notes & Site Instructions */}
              {quoteNotes && quoteNotes.trim() && (
                <div className="border border-slate-300 rounded p-2.5 bg-slate-50/60 text-[7.5pt]">
                  <div className="font-bold text-slate-700 uppercase text-[7pt] tracking-wider mb-1">
                    Special Notes &amp; Site Instructions:
                  </div>
                  {renderRichNotes(quoteNotes)}
                </div>
              )}
            </div>

            {/* Right 5 cols: Exact Summary Breakdown & Side-by-Side 50/50 Deposit */}
            <div className="col-span-5 border border-slate-300 rounded p-3 bg-slate-50 text-[8pt] space-y-1.5">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[7.5pt] border-b border-slate-300 pb-1">
                Summary
              </div>

              {lineItems.length > 0 ? (
                lineItems.map((item, idx) => {
                  const qty = item.quantity || 1;
                  const heading = formatDoorItemHeading(item);
                  const itemBaseTotal = item.inksterBasePrice * qty;
                  return (
                    <div key={item.id || idx} className="flex justify-between text-[7.5pt]">
                      <span className="text-slate-600 truncate max-w-[200px]">{heading}:</span>
                      <span className="font-mono font-semibold shrink-0">${itemBaseTotal.toFixed(2)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex justify-between text-[7.5pt]">
                  <span className="text-slate-600">Door Units:</span>
                  <span className="font-mono font-semibold">$0.00</span>
                </div>
              )}

              {hasAttachedWindow && (
                <div className="flex justify-between text-[7.5pt]">
                  <span className="text-slate-600 truncate max-w-[200px]">{attachedWindowQuote.summarySentence || attachedWindowQuote.summaryLabel || 'Attached Window Glass'}:</span>
                  <span className="font-mono font-semibold shrink-0">+${winBase.toFixed(2)}</span>
                </div>
              )}

              {hasAttachedWindow && winJC > 0 && (
                <div className="flex justify-between text-[7.5pt]">
                  <span className="text-slate-600 truncate max-w-[200px]">{winJCDescription}:</span>
                  <span className="font-mono font-semibold shrink-0">+${winJC.toFixed(2)}</span>
                </div>
              )}

              {hasAttachedSU && (
                <div className="flex justify-between text-[7.5pt]">
                  <span className="text-slate-600 truncate max-w-[200px]">Attached Sealed Glass:</span>
                  <span className="font-mono font-semibold shrink-0">+${suGlass.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[7.5pt]">
                <span className="text-slate-600">Labour:</span>
                <span className="font-mono font-semibold">${combinedLabour.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[7.5pt]">
                <span className="text-slate-600">Miscellaneous:</span>
                <span className="font-mono font-semibold">${combinedMisc.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[7.5pt]">
                <span className="text-slate-600">Surcharge:</span>
                <span className="font-mono font-semibold">${combinedSurcharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[7.5pt] text-emerald-700 font-semibold">
                <span>10% Door Discount:</span>
                <span className="font-mono">-${totals.discountTotal.toFixed(2)}</span>
              </div>

              {winDiscount > 0 && (
                <div className="flex justify-between text-[7.5pt] text-emerald-700 font-semibold">
                  <span className="truncate max-w-[200px]">Promo ({winPromoName}):</span>
                  <span className="font-mono shrink-0">-${winDiscount.toFixed(2)}</span>
                </div>
              )}

              {totals.hardwareTotal > 0 && (
                <div className="flex justify-between text-[7.5pt]">
                  <span className="text-slate-600">Hardware &amp; Lockset:</span>
                  <span className="font-mono font-semibold">${totals.hardwareTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-[8.5pt]">
                <span>Subtotal:</span>
                <span className="font-mono">${combinedSubtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[7.5pt] text-slate-600">
                <span>HST ({isFirstNation ? '5% GST FN' : '13%'}):</span>
                <span className="font-mono font-semibold">${combinedTax.toFixed(2)}</span>
              </div>

              {/* Total incl. HST */}
              <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between items-baseline font-black text-[11pt] text-slate-950">
                <span className="uppercase text-[8pt]">Total:</span>
                <span className="font-mono">${finalGrandTotal.toFixed(2)}</span>
              </div>

              {/* Side-by-side First 50% and Final 50% deposit boxes matching Sealed Units */}
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 mt-1 border-t border-slate-300 text-center text-[7pt]">
                <div className="border border-slate-300 rounded py-1 px-1.5 bg-white">
                  <span className="text-slate-500 uppercase block font-bold text-[6pt]">First 50%</span>
                  <span className="font-mono font-bold text-slate-900">${firstPayment.toFixed(2)}</span>
                </div>
                <div className="border border-slate-300 rounded py-1 px-1.5 bg-white">
                  <span className="text-slate-500 uppercase block font-bold text-[6pt]">Final 50%</span>
                  <span className="font-mono font-bold text-slate-900">${secondPayment.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature / Approval Footer */}
          <div className="border-t border-slate-300 pt-3 mt-4 flex justify-between items-end text-[7.5pt] text-slate-500">
            <div className="space-y-3">
              <div className="w-56 border-b border-slate-400 pb-0.5 text-slate-700">
                Customer Signature
              </div>
              <div className="text-[6.5pt] text-slate-400">
                Signature indicates acceptance of door specifications, terms, and deposit schedule.
              </div>
            </div>

            <div className="w-36 border-b border-slate-400 pb-0.5 text-right text-slate-700">
              Date
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
