"use client"

import React from "react"
import { Sliders, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DbSettingsItem } from "./types"
import { generateId } from "@/hooks/useCalculatorWindows"

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
  overrideMaterialsMode?: "inherit" | "custom" | "none"
  setOverrideMaterialsMode?: (mode: "inherit" | "custom" | "none") => void
  optionAMaterials?: any[]
  optionBMaterials?: any[]
  setOptionBMaterials?: (materials: any[]) => void
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
  overrideMaterialsMode = "inherit",
  setOverrideMaterialsMode,
  optionAMaterials = [],
  optionBMaterials = [],
  setOptionBMaterials,
}: ComparisonOptionBOverridesProps) {
  const handleAddMaterial = () => {
    const newMat = { id: generateId(), label: "New Material", amount: 0 }
    setOptionBMaterials?.([...(optionBMaterials || []), newMat])
  }

  const handleUpdateMaterial = (id: string, field: "label" | "amount", val: string | number) => {
    const updated = (optionBMaterials || []).map((m) =>
      m.id === id ? { ...m, [field]: val } : m
    )
    setOptionBMaterials?.(updated)
  }

  const handleRemoveMaterial = (id: string) => {
    const updated = (optionBMaterials || []).filter((m) => m.id !== id)
    setOptionBMaterials?.(updated)
  }
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

            {/* Option B Additional Materials Override */}
            <div className="space-y-1.5 sm:col-span-2 border-t border-border/60 pt-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Option B Additional Materials
                </Label>
                {overrideMaterialsMode === "inherit" &&
                  Array.isArray(optionAMaterials) &&
                  optionAMaterials.length > 0 && (
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      Inheriting {optionAMaterials.length} item(s) ($
                      {optionAMaterials
                        .reduce((acc, m) => acc + (Number(m.amount) || 0), 0)
                        .toFixed(2)}
                      )
                    </span>
                  )}
              </div>
              <Select
                value={overrideMaterialsMode}
                onValueChange={(val: any) => setOverrideMaterialsMode?.(val)}
              >
                <SelectTrigger className="h-9 w-full min-w-0 bg-background text-xs font-medium">
                  <SelectValue placeholder="Select materials mode" />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[420px] min-w-[280px] sm:min-w-[340px]">
                  <SelectItem value="inherit" className="cursor-pointer py-2">
                    <span className="leading-snug">
                      Same as Option A{" "}
                      {Array.isArray(optionAMaterials) && optionAMaterials.length > 0
                        ? `(${optionAMaterials.map((m) => m.label || "Material").join(", ")})`
                        : "(No materials)"}
                    </span>
                  </SelectItem>
                  <SelectItem value="none" className="cursor-pointer py-2">
                    None (No additional materials for Option B)
                  </SelectItem>
                  <SelectItem value="custom" className="cursor-pointer py-2">
                    Custom for Option B
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Option B Materials Editor */}
              {overrideMaterialsMode === "custom" && (
                <div className="mt-2 space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-2">
                  {optionBMaterials.map((mat) => (
                    <div key={mat.id} className="flex items-center gap-1.5">
                      <Input
                        placeholder="Material description"
                        value={mat.label}
                        onChange={(e) =>
                          handleUpdateMaterial(mat.id, "label", e.target.value)
                        }
                        className="h-7 text-xs"
                      />
                      <div className="relative w-24 shrink-0">
                        <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={mat.amount}
                          onChange={(e) =>
                            handleUpdateMaterial(
                              mat.id,
                              "amount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-7 pl-5 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMaterial(mat.id)}
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMaterial}
                    className="h-7 w-full gap-1 border-dashed text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Material for Option B
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
