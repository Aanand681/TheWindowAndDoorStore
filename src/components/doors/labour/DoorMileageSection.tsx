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
import { DoorLogisticsSettings } from "@/lib/doors/types"
import { Truck } from "lucide-react"

interface DoorMileageSectionProps {
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  logistics: DoorLogisticsSettings
  onUpdateParams: (updates: {
    showOutTownTravel?: boolean
    travelKm?: string
    crewHours?: string
    crewSize?: "2" | "3"
  }) => void
}

export function DoorMileageSection({
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
  logistics,
  onUpdateParams,
}: DoorMileageSectionProps) {
  const km = parseFloat(travelKm) || 0
  const hours = parseFloat(crewHours) || 0
  const isTravelActive = showOutTownTravel || km > 0 || hours > 0
  const vehicleCost = isTravelActive
    ? km * (logistics.vehicleRatePerKm || 0.98)
    : 0
  const crewHourlyRate =
    crewSize === "2"
      ? logistics.crewHourly2Men || 150
      : logistics.crewHourly3Men || 200
  const crewCost = isTravelActive ? hours * crewHourlyRate : 0
  const totalTravelFleet = vehicleCost + crewCost

  const handleKmChange = (val: string) => {
    const num = parseFloat(val) || 0
    onUpdateParams({
      travelKm: val,
      showOutTownTravel: num > 0 || parseFloat(crewHours) > 0,
    })
  }

  const handleHoursChange = (val: string) => {
    const num = parseFloat(val) || 0
    onUpdateParams({
      crewHours: val,
      showOutTownTravel: num > 0 || parseFloat(travelKm) > 0,
    })
  }

  return (
    <div className="space-y-3.5 rounded-xl border border-border/70 bg-card/40 p-3.5">
      <div className="flex flex-col justify-between gap-2 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <Label className="text-xs font-bold text-foreground">
            Travel Mileage &amp; Crew Transit (Out-of-Town)
          </Label>
        </div>
        <div className="self-start rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary sm:self-auto">
          Mileage Total: +${totalTravelFleet.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
        {/* Round-trip Distance */}
        <div className="space-y-1 sm:col-span-3">
          <Label className="text-xs font-semibold text-muted-foreground">
            Round-Trip Distance (km)
          </Label>
          <Input
            type="number"
            step="1"
            value={travelKm}
            onChange={(e) => handleKmChange(e.target.value)}
            placeholder="0"
            className="h-9 bg-background font-mono text-xs"
          />
        </div>

        {/* Crew Size (Increased width) */}
        <div className="space-y-1 sm:col-span-6">
          <Label className="text-xs font-semibold text-muted-foreground">
            Crew Configuration
          </Label>
          <Select
            value={crewSize}
            onValueChange={(val: any) => {
              if (val) onUpdateParams({ crewSize: val })
            }}
          >
            <SelectTrigger className="h-9 w-full bg-background text-xs font-medium">
              <SelectValue placeholder="Crew Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3-Man Crew (Standard)</SelectItem>
              <SelectItem value="2">2-Man Crew</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Crew Transit Hours */}
        <div className="space-y-1 sm:col-span-3">
          <Label className="text-xs font-semibold text-muted-foreground">
            Transit Time (Hours)
          </Label>
          <Input
            type="number"
            step="0.5"
            value={crewHours}
            onChange={(e) => handleHoursChange(e.target.value)}
            placeholder="0.0"
            className="h-9 bg-background font-mono text-xs"
          />
        </div>
      </div>
    </div>
  )
}
