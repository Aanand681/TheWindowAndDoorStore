"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DoorPreset, DoorCategory, DoorHardwareType } from "@/lib/doors/types"

interface DoorPresetSpecsSectionProps {
  doorType: DoorCategory
  onDoorTypeChange: (type: DoorCategory) => void
  typeOptions: DoorPreset[]
  selectedPresetId: string
  onOptionChange: (presetId: string) => void
  quantity: string
  setQuantity: (qty: string) => void
  inksterBasePrice: string
  setInksterBasePrice: (price: string) => void
  labourInput: string
  setLabourInput: (val: string) => void
  miscInput: string
  setMiscInput: (val: string) => void
  hardwareType: DoorHardwareType
  setHardwareType: (type: DoorHardwareType) => void
  customDescription: string
  setCustomDescription: (desc: string) => void
  currentPreset?: DoorPreset
}

export function DoorPresetSpecsSection({
  doorType,
  onDoorTypeChange,
  typeOptions,
  selectedPresetId,
  onOptionChange,
  quantity,
  setQuantity,
  inksterBasePrice,
  setInksterBasePrice,
  labourInput,
  setLabourInput,
  miscInput,
  setMiscInput,
  hardwareType,
  setHardwareType,
  customDescription,
  setCustomDescription,
  currentPreset,
}: DoorPresetSpecsSectionProps) {
  return (
    <div className="space-y-2.5">
      {/* Row 1: Single Row Grid with Door Type, Option, Qty, Price, Labour, Misc, Hardware */}
      <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-4 lg:grid-cols-[2fr_3fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr]">
        {/* Dropdown 1: Door Type (Clean, no discount shown) */}
        <div className="col-span-2 space-y-1 sm:col-span-2 lg:col-span-1">
          <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Door Type
          </Label>
          <select
            value={doorType}
            onChange={(e) => onDoorTypeChange(e.target.value as DoorCategory)}
            className="h-8.5 w-full rounded-lg border border-input bg-background px-2 text-xs font-medium shadow-xs focus:ring-1 focus:ring-ring"
          >
            <option value="entry">Entry Door</option>
            <option value="patio">Patio Door</option>
            <option value="garden">Garden Door</option>
            <option value="storm">Storm Door</option>
          </select>
        </div>

        {/* Dropdown 2: Cascading Option based on Door Type */}
        <div className="col-span-2 space-y-1 sm:col-span-2 lg:col-span-1">
          <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Option
          </Label>
          <select
            value={selectedPresetId}
            onChange={(e) => onOptionChange(e.target.value)}
            className="h-8.5 w-full truncate rounded-lg border border-input bg-background px-2 text-xs font-medium shadow-xs focus:ring-1 focus:ring-ring"
          >
            {typeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Qty */}
        <div className="col-span-1 space-y-1 sm:col-span-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Qty
          </Label>
          <Input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => {
              const val = parseInt(quantity, 10)
              if (isNaN(val) || val < 1) setQuantity("1")
            }}
            className="h-8.5 [appearance:textfield] text-center font-mono text-xs font-semibold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {/* Price ($) - 1.5 Col */}
        <div className="col-span-1 space-y-1 sm:col-span-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold tracking-wider text-primary uppercase">
            Price ($)
          </Label>
          <div className="relative">
            <span className="absolute top-1/2 left-2 -translate-y-1/2 text-xs text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              required
              value={inksterBasePrice}
              onChange={(e) => setInksterBasePrice(e.target.value)}
              placeholder="0.00"
              className="h-8.5 [appearance:textfield] border-primary/40 bg-primary/5 pl-5 text-right font-mono text-xs font-bold focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Labour ($) - 1.5 Col */}
        <div className="col-span-1 space-y-1 sm:col-span-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Labour ($)
          </Label>
          <Input
            type="number"
            step="any"
            value={labourInput}
            onChange={(e) => setLabourInput(e.target.value)}
            placeholder="0.00"
            className="h-8.5 [appearance:textfield] text-right font-mono text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {/* Misc ($) - 1.5 Col */}
        <div className="col-span-1 space-y-1 sm:col-span-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Misc ($)
          </Label>
          <Input
            type="number"
            step="any"
            value={miscInput}
            onChange={(e) => setMiscInput(e.target.value)}
            placeholder="0.00"
            className="h-8.5 [appearance:textfield] text-right font-mono text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {/* Hardware Dropdown - 1.5 Col */}
        <div className="col-span-2 space-y-1 sm:col-span-2 lg:col-span-1">
          <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Hardware
          </Label>
          <select
            value={hardwareType === "customer_supplied" ? "none" : hardwareType}
            onChange={(e) =>
              setHardwareType(e.target.value as DoorHardwareType)
            }
            className="h-8.5 w-full rounded-lg border border-input bg-background px-1.5 text-xs font-medium shadow-xs focus:ring-1 focus:ring-ring"
          >
            <option value="standard">Standard Set</option>
            <option value="custom">Custom Set</option>
            <option value="none">None / Reinstall</option>
          </select>
        </div>
      </div>

      {/* Row 2: Door Description / Specification */}
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Door Description
        </Label>
        <Input
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder={
            currentPreset?.description?.trim() ||
            currentPreset?.label ||
            "Enter door specifications"
          }
          className="h-8.5 bg-background text-xs font-medium"
        />
      </div>
    </div>
  )
}
