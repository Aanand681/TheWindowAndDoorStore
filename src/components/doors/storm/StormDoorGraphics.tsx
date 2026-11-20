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
        fill={c.outerFill}
        stroke={c.outerStroke}
        strokeWidth="2.5"
      />
      {/* Inner Frame */}
      <rect
        x="6"
        y="6"
        width="52"
        height="108"
        rx="1"
        fill={c.innerFill}
        stroke={c.outerStroke}
        strokeWidth="1.2"
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
          <rect
            x="10"
            y="10"
            width="44"
            height="34"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="46"
            width="44"
            height="34"
            className="fill-sky-100/40 dark:fill-sky-950/30 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="82"
            width="44"
            height="28"
            fill={c.kickFill}
            stroke={c.kickStroke}
          />
          <line x1="14" y1="96" x2="50" y2="96" stroke={c.kickStroke} />
        </g>
      )}

      {style === "hi_view" && (
        <g>
          <rect
            x="10"
            y="10"
            width="44"
            height="50"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="62"
            width="44"
            height="48"
            fill={c.kickFill}
            stroke={c.kickStroke}
          />
          <rect
            x="14"
            y="68"
            width="36"
            height="36"
            stroke={c.kickStroke}
            fill={c.innerFill}
            strokeWidth="0.8"
          />
        </g>
      )}

      {style === "extended_view" && (
        <g>
          <rect
            x="10"
            y="10"
            width="44"
            height="86"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="98"
            width="44"
            height="12"
            fill={c.kickFill}
            stroke={c.kickStroke}
          />
        </g>
      )}

      {style === "tri_lite" && (
        <g>
          <rect
            x="10"
            y="10"
            width="44"
            height="26"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="38"
            width="44"
            height="26"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="66"
            width="44"
            height="26"
            className="fill-sky-100/60 dark:fill-sky-950/40 stroke-sky-400/40"
          />
          <rect
            x="10"
            y="94"
            width="44"
            height="16"
            fill={c.kickFill}
            stroke={c.kickStroke}
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
            fill={c.kickFill}
            stroke={c.kickStroke}
          />
          <line
            x1="10"
            y1="56"
            x2="54"
            y2="56"
            stroke={c.outerStroke}
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
            fill={c.kickFill}
            stroke={c.kickStroke}
          />
          <line
            x1="10"
            y1="82"
            x2="54"
            y2="82"
            stroke={c.outerStroke}
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
            fill={c.kickFill}
            stroke={c.kickStroke}
          />
        </g>
      )}

      {/* Latch Handle */}
      <circle cx="53" cy="62" r="2" fill={c.handleColor} />
      <line
        x1="53"
        y1="62"
        x2="48"
        y2="62"
        stroke={c.handleColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
