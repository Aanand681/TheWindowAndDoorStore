"use client"

import React, { useEffect, useRef } from "react"
import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Columns2,
  Maximize2,
} from "lucide-react"
import {
  INVOICE_BLOCK_LABELS,
  type BlockSlotSide,
  type InvoiceBlockId,
  type LayoutContextAction,
} from "@/lib/quotes/invoice-layout-engine"

const WIDTH_RATIOS = [35, 40, 45, 50, 55, 60, 65, 70] as const

export interface BlockContextMenuProps {
  blockId: InvoiceBlockId
  x: number
  y: number
  isSplit: boolean
  activeWidthPct: number
  side: BlockSlotSide
  onAction: (action: LayoutContextAction) => void
  onClose: () => void
}

/**
 * Floating context menu for moving, splitting, swapping, and resizing Universal PDF card blocks.
 */
export function BlockContextMenu({
  blockId,
  x,
  y,
  isSplit,
  activeWidthPct,
  onAction,
  onClose,
}: BlockContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleOutside = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("pointerdown", handleOutside)
    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("pointerdown", handleOutside)
      window.removeEventListener("keydown", handleKey)
    }
  }, [onClose])

  const left = typeof window !== "undefined" ? Math.max(8, Math.min(window.innerWidth - 252, x)) : x
  const top = typeof window !== "undefined" ? Math.max(8, Math.min(window.innerHeight - 335, y)) : y

  const trigger = (action: LayoutContextAction) => {
    onAction(action)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      style={{ left, top }}
      onContextMenu={(e) => e.preventDefault()}
      className="no-print fixed z-[9999] w-[240px] rounded-[10px] border border-[#334155] bg-[#0f172a] p-1.5 text-[11px] font-medium text-[#f8fafc] shadow-2xl print:hidden"
    >
      <div className="mb-1 flex items-center justify-between border-b border-[#1e293b] px-2 py-1 text-[10px] font-bold tracking-wider text-[#94a3b8] uppercase">
        <span className="truncate">{INVOICE_BLOCK_LABELS[blockId]}</span>
        <span className="shrink-0 text-[#cbd5e1]">{activeWidthPct}% Width</span>
      </div>

      {isSplit && (
        <button
          type="button"
          onClick={() => trigger({ type: "make_full", blockId })}
          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-[#1e293b]"
        >
          <span>Make Full Width (100%)</span>
          <Maximize2 className="h-3.5 w-3.5 text-[#94a3b8]" />
        </button>
      )}

      <button
        type="button"
        onClick={() => trigger({ type: "move_side", blockId, targetSide: "left" })}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-[#1e293b]"
      >
        <span>Move / Place Left</span>
        <ArrowLeft className="h-3.5 w-3.5 text-[#94a3b8]" />
      </button>

      <button
        type="button"
        onClick={() => trigger({ type: "move_side", blockId, targetSide: "right" })}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-[#1e293b]"
      >
        <span>Move / Place Right</span>
        <ArrowRight className="h-3.5 w-3.5 text-[#94a3b8]" />
      </button>

      {isSplit && (
        <button
          type="button"
          onClick={() => trigger({ type: "swap_sides", blockId })}
          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-[#1e293b]"
        >
          <span>Swap Left ↔ Right Columns</span>
          <ArrowLeftRight className="h-3.5 w-3.5 text-[#94a3b8]" />
        </button>
      )}

      <button
        type="button"
        onClick={() => trigger({ type: "divide_row", blockId })}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-[#1e293b]"
      >
        <span>{isSplit ? "Divide Split into Full Rows" : "Pair Side-by-Side (50/50)"}</span>
        <Columns2 className="h-3.5 w-3.5 text-[#94a3b8]" />
      </button>

      <div className="my-1.5 h-px bg-[#1e293b]" />

      <div className="px-2 pb-1 text-[9px] font-bold tracking-wider text-[#94a3b8] uppercase">
        Width of This Card
      </div>
      <div className="flex flex-wrap gap-1 px-2 pb-1">
        {WIDTH_RATIOS.map((pct) => {
          const isActive = activeWidthPct === pct
          return (
            <button
              key={pct}
              type="button"
              onClick={() => trigger({ type: "set_width", blockId, pct })}
              className={`rounded border px-1.5 py-0.5 text-[10px] font-bold transition ${
                isActive
                  ? "border-[#818cf8] bg-[#4f46e5] text-white"
                  : "border-[#334155] bg-[#1e293b] text-[#e2e8f0] hover:bg-[#334155]"
              }`}
            >
              {pct}%
            </button>
          )
        })}
      </div>

      <div className="my-1.5 h-px bg-[#1e293b]" />

      <button
        type="button"
        onClick={() => trigger({ type: "move_row", blockId, direction: -1 })}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-[#1e293b]"
      >
        <span>Move Up</span>
        <ArrowUp className="h-3.5 w-3.5 text-[#94a3b8]" />
      </button>

      <button
        type="button"
        onClick={() => trigger({ type: "move_row", blockId, direction: 1 })}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-[#1e293b]"
      >
        <span>Move Down</span>
        <ArrowDown className="h-3.5 w-3.5 text-[#94a3b8]" />
      </button>
    </div>
  )
}
