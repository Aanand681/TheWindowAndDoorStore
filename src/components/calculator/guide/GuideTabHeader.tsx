'use client';

import React from 'react';
import {
  HelpCircle,
  FileCheck2,
  Calculator,
  FileText,
  Layers,
  Bookmark,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuideTabType } from './GuideTabsContent';

export interface GuideTabHeaderProps {
  activeTab: GuideTabType;
  setActiveTab: (t: GuideTabType) => void;
  onClose: () => void;
}

export function GuideTabHeader({
  activeTab,
  setActiveTab,
  onClose,
}: GuideTabHeaderProps) {
  return (
    <div className="p-5 sm:p-6 pb-4 border-b border-border/70 bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Estimator &amp; Quoting Workflow Guide
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Quick instructions for FeneVision PDFs, Window Calculations, Quote Studio &amp; Sealed Units.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-1.5 mt-4 pt-2 border-t border-border/50">
        <button
          type="button"
          onClick={() => setActiveTab('fenevision')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'fenevision'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>1. FeneVision PDFs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'calculator'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>2. Window Calculator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('studio')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'studio'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>3. Quote PDF Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sealed_units')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'sealed_units'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>4. Sealed Units</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'workflow'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>5. Save &amp; Print Policy</span>
        </button>
      </div>
    </div>
  );
}

