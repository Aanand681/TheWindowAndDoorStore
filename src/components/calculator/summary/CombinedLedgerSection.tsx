"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { formatMoney, toCents } from "@/lib/promo-logic"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { SummaryTaxSection } from "./SummaryTaxSection"
import { SummaryDepositSchedule } from "./SummaryDepositSchedule"

export interface CombinedLedgerSectionProps {
  combinedData: any
  summaryWindowGroups: any[]
  attachedDoorQuote: any | null
  renderEditableRow: (
    field: "jc" | "labour" | "misc",
    label: string,
    amountCents: number,
    customVal: string,
    defaultCents: number,
    setter: (val: string) => void,
    suffix?: string
  ) => React.ReactNode
  jcSummaryLabel: string
  customJC: string
  customMisc: string
  customLabour: string
  taxJC: number
  taxMisc: number
  taxLabour: number
  setCustomJC: (val: string) => void
  setCustomMisc: (val: string) => void
  setCustomLabour: (val: string) => void
  isSupplyOnly: boolean
  hstRate: number
  setHstRate: (val: number) => void
  isReadOnly?: boolean
}

export function CombinedLedgerSection({
  combinedData,
  summaryWindowGroups,
  attachedDoorQuote,
  renderEditableRow,
  jcSummaryLabel,
  customJC,
  customMisc,
  customLabour,
  taxJC,
  taxMisc,
  taxLabour,
  setCustomJC,
  setCustomMisc,
  setCustomLabour,
  isSupplyOnly,
  hstRate,
  setHstRate,
  isReadOnly = false,
}: CombinedLedgerSectionProps) {
  return (
    <>
      <div className="space-y-1.5 border-b border-border/50 pb-2.5">
        {/* Window glass configurations */}
        {summaryWindowGroups.length > 0
          ? summaryWindowGroups.map((g) => (
              <div
                key={g.key}
                className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm"
              >
                <span className="truncate font-medium text-muted-foreground capitalize">
                  {g.label}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  {formatMoney(g.baseCents)}
                </span>
              </div>
            ))
          : combinedData.windowBaseCents > 0 && (
              <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
                <span className="font-medium text-muted-foreground">
                  Window base price
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap">
                  {formatMoney(combinedData.windowBaseCents)}
                </span>
              </div>
            )}

        {/* Sealed unit glass price */}
        {combinedData.hasSU && (
          <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
            <span
              className={cn(
                "truncate font-medium",
                combinedData.isAttachedSUService
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-emerald-700 dark:text-emerald-400"
              )}
            >
              {combinedData.suSummarySentence}
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              {combinedData.isAttachedSUService &&
              combinedData.suGlassCents === 0
                ? "$0.00 (Labour below)"
                : `+${formatMoney(combinedData.suGlassCents)}`}
            </span>
          </div>
        )}

        {/* Door units materials price (Itemized as headings) */}
        {combinedData.hasDoor &&
          (attachedDoorQuote?.lineItems &&
          attachedDoorQuote.lineItems.length > 0 ? (
            attachedDoorQuote.lineItems.map((dItem: any, dIdx: number) => {
              const q = dItem.quantity || 1
              const heading = formatDoorItemHeading(dItem)
              const itemBaseCents = Math.round(
                (dItem.inksterBasePrice || 0) * q * 100
              )
              return (
                <div
                  key={dItem.id || dIdx}
                  className="flex items-center justify-between py-0.5 text-xs sm:text-sm"
                >
                  <span className="truncate font-medium text-amber-700 dark:text-amber-400">
                    {heading}
                  </span>
                  <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                    +{formatMoney(itemBaseCents)}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
              <span className="truncate font-medium text-amber-700 dark:text-amber-400">
                {combinedData.doorSummarySentence}
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                +{formatMoney(combinedData.doorMaterialsCents)}
              </span>
            </div>
          ))}

        {/* Attached Door Hardware if any */}
        {combinedData.hasDoor &&
          Boolean((attachedDoorQuote?.totals?.hardwareTotal || 0) > 0) && (
            <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
              <span className="truncate font-medium text-muted-foreground">
                Door Lockset &amp; Hardware
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                +
                {formatMoney(
                  Math.round(
                    Number(attachedDoorQuote.totals.hardwareTotal) * 100
                  )
                )}
              </span>
            </div>
          )}

        {/* Jambs & Casing (Window only) */}
        {(!isSupplyOnly || combinedData.effectiveJCCents > 0) &&
          renderEditableRow(
            "jc",
            jcSummaryLabel,
            combinedData.effectiveJCCents,
            customJC,
            taxJC,
            (val) => setCustomJC(val),
            "(window only)"
          )}

        {/* Misc (Window + Attached) - Hidden on Supply Only */}
        {!isSupplyOnly &&
          (() => {
            const attachedMiscCents =
              combinedData.combinedMiscCents -
              (customMisc !== "" ? toCents(customMisc) : taxMisc)
            const defaultCombinedMiscCents = taxMisc + attachedMiscCents
            return renderEditableRow(
              "misc",
              "Miscellaneous",
              combinedData.combinedMiscCents,
              customMisc,
              defaultCombinedMiscCents,
              (val) => {
                if (!val) {
                  setCustomMisc("")
                  return
                }
                const totalDesiredCents = toCents(val)
                const windowCents = Math.max(
                  0,
                  totalDesiredCents - attachedMiscCents
                )
                setCustomMisc((windowCents / 100).toFixed(2))
              },
              "(window + attached)"
            )
          })()}

        {/* Labour (Window + Attached) - Hidden on Supply Only */}
        {!isSupplyOnly &&
          (() => {
            const attachedLabourCents =
              combinedData.combinedLabourCents -
              (customLabour !== "" ? toCents(customLabour) : taxLabour)
            const defaultCombinedLabourCents = taxLabour + attachedLabourCents
            return renderEditableRow(
              "labour",
              "Labour",
              combinedData.combinedLabourCents,
              customLabour,
              defaultCombinedLabourCents,
              (val) => {
                if (!val) {
                  setCustomLabour("")
                  return
                }
                const totalDesiredCents = toCents(val)
                const windowCents = Math.max(
                  0,
                  totalDesiredCents - attachedLabourCents
                )
                setCustomLabour((windowCents / 100).toFixed(2))
              },
              "(window + attached)"
            )
          })()}

        {/* Surcharge (Window + Attached 8%) */}
        <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
          <span className="text-muted-foreground">
            Surcharge{" "}
            <span className="text-[10px] text-muted-foreground/70">
              (8% on materials)
            </span>
          </span>
          <span className="shrink-0 font-mono whitespace-nowrap text-muted-foreground">
            +{formatMoney(combinedData.combinedSurchargeCents)}
          </span>
        </div>

        {/* Promo discount (Window only) */}
        {combinedData.windowDiscountCents > 0 && (
          <div className="flex items-center justify-between py-0.5 text-xs font-medium text-emerald-600 sm:text-sm dark:text-emerald-400">
            <span>
              Promo discount{" "}
              <span className="text-[10px] text-muted-foreground/70">
                (window only)
              </span>
            </span>
            <span className="shrink-0 font-mono whitespace-nowrap">
              -{formatMoney(combinedData.windowDiscountCents)}
            </span>
          </div>
        )}

        {/* 10% Door Discount (Separated) */}
        {combinedData.doorDiscountCents > 0 && (
          <div className="flex items-center justify-between py-0.5 text-xs font-medium text-emerald-600 sm:text-sm dark:text-emerald-400">
            <span>
              10% Door Discount{" "}
              <span className="text-[10px] text-muted-foreground/70">
                (non-storm doors)
              </span>
            </span>
            <span className="shrink-0 font-mono whitespace-nowrap">
              -{formatMoney(combinedData.doorDiscountCents)}
            </span>
          </div>
        )}
      </div>

      {/* Subtotal */}
      <div className="border-b border-border/50 pb-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between font-medium">
          <span className="text-foreground">Combined Subtotal</span>
          <span className="shrink-0 font-mono font-bold whitespace-nowrap text-primary">
            {formatMoney(combinedData.combinedSubtotalCents)}
          </span>
        </div>
      </div>

      {/* Tax Section */}
      <SummaryTaxSection
        hstRate={hstRate}
        setHstRate={setHstRate}
        taxCents={combinedData.combinedTaxCents}
        hstBaseCents={combinedData.combinedHstBaseCents}
        materialExemptionCents={combinedData.combinedMaterialExemptionCents}
        isReadOnly={isReadOnly}
        idPrefix="promoCombined"
      />

      {/* Total & Deposit Schedule */}
      <SummaryDepositSchedule
        totalCents={combinedData.combinedTotalCents}
        firstPaymentCents={combinedData.combinedFirstPayment}
        secondPaymentCents={combinedData.combinedSecondPayment}
      />
    </>
  )
}
