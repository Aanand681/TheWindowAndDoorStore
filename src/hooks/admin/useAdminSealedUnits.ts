'use client';

import { useState, useEffect } from 'react';
import {
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitGrillSettings,
  DEFAULT_SEALED_UNIT_COMBOS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_GRILL_SETTINGS,
} from '@/lib/sealed-units-logic';
import { toast } from 'sonner';

export type AdminSealedUnitsTab = 'annealed' | 'tempered' | 'labour' | 'formula' | 'grills';

export function useAdminSealedUnits() {
  const [combos, setCombos] = useState<ComboPricing[]>(DEFAULT_SEALED_UNIT_COMBOS);
  const [formula, setFormula] = useState<SealedUnitFormulaConstants>(DEFAULT_FORMULA_CONSTANTS);
  const [labour, setLabour] = useState<SealedUnitLabourSettings>(DEFAULT_LABOUR_SETTINGS);
  const [thicknessBreaks, setThicknessBreaks] = useState<ThicknessBreak[]>(DEFAULT_THICKNESS_BREAKS);
  const [grills, setGrills] = useState<SealedUnitGrillSettings>(DEFAULT_GRILL_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminSealedUnitsTab>('annealed');

  useEffect(() => {
    fetch('/api/sealed-units/settings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.combos) && data.combos.length > 0) {
          setCombos(data.combos);
        }
        if (data.formula) setFormula(data.formula);
        if (data.labour) setLabour(data.labour);
        if (Array.isArray(data.thicknessBreaks)) setThicknessBreaks(data.thicknessBreaks);
        if (data.grills) setGrills(data.grills);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sealed unit settings:', err);
        setLoading(false);
      });
  }, []);

  const handlePriceChange = (
    comboId: string,
    thickness: number,
    pane: 'dual' | 'triple',
    value: string
  ) => {
    const num = value.trim() === '' ? null : Number(value);
    setCombos((prev) =>
      prev.map((c) => {
        if (c.id !== comboId) return c;
        const currentPrices = c.prices || {};
        const currentThickness = currentPrices[thickness] || { dual: null, triple: null };
        return {
          ...c,
          prices: {
            ...currentPrices,
            [thickness]: {
              ...currentThickness,
              [pane]: num !== null && !isNaN(num) ? num : null,
            },
          },
        };
      })
    );
  };

  const handleGridRateChange = (profile: string, color: string, value: string) => {
    const num = value.trim() === '' ? null : Number(value);
    setGrills((prev) => ({
      ...prev,
      gridRates: {
        ...prev.gridRates,
        [profile]: {
          ...(prev.gridRates?.[profile] || {}),
          [color]: num !== null && !isNaN(num) ? num : null,
        },
      },
    }));
  };

  const handleBurst3Change = (colorKey: string, value: string) => {
    const num = Number(value) || 0;
    setGrills((prev) => ({
      ...prev,
      burst3Rates: {
        ...prev.burst3Rates,
        [colorKey]: num,
      },
    }));
  };

  const handleBurst5Change = (colorKey: string, value: string) => {
    const num = Number(value) || 0;
    setGrills((prev) => ({
      ...prev,
      burst5Rates: {
        ...prev.burst5Rates,
        [colorKey]: num,
      },
    }));
  };

  const handleGrillExtraChange = (
    field: 'tIntersectionPrice' | 'bentHubPrice' | 'customerOwnGrillPrice',
    value: string
  ) => {
    const num = Number(value) || 0;
    setGrills((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  const handleResetDefaults = () => {
    if (!confirm('Are you sure you want to reset all sealed unit prices and labour rules to defaults?')) {
      return;
    }
    setCombos(DEFAULT_SEALED_UNIT_COMBOS);
    setFormula(DEFAULT_FORMULA_CONSTANTS);
    setLabour(DEFAULT_LABOUR_SETTINGS);
    setThicknessBreaks(DEFAULT_THICKNESS_BREAKS);
    setGrills(DEFAULT_GRILL_SETTINGS);
    toast.info('Settings reset to default source sheet rates.');
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/sealed-units/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          combos,
          formula,
          labour,
          thicknessBreaks,
          grills,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      toast.success('Sealed Unit pricing and rules saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const annealedCombos = combos.filter((c) => c.treatment === 'annealed');
  const temperedCombos = combos.filter((c) => c.treatment === 'tempered');

  return {
    combos,
    setCombos,
    formula,
    setFormula,
    labour,
    setLabour,
    thicknessBreaks,
    setThicknessBreaks,
    grills,
    setGrills,
    loading,
    saving,
    activeTab,
    setActiveTab,
    handlePriceChange,
    handleGridRateChange,
    handleBurst3Change,
    handleBurst5Change,
    handleGrillExtraChange,
    handleResetDefaults,
    handleSave,
    annealedCombos,
    temperedCombos,
  };
}

