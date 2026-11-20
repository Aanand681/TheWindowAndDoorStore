"use client"

import React from "react"
import { StormDoorStyle } from "@/lib/doors/storm-door-types"
import { getStormDoorColorStyles } from "./storm-door-colors"

interface StormDoorGraphicProps {
  style: StormDoorStyle
  color?: string
  className?: string
  width?: number
  height?: number
}

export function StormDoorGraphic({
  style,
  color = "White",
  className = "w-full h-full",
  width = 64,
  height = 120,
}: StormDoorGraphicProps) {
  const c = getStormDoorColorStyles(color)

  return (
    <svg
      viewBox="0 0 64 120"
      width={width}
      height={height}
      className={`select-none drop-shadow-sm transition-transform duration-200 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Realistic fine charcoal screen mesh pattern */}
        <pattern id="storm-screen-mesh" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="#2d3748" fillOpacity="0.4" />
          <path d="M 0 1.5 L 3 1.5 M 1.5 0 L 1.5 3" stroke="#1a202c" strokeWidth="0.5" strokeOpacity="0.5" />
        </pattern>
      </defs>

      {/* Outer Door Frame */}
      <rect x="2" y="2" width="60" height="116" rx="2" fill={c.outerFill} stroke={c.outerStroke} strokeWidth="2.5" />
      {/* Inner Sash Bevel */}
      <rect x="6" y="6" width="52" height="108" rx="1" fill={c.innerFill} stroke={c.outerStroke} strokeWidth="1.2" />

      {/* 1. ONE-LITE (Tall glass ~88%, solid bottom rail ~12%) */}
      {style === "one_lite" && (
        <g>
          <rect x="8" y="8" width="48" height="94" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/50" strokeWidth="1" />
          <path d="M12 18 L52 18 M12 22 L40 22" className="stroke-sky-300/40" strokeWidth="0.8" strokeDasharray="3 3" />
          <rect x="8" y="103" width="48" height="9" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
          <line x1="12" y1="107" x2="52" y2="107" stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* 2. FULL-VIEW (Narrow sash, maximum glass ~94%, ultra-slim bottom rail ~6%) */}
      {style === "full_view" && (
        <g>
          <rect x="7" y="7" width="50" height="102" className="fill-cyan-100/70 dark:fill-cyan-950/40 stroke-cyan-400/60" strokeWidth="1" />
          <path d="M11 16 L53 16 M11 20 L42 20" className="stroke-cyan-300/40" strokeWidth="0.8" strokeDasharray="3 3" />
          <rect x="7" y="110" width="50" height="4" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* 3. SELF-STORING (Top vent glass ~35%, middle sliding glass ~35%, ~30% kick plate) */}
      {style === "self_storing" && (
        <g>
          <rect x="9" y="9" width="46" height="34" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <rect x="9" y="44" width="46" height="34" className="fill-sky-100/40 dark:fill-sky-950/30 stroke-sky-400/40" strokeWidth="1" />
          <rect x="9" y="79" width="46" height="33" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
          <line x1="14" y1="90" x2="50" y2="90" stroke={c.kickStroke} strokeWidth="1" />
          <line x1="14" y1="101" x2="50" y2="101" stroke={c.kickStroke} strokeWidth="1" />
        </g>
      )}

      {/* 4. HI-VIEW (~55% upper glass, ~45% SCREEN on bottom) */}
      {style === "hi_view" && (
        <g>
          {/* Upper Glass (~55%) */}
          <rect x="8" y="8" width="48" height="55" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <path d="M12 18 L52 18" className="stroke-sky-300/40" strokeWidth="0.8" strokeDasharray="3 3" />
          {/* Painted Divider Rail */}
          <rect x="8" y="63" width="48" height="4.5" fill={c.outerFill} stroke={c.outerStroke} strokeWidth="0.8" />
          {/* Bottom Screen (~45%) */}
          <rect x="8" y="67.5" width="48" height="41.5" fill="url(#storm-screen-mesh)" stroke={c.outerStroke} strokeWidth="1" />
          {/* Bottom Wood Rail */}
          <rect x="8" y="109" width="48" height="4.5" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* 5. EXTENDED-VIEW (75% whole glass, painted divider, 20% screen, 5% wood kick rail at bottom) */}
      {style === "extended_view" && (
        <g>
          {/* Upper Whole Glass (~75%) */}
          <rect x="8" y="8" width="48" height="72" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <path d="M12 18 L52 18 M12 22 L38 22" className="stroke-sky-300/40" strokeWidth="0.8" strokeDasharray="3 3" />
          {/* Painted Horizontal Divider Rail */}
          <rect x="8" y="80" width="48" height="4" fill={c.outerFill} stroke={c.outerStroke} strokeWidth="0.8" />
          {/* 20% Screen */}
          <rect x="8" y="84" width="48" height="21" fill="url(#storm-screen-mesh)" stroke={c.outerStroke} strokeWidth="1" />
          {/* 5% Wood Rail at Bottom */}
          <rect x="8" y="106" width="48" height="6.5" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
        </g>
      )}

      {/* 6. TRI-LITE (Bottom 5-7% wood rail, 3 vertical columns with wider middle divided into top glass & bottom screen) */}
      {style === "tri_lite" && (
        <g>
          {/* Left Column: Slim full-height glass */}
          <rect x="8" y="8" width="11" height="97" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="0.8" />
          {/* Left Vertical Painted Mullion */}
          <rect x="19" y="8" width="3.5" height="97" fill={c.outerFill} stroke={c.outerStroke} strokeWidth="0.8" />

          {/* Middle Column (Extra weight / width 17): Top glass + Bottom screen */}
          <rect x="22.5" y="8" width="17" height="46" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="0.8" />
          {/* Center Painted Horizontal Wood Rail */}
          <rect x="22.5" y="54" width="17" height="4.5" fill={c.outerFill} stroke={c.outerStroke} strokeWidth="0.8" />
          {/* Middle Bottom Screen / Sash */}
          <rect x="22.5" y="58.5" width="17" height="46.5" fill="url(#storm-screen-mesh)" stroke={c.outerStroke} strokeWidth="0.8" />

          {/* Right Vertical Painted Mullion */}
          <rect x="39.5" y="8" width="3.5" height="97" fill={c.outerFill} stroke={c.outerStroke} strokeWidth="0.8" />
          {/* Right Column: Slim full-height glass */}
          <rect x="43" y="8" width="11" height="97" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="0.8" />

          {/* Bottom Wood Rail (5-7%) */}
          <rect x="8" y="106" width="48" height="7" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
        </g>
      )}

      {/* 7. TRUE-VIEW 1/2 LITE (Upper 50% glass, painted center divider, Lower 50% screen) */}
      {style === "true_view_half" && (
        <g>
          {/* Upper Glass 50% */}
          <rect x="8" y="8" width="48" height="49" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <line x1="8" y1="12" x2="56" y2="12" stroke={c.outerStroke} strokeWidth="1.2" />
          {/* Center Painted Divider Rail */}
          <rect x="8" y="57" width="48" height="4.5" fill={c.outerFill} stroke={c.outerStroke} strokeWidth="0.8" />
          {/* Bottom Screen 50% */}
          <rect x="8" y="61.5" width="48" height="46" fill="url(#storm-screen-mesh)" stroke={c.outerStroke} strokeWidth="1" />
          {/* Bottom Rail */}
          <rect x="8" y="108" width="48" height="4.5" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* 8. TRUE-VIEW 3/4 LITE (Upper 75% 3/4 Lite glass, painted divider, Lower 25% 1/4 Lite screen) */}
      {style === "true_view_three_quarter" && (
        <g>
          {/* Upper Glass 75% */}
          <rect x="8" y="8" width="48" height="74" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <line x1="8" y1="12" x2="56" y2="12" stroke={c.outerStroke} strokeWidth="1.2" />
          {/* Painted Divider Rail */}
          <rect x="8" y="82" width="48" height="4" fill={c.outerFill} stroke={c.outerStroke} strokeWidth="0.8" />
          {/* Bottom Screen 25% */}
          <rect x="8" y="86" width="48" height="21.5" fill="url(#storm-screen-mesh)" stroke={c.outerStroke} strokeWidth="1" />
          {/* Bottom Rail */}
          <rect x="8" y="108" width="48" height="4.5" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* 9. 1-1/4" PROJECT SELF-STORING (Split sashes with push-button latch) */}
      {style === "project_self_storing" && (
        <g>
          <rect x="9" y="9" width="46" height="40" className="fill-sky-100/50 dark:fill-sky-950/30 stroke-sky-400/40" strokeWidth="1" />
          <rect x="9" y="50" width="46" height="40" className="fill-sky-100/50 dark:fill-sky-950/30 stroke-sky-400/40" strokeWidth="1" />
          <rect x="9" y="91" width="46" height="21" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
          <line x1="14" y1="101" x2="50" y2="101" stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* Hardware Handle (Papaiz/Classic Lever) */}
      <circle cx="53" cy="62" r="2.2" fill={c.handleColor} stroke={c.outerStroke} strokeWidth="0.5" />
      <line x1="53" y1="62" x2="47" y2="62" stroke={c.handleColor} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
