'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DoorPreset, DoorCategory, DoorHardwareType } from '@/lib/doors/types';

interface DoorPresetSpecsSectionProps {
  doorType: DoorCategory;
  onDoorTypeChange: (type: DoorCategory) => void;
  typeOptions: DoorPreset[];
  selectedPresetId: string;
  onOptionChange: (presetId: string) => void;
  quantity: string;
  setQuantity: (qty: string) => void;
  inksterBasePrice: string;
  setInksterBasePrice: (price: string) => void;
  labourInput: string;
  setLabourInput: (val: string) => void;
  miscInput: string;
  setMiscInput: (val: string) => void;
  hardwareType: DoorHardwareType;
  setHardwareType: (type: DoorHardwareType) => void;
  customDescription: string;
  setCustomDescription: (desc: string) => void;
  currentPreset?: DoorPreset;
}

export function DoorPresetSpecsSection({
  doorType,
  onDoorTypeChange,
  typeOptions,
  selectedPresetId,
  onOptionChange,
  quantity,
  setQuantity,
  inksterBasePrice,
  setInksterBasePrice,
  labourInput,
  setLabourInput,
  miscInput,
  setMiscInput,
  hardwareType,
  setHardwareType,
  customDescription,
  setCustomDescription,
  currentPreset,
}: DoorPresetSpecsSectionProps) {
  return (
    <div className="space-y-2.5">
      {/* Row 1: Single Row Grid with Door Type, Option, Qty, Price, Labour, Misc, Hardware */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-2 items-end">
        {/* Dropdown 1: Door Type (Clean, no discount shown) */}
        <div className="col-span-2 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Door Type
          </Label>
          <select
            value={doorType}
            onChange={(e) => onDoorTypeChange(e.target.value as DoorCategory)}
            className="w-full h-8.5 rounded-lg border border-input bg-background px-2 text-xs shadow-xs focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="entry">Entry Door</option>
            <option value="patio">Patio Door</option>
            <option value="garden">Garden Door</option>
            <option value="storm">Storm Door</option>
          </select>
        </div>

        {/* Dropdown 2: Cascading Option based on Door Type */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-3 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Option
          </Label>
          <select
            value={selectedPresetId}
            onChange={(e) => onOptionChange(e.target.value)}
            className="w-full h-8.5 rounded-lg border border-input bg-background px-2 text-xs shadow-xs focus:ring-1 focus:ring-ring font-medium truncate"
          >
            {typeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Qty */}
        <div className="col-span-1 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Qty
          </Label>
          <Input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => {
              const val = parseInt(quantity, 10);
              if (isNaN(val) || val < 1) setQuantity('1');
            }}
            className="h-8.5 text-xs font-mono font-semibold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Price ($) */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-2 space-y-1">
          <Label className="text-[11px] font-semibold text-primary uppercase tracking-wider">
            Price ($)
          </Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
            <Input
              type="number"
              step="0.01"
              required
              value={inksterBasePrice}
              onChange={(e) => setInksterBasePrice(e.target.value)}
              placeholder="1200.00"
              className="h-8.5 pl-5 text-right font-mono font-bold text-xs bg-primary/5 border-primary/40 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Labour ($) */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-1.5 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Labour ($)
          </Label>
          <Input
            type="number"
            step="any"
            value={labourInput}
            onChange={(e) => setLabourInput(e.target.value)}
            className="h-8.5 text-right font-mono text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Misc ($) */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-1 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Misc ($)
          </Label>
          <Input
            type="number"
            step="any"
            value={miscInput}
            onChange={(e) => setMiscInput(e.target.value)}
            className="h-8.5 text-right font-mono text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Hardware Dropdown */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1.5 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Hardware
          </Label>
          <select
            value={hardwareType === 'customer_supplied' ? 'none' : hardwareType}
            onChange={(e) => setHardwareType(e.target.value as DoorHardwareType)}
            className="w-full h-8.5 rounded-lg border border-input bg-background px-1.5 text-xs shadow-xs focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="standard">Standard Set</option>
            <option value="custom">Custom Set</option>
            <option value="none">None / Reinstall</option>
          </select>
        </div>
      </div>

      {/* Row 2: Door Description / Specification */}
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Door Description (Appears on Customer Quote Summary &amp; PDF)
        </Label>
        <Input
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder={currentPreset?.description?.trim() || currentPreset?.label || 'e.g. Steel Single Entry Door'}
          className="h-8.5 text-xs font-medium bg-background"
        />
      </div>
    </div>
  );
}
