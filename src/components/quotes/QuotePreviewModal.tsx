'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText, CheckCircle2, Star } from 'lucide-react';
import QuoteInvoice, { QuoteInvoiceProps, QuoteTemplateType } from './QuoteInvoice';
import QuoteNotesEditor from './QuoteNotesEditor';
import { toast } from 'sonner';

interface QuotePreviewModalProps extends QuoteInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  template: QuoteTemplateType;
  onTemplateChange: (t: QuoteTemplateType) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  spacing: number;
  onSpacingChange: (spacing: number) => void;
  quoteNotes?: string;
  onQuoteNotesChange?: (notes: string) => void;
}

export default function QuotePreviewModal({
  isOpen,
  onClose,
  template,
  onTemplateChange,
  fontSize,
  onFontSizeChange,
  spacing,
  onSpacingChange,
  quoteNotes = '',
  onQuoteNotesChange,
  ...invoiceProps
}: QuotePreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState<QuoteTemplateType | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('quote-modal-open');
      return () => {
        document.body.classList.remove('quote-modal-open');
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // 1. Sync from localStorage first for instant display
      const saved = (typeof window !== 'undefined' ? localStorage.getItem('defaultQuoteTemplate') : null) as QuoteTemplateType | null;
      if (saved && ['modern', 'executive', 'cards'].includes(saved)) {
        setDefaultTemplate(saved);
        onTemplateChange(saved);
      }
      // 2. Sync from database profile
      fetch('/api/profile')
        .then(r => r.json())
        .then(d => {
          if (d?.favoriteTemplate && ['modern', 'executive', 'cards'].includes(d.favoriteTemplate)) {
            setDefaultTemplate(d.favoriteTemplate);
            localStorage.setItem('defaultQuoteTemplate', d.favoriteTemplate);
            if (!saved) {
              onTemplateChange(d.favoriteTemplate);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSetDefaultTemplate = async () => {
    try {
      localStorage.setItem('defaultQuoteTemplate', template);
      setDefaultTemplate(template);
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoriteTemplate: template }),
      });
      const name = template === 'modern' ? 'Modern Detailed' : template === 'executive' ? 'Executive Ledger' : 'Specification Sheet';
      toast.success(`${name} set as your default template!`);
    } catch (e) {
      toast.success('Template saved as default!');
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isLandscape = orientation === 'landscape';

  const modalContent = (
    <div className="quote-preview-portal fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-md animate-in fade-in duration-200 print:static print:inset-auto print:bg-white print:p-0 print:m-0 print:block print:w-full print:h-auto print:overflow-visible">
      {/* Top Floating Control Toolbar */}
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
                <span>8½" × 11" Letter Standard</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handlePrint} className="shadow-sm font-semibold cursor-pointer h-8 px-3.5 gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Print / Export PDF
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full cursor-pointer h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Row 2: Document Tools (Template Switcher, Default, Orientation, Font & Spacing Sliders, Notes) */}
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
                title={template === defaultTemplate ? "Current default template" : "Set this as your default invoice template"}
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
              {/* Orientation Switcher */}
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
                  min="0.6"
                  max="1.8"
                  step="0.1"
                  value={spacing}
                  onChange={(e) => onSpacingChange(parseFloat(e.target.value))}
                  className="w-16 accent-primary cursor-pointer h-1.5 bg-muted rounded"
                />
                <span className="font-mono text-[11px] font-bold w-7 text-right">{spacing.toFixed(1)}x</span>
              </div>

              {/* Notes Toggle */}
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

        {/* Optional Collapsible Inline Notes Editor */}
        {showNotesEditor && onQuoteNotesChange && (
          <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-border animate-in fade-in duration-150">
            <div className="flex justify-end mb-1">
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
              placeholder="Enter special site notes, warranty terms, or employee comments to display on this quote..."
            />
          </div>
        )}
      </div>

      {/* Main Preview Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-muted/30 print:p-0 print:m-0 print:bg-white print:block print:w-full print:overflow-visible">
        <div className={`w-full ${isLandscape ? 'max-w-[10.8in]' : 'max-w-[8.2in]'} transition-all duration-200 print:max-w-none print:w-full print:m-0 print:p-0`}>
          <div className="bg-white rounded shadow-2xl border border-border/40 overflow-hidden print:shadow-none print:border-none print:rounded-none print:overflow-visible">
            <QuoteInvoice
              {...invoiceProps}
              quoteNotes={quoteNotes}
              orientation={orientation}
              template={template}
              fontSize={fontSize}
              spacing={spacing}
              isInteractivePreview={true}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
