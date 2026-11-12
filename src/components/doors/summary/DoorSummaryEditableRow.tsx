"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, RotateCcw, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface DoorSummaryEditableRowProps {
  field: "labour" | "misc"
  label: string
  amount: number
  customVal: string
  defaultAmount: number
  isInstallation: boolean
  editingField: "labour" | "misc" | null
  setEditingField: (field: "labour" | "misc" | null) => void
  tempEditVal: string
  setTempEditVal: (val: string) => void
  setter?: (val: string) => void
  suffix?: string
}

export function DoorSummaryEditableRow({
  field,
  label,
  amount,
  customVal,
  defaultAmount,
  isInstallation,
  editingField,
  setEditingField,
  tempEditVal,
  setTempEditVal,
  setter,
  suffix,
}: DoorSummaryEditableRowProps) {
  const isEditing = editingField === field
  const isCustom = customVal !== ""

  if (isEditing && setter) {
    return (
      <div
        key={field}
        className="my-1 flex animate-in items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/10 p-1.5 duration-150 fade-in"
      >
        <span className="shrink-0 text-[11px] font-semibold text-primary">
          Edit {label}:
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="font-mono text-xs text-muted-foreground">$</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={tempEditVal}
            onChange={(e) => setTempEditVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setter(tempEditVal)
                setEditingField(null)
                toast.success(
                  `Updated ${label} to $${Number(tempEditVal || 0).toFixed(2)}`
                )
              } else if (e.key === "Escape") {
                setEditingField(null)
              }
            }}
            className="h-6 w-24 bg-background px-1.5 py-0 text-right font-mono text-xs"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={() => {
              setter(tempEditVal)
              setEditingField(null)
              toast.success(
                `Updated ${label} to $${Number(tempEditVal || 0).toFixed(2)}`
              )
            }}
            className="h-6 cursor-pointer px-2 text-[10px] font-bold"
          >
            Save
          </Button>
          {isCustom && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setter("")
                setEditingField(null)
                toast.info(
                  `Reset ${label} to default ($${defaultAmount.toFixed(2)})`
                )
              }}
              className="h-6 cursor-pointer px-1.5 text-[10px]"
              title="Reset to default calculated price"
            >
              Reset
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditingField(null)}
            className="h-6 cursor-pointer px-1 text-[10px]"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      key={field}
      className="group flex items-center justify-between py-0.5 text-xs"
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-muted-foreground">
          {label}{" "}
          {suffix && (
            <span className="text-[10px] text-muted-foreground/70">
              {suffix}
            </span>
          )}
        </span>
        {isCustom && (
          <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
            custom
          </span>
        )}
        {isCustom && setter && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setter("")
              toast.info(
                `Reset ${label} to default ($${defaultAmount.toFixed(2)})`
              )
            }}
            className="h-5 shrink-0 cursor-pointer px-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
            title="Reset to default calculated price"
          >
            <RotateCcw className="mr-0.5 h-2.5 w-2.5" />
            Reset
          </Button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={cn(
            "font-mono whitespace-nowrap",
            amount === 0
              ? "text-xs text-muted-foreground"
              : isCustom
                ? "font-bold text-primary"
                : "font-medium text-foreground"
          )}
        >
          ${amount.toFixed(2)}
        </span>
        {setter && isInstallation && (
          <button
            type="button"
            onClick={() => {
              setEditingField(field)
              setTempEditVal(isCustom ? customVal : amount.toFixed(2))
            }}
            className="cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            title={`Edit ${label} price`}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
