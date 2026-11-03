'use client';

import React from 'react';
import { Truck, MapPin, Users, Fuel, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { cn } from '@/lib/utils';

export interface SealedUnitTravelCalculatorProps {
  labour: SealedUnitLabourSettings;
  travelFeeType: 'none' | 'far_std' | 'far_small' | 'custom';
  setTravelFeeType: (val: 'none' | 'far_std' | 'far_small' | 'custom') => void;
  customTravelFee: string;
  setCustomTravelFee: (val: string) => void;
  showOutTownTravel: boolean;
  setShowOutTownTravel: (val: boolean) => void;
  travelKm: string;
  setTravelKm: (val: string) => void;
  crewHours: string;
  setCrewHours: (val: string) => void;
  crewSize: '2' | '3';
  setCrewSize: (val: '2' | '3') => void;
  baseSetupFee: number;
  totalTravelAndSetup: number;
  contextMode?: 'installation' | 'service_only';
}

export function SealedUnitTravelCalculator({
  labour,
  travelFeeType,
  setTravelFeeType,
  customTravelFee,
  setCustomTravelFee,
  showOutTownTravel,
  setShowOutTownTravel,
  travelKm,
  setTravelKm,
  crewHours,
  setCrewHours,
  crewSize,
  setCrewSize,
  baseSetupFee,
  totalTravelAndSetup,
  contextMode = 'installation',
}: SealedUnitTravelCalculatorProps) {
  const farStandardFee = labour.setupFeeFarStandard || 727.5;
  const farSmallFee = labour.setupFeeFarSmall || 363.5;

  return (
    <div className="space-y-3 pt-2 border-t border-border/60">
      {/* Travel & Far Area Surcharge Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-primary" />
            <span>Travel &amp; Far Area Fee</span>
          </Label>
          <span className="text-[10px] text-muted-foreground">
            {contextMode === 'service_only' ? 'Included in Service Labour' : 'Base setup: $140'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Local ($0 extra) */}
          <button
            type="button"
            onClick={() => setTravelFeeType('none')}
            className={cn(
              'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              travelFeeType === 'none'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-muted/30 hover:bg-muted text-muted-foreground border-border/70'
            )}
          >
            <span className="text-xs font-bold">Local</span>
            <span className="text-[11px] font-mono opacity-90">$0.00 extra</span>
          </button>

          {/* Far Small (+$363.50) */}
          <button
            type="button"
            onClick={() => setTravelFeeType('far_small')}
            className={cn(
              'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              travelFeeType === 'far_small'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-muted/30 hover:bg-muted text-muted-foreground border-border/70'
            )}
          >
            <span className="text-xs font-bold">Far Small</span>
            <span className="text-[11px] font-mono opacity-90">
              +${farSmallFee.toFixed(2)}
            </span>
          </button>

          {/* Far Standard / Dryden / Sioux Lookout (+$727.50) */}
          <button
            type="button"
            onClick={() => setTravelFeeType('far_std')}
            className={cn(
              'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              travelFeeType === 'far_std'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-muted/30 hover:bg-muted text-muted-foreground border-border/70'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Far Standard</span>
            </div>
            <span className="text-[10px] opacity-80 leading-tight">Dryden / Sioux Lookout</span>
            <span className="text-[11px] font-mono opacity-90">
              +${farStandardFee.toFixed(2)}
            </span>
          </button>

          {/* Custom Fee */}
          <button
            type="button"
            onClick={() => setTravelFeeType('custom')}
            className={cn(
              'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              travelFeeType === 'custom'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-muted/30 hover:bg-muted text-muted-foreground border-border/70'
            )}
          >
            <span className="text-xs font-bold">Custom Fee</span>
            <span className="text-[11px] font-mono opacity-90">Manual</span>
          </button>
        </div>

        {/* Custom Travel Fee Input */}
        {travelFeeType === 'custom' && (
          <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-xl border border-border/60 animate-in fade-in duration-150">
            <Label htmlFor="customTravelInput" className="text-xs text-muted-foreground shrink-0 font-medium">
              Custom Travel Amount ($):
            </Label>
            <Input
              id="customTravelInput"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={customTravelFee}
              onChange={(e) => setCustomTravelFee(e.target.value)}
              className="h-8 text-xs font-mono bg-background"
            />
          </div>
        )}
      </div>

      {/* Out-of-Town Vehicle & Crew Travel Section */}
      <div className="p-2.5 sm:p-3 bg-muted/20 border border-border/60 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fuel className="w-3.5 h-3.5 text-primary" />
            <Label htmlFor="toggleOutTown" className="text-xs font-bold text-foreground cursor-pointer">
              Out-of-Town Vehicle &amp; Crew Travel
            </Label>
          </div>
          <button
            id="toggleOutTown"
            type="button"
            onClick={() => setShowOutTownTravel(!showOutTownTravel)}
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer',
              showOutTownTravel
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-muted text-muted-foreground border border-border hover:text-foreground'
            )}
          >
            {showOutTownTravel ? 'Enabled' : 'Add Travel'}
          </button>
        </div>

        {showOutTownTravel && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/40 animate-in fade-in duration-150">
            {/* Travel Distance KM */}
            <div className="space-y-1">
              <Label htmlFor="travelKmInput" className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Roundtrip (KM)</span>
              </Label>
              <Input
                id="travelKmInput"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={travelKm}
                onChange={(e) => setTravelKm(e.target.value)}
                className="h-7 text-xs font-mono bg-background"
              />
              <span className="text-[10px] text-muted-foreground">
                @ ${(labour.vehicleRatePerKm || 0.98).toFixed(2)}/km
              </span>
            </div>

            {/* Crew Travel Hours */}
            <div className="space-y-1">
              <Label htmlFor="crewHoursInput" className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Travel Hours</span>
              </Label>
              <Input
                id="crewHoursInput"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={crewHours}
                onChange={(e) => setCrewHours(e.target.value)}
                className="h-7 text-xs font-mono bg-background"
              />
              <span className="text-[10px] text-muted-foreground">
                Total hours traveled
              </span>
            </div>

            {/* Crew Size Selector */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">
                Crew Size
              </Label>
              <div className="grid grid-cols-2 gap-1.5 h-7">
                <button
                  type="button"
                  onClick={() => setCrewSize('2')}
                  className={cn(
                    'rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1',
                    crewSize === '2'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/60'
                  )}
                >
                  <span>2 Men</span>
                  <span className="text-[9px] opacity-80">(${(labour.crewHourly2Men || 150).toFixed(0)}/h)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCrewSize('3')}
                  className={cn(
                    'rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1',
                    crewSize === '3'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/60'
                  )}
                >
                  <span>3 Men</span>
                  <span className="text-[9px] opacity-80">(${(labour.crewHourly3Men || 200).toFixed(0)}/h)</span>
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {crewSize === '2' ? '2-man crew travel rate' : '3-man crew travel rate'}
              </span>
            </div>
          </div>
        )}

        {/* Travel Total Banner */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-background/80 rounded-lg border border-border/50 text-xs">
          <span className="text-muted-foreground font-medium">Total Travel &amp; Setup:</span>
          <span className="font-mono font-bold text-foreground">
            ${totalTravelAndSetup.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
