'use client';

import React from 'react';
import {
  Wrench,
  Truck,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SealedUnitLabourSettings } from '@/lib/sealed-units-logic';

export interface SealedUnitLabourTravelCardProps {
  isInstallation: boolean;
  setIsInstallation: (val: boolean) => void;
  labour: SealedUnitLabourSettings;
  travelFeeType: 'none' | 'far_std' | 'far_small' | 'custom';
  setTravelFeeType: (val: 'none' | 'far_std' | 'far_small' | 'custom') => void;
  customTravelFee: string;
  setCustomTravelFee: (val: string) => void;
  showOutTownTravel: boolean;
  setShowOutTownTravel: (val: boolean | ((prev: boolean) => boolean)) => void;
  travelKm: string;
  setTravelKm: (val: string) => void;
  crewHours: string;
  setCrewHours: (val: string) => void;
  crewSize: '2' | '3';
  setCrewSize: (val: '2' | '3') => void;
  totals: {
    unitLabourSum: number;
    baseSetupFee: number;
    additionalFarFee: number;
    vehicleTravelFee: number;
    crewTravelFee: number;
    totalAdditionalTravel: number;
    totalTravelAndSetup: number;
    combinedLabourTotal: number;
    miscTotal: number;
  };
}

export function SealedUnitLabourTravelCard({
  isInstallation,
  setIsInstallation,
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
  totals,
}: SealedUnitLabourTravelCardProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="border-b border-border/50 py-2.5 px-3.5 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div>
            <div className="text-sm font-bold flex items-center gap-1.5 text-foreground">
              <Wrench className="w-4 h-4 text-emerald-500" />
              <span>Installation &amp; Labour Settings</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              Installation labour and travel surcharges.
            </p>
          </div>
          {/* Scope Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => setIsInstallation(false)}
              className={cn(
                'px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer text-xs',
                !isInstallation
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Supply Only
            </button>
            <button
              type="button"
              onClick={() => setIsInstallation(true)}
              className={cn(
                'px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 text-xs',
                isInstallation
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Wrench className="w-3 h-3" />
              <span>Installation</span>
            </button>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-3.5 space-y-3">
        {isInstallation ? (
          <>
            {/* Travel / Far Area Surcharge Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Travel &amp; Far Area Fee</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">Optional add-on</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  <span className="text-[11px] font-mono opacity-90">$0.00</span>
                </button>

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
                    +${(labour.setupFeeFarSmall || 363.5).toFixed(2)}
                  </span>
                </button>

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
                  <span className="text-xs font-bold">Far Standard</span>
                  <span className="text-[11px] font-mono opacity-90">
                    +${(labour.setupFeeFarStandard || 727.5).toFixed(2)}
                  </span>
                </button>

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

              {travelFeeType === 'custom' && (
                <div className="pt-2">
                  <Label htmlFor="customTravelInput" className="text-xs font-semibold text-muted-foreground">
                    Custom Travel Fee ($)
                  </Label>
                  <Input
                    id="customTravelInput"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter custom surcharge..."
                    value={customTravelFee}
                    onChange={(e) => setCustomTravelFee(e.target.value)}
                    className="h-9 text-xs font-mono font-bold mt-1"
                  />
                </div>
              )}
            </div>

            {/* Out of Town Travel Expandable Section */}
            <div className="border border-border/70 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowOutTownTravel((prev) => !prev)}
                className="w-full px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between text-xs font-semibold text-foreground cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Out-of-Town Vehicle &amp; Crew Travel Calculator</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {totals.vehicleTravelFee + totals.crewTravelFee > 0 && (
                    <span className="font-mono text-emerald-600 font-bold">
                      +${(totals.vehicleTravelFee + totals.crewTravelFee).toFixed(2)}
                    </span>
                  )}
                  {showOutTownTravel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              {showOutTownTravel && (
                <div className="p-3 bg-muted/10 border-t border-border/60 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="travelKmInput" className="text-[11px] font-semibold text-muted-foreground">
                        Distance (km @ ${(labour.vehicleRatePerKm || 0.98).toFixed(2)}/km)
                      </Label>
                      <Input
                        id="travelKmInput"
                        type="number"
                        min="0"
                        value={travelKm}
                        onChange={(e) => setTravelKm(e.target.value)}
                        className="h-8 text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="crewHoursInput" className="text-[11px] font-semibold text-muted-foreground">
                        Travel Hours
                      </Label>
                      <Input
                        id="crewHoursInput"
                        type="number"
                        min="0"
                        step="0.5"
                        value={crewHours}
                        onChange={(e) => setCrewHours(e.target.value)}
                        className="h-8 text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Crew Size</Label>
                      <div className="grid grid-cols-2 gap-1 h-8">
                        <button
                          type="button"
                          onClick={() => setCrewSize('2')}
                          className={cn(
                            'rounded border text-[11px] font-bold cursor-pointer transition-all',
                            crewSize === '2'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted text-muted-foreground'
                          )}
                        >
                          2 Men (${labour.crewHourly2Men || 150}/h)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCrewSize('3')}
                          className={cn(
                            'rounded border text-[11px] font-bold cursor-pointer transition-all',
                            crewSize === '3'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted text-muted-foreground'
                          )}
                        >
                          3 Men (${labour.crewHourly3Men || 200}/h)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-center space-y-1.5">
            <span className="inline-block p-2 rounded-full bg-muted text-muted-foreground">
              <DollarSign className="w-5 h-5" />
            </span>
            <div className="font-bold text-xs text-foreground">Supply Only Quote</div>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              All installation setup fees ($140.00), travel fees, and on-site window labour have been completely waived.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
