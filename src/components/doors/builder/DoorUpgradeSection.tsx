'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

interface DoorUpgradeSectionProps {
  hasUpgradeOption: boolean;
  setHasUpgradeOption: (val: boolean) => void;
  upgradeTitle: string;
  setUpgradeTitle: (val: string) => void;
  upgradeInksterPrice: string;
  setUpgradeInksterPrice: (val: string) => void;
  upgradeDiff: {
    baseNetPrice: number;
    optionNetPrice: number;
    subtotalDifference: number;
    totalDifference: number;
  } | null;
  parsedQuantity: number;
}

export function DoorUpgradeSection({
  hasUpgradeOption,
  setHasUpgradeOption,
  upgradeTitle,
  setUpgradeTitle,
  upgradeInksterPrice,
  setUpgradeInksterPrice,
  upgradeDiff,
  parsedQuantity,
}: DoorUpgradeSectionProps) {
  return (
    <div className="border border-border/70 rounded-xl overflow-hidden bg-card/40">
      <div className="flex items-center justify-between p-2.5 text-xs font-semibold">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasUpgradeOption}
            onChange={(e) => setHasUpgradeOption(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary w-4 h-4"
          />
          <span className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Option for door
          </span>
        </label>
        {hasUpgradeOption && upgradeDiff && (
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            +{upgradeDiff.subtotalDifference >= 0 ? `$${upgradeDiff.subtotalDifference.toFixed(2)}` : `-$${Math.abs(upgradeDiff.subtotalDifference).toFixed(2)}`}/unit
            {parsedQuantity > 1 ? ` (+${(upgradeDiff.subtotalDifference * parsedQuantity).toFixed(2)} total)` : ''}
          </span>
        )}
      </div>

      {hasUpgradeOption && (
        <div className="p-2.5 pt-0 border-t border-border/40 space-y-2.5 mt-1.5 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs">Option Description</Label>
              <Input
                value={upgradeTitle}
                onChange={(e) => setUpgradeTitle(e.target.value)}
                placeholder="e.g. Triple Pane LoE-366 with Frosted Satin Glass"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Option Inkster Price ($)</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={upgradeInksterPrice}
                  onChange={(e) => setUpgradeInksterPrice(e.target.value)}
                  placeholder="1450.00"
                  className="h-8 pl-6 text-right font-mono text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {upgradeDiff && (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground flex items-center justify-between gap-2">
              <div className="text-[10px] text-muted-foreground">
                Base: ${upgradeDiff.baseNetPrice.toFixed(2)} | Option: ${upgradeDiff.optionNetPrice.toFixed(2)}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  Upgrade Diff: +${upgradeDiff.subtotalDifference.toFixed(2)}/unit
                  {parsedQuantity > 1 ? (
                    <span className="ml-1 text-primary">
                      (+${(upgradeDiff.subtotalDifference * parsedQuantity).toFixed(2)} for {parsedQuantity} doors)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

