'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DoorLogisticsSettings,
  DoorQuotingMode,
  DoorUpchargeConfig,
  DoorSelectedUpcharge,
} from '@/lib/doors/types';
import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DoorSiteUpchargesSection,
  DoorSetupPresetsSection,
  DoorMileageSection,
} from './labour';
import { SharedRegionOption } from '@/hooks/shared/useSharedRegions';

interface DoorLabourTravelCardProps {
  mode: DoorQuotingMode;
  availableUpcharges: DoorUpchargeConfig[];
  globalUpcharges: DoorSelectedUpcharge[];
  onUpdateGlobalUpcharges: (upcharges: DoorSelectedUpcharge[]) => void;
  regions?: SharedRegionOption[];
  selectedRegionId?: string;
  onSelectRegion?: (regionId: string) => void;
  travelFeeType: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  logistics: DoorLogisticsSettings;
  onUpdateParams: (updates: {
    selectedRegionId?: string;
    travelFeeType?: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
    customTravelFee?: string;
    showOutTownTravel?: boolean;
    travelKm?: string;
    crewHours?: string;
    crewSize?: '2' | '3';
  }) => void;
  className?: string;
}

export function DoorLabourTravelCard({
  mode,
  availableUpcharges,
  globalUpcharges,
  onUpdateGlobalUpcharges,
  regions = [],
  selectedRegionId = '',
  onSelectRegion = () => {},
  travelFeeType,
  customTravelFee,
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
  logistics,
  onUpdateParams,
  className,
}: DoorLabourTravelCardProps) {
  const isInstallation = mode === 'installation';

  if (!isInstallation) {
    return (
      <Card className={cn('bg-card/40 border-border/60 opacity-60 py-0 gap-0 [--card-spacing:0px]', className)}>
        <CardContent className="py-4 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span>Setup & Logistics fees are excluded in Supply Only mode.</span>
          </div>
          <span className="font-mono font-semibold">$0.00</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-card/70 backdrop-blur-md border-border shadow-md !py-0 !gap-0 [--card-spacing:0px]', className)}>
      <CardHeader className="p-3.5 !pb-2.5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">Site Setup, Upcharges & Logistics</CardTitle>
              <CardDescription className="text-xs">
                Base $140 setup (fixed), remote travel on top, and one-time jobsite labour upcharges.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 !pt-3 space-y-3.5">
        <DoorSiteUpchargesSection
          availableUpcharges={availableUpcharges}
          globalUpcharges={globalUpcharges}
          onUpdateGlobalUpcharges={onUpdateGlobalUpcharges}
        />

        <DoorSetupPresetsSection
          regions={regions}
          selectedRegionId={selectedRegionId}
          onSelectRegion={onSelectRegion}
          travelFeeType={travelFeeType}
          customTravelFee={customTravelFee}
          logistics={logistics}
          onUpdateParams={onUpdateParams}
        />

        <DoorMileageSection
          showOutTownTravel={showOutTownTravel}
          travelKm={travelKm}
          crewHours={crewHours}
          crewSize={crewSize}
          logistics={logistics}
          onUpdateParams={onUpdateParams}
        />
      </CardContent>
    </Card>
  );
}
