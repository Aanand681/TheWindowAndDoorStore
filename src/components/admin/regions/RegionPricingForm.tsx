'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, MapPin, Loader2 } from 'lucide-react';

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
    <div className="grid md:grid-cols-3 gap-6">
      {/* General Constants */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
          General Constants
        </h3>
        <div className="space-y-3">
          <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold cursor-pointer">
                Supply Only Region
              </Label>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                checked={Boolean(region.isSupplyOnly)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onUpdateRegion(region._id, 'isSupplyOnly', checked);
                  if (checked) {
                    onUpdateRegion(region._id, 'labourPerSqft', 0);
                    onUpdateRegion(region._id, 'miscPerSqft', 0);
                    onUpdateRegion(region._id, 'labourMin', 0);
                    onUpdateRegion(region._id, 'miscMin', 0);
                    onUpdateRegion(region._id, 'fixedSetupFee', 0);
                    onUpdateRegion(region._id, 'baseTravelFee', 0);
                  }
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              When enabled, installation labour, setup, and travel automatically default to $0.
            </p>
          </div>

          <div>
            <Label>Fixed Setup Fee / Job ($)</Label>
            <Input
              type="number"
              value={region.fixedSetupFee}
              onChange={(e) =>
                onUpdateRegion(region._id, 'fixedSetupFee', Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label>Extra Linear Per Window (ft)</Label>
            <Input
              type="number"
              step="0.01"
              value={region.extraLinPerWindow}
              onChange={(e) =>
                onUpdateRegion(region._id, 'extraLinPerWindow', Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label>Free Radius Cities (comma-separated)</Label>
            <Input
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
            />
          </div>
          <div className="pt-2 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">City Origin (Map Center)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px] flex items-center gap-1 text-primary cursor-pointer hover:bg-primary/10"
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

      {/* Window Labour Base */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
          Window Labour Base
        </h3>
        <div className="space-y-3">
          <div>
            <Label>Labour Per Sq Ft ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={region.labourPerSqft}
              onChange={(e) =>
                onUpdateRegion(region._id, 'labourPerSqft', Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label>Misc Per Sq Ft ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={region.miscPerSqft}
              onChange={(e) =>
                onUpdateRegion(region._id, 'miscPerSqft', Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label>Min. Labour per Window ($)</Label>
            <Input
              type="number"
              value={region.labourMin}
              onChange={(e) =>
                onUpdateRegion(region._id, 'labourMin', Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label>Min. Misc per Window ($)</Label>
            <Input
              type="number"
              value={region.miscMin}
              onChange={(e) =>
                onUpdateRegion(region._id, 'miscMin', Number(e.target.value))
              }
            />
          </div>
        </div>
      </div>

      {/* Per-Job Dynamic Setup Fees */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Per-Job Dynamic Setup Fees
          </h3>
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
            <p className="text-xs text-muted-foreground py-2 italic">
              No dynamic setup fees defined. Click &quot;Add Fee Option&quot; above to add one.
            </p>
          ) : (
            region.setupFeeOptions.map((opt: any, idx: number) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  className="flex-1 text-xs"
                  placeholder="Fee Label (e.g., Crane Fee)"
                  value={opt.label}
                  onChange={(e) => {
                    const newOpts = [...(region.setupFeeOptions || [])];
                    newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                    onUpdateRegion(region._id, 'setupFeeOptions', newOpts);
                  }}
                />
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    $
                  </span>
                  <Input
                    className="pl-6 text-xs"
                    type="number"
                    placeholder="0"
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
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                  title="Delete fee option"
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

