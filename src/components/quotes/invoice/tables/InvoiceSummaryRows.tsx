import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult } from "../types"
import { DoorSummaryRows } from "./DoorSummaryRows"
import { InvoiceCustomMaterialsRows } from "./InvoiceCustomMaterialsRows"

export interface InvoiceSummaryRowsProps {
  calc: InvoiceCalculationsResult
  textColor?: string
  rowPyOverride?: number
}

export function InvoiceSummaryRows({
  calc,
  textColor = "text-[#0f172a]",
  rowPyOverride,
}: InvoiceSummaryRowsProps) {
  const py = rowPyOverride ?? 1
  const {
    hasWindows,
    winMaterialsCents,
    windowSummarySentence,
    totalWindowBaseCents,
    hasSealedUnits,
    suGlassCents,
    suSummarySentence,
    isAttachedSUService,
    attachedSealedUnit,
    attachedDoorQuote,
    attachedWindowQuote,
    hasDoors,
    effectiveDoors,
    doorSummarySentence,
    effectiveDoorTotals,
    jcItems,
    effectiveMiscTotalCents,
    effectiveLabourTotalCents,
    effectiveSurchargeTotalCents,
    promoDiscountCents,
    monthlyDiscountCents,
    finalSubtotalCents,
    finalHstLabel,
    finalHstAmountCents,
    microFs,
    smallFs,
    activePromo,
    isWindowHost,
    effectiveSUTotals,
    quoteResult,
    taxTotals,
  } = calc

  const windowCustomMaterials = isWindowHost
    ? taxTotals?.customMaterials
    : attachedWindowQuote?.totals?.customMaterialsList ||
      attachedWindowQuote?.taxTotals?.customMaterials ||
      attachedWindowQuote?.customMaterials
  const doorCustomMaterials =
    effectiveDoorTotals?.customMaterialsList ||
    effectiveDoorTotals?.customMaterials ||
    attachedDoorQuote?.customMaterials
  const suCustomMaterials =
    effectiveSUTotals?.customMaterialsList ||
    effectiveSUTotals?.customMaterials ||
    attachedSealedUnit?.customMaterials

  const hasAnyAttached = Boolean(
    attachedSealedUnit || attachedDoorQuote || attachedWindowQuote
  )

  const doorDiscountCents = hasDoors
    ? Math.round((effectiveDoorTotals?.discountTotal || 0) * 100)
    : 0
  const doorMaterialsCents = hasDoors
    ? Math.round(
        ((effectiveDoorTotals?.rawDoorBaseTotal || 0) +
          (effectiveDoorTotals?.stormDoorTotal || 0) +
          (effectiveDoorTotals?.hardwareTotal || 0)) *
          100
      )
    : 0

  const winJCCents = jcItems.reduce((acc, curr) => acc + curr.amount, 0)

  const resolvedPromoName =
    (isWindowHost
      ? activePromo?.name ||
        taxTotals?.discountLabel ||
        quoteResult?.discountLabel
      : attachedWindowQuote?.discountLabel ||
        attachedWindowQuote?.promoName ||
        attachedWindowQuote?.quoteResult?.promoName ||
        activePromo?.name
    )?.trim() || "Discount"

  return (
    <>
      {/* Line 1: Window base glass total */}
      {hasWindows && (totalWindowBaseCents > 0 || winMaterialsCents > 0) && (
        <tr className="border-b border-[#e2e8f0]">
          <td className={`py-1 ${textColor} font-medium capitalize`}>
            {windowSummarySentence}
          </td>
          <td className={`py-1 text-right font-mono font-bold ${textColor}`}>
            {formatMoney(totalWindowBaseCents)}
          </td>
        </tr>
      )}

      {/* Line 2: Sealed unit glass total pre-8% or Service */}
      {hasSealedUnits &&
        (suGlassCents > 0 ? (
          <tr className="border-b border-[#e2e8f0]">
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className={`${textColor} font-medium capitalize`}
            >
              {suSummarySentence}
            </td>
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className={`text-right font-mono font-bold ${textColor}`}
            >
              {formatMoney(suGlassCents)}
            </td>
          </tr>
        ) : isAttachedSUService && hasAnyAttached ? (
          <tr className="border-b border-[#e2e8f0]">
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className={`${textColor} font-medium`}
            >
              {suSummarySentence}
            </td>
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className="text-right font-mono text-[10px] font-normal text-[#64748b]"
            >
              (Labour below)
            </td>
          </tr>
        ) : null)}

      {/* Line 3: Door Units */}
      <DoorSummaryRows
        hasDoors={hasDoors}
        effectiveDoors={effectiveDoors}
        doorMaterialsCents={doorMaterialsCents}
        doorSummarySentence={doorSummarySentence}
        effectiveDoorTotals={effectiveDoorTotals}
        textColor={textColor}
        py={py}
      />

      {/* Line 4: Jambs & Casing (Window only, if applicable) */}
      {winJCCents > 0 && (
        <tr className="border-b border-[#e2e8f0]">
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`${textColor} font-medium`}
          >
            Jambs &amp; Casings
          </td>
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`text-right font-mono font-bold ${textColor}`}
          >
            {formatMoney(winJCCents)}
          </td>
        </tr>
      )}

      {/* Additional Materials (Windows, Doors & Sealed Units) */}
      <InvoiceCustomMaterialsRows
        windowMaterials={windowCustomMaterials}
        doorMaterials={doorCustomMaterials}
        suMaterials={suCustomMaterials}
        textColor={textColor}
        py={py}
      />

      {/* Line 5: Misc */}
      {effectiveMiscTotalCents > 0 && (
        <tr className="border-b border-[#e2e8f0]">
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`${textColor} font-medium`}
          >
            Miscellaneous
          </td>
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`text-right font-mono font-bold ${textColor}`}
          >
            {formatMoney(effectiveMiscTotalCents)}
          </td>
        </tr>
      )}

      {/* Line 6: Labour */}
      {effectiveLabourTotalCents > 0 && (
        <tr className="border-b border-[#e2e8f0]">
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`${textColor} font-medium`}
          >
            Labour{" "}
            <span
              style={{ fontSize: `${smallFs}px` }}
              className="text-[#334155]"
            >
              (incl. installation &amp; travel)
            </span>
          </td>
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`text-right font-mono font-bold ${textColor}`}
          >
            {formatMoney(effectiveLabourTotalCents)}
          </td>
        </tr>
      )}

      {/* Line 7: Surcharge */}
      {effectiveSurchargeTotalCents > 0 && (
        <tr className="border-b border-[#e2e8f0]">
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`${textColor} font-medium`}
          >
            Surcharge
          </td>
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`text-right font-mono font-bold ${textColor}`}
          >
            +{formatMoney(effectiveSurchargeTotalCents)}
          </td>
        </tr>
      )}

      {/* Line 8: Discounts */}
      {calc.discountLineItems && calc.discountLineItems.length > 0 ? (
        calc.discountLineItems.map((item, idx) => (
          <tr key={idx} className="border-b border-[#cbd5e1] bg-white font-semibold text-emerald-900">
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className="pl-1"
            >
              <span
                style={{ fontSize: `${microFs}px` }}
                className="block font-bold tracking-wider text-emerald-700 uppercase"
              >
                Discount Applied:
              </span>
              {item.label}
            </td>
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className="pr-1 text-right font-mono font-bold text-emerald-700"
            >
              −{formatMoney(Math.round(item.amount * 100))}
            </td>
          </tr>
        ))
      ) : (
        <>
          {promoDiscountCents > 0 && (
            <tr className="border-b border-[#cbd5e1] bg-white font-semibold text-emerald-900">
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className="pl-1"
              >
                <span
                  style={{ fontSize: `${microFs}px` }}
                  className="block font-bold tracking-wider text-emerald-700 uppercase"
                >
                  Discount Applied:
                </span>
                {resolvedPromoName}
              </td>
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className="pr-1 text-right font-mono font-bold text-emerald-700"
              >
                −{formatMoney(promoDiscountCents)}
              </td>
            </tr>
          )}

          {monthlyDiscountCents > 0 && (
            <tr className="border-b border-[#e2e8f0] font-semibold text-emerald-800">
              <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}>
                Monthly Discount
              </td>
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className="text-right font-mono"
              >
                −{formatMoney(monthlyDiscountCents)}
              </td>
            </tr>
          )}

          {doorDiscountCents > 0 && (
            <tr className="border-b border-[#cbd5e1] bg-white font-semibold text-emerald-900">
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className="pl-1"
              >
                <span
                  style={{ fontSize: `${microFs}px` }}
                  className="block font-bold tracking-wider text-emerald-700 uppercase"
                >
                  Discount Applied:
                </span>
                {attachedDoorQuote?.discountLabel || "Door Discount"}
              </td>
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className="pr-1 text-right font-mono font-bold text-emerald-700"
              >
                −{formatMoney(doorDiscountCents)}
              </td>
            </tr>
          )}
        </>
      )}

      {/* Line 9: Subtotal */}
      <tr className="border-t-2 border-b border-[#cbd5e1] bg-[#f8fafc]/80 font-bold text-[#0f172a]">
        <td
          style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
          className="text-[#0f172a]"
        >
          Subtotal
        </td>
        <td
          style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
          className="text-right font-mono font-bold text-[#0f172a]"
        >
          {formatMoney(finalSubtotalCents)}
        </td>
      </tr>

      {/* Line 10: Taxes */}
      {calc.finalMaterialExemptionCents && calc.finalMaterialExemptionCents > 0 ? (
        <>
          <tr className="border-b border-[#cbd5e1] text-[#0f172a]">
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className="text-[#334155]"
            >
              13% HST (on all)
            </td>
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className="text-right font-mono font-medium text-[#0f172a]"
            >
              +{formatMoney(
                calc.finalHstBaseCents ||
                  Math.round(finalSubtotalCents * 0.13)
              )}
            </td>
          </tr>
          <tr className="border-b border-[#cbd5e1] font-semibold text-emerald-800">
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className="text-emerald-800"
            >
              8% Tax Rebate (Material Exemption)
            </td>
            <td
              style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
              className="text-right font-mono font-bold text-emerald-700"
            >
              −{formatMoney(calc.finalMaterialExemptionCents)}
            </td>
          </tr>
        </>
      ) : (
        <tr className="border-b border-[#cbd5e1] text-[#0f172a]">
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className="text-[#334155]"
          >
            {finalHstLabel}
          </td>
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className="text-right font-mono text-[#0f172a]"
          >
            {formatMoney(finalHstAmountCents)}
          </td>
        </tr>
      )}
    </>
  )
}
