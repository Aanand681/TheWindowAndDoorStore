"use client"

import React from "react"
import { StormDoorStyle } from "@/lib/doors/storm-door-types"

interface StormDoorGraphicProps {
  style: StormDoorStyle
  className?: string
  width?: number
  height?: number
}

export function StormDoorGraphic({
  style,
  className = "w-full h-full",
  width = 64,
  height = 120,
}: StormDoorGraphicProps) {
  return (
    <svg
      viewBox="0 0 64 120"
      width={width}
      height={height}
      className={`select-none transition-transform hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Door Frame */}
      <rect
        x="2"
        y="2"
        width="60"
        height="116"
        rx="2"
        className="stroke-border fill-muted/30"
        strokeWidth="2.5"
      />
      {/* Inner Frame */}
      <rect
        x="6"
        y="6"
        width="52"
        height="108"
        rx="1"
        className="stroke-muted-foreground/40 fill-background"
        strokeWidth="1.5"
      />

      {/* Style-specific panels */}
      {style === "one_lite" && (
        <rect
          x="10"
          y="10"
          width="44"
          height="100"
          className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/50"
          strokeWidth="1"
        />
      )}

      {style === "full_view" && (
        <g>
          <rect
            x="8"
            y="8"
            width="48"
            height="104"
            className="fill-cyan-100/70 dark:fill-cyan-950/40 stroke-cyan-400/60"
            strokeWidth="1"
          />
          <path
            d="M12 18 L52 18"
            className="stroke-cyan-300/40"
            strokeDasharray="2 2"
          />
        </g>
      )}

      {style === "self_storing" && (
        <g>
          {/* Top Glass / Screen */}
          <rect
            x="10"
            y="10"
            width="44"
            height="34"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          {/* Middle Glass */}
          <rect
            x="10"
            y="46"
            width="44"
            height="34"
            className="fill-sky-100/40 dark:fill-sky-950/30 stroke-sky-400/40"
          />
          {/* Bottom Kick Plate */}
          <rect
            x="10"
            y="82"
            width="44"
            height="28"
            className="fill-muted stroke-border"
          />
          <line x1="14" y1="96" x2="50" y2="96" className="stroke-border" />
        </g>
      )}

      {style === "hi_view" && (
        <g>
          {/* Upper Glass / Screen */}
          <rect
            x="10"
            y="10"
            width="44"
            height="50"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          {/* High Kick Plate */}
          <rect
            x="10"
            y="62"
            width="44"
            height="48"
            className="fill-muted stroke-border"
          />
          <rect
            x="14"
            y="68"
            width="36"
            height="36"
            className="stroke-border/70 fill-muted/60"
            strokeWidth="0.8"
          />
        </g>
      )}

      {style === "extended_view" && (
        <g>
          {/* Tall Glass */}
          <rect
            x="10"
            y="10"
            width="44"
            height="82"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          {/* Low Kick Plate */}
          <rect
            x="10"
            y="94"
            width="44"
            height="16"
            className="fill-muted stroke-border"
          />
        </g>
      )}

      {style === "tri_lite" && (
        <g>
          {/* Pane 1 */}
          <rect
            x="10"
            y="10"
            width="44"
            height="28"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          {/* Pane 2 */}
          <rect
            x="10"
            y="40"
            width="44"
            height="28"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          {/* Pane 3 */}
          <rect
            x="10"
            y="70"
            width="44"
            height="28"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          {/* Small Kick Plate */}
          <rect
            x="10"
            y="100"
            width="44"
            height="10"
            className="fill-muted stroke-border"
          />
        </g>
      )}

      {style === "true_view_half" && (
        <g>
          <rect
            x="10"
            y="10"
            width="44"
            height="46"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="58"
            width="44"
            height="52"
            className="fill-muted stroke-border"
          />
          <line
            x1="10"
            y1="56"
            x2="54"
            y2="56"
            className="stroke-primary"
            strokeWidth="1.5"
          />
        </g>
      )}

      {style === "true_view_three_quarter" && (
        <g>
          <rect
            x="10"
            y="10"
            width="44"
            height="72"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="84"
            width="44"
            height="26"
            className="fill-muted stroke-border"
          />
          <line
            x1="10"
            y1="82"
            x2="54"
            y2="82"
            className="stroke-primary"
            strokeWidth="1.5"
          />
        </g>
      )}

      {style === "project_self_storing" && (
        <g>
          <rect
            x="10"
            y="10"
            width="44"
            height="40"
            className="fill-sky-100/50 dark:fill-sky-950/30 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="52"
            width="44"
            height="40"
            className="fill-sky-100/50 dark:fill-sky-950/30 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="94"
            width="44"
            height="16"
            className="fill-muted stroke-border"
          />
        </g>
      )}

      {/* Latch Handle */}
      <circle cx="53" cy="62" r="2" className="fill-muted-foreground" />
      <line
        x1="53"
        y1="62"
        x2="48"
        y2="62"
        className="stroke-muted-foreground"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
