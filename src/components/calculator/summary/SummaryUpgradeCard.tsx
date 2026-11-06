'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { formatMoney } from '@/lib/promo-logic';

export interface SummaryUpgradeCardProps {
  wantsUpgrade: boolean;
  setWantsUpgrade: (val: boolean) => void;
  isReadOnly?: boolean;
  upgrade?: any;
  shownUpgrade?: number;
  attachedDoorQuote?: any | null;
}

export function SummaryUpgradeCard({
  wantsUpgrade,
  setWantsUpgrade,
  isReadOnly = false,
  upgrade,
  shownUpgrade = 0,
  attachedDoorQuote,
}: SummaryUpgradeCardProps) {
  return (
    <>
      {/* 5-year free labour upgrade checkbox (placed right after 50/50 deposits) */}
      <div className="flex items-start space-x-2.5 bg-primary/5 p-3 rounded-xl border border-primary/15 mt-3">
        <Checkbox
          id="summaryUpgrade"
          disabled={isReadOnly}
          checked={wantsUpgrade}
          onCheckedChange={(c) => setWantsUpgrade(!!c)}
          className="mt-0.5"
        />
        <div className="space-y-0.5 flex-1">
          <Label htmlFor="summaryUpgrade" className="text-xs font-semibold cursor-pointer">
            Include 5-year free labour upgrade
          </Label>
          <p className="text-[10px] text-muted-foreground">
            Optional. Shows upgrade price only; not added to final total.
          </p>
          {wantsUpgrade && upgrade && (
            <div className="flex items-center justify-between text-xs font-semibold text-primary pt-1">
              <span>Upgrade ({upgrade?.rate})</span>
              <span className="font-mono whitespace-nowrap shrink-0">{formatMoney(shownUpgrade)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Option for door Callout for Attached Door Quote */}
      {attachedDoorQuote?.lineItems &&
        attachedDoorQuote.lineItems.some((i: any) => i.upgradeOption?.enabled) && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs mt-3">
            <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              Option for door:
            </div>
            <div className="space-y-1 divide-y divide-emerald-500/20">
              {attachedDoorQuote.lineItems
                .filter((i: any) => i.upgradeOption?.enabled)
                .map((item: any, idx: number) => (
                  <div key={item.id || idx} className="pt-1 first:pt-0 flex items-center justify-between gap-2">
                    <span className="truncate text-muted-foreground text-[11px]">
                      {item.customDescription || item.presetLabel}: <strong>{item.upgradeOption?.title}</strong>
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-xs">
                      +${Number(item.upgradeOption?.subtotalDifference || 0).toFixed(2)}/unit
                      {item.quantity > 1
                        ? ` (+${(
                            Number(item.upgradeOption?.subtotalDifference || 0) * item.quantity
                          ).toFixed(2)} total)`
                        : ''}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
    </>
  );
}

