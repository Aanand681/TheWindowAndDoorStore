'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/promo-logic';

interface UpgradeFeeHeroCardProps {
  isAvailable: boolean;
  upgradeResult: { charge: number; rate: string };
  subtotalCents: number;
  handleCopyFee: () => void;
  handleCopySummary: () => void;
  copiedFee: boolean;
  copiedSummary: boolean;
}

export function UpgradeFeeHeroCard({
  isAvailable,
  upgradeResult,
  subtotalCents,
  handleCopyFee,
  handleCopySummary,
  copiedFee,
  copiedSummary,
}: UpgradeFeeHeroCardProps) {
  return (
    <Card
      className={cn(
        'rounded-2xl border transition-all shadow-xl overflow-hidden',
        isAvailable
          ? 'bg-gradient-to-br from-emerald-500/15 via-background to-emerald-500/10 border-emerald-500/35'
          : 'bg-muted/30 border-border/80'
      )}
    >
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'p-2.5 rounded-xl text-white font-bold shadow-md',
                isAvailable ? 'bg-emerald-600' : 'bg-muted-foreground/60'
              )}
            >
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Optional Labour Upgrade Fee
              </span>
              <h3 className="text-lg font-black text-foreground">
                5-Year Labour Coverage
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs px-3 py-1 rounded-full font-bold border shadow-xs',
                isAvailable
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-muted text-muted-foreground border-border'
              )}
            >
              {upgradeResult.rate}
            </span>
          </div>
        </div>

        {/* Hero Number Display */}
        {isAvailable ? (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Calculated Upgrade Price (Pre-Tax):
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                +{formatMoney(upgradeResult.charge)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                pre-tax
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold">Labour Upgrade Not Available</p>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                The minimum pre-tax subtotal to qualify for 5-year labour warranty upgrade is $3,000.00. Current subtotal is {formatMoney(subtotalCents)}.
              </p>
            </div>
          </div>
        )}

        {/* 1-Click Action Buttons */}
        {isAvailable && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleCopyFee}
              className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
            >
              {copiedFee ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFee ? 'Copied Fee!' : 'Copy Fee (' + formatMoney(upgradeResult.charge) + ')'}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="gap-1.5 text-xs font-semibold border-border hover:bg-muted text-foreground cursor-pointer shadow-xs"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'Copied Breakdown!' : 'Copy Summary for Customer / Odoo'}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

