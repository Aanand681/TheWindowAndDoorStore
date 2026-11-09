'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/lib/promo-logic';

interface UpgradeComparisonCardProps {
  subtotalCents: number;
  hstRate: number;
  baseHstCents: number;
  baseTotalCents: number;
  subtotalWithUpgradeCents: number;
  withUpgradeHstCents: number;
  withUpgradeTotalCents: number;
}

export function UpgradeComparisonCard({
  subtotalCents,
  hstRate,
  baseHstCents,
  baseTotalCents,
  subtotalWithUpgradeCents,
  withUpgradeHstCents,
  withUpgradeTotalCents,
}: UpgradeComparisonCardProps) {
  return (
    <Card className="bg-card/50 border-border/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-3.5 bg-muted/20">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span>Quote Breakdown &amp; Comparison</span>
          <span className="text-[11px] text-muted-foreground font-normal">
            Comparing Base Quote vs Quote with Labour Upgrade
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Left: Base Quote */}
          <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-border/40 pb-1">
              Base Quote (Without Upgrade)
            </span>
            <div className="flex justify-between text-muted-foreground">
              <span>Pre-Tax Subtotal:</span>
              <span className="font-semibold text-foreground font-mono">{formatMoney(subtotalCents)}</span>
            </div>
            {hstRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>HST ({hstRate}%):</span>
                <span className="font-semibold text-foreground font-mono">{formatMoney(baseHstCents)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border/50 font-bold text-foreground">
              <span>Total:</span>
              <span className="font-mono text-sm">{formatMoney(baseTotalCents)}</span>
            </div>
          </div>

          {/* Right: Quote With Upgrade */}
          <div className="space-y-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block border-b border-emerald-500/20 pb-1">
              With Labour Upgrade
            </span>
            <div className="flex justify-between text-muted-foreground">
              <span>Pre-Tax Subtotal:</span>
              <span className="font-semibold text-foreground font-mono">
                {formatMoney(subtotalWithUpgradeCents)}
              </span>
            </div>
            {hstRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>HST ({hstRate}%):</span>
                <span className="font-semibold text-foreground font-mono">{formatMoney(withUpgradeHstCents)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-emerald-500/20 font-bold text-emerald-600 dark:text-emerald-400">
              <span>Total with Upgrade:</span>
              <span className="font-mono text-sm">{formatMoney(withUpgradeTotalCents)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

