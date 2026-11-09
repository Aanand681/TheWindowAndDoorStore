'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { DoorUpchargeConfig, DoorFormulaSettings } from '@/lib/doors/types';

export interface AdminDoorUpchargesTabProps {
  upcharges: DoorUpchargeConfig[];
  formula: DoorFormulaSettings;
  setFormula: React.Dispatch<React.SetStateAction<DoorFormulaSettings>>;
  onAddUpcharge: () => void;
  onUpdateUpcharge: (index: number, field: keyof DoorUpchargeConfig, value: any) => void;
  onDeleteUpcharge: (index: number) => void;
}

export function AdminDoorUpchargesTab({
  upcharges,
  formula,
  setFormula,
  onAddUpcharge,
  onUpdateUpcharge,
  onDeleteUpcharge,
}: AdminDoorUpchargesTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upcharges Table */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-card/60 backdrop-blur-sm border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Jobsite Labour Upcharges</CardTitle>
              <CardDescription>
                Custom site additions such as transoms, extra height, and complex trims.
              </CardDescription>
            </div>
            <Button size="sm" onClick={onAddUpcharge} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Upcharge
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                    <th className="py-2.5 px-3">Label</th>
                    <th className="py-2.5 px-3 w-32">Rate ($)</th>
                    <th className="py-2.5 px-3 w-32">Unit / Billing</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {upcharges.map((upcharge, idx) => (
                    <tr key={upcharge.id || idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-3">
                        <Input
                          value={upcharge.label}
                          onChange={(e) => onUpdateUpcharge(idx, 'label', e.target.value)}
                          className="h-8 font-medium"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.5"
                            value={upcharge.rate}
                            onChange={(e) =>
                              onUpdateUpcharge(idx, 'rate', parseFloat(e.target.value) || 0)
                            }
                            className="h-8 pl-6 text-right font-mono"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={upcharge.unit}
                          onChange={(e) => onUpdateUpcharge(idx, 'unit', e.target.value)}
                          placeholder="e.g. 1 Hour"
                          className="h-8 text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={upcharge.description || ''}
                          onChange={(e) => onUpdateUpcharge(idx, 'description', e.target.value)}
                          placeholder="Description..."
                          className="h-8 text-xs text-muted-foreground"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteUpcharge(idx)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hardware Prices Card */}
      <div className="space-y-4">
        <Card className="bg-card/60 backdrop-blur-sm border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Hardware Standard Rates</CardTitle>
            <CardDescription>
              Lockset, deadbolt, and customer-supplied hardware charges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Standard Lockset &amp; Deadbolt Hardware ($)</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  $
                </span>
                <Input
                  type="number"
                  step="1"
                  value={formula.locksetDeadboltPrice}
                  onChange={(e) =>
                    setFormula((prev) => ({
                      ...prev,
                      locksetDeadboltPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pl-6 font-mono font-medium"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Default shop price: $147.00 per set</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Customer-Supplied Hardware Fee ($)</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  $
                </span>
                <Input
                  type="number"
                  step="1"
                  value={formula.customerSuppliedHardwareFee}
                  onChange={(e) =>
                    setFormula((prev) => ({
                      ...prev,
                      customerSuppliedHardwareFee: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pl-6 font-mono font-medium"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Default install charge: $80.00</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

