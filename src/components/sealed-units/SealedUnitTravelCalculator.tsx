'use client';

import React from 'react';
import { MapPin, Fuel } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { SharedRegionOption } from '@/hooks/shared/useSharedRegions';

export interface SealedUnitTravelCalculatorProps {
  labour: SealedUnitLabourSettings;
  regions?: SharedRegionOption[];
  selectedRegionId?: string;
  onSelectRegion?: (regionId: string) => void;
  travelFeeType: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
  setTravelFeeType: (val: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom') => void;
  customTravelFee: string;
  setCustomTravelFee: (val: string) => void;
  showOutTownTravel?: boolean;
  setShowOutTownTravel?: (val: boolean) => void;
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
  regions = [],
  selectedRegionId = '',
  onSelectRegion = () => {},
  travelFeeType,
  setTravelFeeType,
  customTravelFee,
  setCustomTravelFee,
  travelKm,
  setTravelKm,
  crewHours,
  setCrewHours,
  crewSize,
  setCrewSize,
  totalTravelAndSetup,
  contextMode = 'installation',
}: SealedUnitTravelCalculatorProps) {
  const farStandardFee = labour.setupFeeFarStandard || 727.5;
  const farSmallFee = labour.setupFeeFarSmall || 363.5;
  const baseSetup = labour.setupFeeDefault || 140.0;
  const selectedRegion = regions.find((r) => r._id === selectedRegionId);

  const isDrydenOrRemote = Boolean(
    selectedRegion?.name.toLowerCase().includes('dryden') ||
      selectedRegion?.name.toLowerCase().includes('sioux')
  );

  let remoteExtra = 0;
  if (isDrydenOrRemote) {
    if (travelFeeType === 'far_std') remoteExtra = farStandardFee;
    else if (travelFeeType === 'far_small') remoteExtra = farSmallFee;
    else if (travelFeeType === 'custom') remoteExtra = Math.max(0, parseFloat(customTravelFee) || 0);
  }

  const isWaived = travelFeeType === 'none';
  const setupTotal = isWaived ? 0 : baseSetup + remoteExtra;

  const handleRegionChange = (newRegionId: string | null) => {
    if (!newRegionId) return;
    onSelectRegion(newRegionId);
    const reg = regions.find((r) => r._id === newRegionId);
    if (!reg) return;
    if (reg.name.toLowerCase().includes('dryden') || reg.name.toLowerCase().includes('sioux')) {
      setTravelFeeType('far_std');
    } else {
      setTravelFeeType('local_std');
      setCustomTravelFee('');
    }
  };

  const kmVal = parseFloat(travelKm) || 0;
  const hrsVal = parseFloat(crewHours) || 0;
  const vehicleRate = labour.vehicleRatePerKm || 0.98;
  const crewHourlyRate = crewSize === '2' ? (labour.crewHourly2Men || 150) : (labour.crewHourly3Men || 200);

  const feeTypeLabel =
    travelFeeType === 'far_std'
      ? `Standard Job Fee (+${farStandardFee.toFixed(2)})`
      : travelFeeType === 'far_small'
      ? `Small Job Fee (+${farSmallFee.toFixed(2)})`
      : travelFeeType === 'custom'
      ? `Custom Surcharge ($${parseFloat(customTravelFee) || 0})`
      : 'Base Setup Only ($0.00 surcharge)';

  return (
    <div className="space-y-3.5 pt-2 border-t border-border/60">
      {/* 1. Region & Setup Mobilization Section */}
      <div className="space-y-3 p-3.5 rounded-xl border border-border/70 bg-card/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <Label className="text-xs font-bold text-foreground">Region &amp; Setup Mobilization</Label>
          </div>
          <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 self-start sm:self-auto">
            Setup Total: ${setupTotal.toFixed(2)}
          </div>
        </div>

        <div className={`grid gap-3 ${isDrydenOrRemote ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Region / Geographic Zone</Label>
            <Select value={selectedRegionId} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-full h-9 text-xs font-medium bg-background">
                <SelectValue placeholder="Select Region">
                  {selectedRegion?.name || 'Select Region'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {regions.map((reg) => (
                  <SelectItem key={reg._id} value={reg._id}>{reg.name}</SelectItem>
                ))}
                {regions.length === 0 && <SelectItem value="default_ff">Fort Frances (Local)</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {isDrydenOrRemote && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                Job Fee Type (Dryden / Sioux Lookout)
              </Label>
              <Select value={travelFeeType} onValueChange={(val: any) => { if (val) setTravelFeeType(val); }}>
                <SelectTrigger className="w-full h-9 text-xs font-medium bg-background">
                  <SelectValue placeholder="Select Fee Type">
                    {feeTypeLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="far_std">Standard Job Fee (+${farStandardFee.toFixed(2)})</SelectItem>
                  <SelectItem value="far_small">Small Job Fee (+${farSmallFee.toFixed(2)})</SelectItem>
                  <SelectItem value="local_std">Base Setup Only ($0.00 surcharge)</SelectItem>
                  <SelectItem value="custom">Custom Surcharge Amount...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isDrydenOrRemote && travelFeeType === 'custom' && (
          <div className="pt-2 border-t border-border/40 max-w-xs space-y-1">
            <Label className="text-xs font-semibold">Custom Surcharge on Top of $140 ($)</Label>
            <Input
              type="number"
              step="any"
              className="h-8.5 text-xs font-mono bg-background"
              placeholder="0.00"
              value={customTravelFee}
              onChange={(e) => setCustomTravelFee(e.target.value)}
            />
          </div>
        )}

        <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
          <span>
            {isDrydenOrRemote ? (
              <>
                Base mobilization: <strong>${baseSetup.toFixed(2)}</strong>
                {remoteExtra > 0 && ` + remote surcharge: $${remoteExtra.toFixed(2)}`}
              </>
            ) : (
              <>
                Fixed Base Mobilization: <strong>${baseSetup.toFixed(2)}</strong> (Included)
              </>
            )}
          </span>
          {contextMode === 'service_only' && <span className="italic text-[10px] text-primary">Service Only</span>}
        </div>
      </div>

      {/* 2. Out-of-Town Mileage & Crew Transit Hours */}
      <div className="space-y-3 p-3.5 rounded-xl border border-border/70 bg-card/40">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <Fuel className="w-4 h-4 text-primary" />
          <Label className="text-xs font-bold text-foreground">Out-of-Town Mileage &amp; Transit Hours</Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Roundtrip (KM)</Label>
            <Input
              type="number"
              step="any"
              min="0"
              value={travelKm}
              onChange={(e) => setTravelKm(e.target.value)}
              placeholder="0"
              className="h-9 text-xs font-mono bg-background"
            />
            <span className="text-[10px] text-muted-foreground block">
              @ ${vehicleRate.toFixed(2)}/km = ${(kmVal * vehicleRate).toFixed(2)}
            </span>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Transit Hours</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={crewHours}
              onChange={(e) => setCrewHours(e.target.value)}
              placeholder="0.0"
              className="h-9 text-xs font-mono bg-background"
            />
            <span className="text-[10px] text-muted-foreground block">
              @ ${crewHourlyRate}/hr = ${(hrsVal * crewHourlyRate).toFixed(2)}
            </span>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Crew Configuration</Label>
            <Select value={crewSize} onValueChange={(val: any) => { if (val) setCrewSize(val); }}>
              <SelectTrigger className="w-full h-9 text-xs font-medium bg-background">
                <SelectValue placeholder="Crew Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3-Man Crew (${labour.crewHourly3Men || 200}/hr) [Standard]</SelectItem>
                <SelectItem value="2">2-Man Crew (${labour.crewHourly2Men || 150}/hr)</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[10px] text-muted-foreground block">Hourly transit billing per crew size</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-background/80 rounded-lg border border-border/60 text-xs">
          <span className="text-muted-foreground font-semibold">Total Travel &amp; Setup:</span>
          <span className="font-mono font-bold text-foreground text-sm">
            ${totalTravelAndSetup.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
