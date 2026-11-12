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

export interface SupplyCasingSelectorProps {
  isReadOnly: boolean
  casingId: string
  setCasingId: (val: string) => void
  casingName: string
  setCasingName: (val: string) => void
  casingRate: string
  setCasingRate: (val: string) => void
  dbCasings: any[]
  selectedCasingLabel: string
}

export function SupplyCasingSelector({
  isReadOnly,
  casingId,
  setCasingId,
  casingName,
  setCasingName,
  casingRate,
  setCasingRate,
  dbCasings,
  selectedCasingLabel,
}: SupplyCasingSelectorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Casing Style
        </Label>
        {casingId !== "none" && !isReadOnly && (
          <button
            type="button"
            onClick={() => setCasingId("none")}
            className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-primary"
          >
            <RotateCcw className="h-2.5 w-2.5" /> None
          </button>
        )}
      </div>
      <Select
        disabled={isReadOnly}
        value={casingId}
        onValueChange={(val) => setCasingId(val ?? "none")}
      >
        <SelectTrigger className="h-9 w-full bg-background text-xs font-medium">
          <SelectValue placeholder="Select casing style">
            {selectedCasingLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {dbCasings.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom...</SelectItem>
        </SelectContent>
      </Select>

      {casingId === "custom" && (
        <div className="grid animate-in grid-cols-2 gap-2 pt-1 fade-in">
          <Input
            disabled={isReadOnly}
            placeholder="Custom Casing Name"
            value={casingName}
            onChange={(e) => setCasingName(e.target.value)}
            className="h-8 bg-background text-xs"
          />
          <Input
            disabled={isReadOnly}
            type="number"
            step="0.01"
            placeholder="Rate/ft"
            value={casingRate}
            onChange={(e) => setCasingRate(e.target.value)}
            className="h-8 bg-background font-mono text-xs"
          />
        </div>
      )}
    </div>
  )
}
