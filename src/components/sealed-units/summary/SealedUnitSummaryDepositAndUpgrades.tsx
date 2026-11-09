'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export interface SealedUnitSummaryDepositAndUpgradesProps {
  displayGrandTotal: number;
  firstPayment: number;
  secondPayment: number;
  hasAttachedDoor: boolean;
  hasAttachedWindow: boolean;
  attachedDoorQuote?: any;
  attachedWindowQuote?: any;
}

export function SealedUnitSummaryDepositAndUpgrades({
  displayGrandTotal,
  firstPayment,
  secondPayment,
  hasAttachedDoor,
  hasAttachedWindow,
  attachedDoorQuote,
  attachedWindowQuote,
}: SealedUnitSummaryDepositAndUpgradesProps) {
  return (
    <>
      {/* Grand Total & 50/50 Deposit */}
      <div className="pt-1">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-base font-bold">Total</span>
          <span className="text-2xl font-black font-mono tracking-tight text-primary whitespace-nowrap shrink-0">
            ${displayGrandTotal.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
              First 50% Deposit
            </div>
            <div className="font-mono font-bold text-primary text-sm whitespace-nowrap">
              ${firstPayment.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
              Final 50% Balance
            </div>
            <div className="font-mono font-bold text-primary text-sm whitespace-nowrap">
              ${secondPayment.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Option for door Callout */}
      {hasAttachedDoor &&
        attachedDoorQuote?.lineItems &&
        attachedDoorQuote.lineItems.some((i: any) => i.upgradeOption?.enabled) && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              Option for door:
            </div>
            <div className="space-y-1 divide-y divide-emerald-500/20">
              {attachedDoorQuote.lineItems
                .filter((i: any) => i.upgradeOption?.enabled)
                .map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="pt-1 first:pt-0 flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-muted-foreground text-[11px]">
                      {item.customDescription || item.presetLabel}:{' '}
                      <strong>{item.upgradeOption?.title}</strong>
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-xs">
                      +${Number(item.upgradeOption?.subtotalDifference || 0).toFixed(2)}/unit
                      {item.quantity > 1
                        ? ` (+${(Number(item.upgradeOption?.subtotalDifference || 0) * item.quantity).toFixed(2)} total)`
                        : ''}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Attached Window Upgrade Callout */}
      {hasAttachedWindow && attachedWindowQuote?.attachedUpgrade?.amountPreTaxCents > 0 && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs">
          <div className="font-bold flex items-center justify-between text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Optional Window Upgrade:
            </span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
              +${(attachedWindowQuote.attachedUpgrade.amountPreTaxCents / 100).toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {attachedWindowQuote.attachedUpgrade.title} (Optional upgrade, not included in total)
          </p>
        </div>
      )}
    </>
  );
}

