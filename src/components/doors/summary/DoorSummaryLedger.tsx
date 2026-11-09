'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DoorLineItem, DoorQuoteTotals } from '@/lib/doors/types';
import { formatDoorItemHeading } from '@/lib/doors/calculations';
import { cn } from '@/lib/utils';
import { DoorSummaryEditableRow } from './DoorSummaryEditableRow';

export interface DoorSummaryLedgerProps {
  lineItems: DoorLineItem[];
  totals: DoorQuoteTotals;
  isInstallation: boolean;
  hasAttachedWindow: boolean;
  hasAttachedSU: boolean;
  attachedWindowQuote?: any;
  attachedWinSentence: string;
  attachedSUSentence: string;
  winBase: number;
  winJC: number;
  winJCDescription: string;
  suGlass: number;
  combinedLabour: number;
  customLabour: string;
  defaultDoorLabour: number;
  winLabour: number;
  suLabour: number;
  setCustomLabour?: (val: string) => void;
  combinedMisc: number;
  customMisc: string;
  defaultDoorMisc: number;
  winMisc: number;
  suMisc: number;
  setCustomMisc?: (val: string) => void;
  hasAnyAttached: boolean;
  combinedSurcharge: number;
  winDiscount: number;
  combinedSubtotal: number;
  isFirstNation: boolean;
  onToggleFirstNation: (val: boolean) => void;
  combinedTax: number;
  displayGrandTotal: number;
  firstPayment: number;
  secondPayment: number;
  editingField: 'labour' | 'misc' | null;
  setEditingField: (field: 'labour' | 'misc' | null) => void;
  tempEditVal: string;
  setTempEditVal: (val: string) => void;
}

export function DoorSummaryLedger({
  lineItems,
  totals,
  isInstallation,
  hasAttachedWindow,
  hasAttachedSU,
  attachedWindowQuote,
  attachedWinSentence,
  attachedSUSentence,
  winBase,
  winJC,
  winJCDescription,
  suGlass,
  combinedLabour,
  customLabour,
  defaultDoorLabour,
  winLabour,
  suLabour,
  setCustomLabour,
  combinedMisc,
  customMisc,
  defaultDoorMisc,
  winMisc,
  suMisc,
  setCustomMisc,
  hasAnyAttached,
  combinedSurcharge,
  winDiscount,
  combinedSubtotal,
  isFirstNation,
  onToggleFirstNation,
  combinedTax,
  displayGrandTotal,
  firstPayment,
  secondPayment,
  editingField,
  setEditingField,
  tempEditVal,
  setTempEditVal,
}: DoorSummaryLedgerProps) {
  return (
    <div className="space-y-2 text-xs sm:text-sm">
      {lineItems.length > 0 ? (
        lineItems.map((item, idx) => {
          const qty = item.quantity || 1;
          const heading = formatDoorItemHeading(item);
          const itemBaseTotal = item.inksterBasePrice * qty;

          return (
            <div
              key={item.id || idx}
              className="flex items-start justify-between gap-2 pb-1.5 border-b border-border/30"
            >
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-xs sm:text-sm">{heading}</div>
                <div className="text-[11px] text-muted-foreground">
                  Preset: {item.presetLabel} • ${item.inksterBasePrice.toFixed(2)}/ea
                </div>
              </div>
              <div className="font-mono font-semibold text-xs sm:text-sm shrink-0">
                ${itemBaseTotal.toFixed(2)}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-border/30">
          <div className="min-w-0">
            <div className="font-semibold text-foreground text-xs sm:text-sm">Door Units</div>
            <div className="text-[11px] text-muted-foreground">No doors configured yet</div>
          </div>
          <div className="font-mono font-semibold text-xs sm:text-sm shrink-0">$0.00</div>
        </div>
      )}

      {hasAttachedWindow && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground truncate">{attachedWinSentence}</span>
          <span className="font-mono font-medium">+${winBase.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedWindow && winJC > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground truncate">{winJCDescription}</span>
          <span className="font-mono font-medium">+${winJC.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedSU && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground truncate">{attachedSUSentence}</span>
          <span className="font-mono font-medium">+${suGlass.toFixed(2)}</span>
        </div>
      )}

      {isInstallation && (
        <DoorSummaryEditableRow
          field="labour"
          label="Labour"
          amount={combinedLabour}
          customVal={customLabour}
          defaultAmount={defaultDoorLabour + winLabour + suLabour}
          isInstallation={isInstallation}
          editingField={editingField}
          setEditingField={setEditingField}
          tempEditVal={tempEditVal}
          setTempEditVal={setTempEditVal}
          setter={setCustomLabour}
          suffix={hasAnyAttached ? '(all quotes)' : undefined}
        />
      )}

      {isInstallation && (
        <DoorSummaryEditableRow
          field="misc"
          label="Miscellaneous"
          amount={combinedMisc}
          customVal={customMisc}
          defaultAmount={defaultDoorMisc + winMisc + suMisc}
          isInstallation={isInstallation}
          editingField={editingField}
          setEditingField={setEditingField}
          tempEditVal={tempEditVal}
          setTempEditVal={setTempEditVal}
          setter={setCustomMisc}
          suffix={hasAnyAttached ? '(all quotes)' : undefined}
        />
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Surcharge (8% on materials)</span>
        <span className="font-mono font-medium">${combinedSurcharge.toFixed(2)}</span>
      </div>

      {totals.discountTotal > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            10% Discount (Non-Storm Doors)
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            -${totals.discountTotal.toFixed(2)}
          </span>
        </div>
      )}

      {winDiscount > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Promo Discount (
            {attachedWindowQuote?.promoName ||
              attachedWindowQuote?.quoteResult?.promoName ||
              'Attached Window Promo'}
            )
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            -${winDiscount.toFixed(2)}
          </span>
        </div>
      )}

      {totals.hardwareTotal > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Lockset &amp; Hardware</span>
          <span className="font-mono font-medium">${totals.hardwareTotal.toFixed(2)}</span>
        </div>
      )}

      <div className="pt-1 border-t border-border/60" />

      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Subtotal</span>
        <span className="font-mono text-base font-bold text-foreground">
          ${combinedSubtotal.toFixed(2)}
        </span>
      </div>

      <div className="pt-1 space-y-1.5 border-t border-border/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {isFirstNation ? '5% GST (First Nations Material Exemption)' : '13% HST'}
          </span>
          <span className="font-mono font-medium">${combinedTax.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="doorFirstNationCheckbox"
              checked={isFirstNation}
              onCheckedChange={(c) => onToggleFirstNation(Boolean(c))}
            />
            <Label
              htmlFor="doorFirstNationCheckbox"
              className="cursor-pointer text-muted-foreground font-normal text-xs"
            >
              8% First Nations Material Exemption
            </Label>
          </div>
          <span
            className={cn(
              'font-mono text-xs',
              isFirstNation
                ? 'text-emerald-500 font-semibold'
                : 'text-muted-foreground opacity-40 line-through'
            )}
          >
            {isFirstNation ? '-8% PST' : 'Standard'}
          </span>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-baseline mb-2.5">
          <span className="text-base font-bold text-foreground">Total incl. HST</span>
          <span className="text-2xl font-black font-mono tracking-tight text-primary whitespace-nowrap shrink-0">
            ${displayGrandTotal.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60 text-center sm:text-left">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
              First 50%
            </div>
            <div className="font-mono font-bold text-primary text-base whitespace-nowrap">
              ${firstPayment.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60 text-center sm:text-left">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
              Final 50%
            </div>
            <div className="font-mono font-bold text-primary text-base whitespace-nowrap">
              ${secondPayment.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

