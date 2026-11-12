"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Printer, X, FileText, CheckCircle2, Star } from "lucide-react"
import QuoteNotesEditor from "@/components/quotes/QuoteNotesEditor"
import { SealedUnitTemplateType } from "../SealedUnitPrintInvoice"

interface SealedUnitPrintToolbarProps {
  handlePrint: () => void
  onClose: () => void
  template: SealedUnitTemplateType
  onTemplateChange: (t: SealedUnitTemplateType) => void
  defaultTemplate: SealedUnitTemplateType | null
  handleSetDefaultTemplate: () => void
  orientation: "portrait" | "landscape"
  setOrientation: (o: "portrait" | "landscape") => void
  fontSize: number
  onFontSizeChange: (sz: number) => void
  spacing: number
  onSpacingChange: (sp: number) => void
  quoteNotes: string
  onQuoteNotesChange?: (notes: string) => void
  showNotesEditor: boolean
  setShowNotesEditor: (show: boolean) => void
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
      <div className="mx-auto max-w-7xl space-y-2">
        {/* Row 1: Status & Actions */}
        <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold tracking-wide text-foreground">
                Sealed Unit Print Preview
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>8½&quot; × 11&quot; Letter Standard</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 cursor-pointer gap-1.5 bg-primary px-3.5 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Export PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 cursor-pointer rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Document Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* 3-Template Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => onTemplateChange("window_style")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  template === "window_style"
                    ? "bg-background font-semibold text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Window Style
              </button>
              <button
                type="button"
                onClick={() => onTemplateChange("standard")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  template === "standard"
                    ? "bg-background font-semibold text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Standard (Full Width)
              </button>
              <button
                type="button"
                onClick={() => onTemplateChange("production")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  template === "production"
                    ? "bg-background font-semibold text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
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
                  ? "Current default template"
                  : "Set this as your default sealed unit invoice template"
              }
              className={`h-7 cursor-pointer gap-1 px-2 text-[11px] transition-all ${
                template === defaultTemplate
                  ? "bg-amber-500/10 font-bold text-amber-500 hover:bg-amber-500/20"
                  : "text-muted-foreground hover:text-amber-400"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  template === defaultTemplate
                    ? "fill-amber-400 text-amber-400"
                    : ""
                }`}
              />
              <span>
                {template === defaultTemplate ? "Default" : "Set Default"}
              </span>
            </Button>
          </div>

          {/* Document Sliders & Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Orientation Switcher */}
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  orientation === "portrait"
                    ? "bg-background font-semibold text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation("landscape")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  orientation === "landscape"
                    ? "bg-background font-semibold text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Landscape
              </button>
            </div>

            {/* Font Size Slider */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 py-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Font:
              </span>
              <input
                type="range"
                min="7.0"
                max="12.0"
                step="0.5"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
                className="h-1.5 w-16 cursor-pointer rounded bg-muted accent-primary"
              />
              <span className="w-9 text-right font-mono text-[11px] font-bold">
                {fontSize.toFixed(1)}pt
              </span>
            </div>

            {/* Spacing Slider */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 py-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Spacing:
              </span>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={spacing}
                onChange={(e) => onSpacingChange(parseFloat(e.target.value))}
                className="h-1.5 w-16 cursor-pointer rounded bg-muted accent-primary"
              />
              <span className="w-7 text-right font-mono text-[11px] font-bold">
                {spacing.toFixed(1)}x
              </span>
            </div>

            {/* Notes Toggle with Bold & Bullet formatting */}
            {onQuoteNotesChange && (
              <button
                type="button"
                onClick={() => setShowNotesEditor(!showNotesEditor)}
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  showNotesEditor || (quoteNotes && quoteNotes.trim())
                    ? "border-primary/40 bg-primary/10 font-semibold text-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {quoteNotes && quoteNotes.trim()
                  ? "Notes (Active)"
                  : "+ Add Notes"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Rich Notes Editor (Bold & Bullets) */}
      {showNotesEditor && onQuoteNotesChange && (
        <div className="mx-auto mt-2 max-w-4xl animate-in border-t border-border pt-2 duration-150 fade-in">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Rich Notes Editor (Supports Bold text &amp; Bullets)
            </span>
            <button
              type="button"
              onClick={() => setShowNotesEditor(false)}
              className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground"
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
  )
}
