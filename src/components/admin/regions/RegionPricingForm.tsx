'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, MapPin, Loader2, DollarSign } from 'lucide-react';

interface RegionPricingFormProps {
  region: any;
  geocoding: string | null;
  onUpdateRegion: (id: string, field: string, value: any) => void;
  onAutoLocate: (targetCity: string, isForNewRegion: boolean, regionId?: string) => void;
}

export function RegionPricingForm({
  region,
  geocoding,
  onUpdateRegion,
  onAutoLocate,
}: RegionPricingFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Geographic Logistics & Base Setup */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
          Geographic Origin &amp; Base Mobilization
        </h3>
        <div className="space-y-3.5">
          <div>
            <Label className="text-xs font-semibold">Fixed Base Setup Fee / Job ($)</Label>
            <Input
              type="number"
              className="h-9 text-xs font-mono"
              value={region.fixedSetupFee ?? 140}
              onChange={(e) =>
                onUpdateRegion(region._id, 'fixedSetupFee', Number(e.target.value))
              }
              placeholder="140"
            />
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Universal base dispatch &amp; vehicle setup fee applied to all installation jobs in this region.
            </span>
          </div>

          <div>
            <Label className="text-xs font-semibold">Free Radius Cities (comma-separated)</Label>
            <Input
              className="h-9 text-xs"
              value={region.freeCities?.join(', ') || ''}
              onChange={(e) =>
                onUpdateRegion(
                  region._id,
                  'freeCities',
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder="e.g. Kenora, Keewatin, Norman"
            />
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Locations where mileage &amp; crew transit fees are waived ($0 travel).
            </span>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">City Origin (Map Center Coordinates)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] flex items-center gap-1 text-primary cursor-pointer hover:bg-primary/10"
                disabled={geocoding === region._id}
                onClick={() => onAutoLocate(region.name, false, region._id)}
                title="Locate city coordinates using OpenStreetMap"
              >
                {geocoding === region._id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                <span>Auto-Center</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">
                  Latitude
                </span>
                <Input
                  type="number"
                  step="0.0001"
                  className="h-8.5 text-xs font-mono"
                  value={region.officeLat}
                  onChange={(e) =>
                    onUpdateRegion(region._id, 'officeLat', Number(e.target.value))
                  }
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">
                  Longitude
                </span>
                <Input
                  type="number"
                  step="0.0001"
                  className="h-8.5 text-xs font-mono"
                  value={region.officeLon}
                  onChange={(e) =>
                    onUpdateRegion(region._id, 'officeLon', Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Job Dynamic Setup Fees */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Per-Job Dynamic Setup Fees
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Remote surcharges available for Windows, Doors &amp; Sealed Units.
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
            onClick={() => {
              const currentOpts = region.setupFeeOptions || [];
              onUpdateRegion(region._id, 'setupFeeOptions', [
                ...currentOpts,
                { label: '', value: 0 },
              ]);
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Fee Option
          </Button>
        </div>
        <div className="space-y-2.5">
          {!region.setupFeeOptions || region.setupFeeOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center italic">
              No dynamic setup fees defined. Click &quot;Add Fee Option&quot; above to add remote mobilization rates (e.g. Dryden $727.50).
            </p>
          ) : (
            region.setupFeeOptions.map((opt: any, idx: number) => (
              <div key={idx} className="flex gap-2 items-center bg-muted/20 p-2 rounded-xl border border-border/50">
                <Input
                  className="flex-1 text-xs h-8.5"
                  placeholder="Fee Label (e.g. Dryden / Sioux Lookout)"
                  value={opt.label}
                  onChange={(e) => {
                    const newOpts = [...(region.setupFeeOptions || [])];
                    newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                    onUpdateRegion(region._id, 'setupFeeOptions', newOpts);
                  }}
                />
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    $
                  </span>
                  <Input
                    className="pl-6 text-xs h-8.5 font-mono"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={opt.value}
                    onChange={(e) => {
                      const newOpts = [...(region.setupFeeOptions || [])];
                      newOpts[idx] = { ...newOpts[idx], value: Number(e.target.value) };
                      onUpdateRegion(region._id, 'setupFeeOptions', newOpts);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8.5 w-8.5 text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                  onClick={() => {
                    const newOpts = (region.setupFeeOptions || []).filter(
                      (_: any, i: number) => i !== idx
                    );
                    onUpdateRegion(region._id, 'setupFeeOptions', newOpts);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
