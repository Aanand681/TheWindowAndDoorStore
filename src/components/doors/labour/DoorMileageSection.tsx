'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DoorLogisticsSettings } from '@/lib/doors/types';
import { Truck } from 'lucide-react';

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
  const isTravelActive = showOutTownTravel || km > 0 || hours > 0;
  const vehicleCost = isTravelActive ? km * (logistics.vehicleRatePerKm || 0.98) : 0;
  const crewHourlyRate = crewSize === '2' ? logistics.crewHourly2Men || 150 : logistics.crewHourly3Men || 200;
  const crewCost = isTravelActive ? hours * crewHourlyRate : 0;
  const totalTravelFleet = vehicleCost + crewCost;

  const handleKmChange = (val: string) => {
    const num = parseFloat(val) || 0;
    onUpdateParams({
      travelKm: val,
      showOutTownTravel: num > 0 || parseFloat(crewHours) > 0,
    });
  };

  const handleHoursChange = (val: string) => {
    const num = parseFloat(val) || 0;
    onUpdateParams({
      crewHours: val,
      showOutTownTravel: num > 0 || parseFloat(travelKm) > 0,
    });
  };

  return (
    <div className="space-y-3.5 p-3.5 rounded-xl border border-border/70 bg-card/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <Label className="text-xs font-bold text-foreground">
            Travel Mileage &amp; Crew Transit (Out-of-Town)
          </Label>
        </div>
        <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 self-start sm:self-auto">
          Mileage Total: +${totalTravelFleet.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Round-trip Distance */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">Round-Trip Distance (km)</Label>
          <Input
            type="number"
            step="1"
            value={travelKm}
            onChange={(e) => handleKmChange(e.target.value)}
            placeholder="0"
            className="h-9 text-xs font-mono bg-background"
          />
          <span className="text-[10px] text-muted-foreground block">
            @ ${(logistics.vehicleRatePerKm || 0.98).toFixed(2)}/km = ${vehicleCost.toFixed(2)}
          </span>
        </div>

        {/* Crew Size */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">Crew Configuration</Label>
          <Select
            value={crewSize}
            onValueChange={(val: any) => {
              if (val) onUpdateParams({ crewSize: val });
            }}
          >
            <SelectTrigger className="h-9 text-xs font-medium bg-background">
              <SelectValue placeholder="Crew Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">
                3-Man Crew (${logistics.crewHourly3Men || 200}/hr) [Standard]
              </SelectItem>
              <SelectItem value="2">
                2-Man Crew (${logistics.crewHourly2Men || 150}/hr)
              </SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] text-muted-foreground block">
            Hourly transit billing per crew size
          </span>
        </div>

        {/* Crew Transit Hours */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">Transit Time (Hours)</Label>
          <Input
            type="number"
            step="0.5"
            value={crewHours}
            onChange={(e) => handleHoursChange(e.target.value)}
            placeholder="0.0"
            className="h-9 text-xs font-mono bg-background"
          />
          <span className="text-[10px] text-muted-foreground block">
            @ ${crewHourlyRate.toFixed(2)}/hr = ${crewCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
