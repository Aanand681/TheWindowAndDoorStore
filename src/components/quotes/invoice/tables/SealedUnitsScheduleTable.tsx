import React from "react"
import type { QuoteTemplateType, InvoiceCalculationsResult } from "../types"
import { SealedUnitScheduleRow } from "./SealedUnitScheduleRow"

export interface SealedUnitsScheduleTableProps {
  theme: QuoteTemplateType
  calc: InvoiceCalculationsResult
  universal?: boolean
  compactSide?: boolean
}

export function SealedUnitsScheduleTable({
  theme,
  calc,
  universal = false,
  compactSide = false,
}: SealedUnitsScheduleTableProps) {
  const {
    isAttachedSUService: isService,
    attachedSealedUnit,
    effectiveSUTotals,
    effectiveSealedUnits,
    hasSealedUnits,
    suSummarySentence,
    isSUHost,
    h2Fs,
    microFs,
    bodyFs,
    thFs,
    rowPy,
  } = calc

  const suMode =
    attachedSealedUnit?.sealedUnitMode ||
    attachedSealedUnit?.data?.sealedUnitMode ||
    (isService
      ? "service_only"
      : isSUHost
        ? (effectiveSUTotals.isInstallation ?? !calc.isSupplyOnly)
          ? "installation"
          : "supply_only"
        : attachedSealedUnit?.isInstallation || effectiveSUTotals.isInstallation
          ? "installation"
          : "supply_only")
  const isInstallation = !isService && suMode === "installation"

  const effectiveSULineItems =
    effectiveSealedUnits.length > 0
      ? effectiveSealedUnits
      : isService && (effectiveSUTotals.totalSqft || 0) > 0
        ? [
            {
              id: "su-service-1",
              widthIn: "Custom Area",
              heightIn: "",
              paneType: "dual",
              combinationName: "On-Site Sealed Unit Service & Glazing",
              shapeDescription: "On-Site Service",
              grillDescription: "No Grills",
              quantity: 1,
              actualSqft: effectiveSUTotals.totalSqft || 0,
            },
          ]
        : isService && Number(effectiveSUTotals.serviceLabourTotal) > 0
          ? [
              {
                id: "su-service-flat",
                widthIn: "On-Site Service",
                heightIn: "",
                paneType: "service",
                combinationName: "On-Site Sealed Unit Service & Glazing",
                shapeDescription: "Labour & Service",
                grillDescription: "None",
                quantity: 1,
                actualSqft: 0,
              },
            ]
          : []

  if (!hasSealedUnits || effectiveSULineItems.length === 0) return null

  const isModern = !universal && theme === "modern"
  const isExecutive = !universal && theme === "executive"
  const isCards = universal || theme === "cards"

  const minL = effectiveSUTotals.labourMinPerUnit ?? 120.0
  const labourR =
    effectiveSUTotals.effectiveLabourRate ||
    effectiveSUTotals.labourRatePerSqft ||
    14.4
  const miscR =
    effectiveSUTotals.effectiveMiscRate ||
    effectiveSUTotals.miscRatePerSqft ||
    2.4

  return (
    <div
      className={
        universal
          ? "overflow-hidden rounded border border-[#cbd5e1] bg-white"
          : isCards
            ? "mb-4 overflow-hidden rounded border border-[#cbd5e1] bg-white shadow-sm"
            : "mb-4"
      }
    >
      {!universal && (
        <div
          className={`flex items-center justify-between ${
            isCards
              ? "border-b border-[#cbd5e1] bg-[#f8fafc] p-2"
              : "mb-1 border-b-[1.5px] border-[#0f172a] pb-1"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              style={{ fontSize: `${h2Fs}px` }}
              className="font-bold tracking-wider text-[#0f172a] uppercase"
            >
              {isService
                ? suSummarySentence
                : "Sealed Unit Specifications"}
            </span>
            {!isSUHost && attachedSealedUnit?.quoteNumber && (
              <span
                style={{ fontSize: `${microFs}px` }}
                className="rounded bg-muted px-1.5 py-0.5 font-mono font-medium text-[#334155]"
              >
                #{attachedSealedUnit.quoteNumber}
              </span>
            )}
          </div>
          <span
            style={{ fontSize: `${microFs}px` }}
            className="font-medium text-[#64748b]"
          >
            {effectiveSULineItems.length} item
            {effectiveSULineItems.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      <table
        className="w-full border-collapse"
        style={{ fontSize: `${bodyFs}px` }}
      >
        <thead>
          <tr
            className={
              isModern || isExecutive
                ? "border-b-2 border-[#0f172a] text-[#0f172a]"
                : "border-b border-[#cbd5e1] bg-[#f8fafc] font-semibold text-[#0f172a] uppercase"
            }
            style={{ fontSize: `${thFs}px` }}
          >
            <th className="w-[5%] px-1.5 py-1 text-left font-bold">#</th>
            {compactSide ? (
              <>
                <th className="w-[62%] px-1.5 py-1 text-left font-bold">
                  <span>{isService ? suSummarySentence : "Sealed Units"}</span>
                  {universal && !isSUHost && attachedSealedUnit?.quoteNumber && (
                    <span
                      style={{ fontSize: `${microFs}px` }}
                      className="ml-1.5 font-mono font-normal text-[#64748b]"
                    >
                      #{attachedSealedUnit.quoteNumber}
                    </span>
                  )}
                </th>
                <th className="w-[10%] px-1.5 py-1 text-center font-bold">
                  Qty
                </th>
                <th className="w-[23%] px-1.5 py-1 text-right font-mono font-bold">
                  Total
                </th>
              </>
            ) : (
              <>
                <th className="w-[26%] px-1.5 py-1 text-left font-bold">
                  <span>Glass Specs</span>
                  {universal && !isSUHost && attachedSealedUnit?.quoteNumber && (
                    <span
                      style={{ fontSize: `${microFs}px` }}
                      className="ml-1.5 font-mono font-normal text-[#64748b]"
                    >
                      #{attachedSealedUnit.quoteNumber}
                    </span>
                  )}
                </th>
                <th className="w-[22%] px-1.5 py-1 text-left font-bold">
                  Dimension
                </th>
                <th className="w-[11%] px-1.5 py-1 text-left font-bold">
                  Grills
                </th>
                <th className="w-[6%] px-1.5 py-1 text-center font-bold">
                  Qty
                </th>
                <th className="w-[10%] px-1.5 py-1 text-right font-mono font-bold">
                  Base Price
                </th>
                <th className="w-[10%] px-1.5 py-1 text-right font-mono font-bold">
                  Labour
                </th>
                <th className="w-[10%] px-1.5 py-1 text-right font-mono font-bold">
                  Misc
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody style={{ fontSize: `${bodyFs}px` }}>
          {effectiveSULineItems.map((item: any, idx: number) => (
            <SealedUnitScheduleRow
              key={item.id || idx}
              item={item}
              idx={idx}
              isService={isService}
              isInstallation={isInstallation}
              labourR={labourR}
              minL={minL}
              miscR={miscR}
              rowPy={rowPy}
              microFs={microFs}
              compactSide={compactSide}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
