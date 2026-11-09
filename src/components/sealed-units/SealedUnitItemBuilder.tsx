'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Layers, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from '@/lib/sealed-units-logic';
import { SealedUnitGlassSpecsForm } from './builder/SealedUnitGlassSpecsForm';
import { SealedUnitGrillBuilder } from './builder/SealedUnitGrillBuilder';

export interface SealedUnitItemBuilderProps {
  treatment: GlassTreatment;
  setTreatment: (t: GlassTreatment) => void;
  availableCombos: ComboPricing[];
  selectedComboId: string;
  setSelectedComboId: (id: string) => void;
  activeCombo: ComboPricing | undefined;
  hasDualPane: boolean;
  selectedPane: PaneType;
  setSelectedPane: (p: PaneType) => void;
  shape: GlassShape;
  setShape: (s: GlassShape) => void;
  widthInput: string;
  setWidthInput: (w: string) => void;
  heightInput: string;
  setHeightInput: (h: string) => void;
  qtyInput: string;
  setQtyInput: (q: string) => void;
  onResetQuote?: () => void;
  // Grill state
  grillType: GrillType;
  setGrillType: (g: GrillType) => void;
  grillProfile: GrillProfile;
  setGrillProfile: (p: GrillProfile) => void;
  grillColor: string;
  setGrillColor: (c: string) => void;
  grillPatternMode: 'pattern' | 'manual';
  setGrillPatternMode: (m: 'pattern' | 'manual') => void;
  grillCols: string;
  setGrillCols: (c: string) => void;
  grillRows: string;
  setGrillRows: (r: string) => void;
  grillSquares: string;
  setGrillSquares: (s: string) => void;
  grillTIntersections: string;
  setGrillTIntersections: (t: string) => void;
  grillBentHubs: string;
  setGrillBentHubs: (b: string) => void;
  computedGrillConfig: GrillItemConfig;
  activeGrillPreview: { rawCost: number; description: string };
  grills: SealedUnitGrillSettings;
  // Submit
  onAddItem: (e: React.FormEvent) => void;
  // Draft Actions
  onSaveDraft?: () => void;
  onOpenSavedQuotes?: () => void;
  savedDraftsCount?: number;
}

export function SealedUnitItemBuilder({
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
  const widthRef = useRef<HTMLInputElement>(null);

  const availableGrillColors = useMemo(() => {
    return getAvailableGrillColors(grillProfile);
  }, [grillProfile]);

  useEffect(() => {
    if (!availableGrillColors.includes(grillColor)) {
      setGrillColor(availableGrillColors[0] || 'White');
    }
  }, [availableGrillColors, grillColor, setGrillColor]);

  const handleResetInputs = () => {
    setWidthInput('');
    setHeightInput('');
    setQtyInput('');
    widthRef.current?.focus();
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 py-2.5 px-3.5 bg-muted/20 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold flex items-center gap-1.5 text-foreground">
            <Layers className="w-4 h-4 text-primary" />
            <span>Unit Specifications &amp; Glass Config</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
            Select treatment, combo, shape, and dimensions with live fraction parsing.
          </p>
        </div>
        {onResetQuote && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetQuote}
            className="gap-1 text-xs text-destructive hover:bg-destructive/10 h-7 px-2 cursor-pointer shrink-0"
            title="Reset quote & start fresh"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      <div className="p-3 sm:p-3.5 space-y-3">
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
              className="flex-1 h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Quote</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetInputs}
              className="h-9 text-xs cursor-pointer px-3"
            >
              Clear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
