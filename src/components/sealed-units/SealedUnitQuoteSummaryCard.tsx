'use client';

import React from 'react';
import {
  DollarSign,
  PackageCheck,
  Printer,
  RotateCcw,
  FileText,
  Send,
  ShieldCheck,
  Bookmark,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  SealedUnitLabourSettings,
  SealedUnitLineItem,
  formatSealedUnitSummarySentence,
} from '@/lib/sealed-units-logic';

export interface SealedUnitQuoteSummaryCardProps {
  lineItems: SealedUnitLineItem[];
  lineItemsCount: number;
  mode?: 'installation' | 'supply_only' | 'service_only';
  isInstallation: boolean;
  labour: SealedUnitLabourSettings;
  hstRate: number;
  setHstRate: (r: number) => void;
  totals: {
    totalUnits: number;
    totalSqft: number;
    totalBillableSqft: number;
    glassBefore8PercentTotal: number;
    glass8PercentSurchargeTotal: number;
    glassSupplyTotal: number;
    unitLabourSum: number;
    baseSetupFee: number;
    additionalFarFee: number;
    vehicleTravelFee: number;
    crewTravelFee: number;
    totalAdditionalTravel: number;
    totalTravelAndSetup: number;
    combinedLabourTotal: number;
    miscTotal: number;
    serviceLabourTotal?: number;
    subtotalPreTax: number;
    hstAmount: number;
    grandTotal: number;
    effectiveLabourRate?: number;
    effectiveMiscRate?: number;
  };
  customerName: string;
  quoteNumber: string;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  user?: any;
  onOpenSubmitModal?: () => void;
  onPrint: () => void;
  onResetQuote?: () => void;
  onSaveDraft?: () => void;
  onOpenSavedQuotes?: () => void;
}

