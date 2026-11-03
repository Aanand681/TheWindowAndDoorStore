'use client';

import React from 'react';
import {
  Wrench,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { SealedUnitTravelCalculator } from './SealedUnitTravelCalculator';
import { SealedUnitServiceCard } from './SealedUnitServiceCard';

export type SealedUnitMode = 'installation' | 'supply_only' | 'service_only';

export interface SealedUnitLabourTravelCardProps {
  mode?: SealedUnitMode;
  setMode?: (val: SealedUnitMode) => void;
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
  serviceSqftInput?: string;
  setServiceSqftInput?: (val: string) => void;
  serviceLabourRateInput?: string;
  setServiceLabourRateInput?: (val: string) => void;
  serviceMiscRateInput?: string;
  setServiceMiscRateInput?: (val: string) => void;
  itemsSqft?: number;
  totals: {
    totalSqft?: number;
    itemsSqft?: number;
    unitLabourSum: number;
    baseSetupFee: number;
    additionalFarFee: number;
    vehicleTravelFee: number;
    crewTravelFee: number;
    totalAdditionalTravel: number;
    totalTravelAndSetup: number;
    combinedLabourTotal: number;
    miscTotal: number;
    serviceLabourTotal?: number;
    subtotalPreTax?: number;
    hstAmount?: number;
    grandTotal?: number;
    effectiveLabourRate?: number;
    effectiveMiscRate?: number;
  };
}

export function SealedUnitLabourTravelCard({
  mode = 'installation',
  setMode,
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
  serviceSqftInput = '',
  setServiceSqftInput,
  serviceLabourRateInput = '',
  setServiceLabourRateInput,
  serviceMiscRateInput = '',
  setServiceMiscRateInput,
  itemsSqft = 0,
  totals,
}: SealedUnitLabourTravelCardProps) {
  const currentMode = setMode ? mode : (isInstallation ? 'installation' : 'supply_only');
  const [showLabourBreakdown, setShowLabourBreakdown] = React.useState(false);

  const handleSelectMode = (m: SealedUnitMode) => {
    if (setMode) {
      setMode(m);
    } else {
      setIsInstallation(m === 'installation');
    }
  };

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
              Order scope, installation labour, travel setup, and service parameters.
            </p>
          </div>
          {/* 3-Way Scope Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => handleSelectMode('supply_only')}
              className={cn(
                'px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer text-xs',
                currentMode === 'supply_only'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Supply Only
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('installation')}
              className={cn(
                'px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 text-xs',
                currentMode === 'installation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Wrench className="w-3 h-3" />
              <span>Installation</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('service_only')}
              className={cn(
                'px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 text-xs',
                currentMode === 'service_only'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Service Only</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 space-y-3">
        {currentMode === 'installation' ? (
          <>
            {/* Installation Labour Info Header */}
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl border border-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">On-Site Installation Labour</span>
                <p className="text-[11px] text-muted-foreground">
                  Base unit labour (${totals.unitLabourSum.toFixed(2)}) + travel setup (${totals.totalTravelAndSetup.toFixed(2)})
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${totals.combinedLabourTotal.toFixed(2)}
                </span>
                <span className="block text-[10px] text-muted-foreground">Total Labour</span>
              </div>
            </div>

            {/* Travel & Out-of-Town Calculator */}
            <SealedUnitTravelCalculator
              labour={labour}
              travelFeeType={travelFeeType}
              setTravelFeeType={setTravelFeeType}
              customTravelFee={customTravelFee}
              setCustomTravelFee={setCustomTravelFee}
              showOutTownTravel={showOutTownTravel}
              setShowOutTownTravel={setShowOutTownTravel}
              travelKm={travelKm}
              setTravelKm={setTravelKm}
              crewHours={crewHours}
              setCrewHours={setCrewHours}
              crewSize={crewSize}
              setCrewSize={setCrewSize}
              baseSetupFee={totals.baseSetupFee}
              totalTravelAndSetup={totals.totalTravelAndSetup}
              contextMode="installation"
            />

            {/* Collapsible Detailed Breakdown */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowLabourBreakdown(!showLabourBreakdown)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
              >
                {showLabourBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>{showLabourBreakdown ? 'Hide Fee Breakdown' : 'View Detailed Labour & Travel Breakdown'}</span>
              </button>

              {showLabourBreakdown && (
                <div className="mt-2 p-2.5 bg-muted/20 rounded-xl border border-border/40 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span>Base Setup Fee (Local Standard):</span>
                    <span className="font-mono text-foreground">${totals.baseSetupFee.toFixed(2)}</span>
                  </div>
                  {totals.additionalFarFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span>Far Area Setup Surcharge:</span>
                      <span className="font-mono text-foreground">+${totals.additionalFarFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.vehicleTravelFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span>Vehicle KM Travel Fee ({travelKm} km @ ${(labour.vehicleRatePerKm || 0.98).toFixed(2)}):</span>
                      <span className="font-mono text-foreground">+${totals.vehicleTravelFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.crewTravelFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span>Crew Travel Labour ({crewHours} hrs @ {crewSize === '2' ? `$${(labour.crewHourly2Men || 150).toFixed(0)}/hr` : `$${(labour.crewHourly3Men || 200).toFixed(0)}/hr`}):</span>
                      <span className="font-mono text-foreground">+${totals.crewTravelFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span>Unit Glazing Labour (Line items sum):</span>
                    <span className="font-mono text-foreground">${totals.unitLabourSum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground border-t border-border/40 pt-1 font-bold">
                    <span className="text-foreground">Total Combined Installation Labour:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">${totals.combinedLabourTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : currentMode === 'service_only' ? (
          <div className="space-y-3">
            {/* Service Only Controls */}
            <SealedUnitServiceCard
              labour={labour}
              itemsSqft={itemsSqft}
              serviceSqftInput={serviceSqftInput}
              setServiceSqftInput={setServiceSqftInput}
              serviceLabourRateInput={serviceLabourRateInput}
              setServiceLabourRateInput={setServiceLabourRateInput}
              serviceMiscRateInput={serviceMiscRateInput}
              setServiceMiscRateInput={setServiceMiscRateInput}
              serviceLabourTotal={totals.serviceLabourTotal || 0}
              totalTravelAndSetup={totals.totalTravelAndSetup}
              miscTotal={totals.miscTotal}
              subtotalPreTax={totals.subtotalPreTax || 0}
              hstAmount={totals.hstAmount || 0}
              grandTotal={totals.grandTotal || 0}
            />

            {/* Travel Calculator in Service Only mode */}
            <SealedUnitTravelCalculator
              labour={labour}
              travelFeeType={travelFeeType}
              setTravelFeeType={setTravelFeeType}
              customTravelFee={customTravelFee}
              setCustomTravelFee={setCustomTravelFee}
              showOutTownTravel={showOutTownTravel}
              setShowOutTownTravel={setShowOutTownTravel}
              travelKm={travelKm}
              setTravelKm={setTravelKm}
              crewHours={crewHours}
              setCrewHours={setCrewHours}
              crewSize={crewSize}
              setCrewSize={setCrewSize}
              baseSetupFee={totals.baseSetupFee}
              totalTravelAndSetup={totals.totalTravelAndSetup}
              contextMode="service_only"
            />
          </div>
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
export default SealedUnitLabourTravelCard;
