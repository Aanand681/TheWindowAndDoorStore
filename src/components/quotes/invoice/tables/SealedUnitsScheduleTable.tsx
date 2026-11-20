import React from "react"
import type { QuoteTemplateType, InvoiceCalculationsResult } from "../types"
import { SealedUnitScheduleRow } from "./SealedUnitScheduleRow"

export interface SealedUnitsScheduleTableProps {
  theme: QuoteTemplateType
  calc: InvoiceCalculationsResult
}

export function SealedUnitsScheduleTable({
  theme,
  calc,
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
        : []

  if (!hasSealedUnits || effectiveSULineItems.length === 0) return null

  const isModern = theme === "modern"
  const isExecutive = theme === "executive"
  const isCards = theme === "cards"

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
        isCards
          ? "mb-4 overflow-hidden rounded border border-[#cbd5e1] bg-white shadow-sm"
          : "mb-4"
      }
    >
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
              : isInstallation
                ? "Sealed Units & Installation"
                : "Supply Only Sealed Units"}
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

      <table
        className="w-full border-collapse"
        style={{ fontSize: `${bodyFs}px` }}
      >
        <thead>
          <tr
            className={
              isModern
                ? "border-b-2 border-[#0f172a] text-[#0f172a]"
                : isExecutive
                  ? "border-b-2 border-[#0f172a] text-[#0f172a]"
                  : "border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]"
            }
            style={{ fontSize: `${thFs}px` }}
          >
            <th className="w-[4%] px-1.5 py-1 text-left font-bold">#</th>
            <th className="w-[26%] px-1.5 py-1 text-left font-bold">
              Glass Specs
            </th>
            <th className="w-[22%] px-1.5 py-1 text-left font-bold">
              Dimension
            </th>
            <th className="w-[12%] px-1.5 py-1 text-left font-bold">Grills</th>
            <th className="w-[6%] px-1.5 py-1 text-center font-bold">Qty</th>
            <th className="w-[10%] px-1.5 py-1 text-right font-mono font-bold">
              Base Price
            </th>
            <th className="w-[10%] px-1.5 py-1 text-right font-mono font-bold">
              Labour
            </th>
            <th className="w-[10%] px-1.5 py-1 text-right font-mono font-bold">
              Misc
            </th>
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
            />
          ))}
        </tbody>
      </table>

      {/* Sealed Unit Jobsite Labour & Add-ons */}
      {(() => {
        const suUpcharges = (
          Array.isArray(effectiveSUTotals?.globalUpcharges) &&
          effectiveSUTotals.globalUpcharges.length > 0
            ? effectiveSUTotals.globalUpcharges
            : Array.isArray(attachedSealedUnit?.globalUpcharges)
              ? attachedSealedUnit.globalUpcharges
              : []
        ).filter(
          (u: any) =>
            Math.max(
              0,
              parseFloat(String(u.price || u.rate || u.total || 0)) || 0
            ) > 0
        )

        if (suUpcharges.length === 0) return null

        return (
          <div className="mt-2 overflow-hidden rounded border border-[#cbd5e1]">
            <div
              className="flex items-center justify-between bg-[#f1f5f9] px-2 py-1 font-bold tracking-wider text-[#0f172a] uppercase"
              style={{ fontSize: `${microFs}px` }}
            >
              <span>Sealed Unit Jobsite Labour &amp; Add-ons</span>
              <span className="font-normal text-[#64748b]">
                {suUpcharges.length} item
                {suUpcharges.length > 1 ? "s" : ""}
              </span>
            </div>
            <table
              className="w-full border-collapse"
              style={{ fontSize: `${bodyFs}px` }}
            >
              <thead>
                <tr
                  className="border-b border-[#cbd5e1] bg-[#f8fafc] text-[#0f172a]"
                  style={{ fontSize: `${thFs}px` }}
                >
                  <th className="w-8 px-1.5 py-1 text-left font-bold">#</th>
                  <th className="px-1.5 py-1 text-left font-bold">
                    Service Description
                  </th>
                  <th className="w-24 px-1.5 py-1 text-right font-mono font-bold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody style={{ fontSize: `${bodyFs}px` }}>
                {suUpcharges.map((u: any, uIdx: number) => {
                  const amt = Math.max(
                    0,
                    parseFloat(String(u.price || u.rate || u.total || 0)) || 0
                  )
                  return (
                    <tr
                      key={u.id || u.upchargeId || uIdx}
                      className="border-b border-[#cbd5e1] bg-white"
                    >
                      <td
                        style={{
                          paddingTop: `${rowPy}px`,
                          paddingBottom: `${rowPy}px`,
                        }}
                        className="px-1.5 font-semibold text-[#334155]"
                      >
                        {uIdx + 1}
                      </td>
                      <td
                        style={{
                          paddingTop: `${rowPy}px`,
                          paddingBottom: `${rowPy}px`,
                        }}
                        className="px-1.5 font-bold text-[#0f172a]"
                      >
                        {u.label || "Add-on Labour"}
                      </td>
                      <td
                        style={{
                          paddingTop: `${rowPy}px`,
                          paddingBottom: `${rowPy}px`,
                        }}
                        className="px-1.5 text-right font-mono font-bold text-[#0f172a]"
                      >
                        ${amt.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })()}
    </div>
  )
}
