'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradeInputCardProps {
  subtotalInput: string;
  setSubtotalInput: (val: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setPreset: (amount: number) => void;
  hstRate: number;
  setHstRate: (rate: number) => void;
}

export function UpgradeInputCard({
  subtotalInput,
  setSubtotalInput,
  inputRef,
  setPreset,
  hstRate,
  setHstRate,
}: UpgradeInputCardProps) {
  return (
    <div className="space-y-5">
      <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <span>Job Subtotal Amount</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the pre-tax quote subtotal after promo discounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          {/* Big Currency Input */}
          <div className="space-y-1.5">
            <Label htmlFor="subtotalInput" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pre-Tax Subtotal ($)
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground font-bold text-lg">
                $
              </div>
              <Input
                id="subtotalInput"
                ref={inputRef}
                type="number"
                step="any"
                min="0"
                value={subtotalInput}
                onChange={(e) => setSubtotalInput(e.target.value)}
                placeholder="e.g. 12500"
                className="pl-8 text-xl sm:text-2xl font-mono font-bold h-13 bg-background border-border/80 focus-visible:ring-emerald-500 shadow-inner"
              />
              {subtotalInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSubtotalInput('');
                    inputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear input"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Quick Sample Amounts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '$2.5k (N/A)', amount: 2500 },
                { label: '$4.5k (6%)', amount: 4500 },
                { label: '$8k (8%)', amount: 8000 },
                { label: '$12.5k (8.5%)', amount: 12500 },
                { label: '$18k (9%)', amount: 18000 },
                { label: '$28k (11%)', amount: 28000 },
              ].map((p) => (
                <button
                  key={p.amount}
                  type="button"
                  onClick={() => setPreset(p.amount)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer',
                    subtotalInput === String(p.amount)
                      ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                      : 'bg-muted/40 border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tax Rate Setting */}
          <div className="pt-3 border-t border-border/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-foreground">HST / Tax Rate</Label>
              <p className="text-[11px] text-muted-foreground">For total with tax estimation</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 text-xs">
              {[
                { label: '13% HST', val: 13 },
                { label: '8% FN', val: 8 },
                { label: '0%', val: 0 },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setHstRate(r.val)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
                    hstRate === r.val
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Helper Note for Clerk */}
      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Clerk Quick Guide</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Labour Upgrade coverage is an optional 5-year labour warranty offer. Quotes under $3,000 do not qualify. It does not alter base quote deposits unless explicitly accepted by the customer.
        </p>
      </div>
    </div>
  );
}

