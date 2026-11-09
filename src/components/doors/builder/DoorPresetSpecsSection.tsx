'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DoorPreset, DoorCategory } from '@/lib/doors/types';

interface DoorPresetSpecsSectionProps {
  presets: DoorPreset[];
  selectedPresetId: string;
  handlePresetSelect: (presetId: string) => void;
  category: DoorCategory;
  setCategory: (category: DoorCategory) => void;
  customDescription: string;
  setCustomDescription: (desc: string) => void;
  currentPreset: DoorPreset;
  quantity: string;
  setQuantity: (qty: string) => void;
  inksterBasePrice: string;
  setInksterBasePrice: (price: string) => void;
}

export function DoorPresetSpecsSection({
  presets,
  selectedPresetId,
  handlePresetSelect,
  category,
  setCategory,
  customDescription,
  setCustomDescription,
  currentPreset,
  quantity,
  setQuantity,
  inksterBasePrice,
  setInksterBasePrice,
}: DoorPresetSpecsSectionProps) {
  return (
    <>
      {/* Row 1: Preset & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Door Style Preset</Label>
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs shadow-xs focus:ring-1 focus:ring-ring font-medium"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} (Lab: ${p.labour.toFixed(0)}, Misc: ${p.misc.toFixed(0)})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DoorCategory)}
            className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs shadow-xs focus:ring-1 focus:ring-ring"
          >
            <option value="entry">Entry Door (10% Discount)</option>
            <option value="patio">Patio Door (10% Discount)</option>
            <option value="garden">Garden / Terrace Door (10% Discount)</option>
            <option value="storm">Storm Door (0% Discount / Exempt)</option>
            <option value="custom">Custom Door (10% Discount)</option>
          </select>
        </div>
      </div>

      {/* Row 2: Custom Description */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">Door Description / Specification</Label>
        <Input
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder={currentPreset?.description?.trim() || currentPreset?.label || 'e.g. Steel Single Entry Door'}
          className="h-8.5 text-xs font-medium"
        />
      </div>

      {/* Row 3: Quantity & Inkster Base Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Quantity (Number of Doors)</Label>
          <Input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => {
              const val = parseInt(quantity, 10);
              if (isNaN(val) || val < 1) {
                setQuantity('1');
              }
            }}
            className="h-8.5 text-xs font-mono font-semibold"
          />
          <p className="text-[10px] text-muted-foreground">
            Enter 2 or more if quoting multiple identical doors.
          </p>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-primary">Inkster Base Price per Unit ($)</Label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
            <Input
              type="number"
              step="0.01"
              required
              value={inksterBasePrice}
              onChange={(e) => setInksterBasePrice(e.target.value)}
              placeholder="1200.00"
              className="h-8.5 pl-6 text-right font-mono font-bold text-xs bg-primary/5 border-primary/40 focus:border-primary"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Price before 8% surcharge &amp; 10% discount.</p>
        </div>
      </div>
    </>
  );
}

