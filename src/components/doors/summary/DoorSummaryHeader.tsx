'use client';

import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DoorQuotingMode } from '@/lib/doors/types';

export interface DoorSummaryHeaderProps {
  quoteNumber?: string;
  customerName?: string;
  mode: DoorQuotingMode;
  onModeChange: (mode: DoorQuotingMode) => void;
}

export function DoorSummaryHeader({
  quoteNumber,
  customerName,
  mode,
  onModeChange,
}: DoorSummaryHeaderProps) {
  return (
    <CardHeader className="p-3.5 pb-2.5 border-b border-border/50">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-bold flex items-center gap-1.5 truncate">
            <span className="truncate">Door Quote Summary</span>
          </CardTitle>
          <p
            className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate"
            suppressHydrationWarning
          >
            Itemized summary for Quote #{quoteNumber || '------'}{' '}
            {customerName ? `• ${customerName}` : ''}
          </p>
        </div>

        {/* Compact Scope Selector in Header */}
        <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onModeChange('installation')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
              mode === 'installation'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Wrench className="w-3 h-3" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('supply_only')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
              mode === 'supply_only'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <PackageCheck className="w-3 h-3" />
            <span>Supply Only</span>
          </button>
        </div>
      </div>
    </CardHeader>
  );
}

