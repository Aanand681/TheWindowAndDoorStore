'use client';

import React from 'react';
import {
  Search,
  X,
  Layers,
  Component,
  DoorClosed,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { QuoteType } from '@/lib/quote-drafts-storage';

interface SavedQuotesFilterBarProps {
  selectedTab: QuoteType | 'all';
  setSelectedTab: (tab: QuoteType | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalDraftsCount: number;
  windowDraftsCount: number;
  sealedUnitDraftsCount: number;
  doorDraftsCount: number;
}

export function SavedQuotesFilterBar({
  selectedTab,
  setSelectedTab,
  searchQuery,
  setSearchQuery,
  totalDraftsCount,
  windowDraftsCount,
  sealedUnitDraftsCount,
  doorDraftsCount,
}: SavedQuotesFilterBarProps) {
  return (
    <div className="p-3 sm:p-4 border-b border-border/60 bg-background/50 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              selectedTab === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All ({totalDraftsCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('window')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedTab === 'window'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Component className="w-3.5 h-3.5" />
            <span>Windows ({windowDraftsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('sealed_unit')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedTab === 'sealed_unit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sealed Units ({sealedUnitDraftsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('door')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedTab === 'door'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>Doors ({doorDraftsCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer or quote #..."
            className="pl-8 h-8 text-xs bg-background shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

