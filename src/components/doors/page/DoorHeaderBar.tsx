'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DoorClosed,
  Settings as SettingsIcon,
  Bookmark,
  FolderOpen,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoorHeaderBarProps {
  lastSavedAt: string | null;
  attachedWindowQuote: any;
  attachedSealedUnit: any;
  savedDraftsCount: number;
  isAdmin: boolean;
  onOpenAttach: () => void;
  onSaveDraft: () => void;
  onOpenSavedQuotes: () => void;
  onOpenReset?: () => void;
}

export function DoorHeaderBar({
  lastSavedAt,
  attachedWindowQuote,
  attachedSealedUnit,
  savedDraftsCount,
  isAdmin,
  onOpenAttach,
  onSaveDraft,
  onOpenSavedQuotes,
  onOpenReset: _onOpenReset,
}: DoorHeaderBarProps) {
  const hasAttachment = Boolean(attachedWindowQuote || attachedSealedUnit);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 border-b border-border/50">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <DoorClosed className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Door &amp; Installation Calculator
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Inkster software pricing, 8% surcharge, 10% door discount (storm exempt), hardware, and site labour.
        </p>
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
          onClick={onOpenAttach}
          className={cn(
            'gap-1.5 text-xs h-8 px-2.5 font-semibold cursor-pointer shadow-xs transition-colors',
            hasAttachment
              ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
              : 'border-border/80 hover:bg-muted text-foreground'
          )}
          title="Attach saved Window or Sealed Unit quote to this door quote"
        >
          <Paperclip
            className={cn(
              'w-3.5 h-3.5',
              hasAttachment
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-primary'
            )}
          />
          <span>{hasAttachment ? 'Quote Attached' : 'Attach Quote'}</span>
          {hasAttachment && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          )}
        </Button>

        {/* 2. Save Draft */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          className="gap-1.5 text-xs h-8 px-2.5 font-semibold cursor-pointer shadow-xs border-border/80 hover:bg-muted text-foreground"
          title="Explicitly save this door quote to your permanent Saved Quotes library"
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
          className="gap-1.5 text-xs h-8 px-2.5 font-semibold cursor-pointer shadow-xs border-border/80 hover:bg-muted text-foreground relative"
        >
          <FolderOpen className="w-3.5 h-3.5 text-primary" />
          <span>Saved Quotes</span>
          {savedDraftsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
              {savedDraftsCount}
            </span>
          )}
        </Button>

        {/* 4. Admin Rates Button */}
        {isAdmin && (
          <Link href="/admin/doors">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 px-2.5 font-semibold cursor-pointer shadow-xs border-border/80 hover:bg-muted text-foreground"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-primary" />
              <span>Door Rates</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
