'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText, CheckCircle2, Star } from 'lucide-react';
import QuoteNotesEditor from '@/components/quotes/QuoteNotesEditor';
import { SealedUnitTemplateType } from '../SealedUnitPrintInvoice';

interface SealedUnitPrintToolbarProps {
  handlePrint: () => void;
  onClose: () => void;
  template: SealedUnitTemplateType;
  onTemplateChange: (t: SealedUnitTemplateType) => void;
  defaultTemplate: SealedUnitTemplateType | null;
  handleSetDefaultTemplate: () => void;
  orientation: 'portrait' | 'landscape';
  setOrientation: (o: 'portrait' | 'landscape') => void;
  fontSize: number;
  onFontSizeChange: (sz: number) => void;
  spacing: number;
  onSpacingChange: (sp: number) => void;
  quoteNotes: string;
  onQuoteNotesChange?: (notes: string) => void;
  showNotesEditor: boolean;
  setShowNotesEditor: (show: boolean) => void;
}

export function SealedUnitPrintToolbar({
  handlePrint,
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
  quoteNotes,
  onQuoteNotesChange,
  showNotesEditor,
  setShowNotesEditor,
}: SealedUnitPrintToolbarProps) {
  return (
    <div className="sticky top-0 z-10 w-full border-b border-border bg-card/95 px-4 py-2 shadow-sm backdrop-blur print:hidden">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Row 1: Status & Actions */}
        <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm tracking-wide text-foreground">
                Sealed Unit Print Preview
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>8½&quot; × 11&quot; Letter Standard</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="shadow-sm font-semibold cursor-pointer h-8 px-3.5 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full cursor-pointer h-8 w-8 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Document Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* 3-Template Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => onTemplateChange('window_style')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  template === 'window_style'
                    ? 'bg-background text-primary shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Window Style
              </button>
              <button
                type="button"
                onClick={() => onTemplateChange('standard')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  template === 'standard'
                    ? 'bg-background text-primary shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Standard (Full Width)
              </button>
              <button
                type="button"
                onClick={() => onTemplateChange('production')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  template === 'production'
                    ? 'bg-background text-primary shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Production Order
              </button>
            </div>

            {/* Set Default Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSetDefaultTemplate}
              title={
                template === defaultTemplate
                  ? 'Current default template'
                  : 'Set this as your default sealed unit invoice template'
              }
              className={`h-7 px-2 text-[11px] gap-1 cursor-pointer transition-all ${
                template === defaultTemplate
                  ? 'text-amber-500 font-bold bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-muted-foreground hover:text-amber-400'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  template === defaultTemplate ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
              <span>{template === defaultTemplate ? 'Default' : 'Set Default'}</span>
            </Button>
          </div>

          {/* Document Sliders & Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Orientation Switcher */}
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-background text-primary shadow-xs font-semibold'
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
                    ? 'bg-background text-primary shadow-xs font-semibold'
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
                min="7.0"
                max="12.0"
                step="0.5"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
                className="w-16 accent-primary cursor-pointer h-1.5 bg-muted rounded"
              />
              <span className="font-mono text-[11px] font-bold w-9 text-right">{fontSize.toFixed(1)}pt</span>
            </div>

            {/* Spacing Slider */}
            <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-lg border border-border">
              <span className="text-[11px] text-muted-foreground font-medium">Spacing:</span>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={spacing}
                onChange={(e) => onSpacingChange(parseFloat(e.target.value))}
                className="w-16 accent-primary cursor-pointer h-1.5 bg-muted rounded"
              />
              <span className="font-mono text-[11px] font-bold w-7 text-right">{spacing.toFixed(1)}x</span>
            </div>

            {/* Notes Toggle with Bold & Bullet formatting */}
            {onQuoteNotesChange && (
              <button
                type="button"
                onClick={() => setShowNotesEditor(!showNotesEditor)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  showNotesEditor || (quoteNotes && quoteNotes.trim())
                    ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {quoteNotes && quoteNotes.trim() ? 'Notes (Active)' : '+ Add Notes'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Rich Notes Editor (Bold & Bullets) */}
      {showNotesEditor && onQuoteNotesChange && (
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-border animate-in fade-in duration-150">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-foreground">
              Rich Notes Editor (Supports Bold text &amp; Bullets)
            </span>
            <button
              type="button"
              onClick={() => setShowNotesEditor(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hide
            </button>
          </div>
          <QuoteNotesEditor
            id="modalNotes"
            value={quoteNotes}
            onChange={onQuoteNotesChange}
            placeholder="Enter special site instructions, warranty terms, or employee comments with bold text and bullet points..."
          />
        </div>
      )}
    </div>
  );
}

