'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DoorLogisticsSettings } from '@/lib/doors/types';
import { MapPin } from 'lucide-react';

interface DoorMileageSectionProps {
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  logistics: DoorLogisticsSettings;
  onUpdateParams: (updates: {
    showOutTownTravel?: boolean;
    travelKm?: string;
    crewHours?: string;
    crewSize?: '2' | '3';
  }) => void;
}

export function DoorMileageSection({
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
  logistics,
  onUpdateParams,
}: DoorMileageSectionProps) {
  const km = parseFloat(travelKm) || 0;
  const hours = parseFloat(crewHours) || 0;
  const vehicleCost = showOutTownTravel ? km * logistics.vehicleRatePerKm : 0;
  const crewHourlyRate = crewSize === '3' ? logistics.crewHourly3Men : logistics.crewHourly2Men;
  const crewCost = showOutTownTravel ? hours * crewHourlyRate : 0;

  return (
    <div className="border border-border/70 rounded-xl overflow-hidden bg-card/40">
      <div className="flex items-center justify-between p-3 text-xs font-semibold">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOutTownTravel}
            onChange={(e) => onUpdateParams({ showOutTownTravel: e.target.checked })}
            className="rounded border-input text-primary focus:ring-primary w-4 h-4"
          />
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            Additional Out-of-Town Mileage &amp; Crew Travel Time
          </span>
        </label>
        {showOutTownTravel && (
          <span className="text-[11px] font-mono text-primary font-bold">
            +${(vehicleCost + crewCost).toFixed(2)}
          </span>
        )}
      </div>

      {showOutTownTravel && (
        <div className="p-3 pt-0 border-t border-border/40 space-y-3 mt-2 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Distance (km)</Label>
              <Input
                type="number"
                step="1"
                value={travelKm}
                onChange={(e) => onUpdateParams({ travelKm: e.target.value })}
                placeholder="e.g. 200"
                className="h-8 text-xs font-mono"
              />
              <div className="text-[10px] text-muted-foreground">
                @ ${logistics.vehicleRatePerKm.toFixed(2)}/km = ${vehicleCost.toFixed(2)}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Crew Transit (Hours)</Label>
              <Input
                type="number"
                step="any"
                value={crewHours}
                onChange={(e) => onUpdateParams({ crewHours: e.target.value })}
                placeholder="e.g. 2.5"
                className="h-8 text-xs font-mono"
              />
              <div className="text-[10px] text-muted-foreground">
                @ ${crewHourlyRate.toFixed(2)}/hr = ${crewCost.toFixed(2)}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Crew Size (Default: 3 Men)</Label>
              <select
                value={crewSize}
                onChange={(e) => onUpdateParams({ crewSize: e.target.value as '2' | '3' })}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus:ring-1 focus:ring-ring font-medium"
              >
                <option value="3">3-Man Crew (${logistics.crewHourly3Men}/hr) [Default]</option>
                <option value="2">2-Man Crew (${logistics.crewHourly2Men}/hr)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

