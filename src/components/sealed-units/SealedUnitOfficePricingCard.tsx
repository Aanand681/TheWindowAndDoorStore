'use client';

import React, { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Layers,
  Wrench,
  TrendingUp,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  SealedUnitLineItem,
} from '@/lib/sealed-units-logic';
import { cn } from '@/lib/utils';

export interface SealedUnitOfficePricingCardProps {
  lineItems: SealedUnitLineItem[];
  totals: {
    totalUnits: number;
    totalSqft: number;
    totalBillableSqft: number;
    glassBefore8PercentTotal: number;
    glass8PercentSurchargeTotal: number;
    glassSupplyTotal: number;
    unitLabourSum: number;
    baseSetupFee: number;
    additionalFarFee: number;
    vehicleTravelFee: number;
    crewTravelFee: number;
    totalAdditionalTravel: number;
    totalTravelAndSetup: number;
    combinedLabourTotal: number;
    miscTotal: number;
    subtotalPreTax: number;
    hstAmount: number;
    grandTotal: number;
  };
  formula?: SealedUnitFormulaConstants;
  labour?: SealedUnitLabourSettings;
  isInstallation: boolean;
  isServiceOnly: boolean;
  travelKm?: string | number;
  crewHours?: string | number;
  crewSize?: '2' | '3';
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
  crewSize = '3',
}: SealedUnitOfficePricingCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Raw material sums across all items
  const rawGlassTotal = lineItems.reduce((acc, item) => acc + (Number(item.rawGlassCost) || 0) * (Number(item.quantity) || 1), 0);
  const rawGrillTotal = lineItems.reduce((acc, item) => acc + (Number(item.rawGrillCost) || 0) * (Number(item.quantity) || 1), 0);
  const rawShapeTotal = lineItems.reduce((acc, item) => acc + (Number(item.rawShapeCost) || 0) * (Number(item.quantity) || 1), 0);
  const rawCombinedTotal = rawGlassTotal + rawGrillTotal + rawShapeTotal;

  // Formula constants
  const surchargeRate = formula?.surchargeRate ?? 0.27;
  const stepMultiplier = formula?.stepMultiplier ?? 2.5;
  const finalAddonRate = formula?.finalAddonRate ?? 0.08;

  // Vitro raw surcharge (27%)
  const vitroSurchargeAmount = Math.round(rawCombinedTotal * surchargeRate * 100) / 100;
  const subtotalWith27 = Math.round((rawCombinedTotal + vitroSurchargeAmount) * 100) / 100;
  const multipliedPre8 = Math.round(subtotalWith27 * stepMultiplier * 100) / 100;
  const surcharge8Amount = Math.round(multipliedPre8 * finalAddonRate * 100) / 100;

  // Estimated gross margin
  const totalRawDirectCost = rawCombinedTotal + totals.vehicleTravelFee + (isInstallation ? totals.baseSetupFee * 0.5 : 0);
  const grossProfitDollar = Math.max(0, totals.subtotalPreTax - totalRawDirectCost);
  const grossMarginPercent = totals.subtotalPreTax > 0 ? (grossProfitDollar / totals.subtotalPreTax) * 100 : 0;

  return (
    <div className="bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="border-b border-border/50 py-2.5 px-3.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">
              Office Pricing Reference &amp; Internal Calculations
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-3 h-3" />
              <span>Internal Only • Not for Customer</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto"
        >
          <span>{isExpanded ? 'Collapse Reference' : 'Expand Reference'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3.5 sm:p-4 space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Card 1: Vitro Manufacturing Breakdown */}
            <div className="p-3 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/40 font-bold text-foreground">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Vitro Sheet Formula Breakdown</span>
              </div>

              {isServiceOnly ? (
                <div className="py-6 text-center text-muted-foreground text-xs space-y-1">
                  <Info className="w-5 h-5 mx-auto opacity-40 text-muted-foreground" />
                  <div className="font-semibold text-foreground">On-Site Service Scope</div>
                  <p className="text-[11px] text-muted-foreground">
                    Glass manufacturing cost is waived ($0.00). Labour and misc charges calculated on actual sq ft.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Raw Vitro Glass:</span>
                    <span className="text-foreground font-semibold">${rawGlassTotal.toFixed(2)}</span>
                  </div>
                  {rawGrillTotal > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">Interior Grills &amp; Hubs:</span>
                      <span className="text-foreground font-semibold">+${rawGrillTotal.toFixed(2)}</span>
                    </div>
                  )}
                  {rawShapeTotal > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">Custom Shapes Surcharge:</span>
                      <span className="text-foreground font-semibold">+${rawShapeTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5 border-t border-border/30 text-foreground font-semibold">
                    <span className="font-sans">Combined Raw Price:</span>
                    <span>${rawCombinedTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">+ 27% Vitro Surcharge:</span>
                    <span className="text-foreground">+${vitroSurchargeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Subtotal (with 27%):</span>
                    <span className="text-foreground">${subtotalWith27.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">× 2.5 Pricing Multiplier:</span>
                    <span className="text-foreground">${multipliedPre8.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-border/50 text-foreground font-bold text-xs">
                    <span className="font-sans">Sealed Unit Total:</span>
                    <span className="text-primary">${totals.glassBefore8PercentTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Installation Labour & Travel Audit */}
            <div className="p-3 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/40 font-bold text-foreground">
                <Wrench className="w-3.5 h-3.5 text-primary" />
                <span>Labour &amp; Travel Logistics Audit</span>
              </div>

              {!isInstallation && !isServiceOnly ? (
                <div className="py-6 text-center text-muted-foreground text-xs space-y-1">
                  <Info className="w-5 h-5 mx-auto opacity-40 text-muted-foreground" />
                  <div className="font-semibold text-foreground">Supply Only Order</div>
                  <p className="text-[11px] text-muted-foreground">
                    Installation labour and travel charges waived ($0.00). Customer pick-up or freight delivery.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Actual Glazed Sq Ft:</span>
                    <span className="text-foreground font-semibold">{(totals.totalSqft || 0).toFixed(2)} sq ft</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Glazing Labour (@ ${(labour?.labourRatePerSqft || 14.40).toFixed(2)}/sqft):</span>
                    <span className="text-foreground font-semibold">${totals.unitLabourSum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Glazing Supplies (@ ${(labour?.miscRatePerSqft || 2.40).toFixed(2)}/sqft):</span>
                    <span className="text-foreground font-semibold">+${totals.miscTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-muted-foreground">
                    <span className="font-sans">Local Setup Base:</span>
                    <span className="text-foreground font-semibold">+${totals.baseSetupFee.toFixed(2)}</span>
                  </div>
                  {totals.additionalFarFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">Far Area Setup Fee:</span>
                      <span className="text-foreground font-semibold">+${totals.additionalFarFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.vehicleTravelFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">Vehicle Travel ({travelKm} km @ $0.98/km):</span>
                      <span className="text-foreground font-semibold">+${totals.vehicleTravelFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.crewTravelFee > 0 && (
                    <div className="flex justify-between py-0.5 text-muted-foreground">
                      <span className="font-sans">Crew Travel ({crewHours} hrs, {crewSize} men):</span>
                      <span className="text-foreground font-semibold">+${totals.crewTravelFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-t border-border/50 text-foreground font-bold text-xs">
                    <span className="font-sans">Combined Labour &amp; Setup:</span>
                    <span className="text-primary">${totals.combinedLabourTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Economic Profit & Margin Analysis */}
            <div className="p-3 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/40 font-bold text-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span>Job Margin &amp; Profit Summary</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-0.5 text-muted-foreground">
                  <span className="font-sans">Total Billed Subtotal (Pre-tax):</span>
                  <span className="text-foreground font-bold">${totals.subtotalPreTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-muted-foreground">
                  <span className="font-sans">Est. Direct Material/Vehicle Costs:</span>
                  <span className="text-muted-foreground font-semibold">${totalRawDirectCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <span className="font-sans">Est. Gross Margin ($):</span>
                  <span>+${grossProfitDollar.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-muted-foreground font-sans">
                  <span>Gross Margin (%):</span>
                  <span className="font-mono font-bold text-foreground">{grossMarginPercent.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-0.5 text-muted-foreground font-sans">
                  <span>Manufacturing Multiplier:</span>
                  <span className="font-mono font-bold text-foreground">{stepMultiplier}× Vitro Base</span>
                </div>
                <div className="pt-2 text-[10px] text-muted-foreground/80 font-sans leading-tight">
                  Formulas reflect the official Vitro price sheet and company glazing rate schedule.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
