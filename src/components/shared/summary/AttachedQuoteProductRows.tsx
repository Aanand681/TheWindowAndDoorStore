"use client"

import React from "react"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import type { NormalizedQuoteFinancials } from "@/lib/quotes/quote-financial-normalizer"

export function getAttachedDoorItemBaseDollars(dItem: any): number {
  const qty = Math.max(1, Number(dItem?.quantity) || 1)
  const rawPrice = Number(
    dItem?.inksterBasePrice ??
      dItem?.finalUnitPrice ??
      dItem?.unitPrice ??
      dItem?.basePrice ??
      (dItem?.lineTotal ? dItem.lineTotal / qty : 0)
  )
  return Math.round(rawPrice * qty * 100) / 100
}

export function hasAttachedDoorItemPrices(items: any[]): boolean {
  return items.some((dItem: any) =>
    Boolean(
      dItem?.inksterBasePrice ||
        dItem?.finalUnitPrice ||
        dItem?.unitPrice ||
        dItem?.basePrice ||
        dItem?.lineTotal
    )
  )
}

export function resolveAttachedDoorFallbackBase(
  doorFallbackBase: number,
  hardwareTotal: number
): number {
  if (hardwareTotal > 0 && doorFallbackBase >= hardwareTotal) {
    return Math.round((doorFallbackBase - hardwareTotal) * 100) / 100
  }
  return doorFallbackBase
}

export function isAttachedSealedUnitService(
  attachedSealedUnit?: any | null,
  suNorm?: NormalizedQuoteFinancials | null,
  explicitFlag?: boolean
): boolean {
  return Boolean(
    explicitFlag ||
      attachedSealedUnit?.sealedUnitMode === "service_only" ||
      attachedSealedUnit?.isService ||
      attachedSealedUnit?.totals?.isServiceOnly ||
      suNorm?.isServiceOnly
  )
}

export interface AttachedQuoteProductRowsProps {
  hostType: "window" | "door" | "sealed_unit"
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  attachedSealedUnit?: any | null
  suNorm?: NormalizedQuoteFinancials | null
  winSentence?: string
  winBase?: number
  suSentence?: string
  suGlass?: number
  isAttachedSUService?: boolean
  doorSentence?: string
  doorFallbackBase?: number
}

/**
 * Shared ledger rows for rendering attached Window, Sealed Unit, and Door
 * base product lines consistently across all three summary cards.
 */
export function AttachedQuoteProductRows({
  hostType,
  attachedWindowQuote,
  attachedDoorQuote,
  attachedSealedUnit,
  suNorm,
  winSentence = "Attached Window Units",
  winBase = 0,
  suSentence = "Attached Sealed Glass Units",
  suGlass = 0,
  isAttachedSUService,
  doorSentence = "Attached Door Units",
  doorFallbackBase = 0,
}: AttachedQuoteProductRowsProps) {
  const isSUService = isAttachedSealedUnitService(
    attachedSealedUnit,
    suNorm,
    isAttachedSUService
  )
  const doorItems = attachedDoorQuote?.lineItems || []
  const hasDoorItemPrices =
    doorItems.length > 0 && hasAttachedDoorItemPrices(doorItems)
  const doorHardwareTotal = Number(attachedDoorQuote?.totals?.hardwareTotal || 0)
  const safeDoorFallback = resolveAttachedDoorFallbackBase(
    doorFallbackBase,
    doorHardwareTotal
  )

  return (
    <>
      {hostType !== "window" && attachedWindowQuote && (
        <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">
            {winSentence}
          </span>
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            +${winBase.toFixed(2)}
          </span>
        </div>
      )}

      {hostType !== "sealed_unit" && attachedSealedUnit && (
        <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
          <span
            className={
              isSUService
                ? "truncate font-medium text-blue-700 dark:text-blue-400"
                : "truncate font-medium text-foreground"
            }
          >
            {suSentence}
          </span>
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            {isSUService && suGlass === 0
              ? "$0.00 (Labour below)"
              : `+$${suGlass.toFixed(2)}`}
          </span>
        </div>
      )}

      {hostType !== "door" && attachedDoorQuote && (
        <>
          {hasDoorItemPrices ? (
            doorItems.map((dItem: any, dIdx: number) => (
              <div
                key={dItem.id || dIdx}
                className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm"
              >
                <span className="truncate font-medium text-foreground">
                  {formatDoorItemHeading(dItem)}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${getAttachedDoorItemBaseDollars(dItem).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
              <span className="truncate font-medium text-foreground">
                {doorSentence}
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                +${safeDoorFallback.toFixed(2)}
              </span>
            </div>
          )}
        </>
      )}
    </>
  )
}

export interface AttachedQuoteHardwareAndJCRowsProps {
  hostType: "window" | "door" | "sealed_unit"
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  doorHardwareTotal?: number
  doorHardwareQty?: number
  winJC?: number
  winJCDescription?: string
}

/**
 * Shared ledger rows for Door Lockset & Hardware and attached Window Jambs & Casing,
 * placed consistently after all product base rows and before Custom Materials.
 */
export function AttachedQuoteHardwareAndJCRows({
  hostType,
  attachedWindowQuote,
  attachedDoorQuote,
  doorHardwareTotal,
  doorHardwareQty,
  winJC = 0,
  winJCDescription = "Jambs & Casing",
}: AttachedQuoteHardwareAndJCRowsProps) {
  const resolvedHardwareTotal =
    hostType === "door"
      ? Number(doorHardwareTotal || 0)
      : Number(attachedDoorQuote?.totals?.hardwareTotal || 0)
  const resolvedHardwareQty =
    hostType === "door"
      ? Number(doorHardwareQty || 0)
      : Number(attachedDoorQuote?.totals?.hardwareQty || 0)

  return (
    <>
      {resolvedHardwareTotal > 0 && (
        <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">
            {resolvedHardwareQty > 0
              ? `${resolvedHardwareQty} Door Locksets & Hardware`
              : "Door Lockset & Hardware"}
          </span>
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            +${resolvedHardwareTotal.toFixed(2)}
          </span>
        </div>
      )}

      {hostType !== "window" && attachedWindowQuote && winJC > 0 && (
        <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">
            {winJCDescription}{" "}
            <span className="text-[10px] font-normal text-muted-foreground/80">
              (window only)
            </span>
          </span>
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            +${winJC.toFixed(2)}
          </span>
        </div>
      )}
    </>
  )
}
