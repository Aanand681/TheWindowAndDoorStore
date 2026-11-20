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

      {/* 4. HI-VIEW (~55% upper glass, ~45% HIGH kick plate with raised panel) */}
      {style === "hi_view" && (
        <g>
          <rect x="9" y="9" width="46" height="52" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <path d="M12 18 L52 18" className="stroke-sky-300/40" strokeWidth="0.8" strokeDasharray="3 3" />
          <rect x="9" y="62" width="46" height="50" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
          <rect x="14" y="68" width="36" height="38" fill={c.innerFill} stroke={c.kickStroke} strokeWidth="1.2" rx="1" />
          <line x1="17" y1="87" x2="47" y2="87" stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* 5. EXTENDED-VIEW (~80% tall extended glass, ~20% low kick plate) */}
      {style === "extended_view" && (
        <g>
          <rect x="9" y="9" width="46" height="84" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <path d="M12 18 L52 18 M12 22 L38 22" className="stroke-sky-300/40" strokeWidth="0.8" strokeDasharray="3 3" />
          <rect x="9" y="94" width="46" height="18" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
          <line x1="14" y1="103" x2="50" y2="103" stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* 6. TRI-LITE (3 vertical lites on top ~60%, 3 matching vertical kick panels on bottom ~40%) */}
      {style === "tri_lite" && (
        <g>
          <rect x="9" y="9" width="13" height="58" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="0.8" />
          <rect x="23" y="9" width="18" height="58" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="0.8" />
          <rect x="42" y="9" width="13" height="58" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="0.8" />
          <rect x="9" y="68" width="46" height="44" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
          <rect x="11" y="71" width="11" height="38" fill={c.innerFill} stroke={c.kickStroke} strokeWidth="0.8" />
          <rect x="24" y="71" width="16" height="38" fill={c.innerFill} stroke={c.kickStroke} strokeWidth="0.8" />
          <rect x="42" y="71" width="11" height="38" fill={c.innerFill} stroke={c.kickStroke} strokeWidth="0.8" />
        </g>
      )}

      {/* 7. TRUE-VIEW 1/2 LITE (Exactly 50% glass, 50% lower panel with hidden vent) */}
      {style === "true_view_half" && (
        <g>
          <rect x="9" y="9" width="46" height="48" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <line x1="9" y1="12" x2="55" y2="12" stroke={c.outerStroke} strokeWidth="1.5" />
          <rect x="9" y="58" width="46" height="54" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
          <rect x="14" y="64" width="36" height="42" fill={c.innerFill} stroke={c.kickStroke} strokeWidth="1" rx="1" />
        </g>
      )}

      {/* 8. TRUE-VIEW 3/4 LITE (~72% glass, ~28% lower panel with hidden vent) */}
      {style === "true_view_three_quarter" && (
        <g>
          <rect x="9" y="9" width="46" height="74" className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40" strokeWidth="1" />
          <line x1="9" y1="12" x2="55" y2="12" stroke={c.outerStroke} strokeWidth="1.5" />
          <rect x="9" y="84" width="46" height="28" fill={c.kickFill} stroke={c.kickStroke} strokeWidth="1" />
          <rect x="14" y="88" width="36" height="20" fill={c.innerFill} stroke={c.kickStroke} strokeWidth="0.8" rx="1" />
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
