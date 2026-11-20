"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { Layers, Plus, RotateCcw, RefreshCw, CheckCircle2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  GlassTreatment,
  PaneType,
  ComboPricing,
  GrillType,
  GrillProfile,
  GrillItemConfig,
  SealedUnitGrillSettings,
  GlassShape,
  SealedUnitLineItem,
  getAvailableGrillColors,
} from "@/lib/sealed-units-logic"
import { SealedUnitGlassSpecsForm } from "./builder/SealedUnitGlassSpecsForm"
import { SealedUnitGrillBuilder } from "./builder/SealedUnitGrillBuilder"

export interface SealedUnitItemBuilderProps {
  customerName?: string
  setCustomerName?: (val: string) => void
  quoteNumber?: string
  setQuoteNumber?: (val: string) => void
  onRegenerateQuoteNumber?: () => void
  treatment: GlassTreatment
  setTreatment: (t: GlassTreatment) => void
  availableCombos: ComboPricing[]
  selectedComboId: string
  setSelectedComboId: (id: string) => void
  activeCombo: ComboPricing | undefined
  hasDualPane: boolean
  selectedPane: PaneType
  setSelectedPane: (p: PaneType) => void
  shape: GlassShape
  setShape: (s: GlassShape) => void
  widthInput: string
  setWidthInput: (w: string) => void
  heightInput: string
  setHeightInput: (h: string) => void
  qtyInput: string
  setQtyInput: (q: string) => void
  onResetQuote?: () => void
  // Grill state
  grillType: GrillType
  setGrillType: (g: GrillType) => void
  grillProfile: GrillProfile
  setGrillProfile: (p: GrillProfile) => void
  grillColor: string
  setGrillColor: (c: string) => void
  grillPatternMode: "pattern" | "manual"
  setGrillPatternMode: (m: "pattern" | "manual") => void
  grillCols: string
  setGrillCols: (c: string) => void
  grillRows: string
  setGrillRows: (r: string) => void
  grillSquares: string
  setGrillSquares: (s: string) => void
  grillTIntersections: string
  setGrillTIntersections: (t: string) => void
  grillBentHubs: string
  setGrillBentHubs: (b: string) => void
  computedGrillConfig: GrillItemConfig
  activeGrillPreview: { rawCost: number; description: string }
  grills: SealedUnitGrillSettings
  // Editing
  editingItem?: SealedUnitLineItem | null
  onCancelEdit?: () => void
  // Submit
  onAddItem: (e: React.FormEvent) => void
  // Draft Actions
  onSaveDraft?: () => void
  onOpenSavedQuotes?: () => void
  savedDraftsCount?: number
  isReadOnly?: boolean
}

