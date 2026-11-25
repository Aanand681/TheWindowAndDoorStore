"use client"

import React, { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Layers } from "lucide-react"
import type { CustomMaterialItem } from "@/types/calculator"
import { CustomMaterialsEditor } from "./CustomMaterialsEditor"

export interface CustomMaterialsCardProps {
  materials: CustomMaterialItem[]
  onMaterialsChange: (mats: CustomMaterialItem[]) => void
  isReadOnly?: boolean
  title?: string
  placeholder?: string
  className?: string
}

/**
 * Standalone card wrapper for Additional / Custom Materials used in Door
 * and Sealed Unit workspaces with full Material Exemption & summary integration.
 */
export function CustomMaterialsCard({
  materials,
  onMaterialsChange,
  isReadOnly = false,
  title = "Additional Materials (Optional)",
  placeholder = "e.g. Custom stop, trim, or hardware",
  className = "",
}: CustomMaterialsCardProps) {
  const totalCents = useMemo(
    () =>
      Math.round(
        (Array.isArray(materials) ? materials : []).reduce(
          (acc, m) => acc + (Number(m.amount) || 0),
          0
        ) * 100
      ),
    [materials]
  )

  return (
    <Card
      className={`gap-0 overflow-hidden border-primary/20 bg-card/70 py-0 shadow-md backdrop-blur-xl [--card-spacing:0px] ${className}`}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>{title}</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            Eligible for Material Exemption
          </span>
        </div>

        <CustomMaterialsEditor
          materials={materials}
          onMaterialsChange={onMaterialsChange}
          isReadOnly={isReadOnly}
          placeholder={placeholder}
          showHeader={false}
        />

        {totalCents > 0 && (
          <div className="flex items-center justify-between border-t border-border/40 pt-2 font-mono text-xs font-bold text-foreground">
            <span className="font-sans text-[11px] font-medium text-muted-foreground">
              {materials.length} material line{materials.length !== 1 ? "s" : ""}
            </span>
            <span className="font-bold text-primary">
              Total: ${(totalCents / 100).toFixed(2)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
