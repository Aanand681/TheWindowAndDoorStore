"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wrench, Plus, Trash2 } from "lucide-react"
import { blockNegativeKey, sanitizeNonNegativeNumber } from "@/lib/input-sanitizers"
import { cn } from "@/lib/utils"

export interface SealedUnitUpchargeItem {
  id: string
  label: string
  price: string | number
}

interface SealedUnitAddOnsSectionProps {
  upcharges: SealedUnitUpchargeItem[]
  onUpdateUpcharges: (items: SealedUnitUpchargeItem[]) => void
  isReadOnly?: boolean
}

export function SealedUnitAddOnsSection({
  upcharges = [],
  onUpdateUpcharges,
  isReadOnly = false,
}: SealedUnitAddOnsSectionProps) {
  const handleAddItem = () => {
    const newItem: SealedUnitUpchargeItem = {
      id: "addon_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      label: "",
      price: "",
    }
    onUpdateUpcharges([...upcharges, newItem])
  }

  const handleUpdateItem = (
    id: string,
    field: "label" | "price",
    value: string
  ) => {
    onUpdateUpcharges(
      upcharges.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleRemoveItem = (id: string) => {
    onUpdateUpcharges(upcharges.filter((item) => item.id !== id))
  }

  const totalAmount = upcharges.reduce((acc, item) => {
    const val = parseFloat(String(item.price)) || 0
    return acc + Math.max(0, val)
  }, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40 p-3 sm:p-3.5">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          <div>
            <span className="text-xs font-bold text-foreground">
              Add-ons / Extra Labour
            </span>
            {upcharges.length > 0 && (
              <span className="ml-2 text-[10px] text-muted-foreground">
                ({upcharges.length} active)
              </span>
            )}
          </div>
        </div>
        {totalAmount > 0 && (
          <span className="font-mono text-xs font-bold text-primary">
            +${totalAmount.toFixed(2)}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Additional labor for high ladder, scaffolding, specialty stops, or custom site services.
      </p>

      {/* Itemized Labour Rows */}
      {upcharges.length > 0 && (
        <div className="mt-2.5 space-y-2">
          {upcharges.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex animate-in items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2 text-xs fade-in"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  disabled={isReadOnly}
                  placeholder="Labour description (e.g. High ladder, scaffolding, specialty stops)"
                  value={item.label}
                  onChange={(e) =>
                    handleUpdateItem(item.id, "label", e.target.value)
                  }
                  className="h-8 bg-background text-xs"
                />
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="text"
                    disabled={isReadOnly}
                    placeholder="0.00"
                    value={item.price}
                    onKeyDown={blockNegativeKey}
                    onChange={(e) =>
                      handleUpdateItem(
                        item.id,
                        "price",
                        sanitizeNonNegativeNumber(e.target.value)
                      )
                    }
                    className="h-8 pl-5.5 text-right font-mono text-xs font-bold bg-background"
                  />
                </div>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-8 w-8 cursor-pointer text-destructive hover:bg-destructive/10"
                    title="Remove labour item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Labour Button */}
      {!isReadOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className={cn(
            "h-8 w-full cursor-pointer border-dashed text-xs text-primary hover:bg-primary/5",
            upcharges.length > 0 ? "mt-2.5" : "mt-2"
          )}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Labour
        </Button>
      )}
    </div>
  )
}
export default SealedUnitAddOnsSection
