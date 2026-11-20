"use client"

import React from "react"
import { MapPin } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SealedUnitLabourSettings } from "@/lib/sealed-units-logic"
import { SharedRegionOption } from "@/hooks/shared/useSharedRegions"
import { blockNegativeKey, sanitizeNonNegativeNumber } from "@/lib/input-sanitizers"
import { SealedUnitMileageSection } from "./SealedUnitMileageSection"

export interface SealedUnitTravelCalculatorProps {
  labour: SealedUnitLabourSettings
  regions?: SharedRegionOption[]
  selectedRegionId?: string
  onSelectRegion?: (regionId: string) => void
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  setTravelFeeType: (
    val: "none" | "local_std" | "far_std" | "far_small" | "custom"
  ) => void
  customTravelFee: string
  setCustomTravelFee: (val: string) => void
  showOutTownTravel?: boolean
  setShowOutTownTravel?: (val: boolean) => void
  travelKm: string
  setTravelKm: (val: string) => void
  crewHours: string
  setCrewHours: (val: string) => void
  crewSize: "2" | "3"
  setCrewSize: (val: "2" | "3") => void
  baseSetupFee: number
  totalTravelAndSetup: number
  contextMode?: "installation" | "service_only"
}

export function SealedUnitTravelCalculator({
  labour,
  regions = [],
  selectedRegionId = "",
  onSelectRegion = () => {},
  travelFeeType,
  setTravelFeeType,
  customTravelFee,
  setCustomTravelFee,
  showOutTownTravel = false,
  setShowOutTownTravel,
  travelKm,
  setTravelKm,
  crewHours,
  setCrewHours,
  crewSize,
  setCrewSize,
  totalTravelAndSetup,
  contextMode = "installation",
}: SealedUnitTravelCalculatorProps) {
  const farStandardFee = labour.setupFeeFarStandard || 727.5
  const farSmallFee = labour.setupFeeFarSmall || 363.5
  const baseSetup = labour.setupFeeDefault || 140.0
  const selectedRegion = regions.find((r) => r._id === selectedRegionId)

  const isDrydenOrRemote = Boolean(
    selectedRegion?.name.toLowerCase().includes("dryden") ||
      selectedRegion?.name.toLowerCase().includes("sioux")
  )

  // Reactive auto-sync: Automatically default to remote small setup fee ($363.50) for Sioux / Dryden on initial render/quote load
  React.useEffect(() => {
    if (
      isDrydenOrRemote &&
      (!travelFeeType || travelFeeType === "none" || (travelFeeType as string) === "local_std")
    ) {
      setTravelFeeType("far_small")
    }
  }, [isDrydenOrRemote, travelFeeType, setTravelFeeType])

  const handleKmChange = (val: string) => {
    const cleaned = sanitizeNonNegativeNumber(val)
    setTravelKm(cleaned)
    const kmNum = parseFloat(cleaned) || 0
    const hrsNum = parseFloat(crewHours) || 0
    setShowOutTownTravel?.(kmNum > 0 || hrsNum > 0)
  }

  const handleHoursChange = (val: string) => {
    const cleaned = sanitizeNonNegativeNumber(val)
    setCrewHours(cleaned)
    const hrsNum = parseFloat(cleaned) || 0
    const kmNum = parseFloat(travelKm) || 0
    setShowOutTownTravel?.(hrsNum > 0 || kmNum > 0)
  }

  let remoteExtra = 0
  if (isDrydenOrRemote) {
    if (travelFeeType === "far_std") remoteExtra = farStandardFee
    else if (travelFeeType === "far_small") remoteExtra = farSmallFee
    else if (travelFeeType === "custom")
      remoteExtra = Math.max(0, parseFloat(customTravelFee) || 0)
  }

  const isWaived = travelFeeType === "none"
  const setupTotal = isWaived ? 0 : baseSetup + remoteExtra

  const handleRegionChange = (newRegionId: string | null) => {
    if (!newRegionId) return
    onSelectRegion(newRegionId)
    const reg = regions.find((r) => r._id === newRegionId)
    if (!reg) return
    if (
      reg.name.toLowerCase().includes("dryden") ||
      reg.name.toLowerCase().includes("sioux")
    ) {
      setTravelFeeType("far_small")
    } else {
      setTravelFeeType("local_std")
      setCustomTravelFee("")
    }
  }

  const feeTypeLabel =
    travelFeeType === "far_std"
      ? `Standard Job Fee (+${farStandardFee.toFixed(2)})`
      : travelFeeType === "far_small"
        ? `Small Job Fee (+${farSmallFee.toFixed(2)})`
        : travelFeeType === "custom"
          ? `Custom Surcharge ($${parseFloat(customTravelFee) || 0})`
          : "Base Setup Only ($0.00 surcharge)"

  return (
    <div className="space-y-3.5 border-t border-border/60 pt-2">
      {/* 1. Region & Setup Mobilization Section */}
      <div className="space-y-3 rounded-xl border border-border/70 bg-card/40 p-3.5">
        <div className="flex flex-col justify-between gap-2 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <Label className="text-xs font-bold text-foreground">
              Region &amp; Setup Mobilization
            </Label>
          </div>
          <div className="self-start rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary sm:self-auto">
            Setup Total: ${setupTotal.toFixed(2)}
          </div>
        </div>

        <div
          className={`grid gap-3 ${isDrydenOrRemote ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
        >
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
                  <SelectItem value="default_ff">
                    Fort Frances (Local)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {isDrydenOrRemote && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                Job Fee Type (Dryden / Sioux Lookout)
              </Label>
              <Select
                value={travelFeeType}
                onValueChange={(val: any) => {
                  if (val) setTravelFeeType(val)
                }}
              >
                <SelectTrigger className="h-9 w-full bg-background text-xs font-medium">
                  <SelectValue placeholder="Select Fee Type">
                    {feeTypeLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="far_std">
                    Standard Job Fee (+${farStandardFee.toFixed(2)})
                  </SelectItem>
                  <SelectItem value="far_small">
                    Small Job Fee (+${farSmallFee.toFixed(2)})
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

        {isDrydenOrRemote && travelFeeType === "custom" && (
          <div className="max-w-xs space-y-1 border-t border-border/40 pt-2">
            <Label className="text-xs font-semibold">
              Custom Surcharge on Top of $140 ($)
            </Label>
            <Input
              type="number"
              step="any"
              min="0"
              className="h-8.5 bg-background font-mono text-xs"
              placeholder="0.00"
              value={customTravelFee}
              onKeyDown={blockNegativeKey}
              onChange={(e) => setCustomTravelFee(sanitizeNonNegativeNumber(e.target.value))}
            />
          </div>
        )}

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
                Fixed Base Mobilization:{" "}
                <strong>${baseSetup.toFixed(2)}</strong> (Included)
              </>
            )}
          </span>
          {contextMode === "service_only" && (
            <span className="text-[10px] text-primary italic">
              Service Only
            </span>
          )}
        </div>
      </div>

      {/* 2. Out-of-Town Mileage & Crew Transit Hours */}
      <SealedUnitMileageSection
        showOutTownTravel={showOutTownTravel}
        travelKm={travelKm}
        crewHours={crewHours}
        crewSize={crewSize}
        labour={labour}
        totalTravelAndSetup={totalTravelAndSetup}
        onKmChange={handleKmChange}
        onHoursChange={handleHoursChange}
        onCrewSizeChange={(val) => setCrewSize(val)}
      />
    </div>
  )
}
