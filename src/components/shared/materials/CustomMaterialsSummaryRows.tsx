import React from "react"

export interface CustomMaterialsSummaryRowsProps {
  materials?: any[] | null
  prefix?: string
}

/**
 * Shared ledger row renderer for Custom / Additional Materials across
 * Windows, Doors, Sealed Units, and Combined Quote Summary Cards.
 */
export function CustomMaterialsSummaryRows({
  materials,
  prefix = "",
}: CustomMaterialsSummaryRowsProps) {
  if (!Array.isArray(materials) || materials.length === 0) return null

  return (
    <>
      {materials.map((mat: any, idx: number) => {
        const amt = Number(mat?.amount) || 0
        if (amt <= 0 && !mat?.label) return null
        const title = mat.label
          ? prefix
            ? `${prefix}: ${mat.label}`
            : mat.label
          : prefix
            ? `${prefix} Additional Material`
            : "Additional Material"
        return (
          <div
            key={mat.id || idx}
            className="flex items-center justify-between gap-2 py-0.5 text-xs sm:text-sm"
          >
            <span className="truncate font-medium text-foreground">{title}</span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              +${amt.toFixed(2)}
            </span>
          </div>
        )
      })}
    </>
  )
}
