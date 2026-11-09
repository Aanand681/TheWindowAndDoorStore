'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';

export interface SupplyCasingSelectorProps {
  isReadOnly: boolean;
  casingId: string;
  setCasingId: (val: string) => void;
  casingName: string;
  setCasingName: (val: string) => void;
  casingRate: string;
  setCasingRate: (val: string) => void;
  dbCasings: any[];
  selectedCasingLabel: string;
}

export function SupplyCasingSelector({
  isReadOnly,
  casingId,
  setCasingId,
  casingName,
  setCasingName,
  casingRate,
  setCasingRate,
  dbCasings,
  selectedCasingLabel,
}: SupplyCasingSelectorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Casing Style
        </Label>
        {casingId !== 'none' && !isReadOnly && (
          <button
            type="button"
            onClick={() => setCasingId('none')}
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" /> None
          </button>
        )}
      </div>
      <Select disabled={isReadOnly} value={casingId} onValueChange={(val) => setCasingId(val ?? 'none')}>
        <SelectTrigger className="w-full h-9 bg-background text-xs font-medium">
          <SelectValue placeholder="Select casing style">
            {selectedCasingLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {dbCasings.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom...</SelectItem>
        </SelectContent>
      </Select>

      {casingId === 'custom' && (
        <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
          <Input
            disabled={isReadOnly}
            placeholder="Custom Casing Name"
            value={casingName}
            onChange={(e) => setCasingName(e.target.value)}
            className="bg-background h-8 text-xs"
          />
          <Input
            disabled={isReadOnly}
            type="number"
            step="0.01"
            placeholder="Rate/ft"
            value={casingRate}
            onChange={(e) => setCasingRate(e.target.value)}
            className="bg-background h-8 text-xs font-mono"
          />
        </div>
      )}
    </div>
  );
}

