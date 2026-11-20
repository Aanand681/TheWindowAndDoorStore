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
    if (addon.applicableStyles && addon.applicableStyles.length > 0) {
      if (!addon.applicableStyles.includes(style)) return false
    }
    if (addon.applicableSwings && addon.applicableSwings.length > 0) {
      if (!addon.applicableSwings.includes(swing)) return false
    }
    return true
  })

  return (
    <div className="p-4 md:col-span-7 space-y-3 overflow-y-auto">
      {style !== "project_self_storing" && (
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase">
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
                {p} Frame
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Vent Type & Swing */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase">
            Vent Type
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setVentType("standard")}
              className={`px-2.5 py-1.5 text-xs text-left rounded-lg border font-medium ${
                ventType === "standard"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-input bg-background"
              }`}
            >
              Standard
            </button>
            {currentItem.hiddenVentPrice && (
              <button
                type="button"
                onClick={() => setVentType("hidden_vent")}
                className={`px-2.5 py-1.5 text-xs text-left rounded-lg border font-medium ${
                  ventType === "hidden_vent"
                    ? "border-primary bg-primary/10 font-bold text-primary"
                    : "border-input bg-background"
                }`}
              >
                Hidden Vent (+Roll Screen)
              </button>
            )}
            {currentItem.screenOnlyPrice && (
              <button
                type="button"
                onClick={() => setVentType("screen_only")}
                className={`px-2.5 py-1.5 text-xs text-left rounded-lg border font-medium ${
                  ventType === "screen_only"
                    ? "border-primary bg-primary/10 font-bold text-primary"
                    : "border-input bg-background"
                }`}
              >
                Screen Only
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase">
            Swing
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setSwing("outswing")}
              className={`px-2.5 py-1.5 text-xs text-left rounded-lg border font-medium ${
                swing === "outswing"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-input bg-background"
              }`}
            >
              Standard Outswing
            </button>
            {currentItem.inswingPrice && (
              <button
                type="button"
                onClick={() => setSwing("inswing")}
                className={`px-2.5 py-1.5 text-xs text-left rounded-lg border font-medium ${
                  swing === "inswing"
                    ? "border-primary bg-primary/10 font-bold text-primary"
                    : "border-input bg-background"
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
        <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <label className="text-[11px] font-semibold text-primary uppercase">
            Papaiz Lever Finish
          </label>
          <div className="flex gap-2">
            {(["Satin Chrome", "Brass", "Black"] as PapaizFinish[]).map((fin) => (
              <button
                key={fin}
                type="button"
                onClick={() => setPapaizFinish(fin)}
                className={`flex-1 rounded-md px-2 py-1 text-xs font-semibold border ${
                  papaizFinish === fin
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                {fin}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors & Custom Paint */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase">
            Color / Finish
          </label>
          <button
            type="button"
            onClick={() => setIsCustomPaint(!isCustomPaint)}
            className={`text-[11px] font-bold underline ${
              isCustomPaint ? "text-amber-500" : "text-muted-foreground"
            }`}
          >
            {isCustomPaint ? "Custom Paint Active" : "Custom Paint?"}
          </button>
        </div>

        {isCustomPaint && setIsDoubleDoorCustomPaint && (
          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={() => setIsDoubleDoorCustomPaint(false)}
              className={`flex-1 rounded-md px-2 py-1 text-xs border font-medium ${
                !isDoubleDoorCustomPaint
                  ? "bg-amber-500/20 text-amber-600 border-amber-500/50 font-bold"
                  : "bg-muted/40 border-border"
              }`}
            >
              Single Door (+$1,113)
            </button>
            <button
              type="button"
              onClick={() => setIsDoubleDoorCustomPaint(true)}
              className={`flex-1 rounded-md px-2 py-1 text-xs border font-medium ${
                isDoubleDoorCustomPaint
                  ? "bg-amber-500/20 text-amber-600 border-amber-500/50 font-bold"
                  : "bg-muted/40 border-border"
              }`}
            >
              Double French (+$2,184)
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {colorList.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`px-2 py-1 text-xs rounded-md border font-medium ${
                color === c && !isCustomPaint
                  ? "border-primary bg-primary text-primary-foreground font-bold"
                  : "border-border bg-muted/40 hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Add-ons & Option Upgrade Selection */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase">
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
        </div>
      </div>
    </div>
  )
}
