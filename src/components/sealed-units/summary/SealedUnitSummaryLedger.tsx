"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import {
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { SealedUnitSummaryDepositAndUpgrades } from "./SealedUnitSummaryDepositAndUpgrades"

export interface SealedUnitSummaryLedgerProps {
  isService: boolean
  lineItems: SealedUnitLineItem[]
  lineItemsCount: number
  totals: any
  labour: any
  combinedLabour: number
  combinedMisc: number
  combinedSurcharge: number
  combinedSubtotal: number
  combinedTax: number
  displayGrandTotal: number
  firstPayment: number
  secondPayment: number
  hasAttachedWindow: boolean
  hasAttachedDoor: boolean
  hasAnyAttached: boolean
  attachedWindowQuote?: any
  attachedDoorQuote?: any
  attachedWinSentence: string
  attachedDoorSentence: string
  winBase: number
  winJC: number
  winJCDescription: string
  winDiscount: number
  doorRawBase: number
  doorDiscount: number
  isInstallation: boolean
  hstRate: number
  setHstRate: (rate: number) => void
}

export function SealedUnitSummaryLedger({
  isService,
  lineItems,
  lineItemsCount,
  totals,
  labour,
  combinedLabour,
  combinedMisc,
  combinedSurcharge,
  combinedSubtotal,
  combinedTax,
  displayGrandTotal,
  firstPayment,
  secondPayment,
  hasAttachedWindow,
  hasAttachedDoor,
  hasAnyAttached,
  attachedWindowQuote,
  attachedDoorQuote,
  attachedWinSentence,
  attachedDoorSentence,
  winBase,
  winJC,
  winJCDescription,
  winDiscount,
  doorRawBase,
  doorDiscount,
  isInstallation,
  hstRate,
  setHstRate,
}: SealedUnitSummaryLedgerProps) {
  return (
    <div className="space-y-3 text-xs">
      <div className="space-y-1.5 border-b border-border/50 pb-2.5">
        {isService ? (
          <>
            <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
              <span className="font-medium text-muted-foreground">
                {getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)}{" "}
                (Labour)
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                ${combinedLabour.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
              <span className="font-medium text-muted-foreground">
                Service Materials &amp; Misc (
                {(totals.totalSqft || 0).toFixed(2)} sq ft @ $
                {(
                  totals.effectiveMiscRate ||
                  labour.miscRatePerSqft ||
                  2.4
                ).toFixed(2)}
                /sqft)
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                +${combinedMisc.toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <>
            {lineItemsCount > 0 && (
              <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                <span className="truncate font-medium text-muted-foreground capitalize">
                  {formatSealedUnitSummarySentence(lineItems)}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  ${totals.glassBefore8PercentTotal.toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedWindow && (
              <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                <span className="truncate font-medium text-muted-foreground">
                  {attachedWinSentence}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${winBase.toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedWindow && winJC > 0 && (
              <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                <span className="truncate font-medium text-muted-foreground">
                  {winJCDescription}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${winJC.toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedDoor &&
              (attachedDoorQuote?.lineItems &&
              attachedDoorQuote.lineItems.length > 0 ? (
                attachedDoorQuote.lineItems.map((dItem: any, dIdx: number) => (
                  <div
                    key={dItem.id || dIdx}
                    className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm"
                  >
                    <span className="truncate font-medium text-muted-foreground">
                      {formatDoorItemHeading(dItem)}
                    </span>
                    <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                      +$
                      {(
                        (dItem.inksterBasePrice || 0) * (dItem.quantity || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                  <span className="truncate font-medium text-muted-foreground">
                    {attachedDoorSentence}
                  </span>
                  <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                    +${doorRawBase.toFixed(2)}
                  </span>
                </div>
              ))}

            {hasAttachedDoor &&
              Boolean(attachedDoorQuote?.totals?.hardwareTotal > 0) && (
                <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                  <span className="truncate font-medium text-muted-foreground">
                    Door Lockset &amp; Hardware
                  </span>
                  <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                    +$
                    {Number(attachedDoorQuote.totals.hardwareTotal).toFixed(2)}
                  </span>
                </div>
              )}

            {(isInstallation || hasAnyAttached) && (
              <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  Labour{" "}
                  {hasAnyAttached
                    ? "(all quotes combined)"
                    : "(includes all the labour and the travel charges)"}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${combinedLabour.toFixed(2)}
                </span>
              </div>
            )}

            {(isInstallation || hasAnyAttached) && (
              <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  Misc {hasAnyAttached ? "(all quotes combined)" : ""}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${combinedMisc.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
              <span className="text-muted-foreground">
                Surcharge{" "}
                {hasAnyAttached ? "(8% on materials)" : "(8% Glass Surcharge)"}
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-muted-foreground">
                +${combinedSurcharge.toFixed(2)}
              </span>
            </div>

            {winDiscount > 0 && (
              <div className="flex items-center justify-between py-0.5 text-xs font-medium text-emerald-600 sm:text-sm dark:text-emerald-400">
                <span>
                  Promo Discount (
                  {attachedWindowQuote?.promoName ||
                    attachedWindowQuote?.quoteResult?.promoName ||
                    "Window Promo"}
                  )
                </span>
                <span className="shrink-0 font-mono whitespace-nowrap">
                  -${winDiscount.toFixed(2)}
                </span>
              </div>
            )}

            {doorDiscount > 0 && (
              <div className="flex items-center justify-between py-0.5 text-xs font-medium text-emerald-600 sm:text-sm dark:text-emerald-400">
                <span>10% Door Discount (non-storm doors)</span>
                <span className="shrink-0 font-mono whitespace-nowrap">
                  -${doorDiscount.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Subtotal */}
      <div className="border-b border-border/50 pb-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between font-medium">
          <span className="font-bold text-foreground">Subtotal</span>
          <span className="shrink-0 font-mono font-bold whitespace-nowrap text-primary">
            ${combinedSubtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tax Section */}
      {/* Tax Section */}
      <div className="space-y-2 border-b border-border/50 pt-1 pb-2.5">
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium whitespace-nowrap text-muted-foreground">
              Tax Option:
            </Label>
            <Select
              disabled={isService}
              value={String(isService ? 13 : hstRate)}
              onValueChange={(val) => setHstRate(Number(val))}
            >
              <SelectTrigger className="h-7 w-[190px] bg-background/50 text-xs font-medium shadow-none">
                <SelectValue>
                  {isService
                    ? "13% HST (Service Rate)"
                    : hstRate === 8
                      ? "8% Material Exemption"
                      : hstRate === 0
                        ? "0% No Tax (Exempt)"
                        : "13% HST (Standard)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="13">
                  {isService ? "13% HST (Service Rate)" : "13% HST (Standard)"}
                </SelectItem>
                {!isService && (
                  <>
                    <SelectItem value="8">8% Material Exemption</SelectItem>
                    <SelectItem value="0">0% No Tax (Exempt)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {(hstRate === 13 || isService) && (
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              +${combinedTax.toFixed(2)}
            </span>
          )}
          {hstRate === 0 && !isService && (
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-muted-foreground">
              $0.00
            </span>
          )}
        </div>

        {!isService && hstRate === 8 && (
          <div className="space-y-1 rounded-md border border-border/50 bg-muted/40 p-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>13% HST (on all):</span>
              <span className="font-mono font-medium text-foreground">
                +$
                {(
                  totals.hstBase ??
                  combinedTax + (totals.materialExemption || 0)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between font-medium text-emerald-500">
              <span>8% Tax Rebate (Material Exemption):</span>
              <span className="font-mono">
                -${(totals.materialExemption || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      <SealedUnitSummaryDepositAndUpgrades
        displayGrandTotal={displayGrandTotal}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        hasAttachedDoor={hasAttachedDoor}
        hasAttachedWindow={hasAttachedWindow}
        attachedDoorQuote={attachedDoorQuote}
        attachedWindowQuote={attachedWindowQuote}
      />
    </div>
  )
}
