"use client"

import React from "react"
import { StormDoorStyle, StormDoorVentType, StormDoorSwing } from "@/lib/doors/storm-door-types"
import { StormDoorGraphic } from "../storm/StormDoorGraphics"

export interface StormDoorStudioHeroProps {
  style: StormDoorStyle
  name: string
  color: string
  isCustomPaint: boolean
  swing: StormDoorSwing
  ventType: StormDoorVentType
}

export function StormDoorStudioHero({
  style,
  name,
  color,
  isCustomPaint,
  swing,
  ventType,
}: StormDoorStudioHeroProps) {
  return (
    <div className="md:col-span-5 p-6 flex flex-col items-center justify-between bg-muted/10 overflow-y-auto">
      <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-wider">Live Model Preview</span>
        <span className="font-mono text-[11px] bg-background/80 px-2 py-0.5 rounded border border-border/60">
          {name}
        </span>
      </div>

      <div className="my-auto py-4 flex flex-col items-center justify-center">
        <div className="h-72 w-44 drop-shadow-xl transition-all duration-300">
          <StormDoorGraphic style={style} color={color} width={176} height={288} />
        </div>
      </div>

      <div className="w-full p-2.5 rounded-xl border border-border/70 bg-card/80 text-center space-y-1">
        <div className="text-xs font-bold text-foreground">
          Color: {color} {isCustomPaint && "(Custom Paint)"}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">
          Swing: {swing.toUpperCase()} • Vent: {ventType.replace("_", " ").toUpperCase()}
        </div>
      </div>
    </div>
  )
}
