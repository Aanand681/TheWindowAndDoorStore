"use client"

import React, { useState } from "react"
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Layers,
  Wrench,
  TrendingUp,
  ShieldAlert,
  Info,
} from "lucide-react"
import {
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  SealedUnitLineItem,
} from "@/lib/sealed-units-logic"

export interface SealedUnitOfficePricingCardProps {
  lineItems: SealedUnitLineItem[]
  totals: {
    totalUnits: number
    totalSqft: number
    totalBillableSqft: number
    glassBefore8PercentTotal: number
    glass8PercentSurchargeTotal: number
    glassSupplyTotal: number
    unitLabourSum: number
    baseSetupFee: number
    additionalFarFee: number
    vehicleTravelFee: number
    crewTravelFee: number
    totalAdditionalTravel: number
    totalTravelAndSetup: number
    combinedLabourTotal: number
    miscTotal: number
    subtotalPreTax: number
    hstAmount: number
    grandTotal: number
  }
  formula?: SealedUnitFormulaConstants
  labour?: SealedUnitLabourSettings
  isInstallation: boolean
  isServiceOnly: boolean
  travelKm?: string | number
  crewHours?: string | number
  crewSize?: "2" | "3"
}

export function SealedUnitOfficePricingCard({
  lineItems,
  totals,
  formula,
  labour,
  isInstallation,
  isServiceOnly,
  travelKm = 0,
  crewHours = 0,
  crewSize = "3",
}: SealedUnitOfficePricingCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Raw material sums across all items
  const rawGlassTotal = lineItems.reduce(
    (acc, item) =>
      acc + (Number(item.rawGlassCost) || 0) * (Number(item.quantity) || 1),
    0
  )
  const rawGrillTotal = lineItems.reduce(
    (acc, item) =>
      acc + (Number(item.rawGrillCost) || 0) * (Number(item.quantity) || 1),
    0
  )
  const rawShapeTotal = lineItems.reduce(
    (acc, item) =>
      acc + (Number(item.rawShapeCost) || 0) * (Number(item.quantity) || 1),
    0
  )
  const rawCombinedTotal = rawGlassTotal + rawGrillTotal + rawShapeTotal

  // Formula constants
  const surchargeRate = formula?.surchargeRate ?? 0.27
  const stepMultiplier = formula?.stepMultiplier ?? 2.5

  // Vitro raw surcharge (27%)
  const vitroSurchargeAmount =
    Math.round(rawCombinedTotal * surchargeRate * 100) / 100
  const subtotalWith27 =
    Math.round((rawCombinedTotal + vitroSurchargeAmount) * 100) / 100
  const multipliedPre8 = Math.round(subtotalWith27 * stepMultiplier * 100) / 100

  // Estimated gross margin
  const totalRawDirectCost =
    rawCombinedTotal +
    totals.vehicleTravelFee +
    (isInstallation ? totals.baseSetupFee * 0.5 : 0)
  const grossProfitDollar = Math.max(
    0,
    totals.subtotalPreTax - totalRawDirectCost
  )
  const grossMarginPercent =
    totals.subtotalPreTax > 0
      ? (grossProfitDollar / totals.subtotalPreTax) * 100
      : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-xl backdrop-blur-xl">
      {/* Header Bar */}
      <div className="flex flex-col gap-2 border-b border-border/50 bg-muted/20 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              Office Pricing Reference &amp; Internal Calculations
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-3 w-3" />
              <span>Internal Only • Not for Customer</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex cursor-pointer items-center gap-1 self-start text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:self-auto"
        >
          <span>{isExpanded ? "Collapse Reference" : "Expand Reference"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="animate-in space-y-4 p-3.5 duration-150 fade-in sm:p-4">
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {/* Card 1: Vitro Manufacturing Breakdown */}
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
              <div className="flex items-center gap-1.5 border-b border-border/40 pb-1.5 font-bold text-foreground">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>Vitro Sheet Formula Breakdown</span>
              </div>

              {isServiceOnly ? (
                <div className="space-y-1 py-6 text-center text-xs text-muted-foreground">
                  <Info className="mx-auto h-5 w-5 text-muted-foreground opacity-40" />
                  <div className="font-semibold text-foreground">
                    On-Site Service Scope
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Glass manufacturing cost is waived ($0.00). Labour and misc
                    charges calculated on actual sq ft.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Raw Vitro Glass:</span>
                    <span className="font-semibold text-foreground">
                      ${rawGlassTotal.toFixed(2)}
                    </span>
                  </div>
                  {rawGrillTotal > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">
                        Interior Grills &amp; Hubs:
                      </span>
                      <span className="font-semibold text-foreground">
                        +${rawGrillTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {rawShapeTotal > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">
                        Custom Shapes Surcharge:
                      </span>
                      <span className="font-semibold text-foreground">
                        +${rawShapeTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/30 py-0.5 font-semibold text-foreground">
                    <span className="font-sans">Combined Raw Price:</span>
                    <span>${rawCombinedTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">+ 27% Vitro Surcharge:</span>
                    <span className="text-foreground">
                      +${vitroSurchargeAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Subtotal (with 27%):</span>
                    <span className="text-foreground">
                      ${subtotalWith27.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">× 2.5 Pricing Multiplier:</span>
                    <span className="text-foreground">
                      ${multipliedPre8.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/50 py-1 text-xs font-bold text-foreground">
                    <span className="font-sans">Sealed Unit Total:</span>
                    <span className="text-primary">
                      ${totals.glassBefore8PercentTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Installation Labour & Travel Audit */}
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
              <div className="flex items-center gap-1.5 border-b border-border/40 pb-1.5 font-bold text-foreground">
                <Wrench className="h-3.5 w-3.5 text-primary" />
                <span>Labour &amp; Travel Logistics Audit</span>
              </div>

              {!isInstallation && !isServiceOnly ? (
                <div className="space-y-1 py-6 text-center text-xs text-muted-foreground">
                  <Info className="mx-auto h-5 w-5 text-muted-foreground opacity-40" />
                  <div className="font-semibold text-foreground">
                    Supply Only Order
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Installation labour and travel charges waived ($0.00).
                    Customer pick-up or freight delivery.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Actual Glazed Sq Ft:</span>
                    <span className="font-semibold text-foreground">
                      {(totals.totalSqft || 0).toFixed(2)} sq ft
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">
                      Glazing Labour (@ $
                      {(labour?.labourRatePerSqft || 14.4).toFixed(2)}/sqft):
                    </span>
                    <span className="font-semibold text-foreground">
                      ${totals.unitLabourSum.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">
                      Glazing Supplies (@ $
                      {(labour?.miscRatePerSqft || 2.4).toFixed(2)}/sqft):
                    </span>
                    <span className="font-semibold text-foreground">
                      +${totals.miscTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Local Setup Base:</span>
                    <span className="font-semibold text-foreground">
                      +${totals.baseSetupFee.toFixed(2)}
                    </span>
                  </div>
                  {totals.additionalFarFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">Far Area Setup Fee:</span>
                      <span className="font-semibold text-foreground">
                        +${totals.additionalFarFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totals.vehicleTravelFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">
                        Vehicle Travel ({travelKm} km @ $0.98/km):
                      </span>
                      <span className="font-semibold text-foreground">
                        +${totals.vehicleTravelFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totals.crewTravelFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">
                        Crew Travel ({crewHours} hrs, {crewSize} men):
                      </span>
                      <span className="font-semibold text-foreground">
                        +${totals.crewTravelFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/50 py-1 text-xs font-bold text-foreground">
                    <span className="font-sans">
                      Combined Labour &amp; Setup:
                    </span>
                    <span className="text-primary">
                      ${totals.combinedLabourTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Economic Profit & Margin Analysis */}
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
              <div className="flex items-center gap-1.5 border-b border-border/40 pb-1.5 font-bold text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Job Margin &amp; Profit Summary</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-0.5 text-muted-foreground">
                  <span className="font-sans">
                    Total Billed Subtotal (Pre-tax):
                  </span>
                  <span className="font-bold text-foreground">
                    ${totals.subtotalPreTax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 text-muted-foreground">
                  <span className="font-sans">
                    Est. Direct Material/Vehicle Costs:
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    ${totalRawDirectCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/40 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="font-sans">Est. Gross Margin ($):</span>
                  <span>+${grossProfitDollar.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 font-sans text-muted-foreground">
                  <span>Gross Margin (%):</span>
                  <span className="font-mono font-bold text-foreground">
                    {grossMarginPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-0.5 font-sans text-muted-foreground">
                  <span>Manufacturing Multiplier:</span>
                  <span className="font-mono font-bold text-foreground">
                    {stepMultiplier}× Vitro Base
                  </span>
                </div>
                <div className="pt-2 font-sans text-[10px] leading-tight text-muted-foreground/80">
                  Formulas reflect the official Vitro price sheet and company
                  glazing rate schedule.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
