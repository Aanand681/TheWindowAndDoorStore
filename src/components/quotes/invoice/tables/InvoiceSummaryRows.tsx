import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult } from "../types"
import { DoorSummaryRows } from "./DoorSummaryRows"

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
    quoteResult,
    taxTotals,
  } = calc

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
      ? activePromo?.name
      : attachedWindowQuote?.promoName ||
        attachedWindowQuote?.quoteResult?.promoName ||
        activePromo?.name
    )?.trim() || "Promotion Discount"

  return (
    <>
      {/* Line 1: Window base glass total */}
      {hasWindows && winMaterialsCents > 0 && (
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

      {/* Additional Materials */}
      {taxTotals?.customMaterials &&
        Array.isArray(taxTotals.customMaterials) &&
        taxTotals.customMaterials.map((mat: any) => {
          const amt = Number(mat.amount) || 0
          if (amt <= 0 && !mat.label) return null
          return (
            <tr key={mat.id} className="border-b border-[#e2e8f0]">
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className={`${textColor} font-medium`}
              >
                {mat.label ? `Material: ${mat.label}` : "Additional Material"}
              </td>
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className={`text-right font-mono font-bold ${textColor}`}
              >
                {formatMoney(Math.round(amt * 100))}
              </td>
            </tr>
          )
        })}

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
              Promo Applied:
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
            10% Door Discount (Non-Storm Doors)
          </td>
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className="pr-1 text-right font-mono font-bold text-emerald-700"
          >
            −{formatMoney(doorDiscountCents)}
          </td>
        </tr>
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
