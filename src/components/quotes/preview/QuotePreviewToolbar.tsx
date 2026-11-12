"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Printer, X, FileText, CheckCircle2, Star, Scale } from "lucide-react"
import { QuoteTemplateType } from "../QuoteInvoice"
import { writeSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface QuotePreviewToolbarProps {
  onPrint: () => void
  onClose: () => void
  template: QuoteTemplateType
  onTemplateChange: (t: QuoteTemplateType) => void
  defaultTemplate: QuoteTemplateType | null
  handleSetDefaultTemplate: () => void
  orientation: "portrait" | "landscape"
  setOrientation: (o: "portrait" | "landscape") => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  spacing: number
  onSpacingChange: (spacing: number) => void
  showNotesEditor: boolean
  setShowNotesEditor: React.Dispatch<React.SetStateAction<boolean>>
  quoteNotes?: string
  isSupplyOnly?: boolean
  isDualOption?: boolean
  setIsDualOption?: (val: boolean) => void
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
  quoteNotes = "",
  isSupplyOnly = false,
  isDualOption = false,
  setIsDualOption,
}: QuotePreviewToolbarProps) {
  return (
    <div className="sticky top-0 z-10 w-full border-b border-border bg-card/95 px-4 py-2 shadow-sm backdrop-blur print:hidden">
      <div className="mx-auto max-w-7xl space-y-2">
        {/* Row 1: Preview Status & Primary Actions (Print / Close) */}
        <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold tracking-wide text-foreground">
                Print Preview
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
              onClick={onPrint}
              className="h-8 cursor-pointer gap-1.5 px-3.5 font-semibold shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Export PDF
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 cursor-pointer rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Document Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Left: Template Switcher & Set Default */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => onTemplateChange("modern")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  template === "modern"
                    ? "bg-background font-semibold text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Modern Detailed
              </button>
              <button
                type="button"
                onClick={() => onTemplateChange("executive")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  template === "executive"
                    ? "bg-background font-semibold text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Executive Ledger
              </button>
              <button
                type="button"
                onClick={() => onTemplateChange("cards")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  template === "cards"
                    ? "bg-background font-semibold text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
              title={
                template === defaultTemplate
                  ? "Current default template"
                  : "Set this as your default invoice template"
              }
              className={`h-7 cursor-pointer gap-1 px-2 text-[11px] transition-all ${
                template === defaultTemplate
                  ? "bg-amber-500/10 font-bold text-amber-500 hover:bg-amber-500/20"
                  : "text-muted-foreground hover:text-amber-400"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${template === defaultTemplate ? "fill-amber-400 text-amber-400" : ""}`}
              />
              <span>
                {template === defaultTemplate ? "Default" : "Set Default"}
              </span>
            </Button>

            {isSupplyOnly && setIsDualOption && (
              <Button
                type="button"
                variant={isDualOption ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  const next = !isDualOption
                  setIsDualOption(next)
                  writeSessionAttachedInstallOption(
                    next ? { enabled: true, amountPreTaxCents: 0 } : null
                  )
                }}
                title="Attach the Option for Installation card to this supply quote"
                className="h-7 cursor-pointer gap-1.5 border-primary/30 px-2.5 text-[11px] font-semibold"
              >
                <Scale className="h-3.5 w-3.5 text-primary" />
                <span>
                  {isDualOption
                    ? "Installation Option (Attached)"
                    : "Option for Installation"}
                </span>
              </Button>
            )}
          </div>

          {/* Right: Orientation, Font Slider, Spacing Slider, Notes */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  orientation === "portrait"
                    ? "bg-background font-semibold text-primary shadow-sm"
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
                    ? "bg-background font-semibold text-primary shadow-sm"
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
                min="9.0"
                max="16.5"
                step="0.5"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
                className="h-1.5 w-16 cursor-pointer rounded bg-muted accent-primary"
              />
              <span className="w-9 text-right font-mono text-[11px] font-bold">
                {fontSize.toFixed(1)}px
              </span>
            </div>

            {/* Spacing Slider */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 py-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Spacing:
              </span>
              <input
                type="range"
                min="0.75"
                max="1.50"
                step="0.05"
                value={spacing}
                onChange={(e) => onSpacingChange(parseFloat(e.target.value))}
                className="h-1.5 w-14 cursor-pointer rounded bg-muted accent-primary"
              />
              <span className="w-10 text-right font-mono text-[11px] font-bold">
                {spacing.toFixed(2)}x
              </span>
            </div>

            {/* Notes Editor Toggle */}
            <Button
              type="button"
              variant={showNotesEditor ? "default" : "outline"}
              size="sm"
              onClick={() => setShowNotesEditor((prev) => !prev)}
              className="h-7 cursor-pointer px-2.5 text-xs font-semibold"
            >
              {showNotesEditor
                ? "Hide Notes"
                : quoteNotes
                  ? "Edit Notes (Active)"
                  : "+ Add Notes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
