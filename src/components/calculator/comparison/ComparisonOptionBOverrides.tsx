'use client';

import React from 'react';
import { Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DbSettingsItem } from './types';

export interface ComparisonOptionBOverridesProps {
  showOverrides: boolean;
  setShowOverrides: (val: boolean) => void;
  overrideJambId: string;
  setOverrideJambId: (val: string) => void;
  overrideCasingId: string;
  setOverrideCasingId: (val: string) => void;
  dbJambs: DbSettingsItem[];
  dbCasings: DbSettingsItem[];
  resolvedOptionAJambLabel: string;
  resolvedOptionACasingLabel: string;
  selectedOverrideJambDisplay: string;
  selectedOverrideCasingDisplay: string;
}

export function ComparisonOptionBOverrides({
  showOverrides,
  setShowOverrides,
  overrideJambId,
  setOverrideJambId,
  overrideCasingId,
  setOverrideCasingId,
  dbJambs,
  dbCasings,
  resolvedOptionAJambLabel,
  resolvedOptionACasingLabel,
  selectedOverrideJambDisplay,
  selectedOverrideCasingDisplay,
}: ComparisonOptionBOverridesProps) {
  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      <button
        type="button"
        onClick={() => setShowOverrides(!showOverrides)}
        className="flex items-center justify-between w-full py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>Customize Option B Add-ons (Jambs &amp; Casing)</span>
        </span>
        {showOverrides ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showOverrides && (
        <div className="mt-2.5 p-3 rounded-xl bg-card border border-border/70 space-y-2.5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Option B Jamb Override */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Option B Jamb Extension
              </Label>
              <Select
                value={overrideJambId}
                onValueChange={(val) => setOverrideJambId(val || 'inherit')}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-background min-w-0 font-medium">
                  <SelectValue placeholder="Select jamb">
                    <span className="truncate block text-left">
                      {selectedOverrideJambDisplay}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full min-w-[280px] sm:min-w-[340px] max-w-[420px]">
                  <SelectItem value="inherit" className="py-2 cursor-pointer">
                    <span className="leading-snug">Same as Option A ({resolvedOptionAJambLabel})</span>
                  </SelectItem>
                  <SelectItem value="none" className="py-2 cursor-pointer">
                    None
                  </SelectItem>
                  {dbJambs.map((j) => (
                    <SelectItem key={j.id} value={j.id} className="py-2 cursor-pointer">
                      <span className="leading-snug">{j.label || j.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Option B Casing Override */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Option B Casing Style
              </Label>
              <Select
                value={overrideCasingId}
                onValueChange={(val) => setOverrideCasingId(val || 'inherit')}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-background min-w-0 font-medium">
                  <SelectValue placeholder="Select casing">
                    <span className="truncate block text-left">
                      {selectedOverrideCasingDisplay}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full min-w-[280px] sm:min-w-[340px] max-w-[420px]">
                  <SelectItem value="inherit" className="py-2 cursor-pointer">
                    <span className="leading-snug">Same as Option A ({resolvedOptionACasingLabel})</span>
                  </SelectItem>
                  <SelectItem value="none" className="py-2 cursor-pointer">
                    None
                  </SelectItem>
                  {dbCasings.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="py-2 cursor-pointer">
                      <span className="leading-snug">{c.label || c.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

