'use client';

import React from 'react';
import { User, Hash, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SealedUnitsCustomerInfoBarProps {
  customerName: string;
  setCustomerName: (val: string) => void;
  quoteNumber: string;
  setQuoteNumber: (val: string) => void;
  onRegenerateQuoteNumber: () => void;
}

export function SealedUnitsCustomerInfoBar({
  customerName,
  setCustomerName,
  quoteNumber,
  setQuoteNumber,
  onRegenerateQuoteNumber,
}: SealedUnitsCustomerInfoBarProps) {
  return (
    <div className="bg-card/70 border border-border/80 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Customer Name */}
        <div className="sm:col-span-7 space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>
              Customer Name <span className="text-destructive">*</span>
            </span>
          </Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name (required)"
            className="h-9 text-xs sm:text-sm bg-background shadow-xs font-medium"
          />
        </div>

        {/* 6-Digit Quote Number */}
        <div className="sm:col-span-5 space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-primary" />
              <span>6-Digit Quote Number</span>
            </Label>
            <button
              type="button"
              onClick={onRegenerateQuoteNumber}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
              title="Generate a fresh unique 6-digit quote number"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regenerate</span>
            </button>
          </div>
          <div className="relative">
            <Input
              suppressHydrationWarning
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="h-9 text-xs sm:text-sm font-mono font-bold bg-background shadow-xs text-foreground tracking-wider pl-8"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold text-xs pointer-events-none">
              #
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

