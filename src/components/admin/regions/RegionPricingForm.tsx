"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, MapPin, Loader2, DollarSign } from "lucide-react"

interface RegionPricingFormProps {
  region: any
  geocoding: string | null
  onUpdateRegion: (id: string, field: string, value: any) => void
  onAutoLocate: (
    targetCity: string,
    isForNewRegion: boolean,
    regionId?: string
  ) => void
}

export function RegionPricingForm({
  region,
  geocoding,
  onUpdateRegion,
  onAutoLocate,
}: RegionPricingFormProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Geographic Logistics & Base Setup */}
      <div className="space-y-4">
        <h3 className="border-b border-border pb-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Geographic Origin &amp; Base Mobilization
        </h3>
        <div className="space-y-3.5">
          <div>
            <Label className="text-xs font-semibold">
              Fixed Base Setup Fee / Job ($)
            </Label>
            <Input
              type="number"
              className="h-9 font-mono text-xs"
              value={region.fixedSetupFee ?? 140}
              onChange={(e) =>
                onUpdateRegion(
                  region._id,
                  "fixedSetupFee",
                  Number(e.target.value)
                )
              }
              placeholder="140"
            />
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Universal base dispatch &amp; vehicle setup fee applied to all
              installation jobs in this region.
            </span>
          </div>

          <div>
            <Label className="text-xs font-semibold">
              Free Radius Cities (comma-separated)
            </Label>
            <Input
              className="h-9 text-xs"
              value={region.freeCities?.join(", ") || ""}
              onChange={(e) =>
                onUpdateRegion(
                  region._id,
                  "freeCities",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder="e.g. Kenora, Keewatin, Norman"
            />
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Locations where mileage &amp; crew transit fees are waived ($0
              travel).
            </span>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                City Origin (Map Center Coordinates)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex h-7 cursor-pointer items-center gap-1 px-2 text-[11px] text-primary hover:bg-primary/10"
                disabled={geocoding === region._id}
                onClick={() => onAutoLocate(region.name, false, region._id)}
                title="Locate city coordinates using OpenStreetMap"
              >
                {geocoding === region._id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                <span>Auto-Center</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="mb-0.5 block text-[10px] text-muted-foreground">
                  Latitude
                </span>
                <Input
                  type="number"
                  step="0.0001"
                  className="h-8.5 font-mono text-xs"
                  value={region.officeLat}
                  onChange={(e) =>
                    onUpdateRegion(
                      region._id,
                      "officeLat",
                      Number(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <span className="mb-0.5 block text-[10px] text-muted-foreground">
                  Longitude
                </span>
                <Input
                  type="number"
                  step="0.0001"
                  className="h-8.5 font-mono text-xs"
                  value={region.officeLon}
                  onChange={(e) =>
                    onUpdateRegion(
                      region._id,
                      "officeLon",
                      Number(e.target.value)
                    )
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
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
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
            className="flex h-7 cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:text-primary"
            onClick={() => {
              const currentOpts = region.setupFeeOptions || []
              onUpdateRegion(region._id, "setupFeeOptions", [
                ...currentOpts,
                { label: "", value: 0 },
              ])
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Fee Option
          </Button>
        </div>
        <div className="space-y-2.5">
          {!region.setupFeeOptions || region.setupFeeOptions.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground italic">
              No dynamic setup fees defined. Click &quot;Add Fee Option&quot;
              above to add remote mobilization rates (e.g. Dryden $727.50).
            </p>
          ) : (
            region.setupFeeOptions.map((opt: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-2"
              >
                <Input
                  className="h-8.5 flex-1 text-xs"
                  placeholder="Fee Label (e.g. Dryden / Sioux Lookout)"
                  value={opt.label}
                  onChange={(e) => {
                    const newOpts = [...(region.setupFeeOptions || [])]
                    newOpts[idx] = { ...newOpts[idx], label: e.target.value }
                    onUpdateRegion(region._id, "setupFeeOptions", newOpts)
                  }}
                />
                <div className="relative w-32">
                  <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    className="h-8.5 pl-6 font-mono text-xs"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={opt.value}
                    onChange={(e) => {
                      const newOpts = [...(region.setupFeeOptions || [])]
                      newOpts[idx] = {
                        ...newOpts[idx],
                        value: Number(e.target.value),
                      }
                      onUpdateRegion(region._id, "setupFeeOptions", newOpts)
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8.5 w-8.5 shrink-0 cursor-pointer text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const newOpts = (region.setupFeeOptions || []).filter(
                      (_: any, i: number) => i !== idx
                    )
                    onUpdateRegion(region._id, "setupFeeOptions", newOpts)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
