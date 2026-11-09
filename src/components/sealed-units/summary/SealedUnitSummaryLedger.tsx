'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SealedUnitLineItem } from '@/lib/sealed-units-logic';
import { formatSealedUnitSummarySentence, getSealedUnitServiceSummaryLabel } from '@/lib/sealed-units-logic';
import { formatDoorItemHeading } from '@/lib/doors/calculations';
import { SealedUnitSummaryDepositAndUpgrades } from './SealedUnitSummaryDepositAndUpgrades';

export interface SealedUnitSummaryLedgerProps {
  isService: boolean;
  lineItems: SealedUnitLineItem[];
  lineItemsCount: number;
  totals: any;
  labour: any;
  combinedLabour: number;
  combinedMisc: number;
  combinedSurcharge: number;
  combinedSubtotal: number;
  combinedTax: number;
  displayGrandTotal: number;
  firstPayment: number;
  secondPayment: number;
  hasAttachedWindow: boolean;
  hasAttachedDoor: boolean;
  hasAnyAttached: boolean;
  attachedWindowQuote?: any;
  attachedDoorQuote?: any;
  attachedWinSentence: string;
  attachedDoorSentence: string;
  winBase: number;
  winJC: number;
  winJCDescription: string;
  winDiscount: number;
  doorRawBase: number;
  doorDiscount: number;
  isInstallation: boolean;
  hstRate: number;
  setHstRate: (rate: number) => void;
}

