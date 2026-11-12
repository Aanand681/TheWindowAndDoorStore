"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DoorHardwareType } from "@/lib/doors/types"

interface DoorHardwareSectionProps {
  hardwareType: DoorHardwareType
  customHardwareName: string
  setCustomHardwareName: (name: string) => void
  customHardwarePrice: string
  setCustomHardwarePrice: (price: string) => void
}

export function DoorHardwareSection({
  hardwareType,
  customHardwareName,
  setCustomHardwareName,
  customHardwarePrice,
  setCustomHardwarePrice,
}: DoorHardwareSectionProps) {
  if (hardwareType !== "custom") return null

  return (
    <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5 sm:grid-cols-2">
      <div className="space-y-1">
        <Label className="text-xs">Custom Hardware / Lockset Description</Label>
        <Input
          value={customHardwareName}
          onChange={(e) => setCustomHardwareName(e.target.value)}
          placeholder="Hardware / lockset description"
          className="h-8 bg-background text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Custom Hardware Price per Door ($)</Label>
        <div className="relative">
          <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            step="0.01"
            value={customHardwarePrice}
            onChange={(e) => setCustomHardwarePrice(e.target.value)}
            placeholder="0.00"
            className="h-8 bg-background pl-6 text-right font-mono text-xs font-semibold"
          />
        </div>
      </div>
    </div>
  )
}
