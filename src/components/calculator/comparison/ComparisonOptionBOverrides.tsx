"use client"

import React from "react"
import { Sliders, ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DbSettingsItem } from "./types"

export interface ComparisonOptionBOverridesProps {
  showOverrides: boolean
  setShowOverrides: (val: boolean) => void
  overrideJambId: string
  setOverrideJambId: (val: string) => void
  overrideCasingId: string
  setOverrideCasingId: (val: string) => void
  dbJambs: DbSettingsItem[]
  dbCasings: DbSettingsItem[]
  resolvedOptionAJambLabel: string
  resolvedOptionACasingLabel: string
  selectedOverrideJambDisplay: string
  selectedOverrideCasingDisplay: string
}

export function ComparisonOptionBOverrides({
  showOverrides,
  setShowOverrides,
  overrideJambId,
  setOverrideJambId,
  overrideCasingId,
  setOverrideCasingId,
  dbJambs,
  dbCasings,
  resolvedOptionAJambLabel,
  resolvedOptionACasingLabel,
  selectedOverrideJambDisplay,
  selectedOverrideCasingDisplay,
}: ComparisonOptionBOverridesProps) {
  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      <button
        type="button"
        onClick={() => setShowOverrides(!showOverrides)}
        className="flex w-full cursor-pointer items-center justify-between py-1 text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400"
      >
        <span className="flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5" />
          <span>Customize Option B Add-ons (Jambs &amp; Casing)</span>
        </span>
        {showOverrides ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {showOverrides && (
        <div className="mt-2.5 animate-in space-y-2.5 rounded-xl border border-border/70 bg-card p-3 duration-150 fade-in">
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            {/* Option B Jamb Override */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                Option B Jamb Extension
              </Label>
              <Select
                value={overrideJambId}
                onValueChange={(val) => setOverrideJambId(val || "inherit")}
              >
                <SelectTrigger className="h-9 w-full min-w-0 bg-background text-xs font-medium">
                  <SelectValue placeholder="Select jamb">
                    <span className="block truncate text-left">
                      {selectedOverrideJambDisplay}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full max-w-[420px] min-w-[280px] sm:min-w-[340px]">
                  <SelectItem value="inherit" className="cursor-pointer py-2">
                    <span className="leading-snug">
                      Same as Option A ({resolvedOptionAJambLabel})
                    </span>
                  </SelectItem>
                  <SelectItem value="none" className="cursor-pointer py-2">
                    None
                  </SelectItem>
                  {dbJambs.map((j) => (
                    <SelectItem
                      key={j.id}
                      value={j.id}
                      className="cursor-pointer py-2"
                    >
                      <span className="leading-snug">{j.label || j.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Option B Casing Override */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                Option B Casing Style
              </Label>
              <Select
                value={overrideCasingId}
                onValueChange={(val) => setOverrideCasingId(val || "inherit")}
              >
                <SelectTrigger className="h-9 w-full min-w-0 bg-background text-xs font-medium">
                  <SelectValue placeholder="Select casing">
                    <span className="block truncate text-left">
                      {selectedOverrideCasingDisplay}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full max-w-[420px] min-w-[280px] sm:min-w-[340px]">
                  <SelectItem value="inherit" className="cursor-pointer py-2">
                    <span className="leading-snug">
                      Same as Option A ({resolvedOptionACasingLabel})
                    </span>
                  </SelectItem>
                  <SelectItem value="none" className="cursor-pointer py-2">
                    None
                  </SelectItem>
                  {dbCasings.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      className="cursor-pointer py-2"
                    >
                      <span className="leading-snug">{c.label || c.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
