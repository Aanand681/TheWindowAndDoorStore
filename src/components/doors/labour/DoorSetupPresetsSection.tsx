"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin } from "lucide-react"
import { DoorLogisticsSettings } from "@/lib/doors/types"
import { SharedRegionOption } from "@/hooks/shared/useSharedRegions"

interface DoorSetupPresetsSectionProps {
  regions: SharedRegionOption[]
  selectedRegionId: string
  onSelectRegion: (regionId: string) => void
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  customTravelFee: string
  logistics: DoorLogisticsSettings
  onUpdateParams: (updates: {
    travelFeeType?: "none" | "local_std" | "far_std" | "far_small" | "custom"
    customTravelFee?: string
  }) => void
}

export function DoorSetupPresetsSection({
  regions,
  selectedRegionId,
  onSelectRegion,
  travelFeeType,
  customTravelFee,
  logistics,
  onUpdateParams,
}: DoorSetupPresetsSectionProps) {
  const selectedRegion = regions.find((r) => r._id === selectedRegionId)
  const baseSetup =
    selectedRegion?.fixedSetupFee ?? (logistics.setupFeeDefault || 140.0)

  const isDrydenOrRemote = Boolean(
    selectedRegion?.name.toLowerCase().includes("dryden") ||
    selectedRegion?.name.toLowerCase().includes("sioux")
  )

  let remoteExtra = 0
  if (isDrydenOrRemote) {
    if (travelFeeType === "far_std") {
      remoteExtra = logistics.setupFeeFarStandard || 727.5
    } else if (travelFeeType === "far_small") {
      remoteExtra = logistics.setupFeeFarSmall || 363.5
    } else if (travelFeeType === "custom") {
      remoteExtra = Math.max(0, parseFloat(customTravelFee) || 0)
    }
  }

  const totalSetup = travelFeeType === "none" ? 0 : baseSetup + remoteExtra

  // Handle region change
  const handleRegionChange = (newRegionId: string | null) => {
    if (!newRegionId) return
    onSelectRegion(newRegionId)
    const reg = regions.find((r) => r._id === newRegionId)
    if (!reg) return

    // If Dryden / Sioux Lookout is selected, default to standard job fee
    if (
      reg.name.toLowerCase().includes("dryden") ||
      reg.name.toLowerCase().includes("sioux")
    ) {
      onUpdateParams({ travelFeeType: "far_std" })
    } else {
      // Local region like Fort Frances or Kenora defaults to fixed local_std ($140)
      onUpdateParams({ travelFeeType: "local_std", customTravelFee: "" })
    }
  }

  const farStdAmount = (logistics.setupFeeFarStandard || 727.5).toFixed(2)
  const farSmallAmount = (logistics.setupFeeFarSmall || 363.5).toFixed(2)

  const feeTypeLabel =
    travelFeeType === "far_std"
      ? `Standard Job Fee (+$${farStdAmount})`
      : travelFeeType === "far_small"
        ? `Small Job Fee (+$${farSmallAmount})`
        : travelFeeType === "custom"
          ? `Custom Surcharge ($${parseFloat(customTravelFee) || 0})`
          : "Base Setup Only ($0.00 surcharge)"

  return (
    <div className="space-y-3.5 rounded-xl border border-border/70 bg-card/40 p-3.5">
      <div className="flex flex-col justify-between gap-2 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <Label className="text-xs font-bold text-foreground">
            Region &amp; Setup Mobilization
          </Label>
        </div>
        <div className="self-start rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary sm:self-auto">
          Setup Total: ${totalSetup.toFixed(2)}
        </div>
      </div>

      <div
        className={`grid gap-3.5 ${isDrydenOrRemote ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {/* 1. Region Selector */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Region / Geographic Zone
          </Label>
          <Select value={selectedRegionId} onValueChange={handleRegionChange}>
            <SelectTrigger className="h-9 w-full bg-background text-xs font-medium">
              <SelectValue placeholder="Select Region">
                {selectedRegion?.name || "Select Region"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {regions.map((reg) => (
                <SelectItem key={reg._id} value={reg._id}>
                  {reg.name}
                </SelectItem>
              ))}
              {regions.length === 0 && (
                <SelectItem value="default_ff">Fort Frances (Local)</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Fee Type Selector: Visible ONLY for Dryden / Sioux Lookout */}
        {isDrydenOrRemote && (
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">
              Job Fee Type (Dryden / Sioux Lookout)
            </Label>
            <Select
              value={travelFeeType}
              onValueChange={(val: any) => {
                if (val) onUpdateParams({ travelFeeType: val })
              }}
            >
              <SelectTrigger className="h-9 w-full bg-background text-xs font-medium">
                <SelectValue placeholder="Select Fee Type">
                  {feeTypeLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="far_std">
                  Standard Job Fee (+${farStdAmount})
                </SelectItem>
                <SelectItem value="far_small">
                  Small Job Fee (+${farSmallAmount})
                </SelectItem>
                <SelectItem value="local_std">
                  Base Setup Only ($0.00 surcharge)
                </SelectItem>
                <SelectItem value="custom">
                  Custom Surcharge Amount...
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Custom Setup Amount Field if Selected */}
      {isDrydenOrRemote && travelFeeType === "custom" && (
        <div className="max-w-xs space-y-1 border-t border-border/40 pt-2">
          <Label className="text-xs font-semibold">
            Custom Mobilization Surcharge ($)
          </Label>
          <div className="relative">
            <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step="any"
              className="h-8.5 bg-background pl-6 font-mono text-xs"
              placeholder="0.00"
              value={customTravelFee}
              onChange={(e) =>
                onUpdateParams({ customTravelFee: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {/* Explanatory Context Note */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
        <span>
          {isDrydenOrRemote ? (
            <>
              Base mobilization: <strong>${baseSetup.toFixed(2)}</strong>
              {remoteExtra > 0 &&
                ` + remote surcharge: $${remoteExtra.toFixed(2)}`}
            </>
          ) : (
            <>
              Fixed Base Mobilization: <strong>${baseSetup.toFixed(2)}</strong>{" "}
              (Included)
            </>
          )}
        </span>
        {selectedRegion?.freeCities && selectedRegion.freeCities.length > 0 && (
          <span className="text-[10px] italic">
            Free radius: {selectedRegion.freeCities.slice(0, 3).join(", ")}
          </span>
        )}
      </div>
    </div>
  )
}
