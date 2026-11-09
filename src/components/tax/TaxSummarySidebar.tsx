'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Eye, Download } from 'lucide-react';
import { formatMoney } from '@/lib/promo-logic';

interface TaxSummarySidebarProps {
  isSupplyOnly: boolean;
  readOnly?: boolean;
  calculatedTotals: any;
  includeLabour: boolean;
  setIncludeLabour: (v: boolean) => void;
  includeMisc: boolean;
  setIncludeMisc: (v: boolean) => void;
  includeJC: boolean;
  setIncludeJC: (v: boolean) => void;
  discount: string;
  setDiscount: (d: string) => void;
  hstOn: boolean;
  setHstOn: (v: boolean) => void;
  onOpenPreview?: () => void;
  summarySlot?: React.ReactNode;
}

export function TaxSummarySidebar({
  isSupplyOnly,
  readOnly = false,
  calculatedTotals,
  includeLabour,
  setIncludeLabour,
  includeMisc,
  setIncludeMisc,
  includeJC,
  setIncludeJC,
  discount,
  setDiscount,
  hstOn,
  setHstOn,
  onOpenPreview,
  summarySlot,
}: TaxSummarySidebarProps) {
  if (summarySlot) {
    return <>{summarySlot}</>;
  }

  const c = calculatedTotals;

  return (
    <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
      <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              {isSupplyOnly ? 'Supply Materials & Tax' : 'Tax & Labour Summary'}
            </CardTitle>
            {isSupplyOnly && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                Supply Only
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {c ? (
            <>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={readOnly}
                      id="incLab"
                      checked={includeLabour}
                      onCheckedChange={(ch) => setIncludeLabour(!!ch)}
                    />
                    <Label htmlFor="incLab" className="cursor-pointer font-normal">
                      Labour (windows + extras)
                    </Label>
                  </div>
                  <span
                    className={`font-mono ${
                      !includeLabour ? 'line-through opacity-50' : 'text-foreground'
                    }`}
                  >
                    {formatMoney(c.labourTotal * 100)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={readOnly}
                      id="incMisc"
                      checked={includeMisc}
                      onCheckedChange={(ch) => setIncludeMisc(!!ch)}
                    />
                    <Label htmlFor="incMisc" className="cursor-pointer font-normal">
                      Miscellaneous
                    </Label>
                  </div>
                  <span
                    className={`font-mono ${
                      !includeMisc ? 'line-through opacity-50' : 'text-foreground'
                    }`}
                  >
                    {formatMoney(c.miscTotal * 100)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={readOnly}
                      id="incJC"
                      checked={includeJC}
                      onCheckedChange={(ch) => setIncludeJC(!!ch)}
                    />
                    <Label htmlFor="incJC" className="cursor-pointer font-normal">
                      Jambs + casings
                    </Label>
                  </div>
                  <span
                    className={`font-mono ${
                      !includeJC ? 'line-through opacity-50' : 'text-foreground'
                    }`}
                  >
                    {formatMoney(c.jc * 100)}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-border">
                  <Label>Monthly discount</Label>
                  <div className="relative w-24">
                    <span className="absolute left-2 top-2 text-muted-foreground text-xs">$</span>
                    <Input
                      disabled={readOnly}
                      type="number"
                      className="h-8 pl-5"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Subtotal</span>
                  <span className="font-mono font-medium text-lg">{formatMoney(c.subtotal * 100)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={readOnly}
                      id="hston"
                      checked={hstOn}
                      onCheckedChange={(ch) => setHstOn(!!ch)}
                    />
                    <Label htmlFor="hston" className="cursor-pointer">
                      HST (13%)
                    </Label>
                  </div>
                  <span className="font-mono text-muted-foreground">{formatMoney(c.hst * 100)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-bold font-mono tracking-tight text-primary">
                    {formatMoney(c.total * 100)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Enter valid window sizes to see the summary.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Action Preview & Print Bar */}
      {onOpenPreview && (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={onOpenPreview}
            className="w-full h-11 text-sm font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Eye className="w-4 h-4" />
            Preview &amp; Print Quote
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onOpenPreview}
            className="w-full h-9 text-xs font-medium flex items-center justify-center gap-2 border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download / Print PDF
          </Button>
        </div>
      )}
    </div>
  );
}

