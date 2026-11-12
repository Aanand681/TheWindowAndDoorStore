"use client"

import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RotateCcw } from "lucide-react"

export interface SupplyJambSelectorProps {
  isReadOnly: boolean
  jambId: string
  setJambId: (val: string) => void
  jambName: string
  setJambName: (val: string) => void
  jambRate: string
  setJambRate: (val: string) => void
  dbJambs: any[]
  selectedJambLabel: string
}

export function SupplyJambSelector({
  isReadOnly,
  jambId,
  setJambId,
  jambName,
  setJambName,
  jambRate,
  setJambRate,
  dbJambs,
  selectedJambLabel,
}: SupplyJambSelectorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Jamb Extension
        </Label>
        {jambId !== "none" && !isReadOnly && (
          <button
            type="button"
            onClick={() => setJambId("none")}
            className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-primary"
          >
            <RotateCcw className="h-2.5 w-2.5" /> None
          </button>
        )}
      </div>
      <Select
        disabled={isReadOnly}
        value={jambId}
        onValueChange={(val) => setJambId(val ?? "none")}
      >
        <SelectTrigger className="h-9 w-full bg-background text-xs font-medium">
          <SelectValue placeholder="Select jamb extension">
            {selectedJambLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {dbJambs.map((j) => (
            <SelectItem key={j.id} value={j.id}>
              {j.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom...</SelectItem>
        </SelectContent>
      </Select>

      {jambId === "custom" && (
        <div className="grid animate-in grid-cols-2 gap-2 pt-1 fade-in">
          <Input
            disabled={isReadOnly}
            placeholder="Custom Jamb Name"
            value={jambName}
            onChange={(e) => setJambName(e.target.value)}
            className="h-8 bg-background text-xs"
          />
          <Input
            disabled={isReadOnly}
            type="number"
            step="0.01"
            placeholder="Rate/ft"
            value={jambRate}
            onChange={(e) => setJambRate(e.target.value)}
            className="h-8 bg-background font-mono text-xs"
          />
        </div>
      )}
    </div>
  )
}
