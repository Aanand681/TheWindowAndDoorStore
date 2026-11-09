'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, Info } from 'lucide-react';
import { DoorFormulaSettings } from '@/lib/doors/types';

export interface AdminDoorFormulaTabProps {
  formula: DoorFormulaSettings;
  setFormula: React.Dispatch<React.SetStateAction<DoorFormulaSettings>>;
}

export function AdminDoorFormulaTab({ formula, setFormula }: AdminDoorFormulaTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <Card className="bg-card/60 backdrop-blur-sm border-border/80">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            Door Surcharge Rate
          </CardTitle>
          <CardDescription>
            Manufacturer price surcharge applied to base Inkster door pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Surcharge Percentage (%)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                value={formula.surchargeRate}
                onChange={(e) =>
                  setFormula((prev) => ({
                    ...prev,
                    surchargeRate: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pr-8 font-mono font-bold text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Typically 8% aligned with the manufacturer pricing adjustments.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur-sm border-border/80">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="w-5 h-5 text-emerald-500" />
            Door Discount Rate
          </CardTitle>
          <CardDescription>
            Standard discount applied to Entry, Patio, and Garden doors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Standard Door Discount (%)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                value={formula.doorDiscountPercent}
                onChange={(e) =>
                  setFormula((prev) => ({
                    ...prev,
                    doorDiscountPercent: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pr-8 font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                %
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Storm doors are strictly <strong>0% discount</strong> (exempt
                from the standard door discount per shop policy).
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

