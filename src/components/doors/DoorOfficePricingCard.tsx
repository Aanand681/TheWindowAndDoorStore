'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DoorLineItem, DoorQuoteTotals, DoorQuotingMode } from '@/lib/doors/types';
import { FileSpreadsheet, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DoorOfficePricingCardProps {
  totals: DoorQuoteTotals;
  lineItems: DoorLineItem[];
  mode: DoorQuotingMode;
  className?: string;
}

export function DoorOfficePricingCard({
  totals,
  lineItems: _lineItems,
  mode: _mode,
  className,
}: DoorOfficePricingCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyBreakdown = () => {
    const text = `DOOR INTERNAL PRICING AUDIT:
Units: ${totals.totalUnits} (${totals.totalDoors} standard doors, ${totals.totalStormDoors} storm doors)
Base Inkster Total: $${(totals.rawDoorBaseTotal + totals.stormDoorTotal).toFixed(2)}
Surcharge (8%): $${totals.surchargeTotal.toFixed(2)}
10% Door Discount: -$${totals.discountTotal.toFixed(2)}
Net Door Supply: $${totals.netDoorSupplyTotal.toFixed(2)}
Unit Labour: $${totals.unitLabourTotal.toFixed(2)}
Jobsite Upcharges: $${totals.upchargesTotal.toFixed(2)}
Setup & Travel: $${totals.totalTravelAndSetup.toFixed(2)}
Combined Labour: $${totals.combinedLabourTotal.toFixed(2)}
Misc Materials: $${totals.miscTotal.toFixed(2)}
Hardware: $${totals.hardwareTotal.toFixed(2)}
Pre-Tax Subtotal: $${totals.subtotalPreTax.toFixed(2)}
HST: $${totals.hstAmount.toFixed(2)}
Grand Total: $${totals.grandTotal.toFixed(2)}
50% Deposit: $${totals.depositAmount.toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Internal pricing audit copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn('!py-0 !gap-0 [--card-spacing:0px]', className)}>
      <CardHeader className="p-3 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-tight">
              Office Pricing &amp; Internal Audit Reference
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono">
              Net Supply: ${totals.netDoorSupplyTotal.toFixed(2)}
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-3 pt-0 border-t border-border/50 space-y-3 text-xs bg-muted/20">
          <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div className="space-y-1">
              <div className="text-muted-foreground">Raw Inkster Doors:</div>
              <div className="font-mono font-semibold">${totals.rawDoorBaseTotal.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Surcharge (8%):</div>
              <div className="font-mono font-semibold">+${totals.surchargeTotal.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">10% Door Discount:</div>
              <div className="font-mono font-semibold text-emerald-600">-${totals.discountTotal.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Net Door Supply:</div>
              <div className="font-mono font-bold">${totals.netDoorSupplyTotal.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Installation Labour:</div>
              <div className="font-mono font-semibold">${totals.unitLabourTotal.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Jobsite Upcharges:</div>
              <div className="font-mono font-semibold">${totals.upchargesTotal.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Mobilization &amp; Travel:</div>
              <div className="font-mono font-semibold">${totals.totalTravelAndSetup.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Miscellaneous Materials:</div>
              <div className="font-mono font-semibold">${totals.miscTotal.toFixed(2)}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Internal shop ledger formula reference (Jodi Tax Calc)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyBreakdown}
              className="h-7 text-[11px] gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy Audit'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