export function SealedUnitItemBuilder({
  customerName = "",
  setCustomerName,
  quoteNumber = "",
  setQuoteNumber,
  onRegenerateQuoteNumber,
  treatment,
  setTreatment,
  availableCombos,
  selectedComboId,
  setSelectedComboId,
  hasDualPane,
  selectedPane,
  setSelectedPane,
  shape,
  setShape,
  widthInput,
  setWidthInput,
  heightInput,
  setHeightInput,
  qtyInput,
  setQtyInput,
  onResetQuote,
  editingItem,
  onCancelEdit,
  grillType,
  setGrillType,
  grillProfile,
  setGrillProfile,
  grillColor,
  setGrillColor,
  grillPatternMode,
  setGrillPatternMode,
  grillCols,
  setGrillCols,
  grillRows,
  setGrillRows,
  grillSquares,
  setGrillSquares,
  grillTIntersections,
  setGrillTIntersections,
  grillBentHubs,
  setGrillBentHubs,
  computedGrillConfig,
  activeGrillPreview,
  grills,
  isReadOnly = false,
  onAddItem,
}: SealedUnitItemBuilderProps) {
  const widthRef = useRef<HTMLInputElement>(null)

  const availableGrillColors = useMemo(() => {
    return getAvailableGrillColors(grillProfile)
  }, [grillProfile])

  useEffect(() => {
    if (!availableGrillColors.includes(grillColor)) {
      setGrillColor(availableGrillColors[0] || "White")
    }
  }, [availableGrillColors, grillColor, setGrillColor])

  const handleResetInputs = () => {
    setWidthInput("")
    setHeightInput("")
    setQtyInput("1")
    widthRef.current?.focus()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/20 px-3.5 py-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {editingItem ? "Edit Sealed Unit" : "Configure Sealed Unit"}
              </span>
              {editingItem && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  Editing Item
                </span>
              )}
            </div>
          </div>
          <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
            {editingItem
              ? "Modify specifications, dimensions, or grills and click Update below."
              : "Select treatment, combo, shape, and dimensions with live fraction parsing."}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {editingItem && onCancelEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              className="h-7 cursor-pointer px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel Edit
            </Button>
          )}
          {onResetQuote && !editingItem && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetQuote}
              className="h-7 shrink-0 cursor-pointer gap-1 px-2 text-xs text-foreground hover:bg-muted"
              title="Start a new quote"
            >
              <Plus className="h-3 w-3 text-primary" />
              <span>New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Customer Name & Quote Number Header Section */}
      {setCustomerName && setQuoteNumber && (
        <div className="grid grid-cols-1 gap-3 border-b border-border/40 bg-muted/20 px-3.5 py-2.5 md:grid-cols-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Quote/Order Number
              </Label>
              {onRegenerateQuoteNumber && (
                <button
                  type="button"
                  onClick={onRegenerateQuoteNumber}
                  className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  title="Generate a fresh unique 6-digit quote number"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
            <Input
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              placeholder="e.g. 400820"
              className="h-9 bg-background font-mono text-sm shadow-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Customer Name
            </Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Jason Schram"
              className="h-9 bg-background text-sm shadow-xs"
            />
          </div>
        </div>
      )}

      <div className="space-y-3 p-3 sm:p-3.5">
        <form onSubmit={onAddItem} className="space-y-3">
          <fieldset disabled={isReadOnly} className="space-y-3 border-0 p-0 m-0">
          <SealedUnitGlassSpecsForm
            treatment={treatment}
            setTreatment={setTreatment}
            availableCombos={availableCombos}
            selectedComboId={selectedComboId}
            setSelectedComboId={setSelectedComboId}
            hasDualPane={hasDualPane}
            selectedPane={selectedPane}
            setSelectedPane={setSelectedPane}
            shape={shape}
            setShape={setShape}
            widthRef={widthRef}
            widthInput={widthInput}
            setWidthInput={setWidthInput}
            heightInput={heightInput}
            setHeightInput={setHeightInput}
            qtyInput={qtyInput}
            setQtyInput={setQtyInput}
          />

          <SealedUnitGrillBuilder
            grillType={grillType}
            setGrillType={setGrillType}
            grillProfile={grillProfile}
            setGrillProfile={setGrillProfile}
            grillColor={grillColor}
            setGrillColor={setGrillColor}
            availableGrillColors={availableGrillColors}
            grillPatternMode={grillPatternMode}
            setGrillPatternMode={setGrillPatternMode}
            grillCols={grillCols}
            setGrillCols={setGrillCols}
            grillRows={grillRows}
            setGrillRows={setGrillRows}
            grillSquares={grillSquares}
            setGrillSquares={setGrillSquares}
            grillTIntersections={grillTIntersections}
            setGrillTIntersections={setGrillTIntersections}
            grillBentHubs={grillBentHubs}
            setGrillBentHubs={setGrillBentHubs}
            computedGrillConfig={computedGrillConfig}
            activeGrillPreview={activeGrillPreview}
            grills={grills}
          />
          </fieldset>

          {/* Action Buttons: Add / Update Item & Clear / Cancel */}
          {isReadOnly ? (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
              Review Mode (Read-Only) — Click &ldquo;Edit Quote&rdquo; in the top bar to make changes.
            </div>
          ) : (
            <div className="flex gap-2 pt-0.5">
              {editingItem ? (
                <>
                  <Button
                    type="submit"
                    className="h-9 flex-1 cursor-pointer gap-1.5 bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Update Sealed Unit</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancelEdit}
                    className="h-9 cursor-pointer px-3 text-xs"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="submit"
                    className="h-9 flex-1 cursor-pointer gap-1.5 bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Quote</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetInputs}
                    className="h-9 cursor-pointer px-3 text-xs"
                  >
                    Clear
                  </Button>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
