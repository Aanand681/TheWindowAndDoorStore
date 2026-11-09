'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText, CheckCircle2, Star } from 'lucide-react';
import { QuoteTemplateType } from '../QuoteInvoice';

export interface QuotePreviewToolbarProps {
  onPrint: () => void;
  onClose: () => void;
  template: QuoteTemplateType;
  onTemplateChange: (t: QuoteTemplateType) => void;
  defaultTemplate: QuoteTemplateType | null;
  handleSetDefaultTemplate: () => void;
  orientation: 'portrait' | 'landscape';
  setOrientation: (o: 'portrait' | 'landscape') => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  spacing: number;
  onSpacingChange: (spacing: number) => void;
  showNotesEditor: boolean;
  setShowNotesEditor: React.Dispatch<React.SetStateAction<boolean>>;
  quoteNotes?: string;
}

export function QuotePreviewToolbar({
  onPrint,
  onClose,
  template,
  onTemplateChange,
  defaultTemplate,
  handleSetDefaultTemplate,
  orientation,
  setOrientation,
  fontSize,
  onFontSizeChange,
  spacing,
  onSpacingChange,
  showNotesEditor,
  setShowNotesEditor,
  quoteNotes = '',
}: QuotePreviewToolbarProps) {
  return (
    <div className="sticky top-0 z-10 w-full border-b border-border bg-card/95 px-4 py-2 shadow-sm backdrop-blur print:hidden">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Row 1: Preview Status & Primary Actions (Print / Close) */}
        <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm tracking-wide text-foreground">Print Preview</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>8½&quot; × 11&quot; Letter Standard</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onPrint} className="shadow-sm font-semibold cursor-pointer h-8 px-3.5 gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print / Export PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full cursor-pointer h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Document Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Left: Template Switcher & Set Default */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => onTemplateChange('modern')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  template === 'modern'
                    ? 'bg-background text-primary shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Modern Detailed
              </button>
              <button
                type="button"
                onClick={() => onTemplateChange('executive')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  template === 'executive'
                    ? 'bg-background text-primary shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Executive Ledger
              </button>
              <button
                type="button"
                onClick={() => onTemplateChange('cards')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  template === 'cards'
                    ? 'bg-background text-primary shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Specification Sheet
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSetDefaultTemplate}
              title={template === defaultTemplate ? 'Current default template' : 'Set this as your default invoice template'}
              className={`h-7 px-2 text-[11px] gap-1 cursor-pointer transition-all ${
                template === defaultTemplate
                  ? 'text-amber-500 font-bold bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-muted-foreground hover:text-amber-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${template === defaultTemplate ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{template === defaultTemplate ? 'Default' : 'Set Default'}</span>
            </Button>
          </div>

          {/* Right: Orientation, Font Slider, Spacing Slider, Notes */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-background text-primary shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-background text-primary shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Landscape
              </button>
            </div>

            {/* Font Size Slider */}
            <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-lg border border-border">
              <span className="text-[11px] text-muted-foreground font-medium">Font:</span>
              <input
                type="range"
                min="9.0"
                max="16.5"
                step="0.5"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
                className="w-16 accent-primary cursor-pointer h-1.5 bg-muted rounded"
              />
              <span className="font-mono text-[11px] font-bold w-9 text-right">{fontSize.toFixed(1)}px</span>
            </div>

            {/* Spacing Slider */}
            <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-lg border border-border">
              <span className="text-[11px] text-muted-foreground font-medium">Spacing:</span>
              <input
                type="range"
                min="0.75"
                max="1.50"
                step="0.05"
                value={spacing}
                onChange={(e) => onSpacingChange(parseFloat(e.target.value))}
                className="w-14 accent-primary cursor-pointer h-1.5 bg-muted rounded"
              />
              <span className="font-mono text-[11px] font-bold w-10 text-right">{spacing.toFixed(2)}x</span>
            </div>

            {/* Notes Editor Toggle */}
            <Button
              type="button"
              variant={showNotesEditor ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowNotesEditor((prev) => !prev)}
              className="h-7 px-2.5 text-xs font-semibold cursor-pointer"
            >
              {showNotesEditor ? 'Hide Notes' : quoteNotes ? 'Edit Notes (Active)' : '+ Add Notes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

