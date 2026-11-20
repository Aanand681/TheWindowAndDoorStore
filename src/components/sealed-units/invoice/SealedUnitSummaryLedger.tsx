import React from "react"
import {
  SealedUnitLineItem,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { SealedUnitTotals } from "./types"

interface SealedUnitSummaryLedgerProps {
  lineItems: SealedUnitLineItem[]
  totals: SealedUnitTotals
  isInstallation: boolean
  isService: boolean
  hstRate: number
  firstPayment?: number
  secondPayment?: number
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  textColor?: string
  subtextColor?: string
  borderColor?: string
  totalBorderColor?: string
}

export function SealedUnitSummaryLedger({
  lineItems, totals, isInstallation, isService, hstRate,
  attachedWindowQuote, attachedDoorQuote, textColor = "text-gray-900",
  subtextColor = "text-gray-700", borderColor = "border-gray-300",
  totalBorderColor = "border-gray-600",
}: SealedUnitSummaryLedgerProps) {
  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedDoor = Boolean(attachedDoorQuote)
  const hasAnyAttached = hasAttachedWindow || hasAttachedDoor

  const winBase = hasAttachedWindow
    ? Number(attachedWindowQuote.totals?.base ?? attachedWindowQuote.totals?.subtotal ?? 0)
    : 0
  const winJC = hasAttachedWindow
    ? Number(attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0)
    : 0
  const winJCDescription = attachedWindowQuote?.jcLabel || "Jambs & Casing"
  const winCustomMaterialsList = hasAttachedWindow
    ? (attachedWindowQuote.totals?.customMaterialsList || attachedWindowQuote.taxTotals?.customMaterials || [])
    : []
  const winCustomMaterials = hasAttachedWindow
    ? Number(attachedWindowQuote.totals?.customMaterials ||
        (Array.isArray(winCustomMaterialsList)
          ? winCustomMaterialsList.reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0)
          : 0))
    : 0

  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount ||
        attachedWindowQuote.quoteResult?.promoDiscount ||
        attachedWindowQuote.data?.promoDiscount ||
        0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0
  const winPromoName =
    attachedWindowQuote?.promoName ||
    attachedWindowQuote?.quoteResult?.promoName ||
    "Window Promo"
  const doorDiscount = hasAttachedDoor ? attachedDoorQuote.totals?.discountTotal || 0 : 0
  const doorMat = hasAttachedDoor
    ? (attachedDoorQuote.totals?.rawDoorBaseTotal || 0) +
      (attachedDoorQuote.totals?.stormDoorTotal || 0) +
      (attachedDoorQuote.totals?.hardwareTotal || 0) -
      doorDiscount
    : 0

  const winLabour = hasAttachedWindow ? Number(attachedWindowQuote.totals?.labour || 0) : 0
  const doorLabour = hasAttachedDoor
    ? Number(
        attachedDoorQuote.totals?.pureLabourTotal ??
        attachedDoorQuote.totals?.doorPureLabourTotal ??
        attachedDoorQuote.totals?.combinedLabourTotal ??
        ((attachedDoorQuote.totals?.unitLabourTotal || 0) + (attachedDoorQuote.totals?.upchargesTotal || 0))
      )
    : 0
  const winMisc = hasAttachedWindow ? Number(attachedWindowQuote.totals?.misc || 0) : 0
  const doorMisc = hasAttachedDoor ? Number(attachedDoorQuote.totals?.miscTotal || 0) : 0
  const rawWinSurcharge = hasAttachedWindow ? Number(attachedWindowQuote.totals?.surcharge || 0) : 0
  const winSurcharge = rawWinSurcharge > winBase && winBase > 0 ? Math.round(winBase * 0.08 * 100) / 100 : rawWinSurcharge
  const doorSurcharge = hasAttachedDoor ? Number(attachedDoorQuote.totals?.surchargeTotal || 0) : 0

  const suMaterials = isService ? 0 : totals.glassBefore8PercentTotal
  const combinedLabour = totals.combinedLabourTotal + winLabour + doorLabour
  const combinedMisc = (totals.miscTotal || 0) + winMisc + doorMisc
  const combinedSurcharge = totals.glass8PercentSurchargeTotal + winSurcharge + doorSurcharge

  const combinedSubtotal = hasAnyAttached
    ? Math.round((suMaterials + (winBase - winDiscount) + winJC + winCustomMaterials + doorMat + combinedLabour + combinedMisc + combinedSurcharge) * 100) / 100
    : totals.subtotalPreTax

  let combinedTax = totals.hstAmount
  if (hasAnyAttached) {
    if (hstRate === 8) {
      const mat = totals.glassBefore8PercentTotal + (winBase - winDiscount + winJC + winCustomMaterials) + doorMat
      const combinedMaterialExemption = Math.round(mat * 0.08 * 100) / 100
      combinedTax = Math.max(0, Math.round((Math.round(combinedSubtotal * 0.13 * 100) / 100 - combinedMaterialExemption) * 100) / 100)
    } else if (hstRate === 13) {
      combinedTax = Math.round(combinedSubtotal * 0.13 * 100) / 100
    } else {
      combinedTax = 0
    }
  }

  const grandTotal = hasAnyAttached ? Math.round((combinedSubtotal + combinedTax) * 100) / 100 : totals.grandTotal
  const fp = Math.floor((grandTotal / 2) * 100) / 100
  const sp = Math.round((grandTotal - fp) * 100) / 100

  return (
    <div className={`space-y-1 font-mono text-[7.5pt] ${textColor}`}>
      {isService ? (
        <>
          <div className="flex items-baseline justify-between py-0.5">
            <span className="font-sans font-medium">
              {getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)} (Labour)
            </span>
            <span className="font-bold">${combinedLabour.toFixed(2)}</span>
          </div>
          <div className="flex items-baseline justify-between py-0.5">
            <span className="font-sans">Miscellaneous (Supplies)</span>
            <span className="font-semibold">+${combinedMisc.toFixed(2)}</span>
          </div>
        </>
      ) : (
        <>
          {lineItems.length > 0 && (
            <div className="flex items-baseline justify-between py-0.5">
              <span className="max-w-[200px] truncate font-sans font-medium capitalize">
                {formatSealedUnitSummarySentence(lineItems)}
              </span>
              <span className="font-bold">${totals.glassBefore8PercentTotal.toFixed(2)}</span>
            </div>
          )}

          {hasAttachedWindow && (
            <div className="flex items-baseline justify-between py-0.5">
              <span className="max-w-[200px] truncate font-sans font-medium">
                {attachedWindowQuote.summarySentence || attachedWindowQuote.summaryLabel || `Attached Windows (#${attachedWindowQuote.quoteNumber})`}
              </span>
              <span className="font-bold">+${winBase.toFixed(2)}</span>
            </div>
          )}

          {hasAttachedWindow && winJC > 0 && (
            <div className="flex items-baseline justify-between py-0.5">
              <span className="max-w-[200px] truncate font-sans font-medium">{winJCDescription}</span>
              <span className="font-bold">+${winJC.toFixed(2)}</span>
            </div>
          )}

          {hasAttachedWindow && winCustomMaterialsList && winCustomMaterialsList.length > 0 &&
            winCustomMaterialsList.map((mat: any, idx: number) => {
              const amt = Number(mat.amount) || 0
              if (amt <= 0 && !mat.label) return null
              return (
                <div key={mat.id || idx} className="flex items-baseline justify-between py-0.5">
                  <span className="max-w-[200px] truncate font-sans font-medium">
                    {mat.label ? `Window Add-on: ${mat.label}` : "Window Add-on"}
                  </span>
                  <span className="font-bold">+${amt.toFixed(2)}</span>
                </div>
              )
            })
          }

          {hasAttachedDoor &&
            (attachedDoorQuote?.lineItems && attachedDoorQuote.lineItems.length > 0 ? (
              attachedDoorQuote.lineItems.map((dItem: any, dIdx: number) => (
                <div key={dItem.id || dIdx} className="flex items-baseline justify-between py-0.5">
                  <span className="max-w-[200px] truncate font-sans font-medium">{formatDoorItemHeading(dItem)}</span>
                  <span className="font-bold">+${((dItem.inksterBasePrice || 0) * (dItem.quantity || 1)).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="flex items-baseline justify-between py-0.5">
                <span className="max-w-[200px] truncate font-sans font-medium">
                  Attached Doors (#{attachedDoorQuote.quoteNumber})
                </span>
                <span className="font-bold">+${doorMat.toFixed(2)}</span>
              </div>
            ))}

          {(isInstallation || hasAnyAttached) && (
            <div className="flex items-baseline justify-between py-0.5">
              <span className="font-sans">Labour {hasAnyAttached ? "(all quotes)" : ""}</span>
              <span className="font-semibold">+${combinedLabour.toFixed(2)}</span>
            </div>
          )}

          {(isInstallation || hasAnyAttached) && (
            <div className="flex items-baseline justify-between py-0.5">
              <span className="font-sans">Miscellaneous {hasAnyAttached ? "(all quotes)" : ""}</span>
              <span className="font-semibold">+${combinedMisc.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-baseline justify-between py-0.5">
            <span className="font-sans">Surcharge (8% on materials)</span>
            <span className="font-semibold">+${combinedSurcharge.toFixed(2)}</span>
          </div>

          {winDiscount > 0 && (
            <div className="flex items-baseline justify-between py-0.5 font-semibold text-emerald-700">
              <span className="max-w-[200px] truncate font-sans">Promo ({winPromoName})</span>
              <span className="font-bold">-${winDiscount.toFixed(2)}</span>
            </div>
          )}

          {doorDiscount > 0 && (
            <div className="flex items-baseline justify-between py-0.5 font-semibold text-emerald-700">
              <span className="max-w-[200px] truncate font-sans">10% Door Discount</span>
              <span className="font-bold">-${doorDiscount.toFixed(2)}</span>
            </div>
          )}
        </>
      )}

      <div className={`flex items-baseline justify-between border-t ${borderColor} pt-0.5 font-bold`}>
        <span className="font-sans">Subtotal</span>
        <span>${combinedSubtotal.toFixed(2)}</span>
      </div>

      <div className={`flex items-baseline justify-between py-0.5 ${subtextColor}`}>
        <span className="font-sans">
          {hstRate === 8 ? "HST (8% First Nations)" : hstRate === 0 ? "Tax (Exempt)" : "HST (13%)"}
        </span>
        <span>${combinedTax.toFixed(2)}</span>
      </div>

      <div className={`flex items-baseline justify-between border-t-2 ${totalBorderColor} pt-0.5 text-[9pt] font-black`}>
        <span className="font-sans uppercase">Total:</span>
        <span>${grandTotal.toFixed(2)}</span>
      </div>

      <div className={`mt-0.5 grid grid-cols-2 gap-1.5 border-t pt-1 ${borderColor} text-center font-sans text-[7pt]`}>
        <div className="rounded border border-gray-300 bg-white px-1 py-0.5">
          <span className="block text-[6pt] font-bold text-gray-500 uppercase">First 50%</span>
          <span className="font-mono font-bold">${fp.toFixed(2)}</span>
        </div>
        <div className="rounded border border-gray-300 bg-white px-1 py-0.5">
          <span className="block text-[6pt] font-bold text-gray-500 uppercase">Final 50%</span>
          <span className="font-mono font-bold">${sp.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
