'use client';

import React from 'react';
import { Sparkles, DoorOpen, AppWindow } from 'lucide-react';

export type StudioProductType = 'window' | 'door';

interface StudioScopeBarProps {
  productType: StudioProductType;
  onProductTypeChange: (type: StudioProductType) => void;
  detectedType: 'window' | 'door' | 'mixed' | 'unknown' | null;
}

export function StudioScopeBar({
  productType,
  onProductTypeChange,
  detectedType,
}: StudioScopeBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-card/60 border border-border backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/60">
        <button
          type="button"
          onClick={() => onProductTypeChange('window')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            productType === 'window'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
          }`}
        >
          <AppWindow className="w-4 h-4 text-primary" />
          <span>Windows</span>
        </button>

        <button
          type="button"
          onClick={() => onProductTypeChange('door')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            productType === 'door'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
          }`}
        >
          <DoorOpen className="w-4 h-4 text-emerald-500" />
          <span>Doors</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {detectedType && detectedType !== 'unknown' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-primary/40 bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span>
              Auto-detected: {detectedType === 'door' ? 'Door Quote' : detectedType === 'window' ? 'Window Quote' : 'Mixed Quote'}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

