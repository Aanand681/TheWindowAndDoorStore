'use client';

import React from 'react';
import { Layers, Calculator, RefreshCw, Sparkles, Wrench } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SealedUnitLabourSettings } from '@/lib/sealed-units-logic';

export interface SealedUnitServiceCardProps {
  labour: SealedUnitLabourSettings;
  itemsSqft: number;
  serviceSqftInput: string;
  setServiceSqftInput?: (val: string) => void;
  serviceLabourRateInput: string;
  setServiceLabourRateInput?: (val: string) => void;
  serviceMiscRateInput: string;
  setServiceMiscRateInput?: (val: string) => void;
  serviceLabourTotal: number;
  totalTravelAndSetup: number;
  miscTotal: number;
  subtotalPreTax: number;
  hstAmount: number;
  grandTotal: number;
}

export function SealedUnitServiceCard({
  labour,
  itemsSqft,
  serviceSqftInput,
  setServiceSqftInput,
  serviceLabourRateInput,
  setServiceLabourRateInput,
  serviceMiscRateInput,
  setServiceMiscRateInput,
  serviceLabourTotal,
  totalTravelAndSetup,
  miscTotal,
  subtotalPreTax,
  hstAmount,
  grandTotal,
}: SealedUnitServiceCardProps) {
  const combinedLabourWithTravel = serviceLabourTotal + totalTravelAndSetup;

  return (
    <div className="space-y-3">
      {/* Informational Header */}
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5 sm:mt-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Service &amp; Repair Work</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                13% HST Locked
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Service labour on square footage + travel setup. Glass manufacturing base is strictly $0.00.
            </p>
          </div>
        </div>
        {itemsSqft > 0 && setServiceSqftInput && (
          <button
            type="button"
            onClick={() => {
              if (serviceSqftInput) {
                setServiceSqftInput('');
              } else {
                setServiceSqftInput(itemsSqft.toFixed(2));
              }
            }}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            title="Toggle between direct square footage input and sum of added glass items"
          >
            <RefreshCw className="w-3 h-3" />
            <span>
              {serviceSqftInput
                ? `Reset to Items (${itemsSqft.toFixed(2)} sq ft)`
                : `Use Items: ${itemsSqft.toFixed(2)} sq ft`}
            </span>
          </button>
        )}
      </div>

      {/* Direct Square Footage & Rate Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-background/90 p-2.5 rounded-xl border border-border/70 space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="serviceSqft" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Total Service Sq Ft</span>
            </Label>
            {serviceSqftInput && (
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">Override</span>
            )}
          </div>
          <Input
            id="serviceSqft"
            type="number"
            step="0.01"
            min="0"
            placeholder={itemsSqft > 0 ? itemsSqft.toFixed(2) : 'e.g. 24.50'}
            value={serviceSqftInput}
            onChange={(e) => setServiceSqftInput && setServiceSqftInput(e.target.value)}
            className="h-8 font-mono text-xs font-bold text-foreground bg-muted/20"
          />
          <p className="text-[10px] text-muted-foreground leading-tight">
            {itemsSqft > 0 && !serviceSqftInput
              ? `Auto-synced from ${itemsSqft.toFixed(2)} sq ft of added glass.`
              : 'Enter custom sq ft or add units above.'}
          </p>
        </div>

        <div className="bg-background/90 p-2.5 rounded-xl border border-border/70 space-y-1">
          <Label htmlFor="serviceLabourRate" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Calculator className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Labour Rate ($/sqft)</span>
          </Label>
          <Input
            id="serviceLabourRate"
            type="number"
            step="0.10"
            min="0"
            placeholder={(labour.labourRatePerSqft || 14.4).toFixed(2)}
            value={serviceLabourRateInput}
            onChange={(e) => setServiceLabourRateInput && setServiceLabourRateInput(e.target.value)}
            className="h-8 font-mono text-xs font-bold text-foreground bg-muted/20"
          />
          <p className="text-[10px] text-muted-foreground leading-tight">
            Default ${(labour.labourRatePerSqft || 14.4).toFixed(2)}/sqft.
          </p>
        </div>

        <div className="bg-background/90 p-2.5 rounded-xl border border-border/70 space-y-1">
          <Label htmlFor="serviceMiscRate" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Calculator className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Misc / Materials ($/sqft)</span>
          </Label>
          <Input
            id="serviceMiscRate"
            type="number"
            step="0.10"
            min="0"
            placeholder={(labour.miscRatePerSqft || 2.4).toFixed(2)}
            value={serviceMiscRateInput}
            onChange={(e) => setServiceMiscRateInput && setServiceMiscRateInput(e.target.value)}
            className="h-8 font-mono text-xs font-bold text-foreground bg-muted/20"
          />
          <p className="text-[10px] text-muted-foreground leading-tight">
            Default ${(labour.miscRatePerSqft || 2.4).toFixed(2)}/sqft.
          </p>
        </div>
      </div>

      {/* Live Financial Breakdown Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-background/80 p-2 rounded-lg border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
            Service Labour (Sqft)
          </div>
          <div className="text-sm font-mono font-bold text-foreground">
            ${serviceLabourTotal.toFixed(2)}
          </div>
          <div className="text-[9px] text-muted-foreground">
            +${totalTravelAndSetup.toFixed(2)} travel
          </div>
        </div>

        <div className="bg-background/80 p-2 rounded-lg border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
            Total Labour (w/ Travel)
          </div>
          <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ${combinedLabourWithTravel.toFixed(2)}
          </div>
          <div className="text-[9px] text-muted-foreground">
            Under service labour
          </div>
        </div>

        <div className="bg-background/80 p-2 rounded-lg border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
            Misc / Supplies
          </div>
          <div className="text-sm font-mono font-bold text-foreground">
            ${miscTotal.toFixed(2)}
          </div>
          <div className="text-[9px] text-muted-foreground">
            Sealant &amp; setting blocks
          </div>
        </div>

        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/30">
          <div className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-bold tracking-wider mb-0.5">
            Subtotal (Pre-Tax)
          </div>
          <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
            ${subtotalPreTax.toFixed(2)}
          </div>
          <div className="text-[9px] text-muted-foreground">
            + 13% HST (${hstAmount.toFixed(2)})
          </div>
        </div>
      </div>
    </div>
  );
}
