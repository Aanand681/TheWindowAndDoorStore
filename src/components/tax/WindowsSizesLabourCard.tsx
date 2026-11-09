'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { formatMoney } from '@/lib/promo-logic';

interface WindowsSizesLabourCardProps {
  windows: any[];
  onWindowsChange: (w: any[]) => void;
  calculatedTotals: any;
  isSupplyOnly: boolean;
  readOnly?: boolean;
}

export function WindowsSizesLabourCard({
  windows,
  onWindowsChange,
  calculatedTotals,
  isSupplyOnly,
  readOnly = false,
}: WindowsSizesLabourCardProps) {
  const lines = calculatedTotals?.lines;

  return (
    <Card className="py-0 gap-0 [--card-spacing:0px] shadow-sm">
      <CardHeader className="py-3 px-5 sm:px-6 !pb-3 border-b border-border/50">
        <CardTitle className="text-base sm:text-lg">Windows Sizes &amp; Labour</CardTitle>
        <CardDescription className="text-xs">
          Sizes accepted in inches (e.g. 61 1/4 or 61.25). You can edit width and height here.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="w-full max-h-[420px] overflow-auto border rounded-xl bg-background/50">
          <div className="text-[11px] text-muted-foreground/80 md:hidden px-4 py-2 bg-muted/30 border-b border-border/40 font-medium">
            ← Swipe horizontally to edit sizes &amp; view labour →
          </div>
          <div className="space-y-2 p-3 min-w-[700px]">
            {windows.map((w, i) => {
              const line = lines?.[i];
              return (
                <div
                  key={w.id || i}
                  className="grid grid-cols-12 gap-3 items-center bg-card p-2.5 rounded-xl border border-border/80 shadow-xs"
                >
                  <div className="col-span-1 text-center font-mono text-xs text-muted-foreground">
                    {i + 1}
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Width&quot;</Label>
                    <Input
                      disabled={readOnly}
                      className="h-8 text-xs font-mono"
                      value={w.w || ''}
                      onChange={(e) => {
                        const nw = [...windows];
                        nw[i].w = e.target.value.replace(/[^0-9\s./-]/g, '');
                        onWindowsChange(nw);
                      }}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Height&quot;</Label>
                    <Input
                      disabled={readOnly}
                      className="h-8 text-xs font-mono"
                      value={w.h || ''}
                      onChange={(e) => {
                        const nw = [...windows];
                        nw[i].h = e.target.value.replace(/[^0-9\s./-]/g, '');
                        onWindowsChange(nw);
                      }}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Qty</Label>
                    <Input
                      disabled={readOnly}
                      type="number"
                      min="1"
                      className="h-8 text-xs font-mono"
                      value={w.qty}
                      onChange={(e) => {
                        const nw = [...windows];
                        nw[i].qty = e.target.value;
                        onWindowsChange(nw);
                      }}
                    />
                  </div>
                  <div className="col-span-4 text-xs space-y-0.5 mt-3">
                    {line ? (
                      <>
                        <div className="text-muted-foreground font-medium text-[11px]">
                          Sqft: {line.sqft.toFixed(2)} | LinFt: {line.lin.toFixed(2)}
                        </div>
                        {isSupplyOnly ? (
                          <div className="font-semibold text-amber-500 text-xs">
                            Supply Only (No Install Labour)
                          </div>
                        ) : (
                          <div className="font-semibold text-primary text-xs">
                            Lab: {formatMoney(line.lab * 100)} | Misc: {formatMoney(line.misc * 100)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground italic text-xs">Invalid size</div>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Button
                      disabled={readOnly}
                      variant="ghost"
                      size="icon"
                      className="text-destructive mt-3 hover:bg-destructive/10 h-8 w-8"
                      onClick={() => {
                        const nw = windows.filter((_, idx) => idx !== i);
                        onWindowsChange(
                          nw.length
                            ? nw
                            : [
                                {
                                  id: Math.random().toString(),
                                  qty: '1',
                                  base: '',
                                  argon: '',
                                  solar: '',
                                  triple: '',
                                  w: '',
                                  h: '',
                                },
                              ]
                        );
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Button
          disabled={readOnly}
          variant="secondary"
          size="sm"
          className="h-8 text-xs font-semibold cursor-pointer"
          onClick={() =>
            onWindowsChange([
              ...windows,
              {
                id: Math.random().toString(),
                qty: '1',
                base: '',
                argon: '',
                solar: '',
                triple: '',
                w: '',
                h: '',
              },
            ])
          }
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Window Manually
        </Button>
      </CardContent>
    </Card>
  );
}

