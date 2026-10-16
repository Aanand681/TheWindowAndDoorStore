'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText, CheckCircle2, Star } from 'lucide-react';
import QuoteInvoice, { QuoteInvoiceProps, QuoteTemplateType } from '@/components/QuoteInvoice';
import QuoteNotesEditor from '@/components/QuoteNotesEditor';
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
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState<QuoteTemplateType | null>(null);

  useEffect(() => {
    // Check localStorage first
    const saved = localStorage.getItem('defaultQuoteTemplate') as QuoteTemplateType | null;
    if (saved && ['modern', 'executive', 'cards'].includes(saved)) {
      setDefaultTemplate(saved);
    }
    // Fetch profile favorite template
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        if (d?.favoriteTemplate && ['modern', 'executive', 'cards'].includes(d.favoriteTemplate)) {
          setDefaultTemplate(d.favoriteTemplate);
          localStorage.setItem('defaultQuoteTemplate', d.favoriteTemplate);
        }
      })
      .catch(() => {});
  }, []);

  const handleSetDefaultTemplate = async () => {
    try {
      localStorage.setItem('defaultQuoteTemplate', template);
      setDefaultTemplate(template);
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoriteTemplate: template }),
      });
      const name = template === 'modern' ? 'Modern List' : template === 'executive' ? 'Executive Invoice' : 'Window Cards';
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Floating Control Toolbar */}
      <div className="sticky top-0 z-10 w-full border-b border-border bg-card/95 px-4 py-2.5 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm tracking-wide text-foreground">Print Preview</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>8½" × 11" Letter Fit</span>
            </div>
          </div>

          {/* Center: Template Switcher, Orientation & Sliders */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Template Switcher & Default Setter */}
            <div className="flex items-center gap-1.5">
              <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
                <button
                  type="button"
                  onClick={() => onTemplateChange('modern')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    template === 'modern'
                      ? 'bg-background text-primary shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Modern List
                </button>
                <button
                  type="button"
                  onClick={() => onTemplateChange('executive')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    template === 'executive'
                      ? 'bg-background text-primary shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Executive Invoice
                </button>
                <button
                  type="button"
                  onClick={() => onTemplateChange('cards')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    template === 'cards'
                      ? 'bg-background text-primary shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Window Cards
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
                <span className="hidden sm:inline">
                  {template === defaultTemplate ? 'Default' : 'Set Default'}
                </span>
              </Button>
            </div>

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

            {/* Font Size Slider: Expanded beyond 13.5px up to 16.5px */}
            <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
              <span className="text-[11px] text-muted-foreground font-medium">Font:</span>
              <input
                type="range"
                min="9.0"
                max="16.5"
                step="0.5"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
                className="w-20 accent-primary cursor-pointer h-1.5 bg-muted rounded"
              />
              <span className="font-mono text-[11px] font-bold w-9 text-right">{fontSize.toFixed(1)}px</span>
            </div>

            {/* Spacing Slider: Expanded from 1.3x up to 1.8x */}
            <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
              <span className="text-[11px] text-muted-foreground font-medium">Spacing:</span>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={spacing}
                onChange={(e) => onSpacingChange(parseFloat(e.target.value))}
                className="w-20 accent-primary cursor-pointer h-1.5 bg-muted rounded"
              />
              <span className="font-mono text-[11px] font-bold w-8 text-right">{spacing.toFixed(1)}x</span>
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

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="shadow-sm font-semibold cursor-pointer">
              <Printer className="w-4 h-4 mr-1.5" /> Print / Export PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full cursor-pointer">
              <X className="w-4 h-4" />
            </Button>
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-muted/30">
        <div className={`w-full ${isLandscape ? 'max-w-[10.8in]' : 'max-w-[8.2in]'} transition-all duration-200`}>
          <div className="bg-white rounded shadow-2xl border border-border/40 overflow-hidden">
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
}
