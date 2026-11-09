'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Info } from 'lucide-react';

interface AdminWindowLabourTabProps {
  windowLabourPerSqft: number;
  setWindowLabourPerSqft: (val: number) => void;
  windowMiscPerSqft: number;
  setWindowMiscPerSqft: (val: number) => void;
  windowLabourMin: number;
  setWindowLabourMin: (val: number) => void;
  windowMiscMin: number;
  setWindowMiscMin: (val: number) => void;
  extraLinPerWindow: number;
  setExtraLinPerWindow: (val: number) => void;
}

export function AdminWindowLabourTab({
  windowLabourPerSqft,
  setWindowLabourPerSqft,
  windowMiscPerSqft,
  setWindowMiscPerSqft,
  windowLabourMin,
  setWindowLabourMin,
  windowMiscMin,
  setWindowMiscMin,
  extraLinPerWindow,
  setExtraLinPerWindow,
}: AdminWindowLabourTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Window Installation &amp; Labour Formula</CardTitle>
              <CardDescription>
                Global square-footage rates, minimums per unit, and perimeter allowance across all window installations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Square footage rates */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                Square Footage Rates ($/sqft)
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Labour Rate per Sq Ft ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 text-xs font-mono"
                    value={windowLabourPerSqft === 0 ? '' : windowLabourPerSqft}
                    onChange={(e) => setWindowLabourPerSqft(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="19.00"
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    Default: $19.00/sqft for standard window installation labour.
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Misc &amp; Consumables per Sq Ft ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 text-xs font-mono"
                    value={windowMiscPerSqft === 0 ? '' : windowMiscPerSqft}
                    onChange={(e) => setWindowMiscPerSqft(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="8.00"
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    Default: $8.00/sqft for fasteners, sealants, shims &amp; foam.
                  </span>
                </div>
              </div>
            </div>

            {/* Minimums per window */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                Per-Window Minimum Floors ($)
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Min. Labour per Window ($)</Label>
                  <Input
                    type="number"
                    step="1"
                    className="h-9 text-xs font-mono"
                    value={windowLabourMin === 0 ? '' : windowLabourMin}
                    onChange={(e) => setWindowLabourMin(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="325"
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    Floor: Minimum labour charged per window unit (default $325.00).
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Min. Misc per Window ($)</Label>
                  <Input
                    type="number"
                    step="1"
                    className="h-9 text-xs font-mono"
                    value={windowMiscMin === 0 ? '' : windowMiscMin}
                    onChange={(e) => setWindowMiscMin(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="74"
                  />
                  <span className="text-[11px] text-muted-foreground block">
                    Floor: Minimum misc materials per window unit (default $74.00).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linear allowance */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Perimeter &amp; Jamb Allowance
            </h4>
            <div className="max-w-md space-y-1">
              <Label className="text-xs font-semibold">Extra Linear Footage Per Window (ft)</Label>
              <Input
                type="number"
                step="0.01"
                className="h-9 text-xs font-mono max-w-xs"
                value={extraLinPerWindow === 0 ? '' : extraLinPerWindow}
                onChange={(e) => setExtraLinPerWindow(e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="2.17"
              />
              <span className="text-[11px] text-muted-foreground block">
                Standard: 2.17 ft added per window to account for cuts, waste, and corners in jamb calculations.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              These rates apply globally to all window installations. Geographic travel distance and mobilization are configured separately in <strong>Regions</strong> and apply to all product lines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

