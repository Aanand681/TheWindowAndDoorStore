"use client"

import React from "react"
import { Fuel } from "lucide-react"
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
import { blockNegativeKey } from "@/lib/input-sanitizers"

interface SealedUnitMileageSectionProps {
  showOutTownTravel?: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  labour: SealedUnitLabourSettings
  totalTravelAndSetup: number
  onKmChange: (val: string) => void
  onHoursChange: (val: string) => void
  onCrewSizeChange: (val: "2" | "3") => void
}

export function SealedUnitMileageSection({
  showOutTownTravel = false,
  travelKm,
  crewHours,
  crewSize,
  labour,
  totalTravelAndSetup,
  onKmChange,
  onHoursChange,
  onCrewSizeChange,
}: SealedUnitMileageSectionProps) {
  const kmVal = parseFloat(travelKm) || 0
  const hrsVal = parseFloat(crewHours) || 0
  const vehicleRate = labour.vehicleRatePerKm || 0.98
  const crewHourlyRate =
    crewSize === "2"
      ? labour.crewHourly2Men || 150
      : labour.crewHourly3Men || 200

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card/40 p-3.5">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <Fuel className="h-4 w-4 text-primary" />
          <Label className="text-xs font-bold text-foreground">
            Out-of-Town Mileage &amp; Transit Hours
          </Label>
        </div>
        {(showOutTownTravel || kmVal > 0 || hrsVal > 0) && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Roundtrip (KM)
          </Label>
          <Input
            type="number"
            step="any"
            min="0"
            value={travelKm}
            onKeyDown={blockNegativeKey}
            onChange={(e) => onKmChange(e.target.value)}
            placeholder="0"
            className="h-9 bg-background font-mono text-xs"
          />
          <span className="block text-[10px] text-muted-foreground">
            @ ${vehicleRate.toFixed(2)}/km = ${(kmVal * vehicleRate).toFixed(2)}
          </span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Transit Hours
          </Label>
          <Input
            type="number"
            step="0.5"
            min="0"
            value={crewHours}
            onKeyDown={blockNegativeKey}
            onChange={(e) => onHoursChange(e.target.value)}
            placeholder="0.0"
            className="h-9 bg-background font-mono text-xs"
          />
          <span className="block text-[10px] text-muted-foreground">
            @ ${crewHourlyRate}/hr = ${(hrsVal * crewHourlyRate).toFixed(2)}
          </span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground">
            Crew Configuration
          </Label>
          <Select
            value={crewSize}
            onValueChange={(val: any) => {
              if (val) onCrewSizeChange(val)
            }}
          >
            <SelectTrigger className="h-9 w-full bg-background text-xs font-medium">
              <SelectValue placeholder="Crew Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">
                3-Man Crew (${labour.crewHourly3Men || 200}/hr) [Standard]
              </SelectItem>
              <SelectItem value="2">
                2-Man Crew (${labour.crewHourly2Men || 150}/hr)
              </SelectItem>
            </SelectContent>
          </Select>
          <span className="block text-[10px] text-muted-foreground">
            Hourly transit billing per crew size
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-xs">
        <span className="font-semibold text-muted-foreground">
          Total Travel &amp; Setup:
        </span>
        <span className="font-mono text-sm font-bold text-foreground">
          ${totalTravelAndSetup.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
export default SealedUnitMileageSection
