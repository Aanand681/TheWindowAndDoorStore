'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Sparkles, Bookmark, FolderOpen, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SmartBackButton from '@/components/shared/SmartBackButton';
import { AppHeader } from '@/components/layout/AppHeader';

interface SealedUnitsHeaderBarProps {
  user: any;
  lastSavedAt: string | null;
  hasAttachedQuote: boolean;
  savedDraftsCount: number;
  onOpenAttachModal: () => void;
  onSaveDraft: () => void;
  onOpenSavedQuotes: () => void;
}

export function SealedUnitsHeaderBar({
  user,
  lastSavedAt,
  hasAttachedQuote,
  savedDraftsCount,
  onOpenAttachModal,
  onSaveDraft,
  onOpenSavedQuotes,
}: SealedUnitsHeaderBarProps) {
  const canManagePriceSheets = Boolean(
    user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.canAccessAdmin
  );

  return (
    <div className="space-y-4">
      <AppHeader currentPath="/sealed-units" />

      {/* Sub-bar with SmartBackButton & Title */}
      <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <SmartBackButton fallbackUrl="/calculator" title="Back to Calculator" />
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20">
              <Layers className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              Sealed Unit Calculator
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              Official Shop Logic
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {lastSavedAt && (
            <span className="text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/50">
              Draft auto-saved {lastSavedAt}
            </span>
          )}

          {/* 1. Attach Quote */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAttachModal}
            className={cn(
              'h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1.5 shadow-xs transition-colors',
              hasAttachedQuote
                ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                : 'border-border/80 hover:bg-muted text-foreground'
            )}
            title="Attach saved Window or Door quote to this sealed unit quotation"
          >
            <Paperclip
              className={cn(
                'w-3.5 h-3.5',
                hasAttachedQuote
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-primary'
              )}
            />
            <span>{hasAttachedQuote ? 'Quote Attached' : 'Attach Quote'}</span>
          </Button>

          {/* 2. Save Draft */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            className="h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1.5 border-primary/40 text-primary hover:bg-primary/10 shadow-xs"
            title="Save current sealed unit quote to drafts"
          >
            <Bookmark className="w-3.5 h-3.5 text-primary" />
            <span>Save Draft</span>
          </Button>

          {/* 3. Saved Quotes */}
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
            {savedDraftsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                {savedDraftsCount}
              </span>
            )}
          </Button>

          {canManagePriceSheets && (
            <Link href="/admin/sealed-units">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1.5 border-border/80 hover:bg-muted shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Manage Price Sheets</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

