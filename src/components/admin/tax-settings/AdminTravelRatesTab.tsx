'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Truck, Users } from 'lucide-react';

interface AdminTravelRatesTabProps {
  vehicleRate: number;
  setVehicleRate: (val: number) => void;
  crewRates: any[];
  setCrewRates: React.Dispatch<React.SetStateAction<any[]>>;
  updateItem: (setter: any, index: number, field: string, value: any) => void;
  removeItem: (setter: any, index: number) => void;
  onAddCrew: () => void;
}

export function AdminTravelRatesTab({
  vehicleRate,
  setVehicleRate,
  crewRates,
  setCrewRates,
  updateItem,
  removeItem,
  onAddCrew,
}: AdminTravelRatesTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vehicle Rate */}
      <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Vehicle Travel Mileage</CardTitle>
              <CardDescription className="text-xs">Reimbursement and fuel/fleet rate per round-trip kilometer.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          <div className="max-w-xs space-y-1.5">
            <Label className="text-xs font-semibold">Vehicle Mileage Rate ($/km)</Label>
            <Input
              type="number"
              step="0.01"
              className="h-9 text-xs font-mono"
              value={vehicleRate === 0 ? '' : vehicleRate}
              onChange={(e) => setVehicleRate(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0.98"
            />
            <span className="text-[11px] text-muted-foreground block">
              Standard: $0.98/km charged on round-trip travel outside of free zones.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Crew Rates */}
      <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Crew Transit Hourly Rates</CardTitle>
                <CardDescription className="text-xs">Hourly rate for technician transit time during travel.</CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={onAddCrew} className="gap-1 text-xs cursor-pointer h-8 px-2.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Crew Tier</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          {crewRates.map((cr, i) => (
            <div key={i} className="flex gap-3 items-end bg-muted/20 p-2.5 rounded-xl border border-border/50">
              <div className="flex-1 space-y-1">
                <Label className="text-xs font-semibold">Crew Configuration</Label>
                <Input
                  className="h-8.5 text-xs"
                  value={cr.crewSize}
                  onChange={(e) => updateItem(setCrewRates, i, 'crewSize', e.target.value)}
                  placeholder="e.g. 2 or 3"
                />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs font-semibold">Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="1"
                  className="h-8.5 text-xs font-mono"
                  value={cr.hourlyRate === 0 ? '' : cr.hourlyRate}
                  onChange={(e) =>
                    updateItem(setCrewRates, i, 'hourlyRate', e.target.value === '' ? 0 : Number(e.target.value))
                  }
                  placeholder="150"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 cursor-pointer h-8.5 w-8.5 shrink-0"
                onClick={() => removeItem(setCrewRates, i)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {crewRates.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center italic">No crew transit rates defined.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
