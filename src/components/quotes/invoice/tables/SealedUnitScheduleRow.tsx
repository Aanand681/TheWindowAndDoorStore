import React from "react"

export interface SealedUnitScheduleRowProps {
  item: any
  idx: number
  isService: boolean
  isInstallation: boolean
  labourR: number
  minL: number
  miscR: number
  rowPy: number
  microFs: number
}

export function SealedUnitScheduleRow({
  item,
  idx,
  isService,
  isInstallation,
  labourR,
  minL,
  miscR,
  rowPy,
  microFs,
}: SealedUnitScheduleRowProps) {
  const qty = Math.max(1, Number(item.quantity) || 1)
  const sqft = Number(item.actualSqft) || 0

  const unitBasePrice = Number(
    item.multipliedAmount ??
      (item.multipliedTotal
        ? item.multipliedTotal / qty
        : item.finalUnitPrice
          ? item.finalUnitPrice / 1.08
          : (item.unitBasePrice ?? 0))
  )
  const totalBasePrice = Number(item.multipliedTotal ?? unitBasePrice * qty)

  const unitServiceLabour = Math.max(sqft * labourR, minL)
  const totalServiceLabour = Math.round(unitServiceLabour * qty * 100) / 100

  const unitInstallLabour =
    item.unitLabour && Number(item.unitLabour) > 0
      ? Math.max(Number(item.unitLabour), minL)
      : Math.max(sqft * labourR, minL)
  const totalInstallLabour = Math.round(unitInstallLabour * qty * 100) / 100

  const totalServiceMisc = Math.round(sqft * miscR * qty * 100) / 100
  const totalInstallMisc =
    item.totalMisc !== undefined && item.totalMisc !== null
      ? Number(item.totalMisc)
      : Math.round(sqft * miscR * qty * 100) / 100

  const isCustomArea =
    item.widthIn === "Custom Area" || !item.widthIn || !item.heightIn
  const dimText = isCustomArea
    ? sqft > 0
      ? `${sqft.toFixed(2)} sq ft total`
      : "Custom Glazing"
    : `${item.widthIn}" wide × ${item.heightIn}" high`

  const hasGrill =
    item.rawGrillCost > 0 ||
    Boolean(item.grill && item.grill.type !== "none") ||
    (item.grillDescription && item.grillDescription !== "No Grills")
  const grillDimText =
    item.grill?.colsCount && item.grill?.rowsCount
      ? `${item.grill.colsCount} × ${item.grill.rowsCount}`
      : ""
  const grillColorText = item.grill?.color
    ? `${item.grill.color} Grills`
    : item.grillDescription && item.grillDescription !== "No Grills"
      ? item.grillDescription
      : "Grills"

  const paneLabel = item.paneType === "triple" ? "Triple Pane" : "Dual Pane"
  const glassSpec =
    item.combinationName || `${paneLabel} · ${item.treatment || "Cardinal 366"}`

  return (
    <tr key={item.id || idx} className="border-b border-[#cbd5e1] bg-white">
      <td
        style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
        className="px-1.5 font-semibold text-[#334155]"
      >
        {idx + 1}
      </td>

      <td
        style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
        className="px-1.5 text-[#1e293b]"
      >
        {!isService ? (
          <>
            <div className="font-bold text-[#0f172a]">{glassSpec}</div>
            <div className="text-[10px] text-[#64748b] capitalize">
              {item.treatment || "Cardinal"} · {paneLabel}{" "}
              {item.thicknessMm ? `· ${item.thicknessMm}mm` : ""}
            </div>
          </>
        ) : (
          <span className="font-mono text-[#94a3b8]">—</span>
        )}
      </td>

      <td
        style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
        className="px-1.5 font-bold text-[#0f172a]"
      >
        <div className="whitespace-nowrap">{dimText}</div>
        {sqft > 0 && !isCustomArea && (
          <div className="text-[10px] font-normal text-[#64748b]">
            {sqft.toFixed(2)} sqft
          </div>
        )}
      </td>

      <td
        style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
        className="px-1.5 text-[#334155]"
      >
        {!isService && hasGrill ? (
          <div>
            {grillDimText && (
              <div className="font-mono text-[11px] font-bold text-[#0f172a]">
                {grillDimText}
              </div>
            )}
            <div className="truncate text-[10px] font-semibold text-amber-800">
              {grillColorText}
            </div>
          </div>
        ) : (
          <span className="font-mono text-[#94a3b8]">—</span>
        )}
      </td>

      <td
        style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
        className="px-1.5 text-center font-bold text-[#0f172a]"
      >
        {qty}
      </td>

      <td
        style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
        className="px-1.5 text-right font-mono"
      >
        {!isService && totalBasePrice > 0 ? (
          <>
            <span className="font-bold text-[#0f172a]">
              ${totalBasePrice.toFixed(2)}
            </span>
            {qty > 1 && (
              <span
                style={{ fontSize: `${microFs}px` }}
                className="block font-sans font-normal text-[#64748b]"
              >
                (${unitBasePrice.toFixed(2)} ea)
              </span>
            )}
          </>
        ) : (
          <span className="font-mono text-[#94a3b8]">—</span>
        )}
      </td>

      <td
        style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
        className="px-1.5 text-right font-mono"
      >
        {isService ? (
          <>
            <span className="font-bold text-[#0f172a]">
              ${totalServiceLabour.toFixed(2)}
            </span>
            {qty > 1 && (
              <span
                style={{ fontSize: `${microFs}px` }}
                className="block font-sans font-normal text-[#64748b]"
              >
                (${unitServiceLabour.toFixed(2)} ea)
              </span>
            )}
          </>
        ) : isInstallation ? (
          <>
            <span className="font-bold text-[#0f172a]">
              ${totalInstallLabour.toFixed(2)}
            </span>
            {qty > 1 && (
              <span
                style={{ fontSize: `${microFs}px` }}
                className="block font-sans font-normal text-[#64748b]"
              >
                (${unitInstallLabour.toFixed(2)} ea)
              </span>
            )}
          </>
        ) : (
          <span className="font-mono text-[#94a3b8]">—</span>
        )}
      </td>

      <td
        style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }}
        className="px-1.5 text-right font-mono"
      >
        {isService ? (
          <span className="font-medium text-[#334155]">
            ${totalServiceMisc.toFixed(2)}
          </span>
        ) : isInstallation ? (
          <span className="font-medium text-[#334155]">
            ${totalInstallMisc.toFixed(2)}
          </span>
        ) : (
          <span className="font-mono text-[#94a3b8]">—</span>
        )}
      </td>
    </tr>
  )
}
