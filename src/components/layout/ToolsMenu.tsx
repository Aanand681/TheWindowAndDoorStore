'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Wrench,
  ChevronDown,
  FileText,
  DoorClosed,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export interface ToolsMenuProps {
  currentPath: string;
  className?: string;
}

export default function ToolsMenu({ currentPath, className }: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isStudioActive = currentPath === '/quote-studio';
  const isUpgradeActive = currentPath === '/upgrade-calculator';
  const isSealedUnitsActive = currentPath === '/sealed-units';

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-all cursor-pointer shadow-xs',
          isStudioActive || isUpgradeActive || isSealedUnitsActive
            ? 'border-primary text-primary bg-primary/10 hover:bg-primary/15'
            : 'border-border/60 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
        )}
        title="Tools & App Launcher"
        aria-expanded={isOpen}
      >
        <Wrench className="w-3.5 h-3.5" />
        <span>Tools</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 opacity-70 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-card/95 backdrop-blur-xl border border-border p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Estimator Tools
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                Suite
              </span>
            </div>
          </div>

          <div className="py-1.5 space-y-1">
            {/* Tool 1: Quote PDF Studio */}
            <Link
              href="/quote-studio"
              onClick={() => setIsOpen(false)}
              className={cn(
                'group flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer border',
                isStudioActive
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-transparent hover:bg-muted/60 text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg shrink-0 transition-colors',
                  isStudioActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                )}
              >
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Quote PDF Studio</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Invoice generation, designer &amp; print presets
                </p>
              </div>
            </Link>

            {/* Tool 2: Labour Upgrade */}
            <Link
              href="/upgrade-calculator"
              onClick={() => setIsOpen(false)}
              className={cn(
                'group flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer border',
                isUpgradeActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent hover:bg-muted/60 text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg shrink-0 transition-colors',
                  isUpgradeActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'
                )}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Labour Upgrade</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Instant 5-year labour warranty fee calculator
                </p>
              </div>
            </Link>

            {/* Tool 3: Sealed Unit Price Calculator */}
            <Link
              href="/sealed-units"
              onClick={() => setIsOpen(false)}
              className={cn(
                'group flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer border',
                isSealedUnitsActive
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                  : 'border-transparent hover:bg-muted/60 text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg shrink-0 transition-colors',
                  isSealedUnitsActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                )}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Sealed Units</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Glass unit pricing, installation &amp; travel calculator
                </p>
              </div>
            </Link>

            {/* Tool 2: Door Calculator (Coming Soon) */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl border border-dashed border-border/60 bg-muted/20 opacity-70 cursor-not-allowed select-none">
              <div className="p-2 rounded-lg shrink-0 bg-muted text-muted-foreground">
                <DoorClosed className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">Door Calculator</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-semibold">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Exterior entry doors &amp; slab pricing engine
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
