"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { Layers, Plus, RotateCcw, RefreshCw } from "lucide-react"
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
  // Submit
  onAddItem: (e: React.FormEvent) => void
  // Draft Actions
  onSaveDraft?: () => void
  onOpenSavedQuotes?: () => void
  savedDraftsCount?: number
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
    setQtyInput("")
    widthRef.current?.focus()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/20 px-3.5 py-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Layers className="h-4 w-4 text-primary" />
            <span>Unit Specifications &amp; Glass Config</span>
          </div>
          <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
            Select treatment, combo, shape, and dimensions with live fraction
            parsing.
          </p>
        </div>
        {onResetQuote && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetQuote}
            className="h-7 shrink-0 cursor-pointer gap-1 px-2 text-xs text-destructive hover:bg-destructive/10"
            title="Reset quote & start fresh"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
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

          {/* Action Buttons: Add Item & Clear */}
          <div className="flex gap-2 pt-0.5">
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
          </div>
        </form>
      </div>
    </div>
  )
}
