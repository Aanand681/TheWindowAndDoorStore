"use client"

import React from "react"
import { KeyRound, Plus, Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DoorInstallHardwareConfig } from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface DoorHardwareSelection {
  doorId: string
  doorLabel: string
  category?: string
  quantity?: number
  hardwareType: "standard" | "custom" | "none"
  price: number
  customHardwareName?: string
}

export interface DoorHardwareCompareSectionProps {
  totalDoorCount: number
  config: DoorInstallHardwareConfig
  onChangeConfig: (config: DoorInstallHardwareConfig) => void
  standardPrice?: number
}

function StepperInput({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  return (
    <div className="flex items-center rounded-md border border-input bg-background shadow-xs">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-7 w-6 cursor-pointer text-muted-foreground hover:bg-muted"
      >
        -
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="h-7 w-10 text-center font-mono text-xs font-bold outline-hidden"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-7 w-6 cursor-pointer text-muted-foreground hover:bg-muted"
      >
        +
      </button>
    </div>
  )
}

export function DoorHardwareCompareSection({
  totalDoorCount,
  config,
  onChangeConfig,
  standardPrice = 158.0,
}: DoorHardwareCompareSectionProps) {
  const updateConfig = (updates: Partial<DoorInstallHardwareConfig>) => {
    const next = { ...config, ...updates }
    const stdCost = next.standardQty * next.standardPrice
    const custCost = next.hasCustom ? next.customQty * next.customPrice : 0
    const totalQty = next.standardQty + (next.hasCustom ? next.customQty : 0)
    const totalPrice = Math.round((stdCost + custCost) * 100) / 100

    onChangeConfig({
      ...next,
      totalQty,
      totalPrice,
    })
  }

  return (
    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-1.5 text-primary">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              Locksets &amp; Deadbolts for Installation
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Configure standard or custom locksets for Option 2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              updateConfig({
                type: "standard",
                standardQty: totalDoorCount,
                hasCustom: false,
                customQty: 0,
              })
            }
            className="h-7 cursor-pointer px-2 text-[11px] font-semibold text-primary hover:bg-primary/10"
          >
            All Doors ({totalDoorCount})
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              updateConfig({ standardQty: 0, hasCustom: false, customQty: 0 })
            }
            className="h-7 cursor-pointer px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* Row 1: Primary Hardware Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:flex-nowrap">
        <div className="flex items-center gap-2">
          <span className="w-10 text-[11px] font-bold text-muted-foreground uppercase">
            Type:
          </span>
          <Select
            value={config.type}
            onValueChange={(val) => {
              if (val === "standard") {
                updateConfig({ type: "standard", standardPrice })
              } else if (val === "custom") {
                updateConfig({ type: "custom" })
              }
            }}
          >
            <SelectTrigger className="h-8 w-44 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">
                Standard (${standardPrice.toFixed(2)})
              </SelectItem>
              <SelectItem value="custom">Custom Lockset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Qty:</span>
            <StepperInput
              value={config.standardQty}
              onChange={(val) => updateConfig({ standardQty: val })}
            />
          </div>

          {config.type === "custom" && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">@ $</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={config.standardPrice || ""}
                onChange={(e) =>
                  updateConfig({
                    standardPrice: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="h-7 w-20 text-xs font-mono font-medium"
                placeholder="220.00"
              />
            </div>
          )}

          <div className="min-w-[70px] text-right font-mono text-xs font-bold text-foreground">
            ${(config.standardQty * config.standardPrice).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Row 2: Secondary / Custom Hardware (when mixing standard + custom) */}
      {config.hasCustom && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-2 text-xs sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-10 text-[11px] font-bold text-muted-foreground uppercase">
              Custom:
            </span>
            <span className="text-xs font-semibold text-foreground">
              Custom Lockset
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Qty:</span>
              <StepperInput
                value={config.customQty}
                onChange={(val) => updateConfig({ customQty: val })}
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">@ $</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={config.customPrice || ""}
                onChange={(e) =>
                  updateConfig({
                    customPrice: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="h-7 w-20 text-xs font-mono font-medium"
                placeholder="220.00"
              />
            </div>

            <div className="min-w-[70px] text-right font-mono text-xs font-bold text-foreground">
              ${(config.customQty * config.customPrice).toFixed(2)}
            </div>

            <button
              type="button"
              onClick={() => updateConfig({ hasCustom: false, customQty: 0 })}
              title="Remove Custom Hardware"
              className="cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer / Add button and Total Badge */}
      <div className="flex items-center justify-between border-t border-primary/10 pt-2 text-xs">
        <div>
          {!config.hasCustom && config.type === "standard" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateConfig({
                  hasCustom: true,
                  customQty: 1,
                  customPrice: 220.0,
                })
              }
              className="h-7 cursor-pointer text-[11px] font-semibold text-primary"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Custom Locksets
            </Button>
          )}
        </div>

        <div className="text-right font-medium">
          <span className="text-muted-foreground">Total Hardware: </span>
          <span className="font-mono font-bold text-primary">
            {config.totalQty > 0
              ? `${config.totalQty} Locksets & Deadbolts = $${config.totalPrice.toFixed(2)}`
              : "$0.00"}
          </span>
        </div>
      </div>
    </div>
  )
}
