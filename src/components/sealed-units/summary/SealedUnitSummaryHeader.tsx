'use client';

import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { PackageCheck, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SealedUnitSummaryHeaderProps {
  quoteNumber: string;
  customerName: string;
  mode?: 'installation' | 'supply_only' | 'service_only';
  onModeChange?: (mode: 'installation' | 'supply_only' | 'service_only') => void;
  isService: boolean;
}

export function SealedUnitSummaryHeader({
  quoteNumber,
  customerName,
  mode,
  onModeChange,
  isService,
}: SealedUnitSummaryHeaderProps) {
  return (
    <CardHeader className="p-3.5 pb-2.5 border-b border-border/50">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-bold flex items-center gap-1.5 truncate">
            <span className="truncate">Sealed Unit Summary</span>
          </CardTitle>
          <p
            className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate"
            suppressHydrationWarning
          >
            Itemized summary for Quote #{quoteNumber || '------'}{' '}
            {customerName ? `• ${customerName}` : ''}
          </p>
        </div>

        {onModeChange ? (
          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 shrink-0">
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
              onClick={() => onModeChange('service_only')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                mode === 'service_only'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Wrench className="w-3 h-3" />
              <span>Service Only</span>
            </button>
          </div>
        ) : (
          isService && (
            <span className="h-7 px-2.5 rounded-lg border border-border/80 bg-muted/60 text-[11px] font-semibold text-foreground flex items-center shadow-xs">
              Service Only
            </span>
          )
        )}
      </div>
    </CardHeader>
  );
}

