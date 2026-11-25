import React from "react"
import { formatMoney } from "@/lib/promo-logic"

export interface InvoiceCustomMaterialsRowsProps {
  windowMaterials?: any[]
  doorMaterials?: any[]
  suMaterials?: any[]
  textColor: string
  py: number
}

function renderMaterialList(
  list: any[] | undefined,
  defaultLabel: string,
  textColor: string,
  py: number
) {
  if (!Array.isArray(list) || list.length === 0) return null
  return list.map((mat: any, idx: number) => {
    const amt = Number(mat?.amount) || 0
    if (amt <= 0 && !mat?.label) return null
    const label = mat?.label ? `Material: ${mat.label}` : defaultLabel
    return (
      <tr key={mat?.id || `${defaultLabel}_${idx}`} className="border-b border-[#e2e8f0]">
        <td
          style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
          className={`${textColor} font-medium`}
        >
          {label}
        </td>
        <td
          style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
          className={`text-right font-mono font-bold ${textColor}`}
        >
          {formatMoney(Math.round(amt * 100))}
        </td>
      </tr>
    )
  })
}

export function InvoiceCustomMaterialsRows({
  windowMaterials,
  doorMaterials,
  suMaterials,
  textColor,
  py,
}: InvoiceCustomMaterialsRowsProps) {
  return (
    <>
      {renderMaterialList(windowMaterials, "Additional Material", textColor, py)}
      {renderMaterialList(doorMaterials, "Door Additional Material", textColor, py)}
      {renderMaterialList(suMaterials, "Sealed Unit Additional Material", textColor, py)}
    </>
  )
}
