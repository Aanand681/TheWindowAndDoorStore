'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DoorLogisticsSettings } from '@/lib/doors/types';
import { cn } from '@/lib/utils';

interface DoorSetupPresetsSectionProps {
  travelFeeType: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  logistics: DoorLogisticsSettings;
  onUpdateParams: (updates: {
    travelFeeType?: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
    customTravelFee?: string;
  }) => void;
}

export function DoorSetupPresetsSection({
  travelFeeType,
  customTravelFee,
  logistics,
  onUpdateParams,
}: DoorSetupPresetsSectionProps) {
  const baseSetup = logistics.setupFeeDefault || 140.0;
  let remoteExtra = 0;
  if (travelFeeType === 'far_std') remoteExtra = logistics.setupFeeFarStandard || 727.5;
  if (travelFeeType === 'far_small') remoteExtra = logistics.setupFeeFarSmall || 363.5;
  if (travelFeeType === 'custom') remoteExtra = Math.max(0, parseFloat(customTravelFee) || 0);

  const totalSetup = travelFeeType === 'none' ? 0 : baseSetup + remoteExtra;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Base Setup &amp; Remote Jobsite Mobilization</Label>
        <span className="text-xs font-mono font-bold text-primary">
          Total Setup: ${totalSetup.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => onUpdateParams({ travelFeeType: 'local_std' })}
          className={cn(
            'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
            travelFeeType === 'local_std'
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border hover:bg-muted/40 text-muted-foreground'
          )}
        >
          <div className="font-semibold">Local (In-Town)</div>
          <div className="text-[11px] font-mono mt-0.5">${baseSetup.toFixed(2)} Base</div>
          <div className="text-[10px] text-muted-foreground">Fixed Base Setup</div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateParams({ travelFeeType: 'far_std' })}
          className={cn(
            'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
            travelFeeType === 'far_std'
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border hover:bg-muted/40 text-muted-foreground'
          )}
        >
          <div className="font-semibold">Dryden / Sioux Lookout</div>
          <div className="text-[11px] font-mono mt-0.5">
            ${(baseSetup + (logistics.setupFeeFarStandard || 727.5)).toFixed(2)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            ${baseSetup} + ${logistics.setupFeeFarStandard}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateParams({ travelFeeType: 'far_small' })}
          className={cn(
            'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
            travelFeeType === 'far_small'
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border hover:bg-muted/40 text-muted-foreground'
          )}
        >
          <div className="font-semibold">Dryden Small Job</div>
          <div className="text-[11px] font-mono mt-0.5">
            ${(baseSetup + (logistics.setupFeeFarSmall || 363.5)).toFixed(2)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            ${baseSetup} + ${logistics.setupFeeFarSmall}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateParams({ travelFeeType: 'custom' })}
          className={cn(
            'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
            travelFeeType === 'custom'
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border hover:bg-muted/40 text-muted-foreground'
          )}
        >
          <div className="font-semibold">Custom Remote</div>
          <div className="text-[11px] font-mono mt-0.5">
            ${(baseSetup + (parseFloat(customTravelFee) || 0)).toFixed(2)}
          </div>
          <div className="text-[10px] text-muted-foreground">${baseSetup} + Custom</div>
        </button>
      </div>

      {travelFeeType === 'custom' && (
        <div className="pt-2">
          <Label className="text-xs">Additional Remote Travel Fee on top of $140 ($)</Label>
          <div className="relative mt-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
            <Input
              type="number"
              step="1"
              value={customTravelFee}
              onChange={(e) => onUpdateParams({ customTravelFee: e.target.value })}
              placeholder="0.00"
              className="pl-6 h-8 text-xs font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
}

