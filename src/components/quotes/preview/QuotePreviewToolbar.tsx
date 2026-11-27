"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Printer,
  Download,
  X,
  FileText,
  CheckCircle2,
  BookmarkCheck,
  Save,
  Scale,
  Undo2,
  Redo2,
  RotateCcw,
} from "lucide-react"
import {
  writeSessionAttachedInstallOption,
  type QuoteOptionScope,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface QuotePreviewToolbarProps {
  onPrint: () => void
  onDownloadPdf: () => void
  isDownloadingPdf?: boolean
  onClose: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onResetAutoFit: () => void
  onSaveDefaultLayout: () => void
  hasSavedDefaultLayout: boolean
  isSavingLayout?: boolean
  fontSize: number
  onFontSizeChange: (size: number) => void
  spacing: number
  onSpacingChange: (spacing: number) => void
  showNotesEditor: boolean
  setShowNotesEditor: React.Dispatch<React.SetStateAction<boolean>>
  canEditNotes?: boolean
  quoteNotes?: string
  isSupplyOnly?: boolean
  isDualOption?: boolean
  setIsDualOption?: (val: boolean) => void
  optionScope?: QuoteOptionScope
}

export function QuotePreviewToolbar({
  onPrint,
  onDownloadPdf,
  isDownloadingPdf = false,
  onClose,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetAutoFit,
  onSaveDefaultLayout,
  hasSavedDefaultLayout,
  isSavingLayout = false,
  fontSize,
  onFontSizeChange,
  spacing,
  onSpacingChange,
  showNotesEditor,
  setShowNotesEditor,
  canEditNotes = true,
  quoteNotes = "",
  isSupplyOnly = false,
  isDualOption = false,
  setIsDualOption,
  optionScope,
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
                Universal Quote Composer
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
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              className="h-8 cursor-pointer gap-1.5 bg-emerald-600 px-3.5 font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Download className="h-3.5 w-3.5" />{" "}
              {isDownloadingPdf ? "Downloading..." : "Download PDF"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onPrint}
              className="h-8 cursor-pointer gap-1.5 px-3 font-semibold"
              title="Print quote on paper"
            >
              <Printer className="h-3.5 w-3.5" /> Print
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

        {/* Row 2: Composer History, Layout Saving & Typography Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Left: Undo / Redo / Auto-Fit / Save My Default Layout / Dual Option */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canUndo}
                onClick={onUndo}
                title="Undo layout change (Ctrl/Cmd+Z)"
                className="h-7 cursor-pointer gap-1 px-2 text-[11px] font-semibold"
              >
                <Undo2 className="h-3.5 w-3.5" />
                <span>Undo</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canRedo}
                onClick={onRedo}
                title="Redo layout change (Ctrl/Cmd+Shift+Z)"
                className="h-7 cursor-pointer gap-1 px-2 text-[11px] font-semibold"
              >
                <Redo2 className="h-3.5 w-3.5" />
                <span>Redo</span>
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetAutoFit}
              title="Reset cards to Smart 1-Page Auto-Fit order and recommended font size"
              className="h-7 cursor-pointer gap-1 px-2.5 text-[11px] font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Auto-Fit</span>
            </Button>

            <Button
              type="button"
              variant={hasSavedDefaultLayout ? "secondary" : "default"}
              size="sm"
              disabled={isSavingLayout}
              onClick={onSaveDefaultLayout}
              title="Save this arrangement & font settings for all your future quotes"
              className="h-7 cursor-pointer gap-1.5 px-2.5 text-[11px] font-semibold"
            >
              {hasSavedDefaultLayout ? (
                <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>
                {isSavingLayout
                  ? "Saving..."
                  : hasSavedDefaultLayout
                    ? "Update Saved Layout"
                    : "Save as My Default"}
              </span>
            </Button>

            {setIsDualOption && (
              <Button
                type="button"
                variant={isDualOption ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  const next = !isDualOption
                  setIsDualOption(next)
                  writeSessionAttachedInstallOption(
                    next
                      ? {
                          enabled: true,
                          amountPreTaxCents: 0,
                          mode: isSupplyOnly ? "supply" : "install",
                        }
                      : null,
                    optionScope
                  )
                }}
                title={
                  isSupplyOnly
                    ? "Attach the Option for Installation card to this supply quote"
                    : "Attach the Option for Supply Only card to this installation quote"
                }
                className="h-7 cursor-pointer gap-1.5 border-primary/30 px-2.5 text-[11px] font-semibold"
              >
                <Scale className="h-3.5 w-3.5 text-primary" />
                <span>
                  {isDualOption
                    ? isSupplyOnly
                      ? "Installation Option (Attached)"
                      : "Supply Option (Attached)"
                    : isSupplyOnly
                      ? "Option for Installation"
                      : "Option for Supply Only"}
                </span>
              </Button>
            )}
          </div>

          {/* Right: Font Slider, Spacing Slider, Notes */}
          <div className="flex flex-wrap items-center gap-2">
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
            {canEditNotes && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
