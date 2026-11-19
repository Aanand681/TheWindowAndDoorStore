"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  StormDoorCatalogItem,
  StormDoorProfile,
  StormDoorVentType,
  StormDoorSwing,
  StormDoorStyle,
} from "@/lib/doors/storm-door-types"
import { YORK_STORM_ADDONS } from "@/lib/doors/storm-door-catalog"

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
  selectedAddons: string[]
  toggleAddon: (id: string) => void
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
  selectedAddons,
  toggleAddon,
}: StormDoorOptionsPaneProps) {
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

      {/* Colors */}
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
            {isCustomPaint ? "Custom Paint (+$1,113)" : "Custom Paint?"}
          </button>
        </div>
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

      {/* Add-ons */}
      <div className="space-y-1 pt-1">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase">
          Available Add-ons
        </label>
        <div className="space-y-1">
          {YORK_STORM_ADDONS.filter((addon) => {
            if (addon.applicableStyles && !addon.applicableStyles.includes(style)) return false
            if (addon.applicableSwings && !addon.applicableSwings.includes(swing)) return false
            return true
          }).map((addon) => (
            <label
              key={addon.id}
              className="flex items-center justify-between rounded-lg border border-border/70 p-2 text-xs hover:bg-muted/30 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedAddons.includes(addon.id)}
                  onChange={() => toggleAddon(addon.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary"
                />
                <span>{addon.label}</span>
              </div>
              <span className="font-mono font-bold text-primary">
                +${addon.price.toFixed(2)}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
