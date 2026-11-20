import React from "react"
import {
  SealedUnitLineItem,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { SealedUnitTotals } from "./types"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"

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

  const universal = calculateUniversalPricing({
    sealedUnitQuote: { data: { totals, sealedUnitMode: isService ? "service_only" : isInstallation ? "installation" : "supply_only" } },
    windowQuote: attachedWindowQuote,
    doorQuote: attachedDoorQuote,
    hostType: "sealed_unit",
    isSupplyOnly: !isInstallation && !isService,
    hstRate,
    isFirstNation: hstRate === 8,
  })

  const winLabour = universal.winNorm?.pureLabour || 0
  const doorLabour = universal.doorNorm?.pureLabour || 0
  const winMisc = universal.winNorm?.misc || 0
  const doorMisc = universal.doorNorm?.misc || 0
  const winSurcharge = universal.winNorm?.surcharge || 0
  const doorSurcharge = universal.doorNorm?.surcharge || 0

  const suMaterials = universal.suNorm?.materials || 0
  const combinedLabour = universal.combinedLabour
  const combinedMisc = universal.misc
  const combinedSurcharge = universal.surcharges
  const combinedSubtotal = universal.subtotal
  const combinedTax = universal.hstAmount
  const grandTotal = universal.total
  const fp = universal.firstPayment
  const sp = universal.secondPayment

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
