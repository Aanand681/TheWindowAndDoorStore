'use client';

import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw, Check, FolderOpen, Paperclip, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalculatorHeaderToolbarProps {
  activeTab: 'promo' | 'tax' | 'quotes';
  isComparisonStaging: boolean;
  hasCompareOptions: boolean;
  hasAttachedQuotes: boolean;
  lastSavedAt: string | null;
  savedDraftsCount?: number;
  onOpenCompareModal: () => void;
  onRevertToBase: () => void;
  onKeepOptionB: () => void;
  onOpenAttachModal: () => void;
  onSaveDraft: () => void;
  onOpenSavedQuotes: () => void;
}

export function CalculatorHeaderToolbar({
  activeTab,
  isComparisonStaging,
  hasCompareOptions,
  hasAttachedQuotes,
  lastSavedAt,
  savedDraftsCount,
  onOpenCompareModal,
  onRevertToBase,
  onKeepOptionB,
  onOpenAttachModal,
  onSaveDraft,
  onOpenSavedQuotes,
}: CalculatorHeaderToolbarProps) {
  return (
    <>
      {/* Phase 3 Hybrid: Staging Mode Banner */}
      {isComparisonStaging && (
        <div className="bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/15 border border-amber-500/40 rounded-2xl p-3.5 px-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-150 mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-amber-950 font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Comparison Staging Mode: Option B (Upgraded Quote)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                  Live Editing
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Base Quote A is preserved. Customize crew, distance, jambs, or promo on Option B, then view the live comparison.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onOpenCompareModal}
              className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Comparison &amp; Delta</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRevertToBase}
              className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert to Base (Option A)</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onKeepOptionB}
              className="h-8 text-xs font-bold gap-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Keep Option B</span>
            </Button>
          </div>
        </div>
      )}

      {/* Tab Controls & Unified Action Bar */}
      {activeTab !== 'quotes' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 sm:mb-5">
          {/* Left Side: Segmented Tab Controls */}
          <TabsList className="inline-flex bg-muted p-1 rounded-xl border border-border/50 shadow-xs h-9">
            <TabsTrigger value="promo" className="rounded-lg text-xs font-semibold px-3 py-1 cursor-pointer">
              Promo Calculator
            </TabsTrigger>
            <TabsTrigger value="tax" className="rounded-lg text-xs font-semibold px-3 py-1 cursor-pointer">
              Tax &amp; Labour Calculator
            </TabsTrigger>
          </TabsList>

          {/* Right Side: Exact Sequence: Auto-saved info, Compare PDF, Attach Quote, Save Draft, Saved Quotes */}
          <div className="flex items-center gap-2 flex-wrap">
            {lastSavedAt && (
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/50">
                Draft auto-saved {lastSavedAt}
              </span>
            )}

            {hasCompareOptions && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenCompareModal}
                className="h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1.5 shadow-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                title="Compare Promo Option A vs Option B"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Compare PDF</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAttachModal}
              className={cn(
                'h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1.5 shadow-xs transition-colors',
                hasAttachedQuotes
                  ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                  : 'border-border/80 hover:bg-muted text-foreground'
              )}
              title="Attach an existing quote (Sealed Units, Entry Doors, etc.) to this window quote"
            >
              <Paperclip
                className={cn(
                  'w-3.5 h-3.5',
                  hasAttachedQuotes ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
                )}
              />
              <span>{hasAttachedQuotes ? 'Quote Attached' : 'Attach Quote'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              className="h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1.5 border-primary/40 text-primary hover:bg-primary/10 shadow-xs"
              title="Save current quote to drafts"
            >
              <Bookmark className="w-3.5 h-3.5 text-primary" />
              <span>Save Draft</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSavedQuotes}
              className="h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1.5 border-border/80 hover:bg-muted shadow-xs"
              title="View and load saved quotes"
            >
              <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Saved Quotes</span>
              {typeof savedDraftsCount === 'number' && savedDraftsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {savedDraftsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

