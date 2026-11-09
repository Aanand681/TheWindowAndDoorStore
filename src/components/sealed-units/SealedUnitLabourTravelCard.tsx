'use client';

import React from 'react';
import {
  Wrench,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { SealedUnitTravelCalculator } from './SealedUnitTravelCalculator';
import { SharedRegionOption } from '@/hooks/shared/useSharedRegions';

export type SealedUnitMode = 'installation' | 'supply_only' | 'service_only';

export interface SealedUnitLabourTravelCardProps {
  mode?: SealedUnitMode;
  setMode?: (val: SealedUnitMode) => void;
  isInstallation: boolean;
  setIsInstallation: (val: boolean) => void;
  labour: SealedUnitLabourSettings;
  regions?: SharedRegionOption[];
  selectedRegionId?: string;
  onSelectRegion?: (regionId: string) => void;
  travelFeeType: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
  setTravelFeeType: (val: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom') => void;
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
  setIsInstallation: _setIsInstallation,
  labour,
  regions = [],
  selectedRegionId = '',
  onSelectRegion = () => {},
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
  const currentMode = setMode ? mode : (isInstallation ? 'installation' : 'supply_only');
  const [showLabourBreakdown, setShowLabourBreakdown] = React.useState(false);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm overflow-hidden">
      {/* Header with Executive Segmented Control */}
      <div className="border-b border-border/50 py-2.5 px-3.5 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Wrench className="w-4 h-4 text-primary" />
              <span>Job Scope &amp; Travel</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              Select job scope and configure travel &amp; crew allowances.
            </p>
          </div>

          {/* Active Scope Badge (Controlled from Summary Card) */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border/60 uppercase tracking-wider font-mono">
              {currentMode === 'service_only' ? 'Service Only Scope' : currentMode === 'supply_only' ? 'Supply Only Scope' : 'Installation Scope'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 space-y-3">
        {currentMode === 'installation' ? (
          <>
            {/* Installation Labour Info Bar */}
            <div className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">Installation Labour &amp; Travel</span>
                <p className="text-[11px] text-muted-foreground">
                  Base unit labour (${totals.unitLabourSum.toFixed(2)}) + travel setup (${totals.totalTravelAndSetup.toFixed(2)})
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-foreground">
                  ${totals.combinedLabourTotal.toFixed(2)}
                </span>
                <span className="block text-[10px] text-muted-foreground">Total Labour</span>
              </div>
            </div>

            {/* Travel & Out-of-Town Calculator */}
            <SealedUnitTravelCalculator
              labour={labour}
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={onSelectRegion}
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

            {/* Collapsible Fee Breakdown */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowLabourBreakdown(!showLabourBreakdown)}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
              >
                {showLabourBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>{showLabourBreakdown ? 'Hide Fee Breakdown' : 'View Detailed Labour & Travel Breakdown'}</span>
              </button>

              {showLabourBreakdown && (
                <div className="mt-2 p-2.5 bg-muted/15 rounded-xl border border-border/40 text-xs space-y-1 animate-in fade-in duration-150">
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
                      <span>Vehicle KM Travel ({travelKm} km @ ${(labour.vehicleRatePerKm || 0.98).toFixed(2)}):</span>
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
                    <span>Unit Glazing Labour:</span>
                    <span className="font-mono text-foreground">${totals.unitLabourSum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground border-t border-border/40 pt-1 font-semibold">
                    <span className="text-foreground">Total Installation Labour:</span>
                    <span className="font-mono text-foreground">${totals.combinedLabourTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : currentMode === 'service_only' ? (
          <div className="space-y-3">
            {/* Travel Calculator for Service Work */}
            <SealedUnitTravelCalculator
              labour={labour}
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={onSelectRegion}
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
          <div className="p-4 rounded-xl bg-muted/15 border border-border/50 text-center space-y-1.5">
            <span className="inline-block p-2 rounded-full bg-muted/60 text-muted-foreground">
              <DollarSign className="w-5 h-5" />
            </span>
            <div className="font-semibold text-xs text-foreground">Supply Only Order</div>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              All on-site installation labour, setup fees ($140.00), and travel charges are waived.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default SealedUnitLabourTravelCard;
