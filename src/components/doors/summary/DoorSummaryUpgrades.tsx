'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { DoorLineItem } from '@/lib/doors/types';

export interface DoorSummaryUpgradesProps {
  upgradeItems: DoorLineItem[];
  hasAttachedWindow: boolean;
  attachedWindowQuote?: any;
}

export function DoorSummaryUpgrades({
  upgradeItems,
  hasAttachedWindow,
  attachedWindowQuote,
}: DoorSummaryUpgradesProps) {
  const hasWindowUpgrade =
    hasAttachedWindow && attachedWindowQuote?.attachedUpgrade?.amountPreTaxCents > 0;

  if (upgradeItems.length === 0 && !hasWindowUpgrade) return null;

  return (
    <>
      {/* Option for door Callout for Record Keeping */}
      {upgradeItems.length > 0 && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs">
          <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            Option for door:
          </div>
          <div className="space-y-1 divide-y divide-emerald-500/20">
            {upgradeItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="pt-1 first:pt-0 flex items-center justify-between gap-2"
              >
                <span className="truncate text-muted-foreground text-[11px]">
                  {item.customDescription || item.presetLabel}:{' '}
                  <strong>{item.upgradeOption?.title}</strong>
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-xs">
                  +${item.upgradeOption?.subtotalDifference.toFixed(2)}/unit
                  {item.quantity > 1
                    ? ` (+${((item.upgradeOption?.subtotalDifference || 0) * item.quantity).toFixed(2)} total)`
                    : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attached Window Upgrade Callout */}
      {hasWindowUpgrade && (
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

