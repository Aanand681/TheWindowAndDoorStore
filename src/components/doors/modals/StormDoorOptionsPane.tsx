"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  StormDoorCatalogItem,
  StormDoorProfile,
  StormDoorVentType,
  StormDoorSwing,
  StormDoorStyle,
  StormDoorAddonOption,
  PapaizFinish,
} from "@/lib/doors/storm-door-types"
import { StormDoorAddonRow } from "./StormDoorAddonRow"
import { StormDoorColorPicker } from "./StormDoorColorPicker"

export interface StormDoorOptionsPaneProps {
  style: StormDoorStyle
  currentItem: StormDoorCatalogItem
  profile: StormDoorProfile
  setProfile: (p: StormDoorProfile) => void
  ventType: StormDoorVentType
  setVentType: (v: StormDoorVentType) => void
  swing: StormDoorSwing
  setSwing: (s: StormDoorSwing) => void
  color: string
  setColor: (c: string) => void
  colorList: string[]
  isCustomPaint: boolean
  setIsCustomPaint: (cp: boolean) => void
  isDoubleDoorCustomPaint?: boolean
  setIsDoubleDoorCustomPaint?: (val: boolean) => void
  papaizFinish?: PapaizFinish
  setPapaizFinish?: (val: PapaizFinish) => void
  selectedAddons: string[]
  toggleAddon: (id: string) => void
  addonModes?: Record<string, "included" | "option">
  setAddonMode?: (id: string, mode: "included" | "option") => void
  availableAddons?: StormDoorAddonOption[]
}

export function StormDoorOptionsPane({
  style,
  currentItem,
  profile,
  setProfile,
  ventType,
  setVentType,
  swing,
  setSwing,
  color,
  setColor,
  colorList,
  isCustomPaint,
  setIsCustomPaint,
  isDoubleDoorCustomPaint = false,
  setIsDoubleDoorCustomPaint,
  papaizFinish = "Satin Chrome",
  setPapaizFinish,
  selectedAddons,
  toggleAddon,
  addonModes = {},
  setAddonMode,
  availableAddons = [],
}: StormDoorOptionsPaneProps) {
  const filteredAddons = availableAddons.filter((addon) => {
    if (addon.applicableStyles && addon.applicableStyles.length > 0 && !addon.applicableStyles.includes(style)) return false
    if (addon.applicableSwings && addon.applicableSwings.length > 0 && !addon.applicableSwings.includes(swing)) return false
    return true
  })

  return (
    <div className="p-4 sm:p-5 space-y-4 overflow-y-auto w-full h-full">
      {/* Profile Thickness */}
      {style !== "project_self_storing" && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Profile Thickness
          </label>
          <div className="flex gap-2">
            {(['2"', '2-1/4"'] as StormDoorProfile[]).map((p) => (
              <Button
                key={p}
                type="button"
                variant={profile === p ? "default" : "outline"}
                size="sm"
                onClick={() => setProfile(p)}
                className="h-8 flex-1 text-xs font-semibold"
              >
                {p === '2"' ? '2" Classic Frame' : '2-1/4" Contemporary'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Vent Type & Swing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Glass / Venting
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setVentType("standard")}
              className={`px-3 py-2 text-xs text-left rounded-lg border font-medium transition-all ${
                ventType === "standard"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              Standard Glass
            </button>
            {currentItem.hiddenVentPrice && (
              <button
                type="button"
                onClick={() => setVentType("hidden_vent")}
                className={`px-3 py-2 text-xs text-left rounded-lg border font-medium transition-all ${
                  ventType === "hidden_vent"
                    ? "border-primary bg-primary/10 font-bold text-primary"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
              >
                Hidden Vent (+Roll Screen)
              </button>
            )}
            {currentItem.screenOnlyPrice && (
              <button
                type="button"
                onClick={() => setVentType("screen_only")}
                className={`px-3 py-2 text-xs text-left rounded-lg border font-medium transition-all ${
                  ventType === "screen_only"
                    ? "border-primary bg-primary/10 font-bold text-primary"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
              >
                Screen Only
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Door Swing
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setSwing("outswing")}
              className={`px-3 py-2 text-xs text-left rounded-lg border font-medium transition-all ${
                swing === "outswing"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              Standard Outswing
            </button>
            {currentItem.inswingPrice && (
              <button
                type="button"
                onClick={() => setSwing("inswing")}
                className={`px-3 py-2 text-xs text-left rounded-lg border font-medium transition-all ${
                  swing === "inswing"
                    ? "border-primary bg-primary/10 font-bold text-primary"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
              >
                Inswing (Papaiz Lever &amp; Sill)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Papaiz Lever Finish on Inswing */}
      {swing === "inswing" && setPapaizFinish && (
        <div className="space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <label className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Papaiz Lever Finish
          </label>
          <div className="flex gap-2">
            {(["Satin Chrome", "Brass", "Black"] as PapaizFinish[]).map((fin) => (
              <button
                key={fin}
                type="button"
                onClick={() => setPapaizFinish(fin)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold border transition-all ${
                  papaizFinish === fin
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                {fin}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Engine */}
      <StormDoorColorPicker
        color={color}
        setColor={setColor}
        colorList={colorList}
        isCustomPaint={isCustomPaint}
        setIsCustomPaint={setIsCustomPaint}
        isDoubleDoorCustomPaint={isDoubleDoorCustomPaint}
        setIsDoubleDoorCustomPaint={setIsDoubleDoorCustomPaint}
      />

      {/* Add-ons & Option Upgrade Selection */}
      <div className="space-y-2 pt-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Available Add-ons &amp; Upgrades
        </label>
        <div className="space-y-1.5">
          {filteredAddons.map((addon) => (
            <StormDoorAddonRow
              key={addon.id}
              addon={addon}
              isSelected={selectedAddons.includes(addon.id)}
              currentMode={addonModes[addon.id] || "included"}
              onToggle={() => toggleAddon(addon.id)}
              onSetMode={setAddonMode ? (mode) => setAddonMode(addon.id, mode) : undefined}
            />
          ))}
          {filteredAddons.length === 0 && (
            <div className="p-3 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
              No additional options applicable for this model configuration.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
