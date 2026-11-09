'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DoorHardwareType } from '@/lib/doors/types';
import { KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoorHardwareSectionProps {
  hardwareType: DoorHardwareType;
  setHardwareType: (type: DoorHardwareType) => void;
  locksetDeadboltPrice: number;
  customerSuppliedHardwareFee: number;
  customHardwareName: string;
  setCustomHardwareName: (name: string) => void;
  customHardwarePrice: string;
  setCustomHardwarePrice: (price: string) => void;
}

export function DoorHardwareSection({
  hardwareType,
  setHardwareType,
  locksetDeadboltPrice,
  customerSuppliedHardwareFee,
  customHardwareName,
  setCustomHardwareName,
  customHardwarePrice,
  setCustomHardwarePrice,
}: DoorHardwareSectionProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold flex items-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
        Lockset &amp; Hardware Style
      </Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setHardwareType('standard')}
          className={cn(
            'py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
            hardwareType === 'standard'
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border hover:bg-muted/40 text-muted-foreground'
          )}
        >
          <div>Standard Set</div>
          <div className="text-[10px] opacity-80">+${locksetDeadboltPrice.toFixed(2)}</div>
        </button>

        <button
          type="button"
          onClick={() => setHardwareType('customer_supplied')}
          className={cn(
            'py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
            hardwareType === 'customer_supplied'
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border hover:bg-muted/40 text-muted-foreground'
          )}
        >
          <div>Customer Supplied</div>
          <div className="text-[10px] opacity-80">+${customerSuppliedHardwareFee.toFixed(2)} Labour</div>
        </button>

        <button
          type="button"
          onClick={() => setHardwareType('custom')}
          className={cn(
            'py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
            hardwareType === 'custom'
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border hover:bg-muted/40 text-muted-foreground'
          )}
        >
          <div>Custom Hardware</div>
          <div className="text-[10px] opacity-80">Custom Price</div>
        </button>

        <button
          type="button"
          onClick={() => setHardwareType('none')}
          className={cn(
            'py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
            hardwareType === 'none'
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border hover:bg-muted/40 text-muted-foreground'
          )}
        >
          <div>No Hardware</div>
          <div className="text-[10px] opacity-80">$0.00</div>
        </button>
      </div>

      {hardwareType === 'custom' && (
        <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1.5">
          <div className="space-y-1">
            <Label className="text-xs">Custom Hardware / Lockset Style</Label>
            <Input
              value={customHardwareName}
              onChange={(e) => setCustomHardwareName(e.target.value)}
              placeholder="e.g. Emtek Modern Matte Black Grip Set"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Custom Hardware Price ($)</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                step="1"
                value={customHardwarePrice}
                onChange={(e) => setCustomHardwarePrice(e.target.value)}
                placeholder="250.00"
                className="h-8 pl-6 text-right font-mono text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

