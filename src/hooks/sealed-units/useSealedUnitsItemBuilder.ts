'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  GlassTreatment,
  PaneType,
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitLineItem,
  GrillType,
  GrillProfile,
  GrillItemConfig,
  SealedUnitGrillSettings,
  GlassShape,
  calculateGrillRawCost,
  parseInchesInput,
  calculateSealedUnitItem,
} from '@/lib/sealed-units-logic';

interface UseSealedUnitsItemBuilderProps {
  combos: ComboPricing[];
  formula: SealedUnitFormulaConstants;
  labour: SealedUnitLabourSettings;
  thicknessBreaks: ThicknessBreak[];
  grills: SealedUnitGrillSettings;
  setLineItems: React.Dispatch<React.SetStateAction<SealedUnitLineItem[]>>;
}

export function useSealedUnitsItemBuilder({
  combos,
  formula,
  labour,
  thicknessBreaks,
  grills,
  setLineItems,
}: UseSealedUnitsItemBuilderProps) {
  // Line Item Builder State
  const [treatment, setTreatment] = useState<GlassTreatment>('annealed');
  const [selectedComboId, setSelectedComboId] = useState<string>('ann_clear');
  const [selectedPane, setSelectedPane] = useState<PaneType>('dual');
  const [shape, setShape] = useState<GlassShape>('rectangle');
  const [widthInput, setWidthInput] = useState<string>('');
  const [heightInput, setHeightInput] = useState<string>('');
  const [qtyInput, setQtyInput] = useState<string>('');

  // Interior Grill Builder State
  const [grillType, setGrillType] = useState<GrillType>('none');
  const [grillProfile, setGrillProfile] = useState<GrillProfile>('5/8" x 1/4"');
  const [grillColor, setGrillColor] = useState<string>('White');
  const [grillPatternMode, setGrillPatternMode] = useState<'pattern' | 'manual'>('pattern');
  const [grillCols, setGrillCols] = useState<string>('');
  const [grillRows, setGrillRows] = useState<string>('');
  const [grillSquares, setGrillSquares] = useState<string>('');
  const [grillTIntersections, setGrillTIntersections] = useState<string>('');
  const [grillBentHubs, setGrillBentHubs] = useState<string>('');

  const widthRef = useRef<HTMLInputElement>(null);

  // Filter combos by treatment (Annealed vs Tempered)
  const availableCombos = useMemo(() => {
    return combos.filter((c) => c.treatment === treatment);
  }, [combos, treatment]);

  // Keep selected combo valid when switching treatment
  useEffect(() => {
    if (!availableCombos.some((c) => c.id === selectedComboId)) {
      if (availableCombos.length > 0) {
        setSelectedComboId(availableCombos[0].id);
      }
    }
  }, [treatment, availableCombos, selectedComboId]);

  // Selected combo object
  const activeCombo = useMemo(() => {
    return combos.find((c) => c.id === selectedComboId) || availableCombos[0] || combos[0];
  }, [combos, selectedComboId, availableCombos]);

  // Check if current combo supports Dual pane
  const hasDualPane = useMemo(() => {
    if (!activeCombo) return true;
    const pricesObj = (activeCombo.prices as any) || {};
    return Object.values(pricesObj).some(
      (t: any) => t && t.dual !== null && t.dual !== undefined && t.dual !== '' && Number(t.dual) > 0
    );
  }, [activeCombo]);

  // Auto-switch to Triple if Dual is not available on selected combo
  useEffect(() => {
    if (!hasDualPane && selectedPane === 'dual') {
      setSelectedPane('triple');
    }
  }, [hasDualPane, selectedPane]);

  // Computed grill item config based on pattern mode or manual mode
  const computedGrillConfig = useMemo((): GrillItemConfig => {
    if (grillType === 'none') return { type: 'none' };
    const hubs = Math.max(0, parseInt(grillBentHubs, 10) || 0);

    if (grillType === 'grid') {
      if (grillPatternMode === 'pattern') {
        const c = Math.max(1, parseInt(grillCols, 10) || 1);
        const r = Math.max(1, parseInt(grillRows, 10) || 1);
        return {
          type: 'grid',
          profile: grillProfile,
          color: grillColor,
          colsCount: c,
          rowsCount: r,
          squaresCount: c * r,
          tIntersectionsCount: Math.max(0, c - 1) * Math.max(0, r - 1),
          bentHubsCount: hubs,
        };
      } else {
        return {
          type: 'grid',
          profile: grillProfile,
          color: grillColor,
          squaresCount: Math.max(0, parseInt(grillSquares, 10) || 0),
          tIntersectionsCount: Math.max(0, parseInt(grillTIntersections, 10) || 0),
          bentHubsCount: hubs,
        };
      }
    }

    return {
      type: grillType,
      color: grillColor,
      bentHubsCount: hubs,
    };
  }, [
    grillType,
    grillProfile,
    grillColor,
    grillPatternMode,
    grillCols,
    grillRows,
    grillSquares,
    grillTIntersections,
    grillBentHubs,
  ]);

  // Live Grill Cost Preview
  const activeGrillPreview = useMemo(() => {
    return calculateGrillRawCost(computedGrillConfig, grills);
  }, [computedGrillConfig, grills]);

  // Add Item Handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!activeCombo) throw new Error('Please select a glass combination.');
      const w = parseInchesInput(widthInput, 'width');
      const h = parseInchesInput(heightInput, 'height');
      const qty = parseInt(qtyInput, 10);
      if (!qty || qty < 1) throw new Error('Quantity must be at least 1.');

      const newItem = calculateSealedUnitItem({
        combo: activeCombo,
        paneType: selectedPane,
        widthIn: w,
        heightIn: h,
        quantity: qty,
        shape,
        formula,
        thicknessBreaks,
        labourSettings: labour,
        grill: computedGrillConfig,
        grillSettings: grills,
      });

      setLineItems((prev) => [...prev, newItem]);
      toast.success(`Added ${activeCombo.name} (${newItem.thicknessMm}mm) to quote.`);

      // Reset dimensions for fast entry
      setWidthInput('');
      setHeightInput('');
      setQtyInput('1');
      widthRef.current?.focus();
    } catch (err: any) {
      toast.error(err.message || 'Invalid dimensions or pricing error.');
    }
  };

  const handleRemoveItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    treatment,
    setTreatment,
    availableCombos,
    selectedComboId,
    setSelectedComboId,
    activeCombo,
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
    onAddItem: handleAddItem,
    handleAddItem,
    handleRemoveItem,
    widthRef,
  };
}
