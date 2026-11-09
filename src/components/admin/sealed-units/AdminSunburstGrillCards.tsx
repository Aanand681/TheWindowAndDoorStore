'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SealedUnitGrillSettings } from '@/lib/sealed-units-logic';

interface AdminSunburstGrillCardsProps {
  grills: SealedUnitGrillSettings;
  onBurst3Change: (colorKey: string, value: string) => void;
  onBurst5Change: (colorKey: string, value: string) => void;
}

export function AdminSunburstGrillCards({
  grills,
  onBurst3Change,
  onBurst5Change,
}: AdminSunburstGrillCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 3 Burst Card */}
      <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>&quot;3 Burst&quot; Arched Pattern ($ / unit)</span>
            <span className="text-[10px] text-muted-foreground font-normal">Foam spacer only</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; White</Label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                <Input
                  type="number"
                  step="0.5"
                  value={grills.burst3Rates?.white ?? 34}
                  onChange={(e) => onBurst3Change('white', e.target.value)}
                  className="h-8 pl-6 text-center text-xs font-mono bg-background"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; Brass or Pewter</Label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                <Input
                  type="number"
                  step="0.5"
                  value={grills.burst3Rates?.brassPewter ?? 48}
                  onChange={(e) => onBurst3Change('brassPewter', e.target.value)}
                  className="h-8 pl-6 text-center text-xs font-mono bg-background"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; Brushed Chrome</Label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                <Input
                  type="number"
                  step="0.5"
                  value={grills.burst3Rates?.brushedChrome ?? 53}
                  onChange={(e) => onBurst3Change('brushedChrome', e.target.value)}
                  className="h-8 pl-6 text-center text-xs font-mono bg-background"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-medium">5/8&quot; Black</Label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                <Input
                  type="number"
                  step="0.5"
                  value={grills.burst3Rates?.black ?? 53}
                  onChange={(e) => onBurst3Change('black', e.target.value)}
                  className="h-8 pl-6 text-center text-xs font-mono bg-background"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5 Burst Card */}
      <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>&quot;5 Burst&quot; Arched Pattern ($ / unit)</span>
            <span className="text-[10px] text-muted-foreground font-normal">Foam spacer only</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; White</Label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                <Input
                  type="number"
                  step="0.5"
                  value={grills.burst5Rates?.white ?? 36}
                  onChange={(e) => onBurst5Change('white', e.target.value)}
                  className="h-8 pl-6 text-center text-xs font-mono bg-background"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; Brass or Pewter</Label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                <Input
                  type="number"
                  step="0.5"
                  value={grills.burst5Rates?.brassPewter ?? 64}
                  onChange={(e) => onBurst5Change('brassPewter', e.target.value)}
                  className="h-8 pl-6 text-center text-xs font-mono bg-background"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; Brushed Chrome</Label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                <Input
                  type="number"
                  step="0.5"
                  value={grills.burst5Rates?.brushedChrome ?? 64}
                  onChange={(e) => onBurst5Change('brushedChrome', e.target.value)}
                  className="h-8 pl-6 text-center text-xs font-mono bg-background"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-medium">5/8&quot; Black</Label>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                <Input
                  type="number"
                  step="0.5"
                  value={grills.burst5Rates?.black ?? 64}
                  onChange={(e) => onBurst5Change('black', e.target.value)}
                  className="h-8 pl-6 text-center text-xs font-mono bg-background"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

