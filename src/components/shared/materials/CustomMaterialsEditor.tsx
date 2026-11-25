"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { CustomMaterialItem } from "@/types/calculator"

export interface CustomMaterialsEditorProps {
  materials: CustomMaterialItem[]
  onMaterialsChange?: (mats: CustomMaterialItem[]) => void
  isReadOnly?: boolean
  placeholder?: string
  showHeader?: boolean
  className?: string
}

/**
 * Shared repeatable list editor for Custom / Additional Materials eligible for
 * Ontario First Nation 8% Point-of-Sale Material Exemption.
 */
export function CustomMaterialsEditor({
  materials = [],
  onMaterialsChange,
  isReadOnly = false,
  placeholder = "e.g. Jamb as stop",
  showHeader = true,
  className = "",
}: CustomMaterialsEditorProps) {
  const handleLabelChange = (index: number, label: string) => {
    if (!onMaterialsChange) return
    const updated = [...materials]
    updated[index] = { ...updated[index], label }
    onMaterialsChange(updated)
  }

  const handleAmountChange = (index: number, val: string) => {
    if (!onMaterialsChange) return
    const updated = [...materials]
    updated[index] = {
      ...updated[index],
      amount: parseFloat(val) || 0,
    }
    onMaterialsChange(updated)
  }

  const handleRemove = (id: string) => {
    if (!onMaterialsChange) return
    onMaterialsChange(materials.filter((m) => m.id !== id))
  }

  const handleAdd = () => {
    if (!onMaterialsChange) return
    const newMat: CustomMaterialItem = {
      id: `mat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: "",
      amount: 0,
    }
    onMaterialsChange([...materials, newMat])
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <Label className="text-xs font-semibold text-muted-foreground">
            Additional Materials
          </Label>
          <span className="font-mono text-[11px] text-muted-foreground">
            (Eligible for Material Exemption)
          </span>
        </div>
      )}

      {materials.length > 0 && (
        <div className="mb-2 space-y-2">
          {materials.map((mat, index) => (
            <div key={mat.id} className="flex items-center gap-2">
              <Input
                disabled={isReadOnly || !onMaterialsChange}
                placeholder={placeholder}
                className="h-8 flex-1 text-xs"
                value={mat.label}
                onChange={(e) => handleLabelChange(index, e.target.value)}
              />
              <div className="relative w-24 shrink-0">
                <span className="absolute top-2 left-2 text-xs text-muted-foreground">
                  $
                </span>
                <Input
                  disabled={isReadOnly || !onMaterialsChange}
                  type="number"
                  placeholder="0.00"
                  className="h-8 pl-5 font-mono text-xs"
                  value={mat.amount || ""}
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                />
              </div>
              {!isReadOnly && onMaterialsChange && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive"
                  onClick={() => handleRemove(mat.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isReadOnly && onMaterialsChange && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-0.5 h-8 w-full border-dashed text-xs"
          onClick={handleAdd}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Material
        </Button>
      )}
    </div>
  )
}
