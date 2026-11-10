'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DoorHardwareType } from '@/lib/doors/types';

interface DoorHardwareSectionProps {
  hardwareType: DoorHardwareType;
  customHardwareName: string;
  setCustomHardwareName: (name: string) => void;
  customHardwarePrice: string;
  setCustomHardwarePrice: (price: string) => void;
}

export function DoorHardwareSection({
  hardwareType,
  customHardwareName,
  setCustomHardwareName,
  customHardwarePrice,
  setCustomHardwarePrice,
}: DoorHardwareSectionProps) {
  if (hardwareType !== 'custom') return null;

  return (
    <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <div className="space-y-1">
        <Label className="text-xs">Custom Hardware / Lockset Description</Label>
        <Input
          value={customHardwareName}
          onChange={(e) => setCustomHardwareName(e.target.value)}
          placeholder="e.g. Matte Black Smart Keypad Lockset"
          className="h-8 text-xs bg-background"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Custom Hardware Price per Door ($)</Label>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
          <Input
            type="number"
            step="0.01"
            value={customHardwarePrice}
            onChange={(e) => setCustomHardwarePrice(e.target.value)}
            placeholder="250.00"
            className="h-8 pl-6 text-right font-mono text-xs font-semibold bg-background"
          />
        </div>
      </div>
    </div>
  );
}
