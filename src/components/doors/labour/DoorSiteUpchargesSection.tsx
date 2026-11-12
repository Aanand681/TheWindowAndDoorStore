"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DoorUpchargeConfig, DoorSelectedUpcharge } from "@/lib/doors/types"
import { Wrench, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DoorSiteUpchargesSectionProps {
  availableUpcharges: DoorUpchargeConfig[]
  globalUpcharges: DoorSelectedUpcharge[]
  onUpdateGlobalUpcharges: (upcharges: DoorSelectedUpcharge[]) => void
}

export function DoorSiteUpchargesSection({
  availableUpcharges,
  globalUpcharges,
  onUpdateGlobalUpcharges,
}: DoorSiteUpchargesSectionProps) {
  const [showUpchargesAccordion, setShowUpchargesAccordion] = useState(true)
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({})

  const handleQtyChange = (config: DoorUpchargeConfig, valStr: string) => {
    setQtyInputs((prev) => ({ ...prev, [config.id]: valStr }))
    const valNum = parseFloat(valStr)

    if (isNaN(valNum) || valNum <= 0) {
      onUpdateGlobalUpcharges(
        globalUpcharges.filter((u) => u.upchargeId !== config.id)
      )
    } else {
      const existing = globalUpcharges.find((u) => u.upchargeId === config.id)
      if (existing) {
        onUpdateGlobalUpcharges(
          globalUpcharges.map((u) =>
            u.upchargeId === config.id
              ? {
                  ...u,
                  qty: valNum,
                  total: Math.round(u.rate * valNum * 100) / 100,
                }
              : u
          )
        )
      } else {
        onUpdateGlobalUpcharges([
          ...globalUpcharges,
          {
            upchargeId: config.id,
            label: config.label,
            rate: config.rate,
            qty: valNum,
            total: Math.round(config.rate * valNum * 100) / 100,
          },
        ])
      }
    }
  }

  const globalUpchargesTotal = globalUpcharges.reduce(
    (acc, u) => acc + u.total,
    0
  )

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
      <button
        type="button"
        onClick={() => setShowUpchargesAccordion(!showUpchargesAccordion)}
        className="flex w-full items-center justify-between p-3 text-left text-xs font-semibold transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          <span>
            Jobsite Labour &amp; Upcharges ({globalUpcharges.length} active)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {globalUpchargesTotal > 0 && (
            <span className="font-mono text-xs font-bold text-primary">
              +${globalUpchargesTotal.toFixed(2)}
            </span>
          )}
          {showUpchargesAccordion ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {showUpchargesAccordion && (
        <div className="mt-2 space-y-1.5 border-t border-border/40 p-3 pt-0">
          <div className="space-y-1.5">
            {availableUpcharges.map((upcharge) => {
              const active = globalUpcharges.find(
                (u) => u.upchargeId === upcharge.id
              )
              const isSelected = !!active && active.qty > 0
              const inputValue =
                qtyInputs[upcharge.id] !== undefined
                  ? qtyInputs[upcharge.id]
                  : active
                    ? String(active.qty)
                    : ""

              return (
                <div
                  key={upcharge.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors",
                    isSelected
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/60 hover:bg-muted/20"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="truncate font-medium text-foreground">
                      {upcharge.label}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      ${upcharge.rate.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        Qty:
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={inputValue}
                        onChange={(e) =>
                          handleQtyChange(upcharge, e.target.value)
                        }
                        className="h-7 w-16 bg-background p-1 text-center font-mono text-xs"
                      />
                    </div>
                    <span
                      className={cn(
                        "min-w-[60px] text-right font-mono text-xs font-bold",
                        isSelected ? "text-primary" : "text-muted-foreground/60"
                      )}
                    >
                      ${(active ? active.total : 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Custom Jobsite Labour Items */}
          {globalUpcharges
            .filter(
              (u) =>
                u.upchargeId.startsWith("custom_") ||
                (u as unknown as { isCustom?: boolean }).isCustom
            )
            .map((customU) => (
              <div
                key={customU.upchargeId}
                className="flex animate-in items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/5 p-2 text-xs fade-in"
              >
                <div className="flex-1">
                  <Input
                    placeholder="Custom labour description"
                    value={customU.label}
                    onChange={(e) => {
                      const newLabel = e.target.value
                      onUpdateGlobalUpcharges(
                        globalUpcharges.map((u) =>
                          u.upchargeId === customU.upchargeId
                            ? { ...u, label: newLabel }
                            : u
                        )
                      )
                    }}
                    className="h-7 bg-background text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="Rate"
                      value={customU.rate || ""}
                      onChange={(e) => {
                        const newRate = parseFloat(e.target.value) || 0
                        onUpdateGlobalUpcharges(
                          globalUpcharges.map((u) =>
                            u.upchargeId === customU.upchargeId
                              ? {
                                  ...u,
                                  rate: newRate,
                                  total:
                                    Math.round(newRate * u.qty * 100) / 100,
                                }
                              : u
                          )
                        )
                      }}
                      className="h-7 w-18 bg-background font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      Qty:
                    </span>
                    <Input
                      type="number"
                      step="any"
                      min="0.1"
                      placeholder="Qty"
                      value={customU.qty || ""}
                      onChange={(e) => {
                        const newQty = parseFloat(e.target.value) || 1
                        onUpdateGlobalUpcharges(
                          globalUpcharges.map((u) =>
                            u.upchargeId === customU.upchargeId
                              ? {
                                  ...u,
                                  qty: newQty,
                                  total:
                                    Math.round(u.rate * newQty * 100) / 100,
                                }
                              : u
                          )
                        )
                      }}
                      className="h-7 w-14 bg-background text-center font-mono text-xs"
                    />
                  </div>
                  <span className="min-w-[50px] text-right font-mono font-bold text-primary">
                    ${Number(customU.total || 0).toFixed(2)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onUpdateGlobalUpcharges(
                        globalUpcharges.filter(
                          (u) => u.upchargeId !== customU.upchargeId
                        )
                      )
                    }}
                    className="h-7 w-7 cursor-pointer text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newId = "custom_" + Date.now()
              onUpdateGlobalUpcharges([
                ...globalUpcharges,
                {
                  upchargeId: newId,
                  label: "",
                  rate: 0,
                  qty: 1,
                  total: 0,
                  isCustom: true,
                } as unknown as DoorSelectedUpcharge,
              ])
            }}
            className="mt-2 h-7.5 w-full cursor-pointer border-dashed text-xs text-primary hover:bg-primary/5"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Custom Labour / Upcharge
          </Button>
        </div>
      )}
    </div>
  )
}