export function SealedUnitQuoteSummaryCard({
  lineItems,
  lineItemsCount,
  mode = 'installation',
  isInstallation,
  labour,
  hstRate,
  setHstRate,
  totals,
  customerName,
  quoteNumber,
  quoteNotes,
  setQuoteNotes,
  user,
  onOpenSubmitModal,
  onPrint,
  onResetQuote,
  onSaveDraft,
  onOpenSavedQuotes,
}: SealedUnitQuoteSummaryCardProps) {
  const isService = mode === 'service_only';
  const hasContent = isService ? ((totals.totalSqft || 0) > 0 || lineItemsCount > 0) : lineItemsCount > 0;

  // 50/50 Deposit Schedule (Matching Promo Calculator)
  const firstPayment = Math.floor((totals.grandTotal / 2) * 100) / 100;
  const secondPayment = Math.round((totals.grandTotal - firstPayment) * 100) / 100;

  return (
    <div className="bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 py-2.5 px-3.5 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold flex items-center gap-1.5 text-foreground">
            <DollarSign className="w-4 h-4 text-primary" />
            <span>Official Quote Breakdown</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isService ? (
              <span className="h-7 px-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center shadow-xs">
                13% HST (Fixed on Service)
              </span>
            ) : (
              <select
                value={hstRate}
                onChange={(e) => setHstRate(Number(e.target.value))}
                className="h-7 px-2 rounded-lg border border-input bg-background text-[11px] font-semibold cursor-pointer shadow-xs text-foreground"
              >
                <option value={13}>13% HST</option>
                <option value={8}>8% First Nations Material Exemption</option>
                <option value={0}>No Tax</option>
              </select>
            )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5" suppressHydrationWarning>
          Itemized summary for Quote #{quoteNumber || '------'} {customerName ? `• ${customerName}` : ''}
        </p>
      </div>

      <div className="p-3 sm:p-3.5 space-y-3">
        {!hasContent ? (
          <div className="py-8 text-center text-muted-foreground space-y-1.5">
            <PackageCheck className="w-8 h-8 mx-auto opacity-30 text-muted-foreground" />
            <div className="text-xs font-semibold">
              {isService ? 'No service square footage entered yet' : 'No items added to quote yet'}
            </div>
            <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto">
              {isService
                ? 'Enter total service square footage above or configure glass units on the left to compute pricing.'
                : 'Configure glass specs on the left and click "Add to Quote" to compute exact pricing.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {/* Strict Sequence - Styled exactly like Promo Summary without bullets */}
            <div className="space-y-1.5 pb-2.5 border-b border-border/50">
              {isService ? (
                <>
                  {/* Service Labour on Total Sqft (includes travel setup charges) */}
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground font-medium">
                      Service Labour {totals.totalTravelAndSetup > 0 ? '(includes travel & setup charges)' : `(${(totals.totalSqft || 0).toFixed(2)} sq ft @ $${(totals.effectiveLabourRate || labour.labourRatePerSqft || 14.40).toFixed(2)}/sqft)`}
                    </span>
                    <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                      ${totals.combinedLabourTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Service Misc on Total Sqft */}
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground font-medium">
                      Service Materials &amp; Misc ({(totals.totalSqft || 0).toFixed(2)} sq ft @ ${(totals.effectiveMiscRate || labour.miscRatePerSqft || 2.40).toFixed(2)}/sqft)
                    </span>
                    <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                      +${(totals.miscTotal || 0).toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* 1. Unified Glass Summary Sentence */}
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground font-medium capitalize truncate">
                      {formatSealedUnitSummarySentence(lineItems)}
                    </span>
                    <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                      ${totals.glassBefore8PercentTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* 2. Labour (includes all the labour and travel charges) */}
                  {isInstallation && (
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground">
                        Labour (includes all the labour and the travel charges)
                      </span>
                      <span className="font-mono text-foreground font-semibold whitespace-nowrap shrink-0">
                        +${totals.combinedLabourTotal.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* 3. Misc */}
                  {isInstallation && (
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground">Misc</span>
                      <span className="font-mono text-foreground font-semibold whitespace-nowrap shrink-0">
                        +${totals.miscTotal.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* 4. Surcharge (8% Glass Surcharge) */}
                  <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground">Surcharge</span>
                    <span className="font-mono text-muted-foreground font-semibold whitespace-nowrap shrink-0">
                      +${totals.glass8PercentSurchargeTotal.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 5. Subtotal of this amount */}
            <div className="pb-2.5 border-b border-border/50 text-xs sm:text-sm">
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground font-bold">Subtotal</span>
                <span className="font-mono font-bold text-primary whitespace-nowrap shrink-0">
                  ${totals.subtotalPreTax.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 6. Tax */}
            <div className="pb-2.5 border-b border-border/50 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  {hstRate === 8
                    ? 'HST (8% First Nations Material Exemption)'
                    : hstRate === 0
                    ? 'No Tax'
                    : 'HST (13%)'}
                </span>
                <span className="font-mono font-semibold text-foreground whitespace-nowrap shrink-0">
                  ${totals.hstAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 7. Total */}
            <div className="pt-1">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-black font-mono tracking-tight text-primary whitespace-nowrap shrink-0">
                  ${totals.grandTotal.toFixed(2)}
                </span>
              </div>

              {/* 50/50 Deposit Schedule (Matching Promo Calculator) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-muted/40 rounded-xl p-2.5 border border-border/60">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                    First 50% Deposit
                  </div>
                  <div className="font-mono font-bold text-primary text-sm whitespace-nowrap">
                    ${firstPayment.toFixed(2)}
                  </div>
                </div>
                <div className="bg-muted/40 rounded-xl p-2.5 border border-border/60">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                    Final 50% Balance
                  </div>
                  <div className="font-mono font-bold text-primary text-sm whitespace-nowrap">
                    ${secondPayment.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Notes Section */}
            <div className="pt-2 border-t border-border/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="sealedUnitNotes"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Special Notes &amp; Instructions</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">Printed on PDF quotation</span>
              </div>
              <Textarea
                id="sealedUnitNotes"
                rows={2}
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                placeholder="e.g. Special grid pattern specs, site measurement notes, safety glass location..."
                className="text-xs bg-background resize-none border-border/80 focus-visible:ring-1"
              />
            </div>

            {/* Action Buttons: Submit for Review, Print PDF, Reset */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              {onOpenSubmitModal && (
                <Button
                  type="button"
                  variant="default"
                  onClick={onOpenSubmitModal}
                  disabled={lineItemsCount === 0}
                  className={cn(
                    'w-full h-10 text-xs shadow-md font-bold text-white cursor-pointer transition-colors',
                    user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  )}
                >
                  {user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Approve &amp; Assign / Submit Quote
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Submit Quote for Review
                    </>
                  )}
                </Button>
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={onPrint}
                  disabled={lineItemsCount === 0}
                  className="gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer flex-1 h-9"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Export Quote (PDF)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onResetQuote}
                  disabled={lineItemsCount === 0}
                  className="gap-1.5 text-xs cursor-pointer h-9 text-muted-foreground hover:text-foreground"
                  title="Reset Quote"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