export function SealedUnitSummaryLedger({
  isService,
  lineItems,
  lineItemsCount,
  totals,
  labour,
  combinedLabour,
  combinedMisc,
  combinedSurcharge,
  combinedSubtotal,
  combinedTax,
  displayGrandTotal,
  firstPayment,
  secondPayment,
  hasAttachedWindow,
  hasAttachedDoor,
  hasAnyAttached,
  attachedWindowQuote,
  attachedDoorQuote,
  attachedWinSentence,
  attachedDoorSentence,
  winBase,
  winJC,
  winJCDescription,
  winDiscount,
  doorRawBase,
  doorDiscount,
  isInstallation,
  hstRate,
  setHstRate,
}: SealedUnitSummaryLedgerProps) {
  return (
    <div className="space-y-3 text-xs">
      <div className="space-y-1.5 pb-2.5 border-b border-border/50">
        {isService ? (
          <>
            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
              <span className="text-muted-foreground font-medium">
                {getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)} (Labour)
              </span>
              <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                ${combinedLabour.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
              <span className="text-muted-foreground font-medium">
                Service Materials &amp; Misc ({(totals.totalSqft || 0).toFixed(2)} sq ft @ $
                {(totals.effectiveMiscRate || labour.miscRatePerSqft || 2.4).toFixed(2)}/sqft)
              </span>
              <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                +${combinedMisc.toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <>
            {lineItemsCount > 0 && (
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                <span className="text-muted-foreground font-medium capitalize truncate">
                  {formatSealedUnitSummarySentence(lineItems)}
                </span>
                <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                  ${totals.glassBefore8PercentTotal.toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedWindow && (
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                <span className="text-muted-foreground font-medium truncate">
                  {attachedWinSentence}
                </span>
                <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                  +${winBase.toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedWindow && winJC > 0 && (
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                <span className="text-muted-foreground font-medium truncate">
                  {winJCDescription}
                </span>
                <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                  +${winJC.toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedDoor &&
              (attachedDoorQuote?.lineItems && attachedDoorQuote.lineItems.length > 0 ? (
                attachedDoorQuote.lineItems.map((dItem: any, dIdx: number) => (
                  <div key={dItem.id || dIdx} className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground font-medium truncate">{formatDoorItemHeading(dItem)}</span>
                    <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                      +${((dItem.inksterBasePrice || 0) * (dItem.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                  <span className="text-muted-foreground font-medium truncate">{attachedDoorSentence}</span>
                  <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">+${doorRawBase.toFixed(2)}</span>
                </div>
              ))}

            {hasAttachedDoor && Boolean(attachedDoorQuote?.totals?.hardwareTotal > 0) && (
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                <span className="text-muted-foreground font-medium truncate">
                  Door Lockset &amp; Hardware
                </span>
                <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                  +${Number(attachedDoorQuote.totals.hardwareTotal).toFixed(2)}
                </span>
              </div>
            )}

            {(isInstallation || hasAnyAttached) && (
              <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                <span className="text-muted-foreground">
                  Labour{' '}
                  {hasAnyAttached
                    ? '(all quotes combined)'
                    : '(includes all the labour and the travel charges)'}
                </span>
                <span className="font-mono text-foreground font-semibold whitespace-nowrap shrink-0">
                  +${combinedLabour.toFixed(2)}
                </span>
              </div>
            )}

            {(isInstallation || hasAnyAttached) && (
              <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                <span className="text-muted-foreground">
                  Misc {hasAnyAttached ? '(all quotes combined)' : ''}
                </span>
                <span className="font-mono text-foreground font-semibold whitespace-nowrap shrink-0">
                  +${combinedMisc.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
              <span className="text-muted-foreground">
                Surcharge {hasAnyAttached ? '(8% on materials)' : '(8% Glass Surcharge)'}
              </span>
              <span className="font-mono text-muted-foreground font-semibold whitespace-nowrap shrink-0">
                +${combinedSurcharge.toFixed(2)}
              </span>
            </div>

            {winDiscount > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span>
                  Promo Discount (
                  {attachedWindowQuote?.promoName ||
                    attachedWindowQuote?.quoteResult?.promoName ||
                    'Window Promo'}
                  )
                </span>
                <span className="font-mono whitespace-nowrap shrink-0">
                  -${winDiscount.toFixed(2)}
                </span>
              </div>
            )}

            {doorDiscount > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span>10% Door Discount (non-storm doors)</span>
                <span className="font-mono whitespace-nowrap shrink-0">
                  -${doorDiscount.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Subtotal */}
      <div className="pb-2.5 border-b border-border/50 text-xs sm:text-sm">
        <div className="flex items-center justify-between font-medium">
          <span className="text-foreground font-bold">Subtotal</span>
          <span className="font-mono font-bold text-primary whitespace-nowrap shrink-0">
            ${combinedSubtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tax Section */}
      <div className="pt-1 pb-2.5 space-y-1.5 border-b border-border/50">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">
            {isService
              ? '13% HST (Service Rate)'
              : hstRate === 8
              ? '5% GST (First Nations Material Exemption)'
              : hstRate === 0
              ? 'No Tax'
              : '13% HST'}
          </span>
          <span className="font-mono font-semibold text-foreground whitespace-nowrap shrink-0">
            ${combinedTax.toFixed(2)}
          </span>
        </div>

        {!isService && (
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="suFirstNationCheckbox"
                checked={hstRate === 8}
                onCheckedChange={(c) => setHstRate(c ? 8 : 13)}
              />
              <Label
                htmlFor="suFirstNationCheckbox"
                className="cursor-pointer text-muted-foreground font-normal text-xs"
              >
                8% First Nations Material Exemption
              </Label>
            </div>
            <span
              className={cn(
                'font-mono text-xs',
                hstRate === 8
                  ? 'text-emerald-500 font-semibold'
                  : 'text-muted-foreground opacity-40 line-through'
              )}
            >
              {hstRate === 8 ? '-8% PST' : 'Standard'}
            </span>
          </div>
        )}
      </div>

      <SealedUnitSummaryDepositAndUpgrades
        displayGrandTotal={displayGrandTotal}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        hasAttachedDoor={hasAttachedDoor}
        hasAttachedWindow={hasAttachedWindow}
        attachedDoorQuote={attachedDoorQuote}
        attachedWindowQuote={attachedWindowQuote}
      />
    </div>
  );
}
