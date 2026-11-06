'use client';

import React from 'react';
import { DoorQuotingMode } from '@/lib/doors/types';
import { Wrench, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoorScopeSelectorProps {
  mode: DoorQuotingMode;
  onModeChange: (mode: DoorQuotingMode) => void;
  className?: string;
}

export function DoorScopeSelector({
  mode,
  onModeChange,
  className,
}: DoorScopeSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 p-1.5 bg-muted/40 rounded-2xl border border-border/60', className)}>
      <button
        type="button"
        onClick={() => onModeChange('installation')}
        className={cn(
          'flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-sm transition-all cursor-pointer',
          mode === 'installation'
            ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        )}
      >
        <Wrench className="w-4 h-4 shrink-0" />
        <div className="text-left">
          <div className="font-semibold text-xs sm:text-sm">Supply &amp; Installation</div>
          <div className={cn(
            'text-[10px] hidden sm:block',
            mode === 'installation' ? 'text-white/80 dark:text-black/80' : 'text-muted-foreground'
          )}>
            Full door supply, setup fee, install labour &amp; upcharges
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onModeChange('supply_only')}
        className={cn(
          'flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-sm transition-all cursor-pointer',
          mode === 'supply_only'
            ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        )}
      >
        <PackageCheck className="w-4 h-4 shrink-0" />
        <div className="text-left">
          <div className="font-semibold text-xs sm:text-sm">Supply Only</div>
          <div className={cn(
            'text-[10px] hidden sm:block',
            mode === 'supply_only' ? 'text-white/80 dark:text-black/80' : 'text-muted-foreground'
          )}>
            Doors &amp; hardware only (zero labour or setup fee)
          </div>
        </div>
      </button>
    </div>
  );
}

