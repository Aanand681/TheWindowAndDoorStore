'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  DoorPreset,
  DoorFormulaSettings,
  DoorLineItem,
  DoorCategory,
  DoorHardwareType,
  DoorUpgradeOption,
  DoorQuotingMode,
} from '@/lib/doors/types';
import { buildDoorLineItem, calculateDoorUpgradeDifference } from '@/lib/doors/calculations';
import { toast } from 'sonner';

interface UseDoorItemFormOptions {
  presets: DoorPreset[];
  formula: DoorFormulaSettings;
  editingItem?: DoorLineItem | null;
  mode?: DoorQuotingMode;
  onSaveItem: (item: DoorLineItem) => void;
  onResetQuote?: () => void;
}

export function useDoorItemForm({
  presets,
  formula,
  editingItem,
  mode,
  onSaveItem,
  onResetQuote,
}: UseDoorItemFormOptions) {
  // Preset & Identity
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    presets[0]?.id || 'single_regular'
  );
  const [customDescription, setCustomDescription] = useState<string>(
    presets[0]?.description?.trim() || presets[0]?.label || ''
  );
  const [category, setCategory] = useState<DoorCategory>('entry');
  const [quantity, setQuantity] = useState<string>('1');

  // Pricing
  const [inksterBasePrice, setInksterBasePrice] = useState<string>('1200');

  // Hardware (defaults to 'none' if in supply_only mode)
  const [hardwareType, setHardwareType] = useState<DoorHardwareType>(
    mode === 'supply_only' ? 'none' : 'standard'
  );
  const [customHardwareName, setCustomHardwareName] = useState<string>('Premium Grip Set');
  const [customHardwarePrice, setCustomHardwarePrice] = useState<string>('250');

  // Automatically switch to 'none' if mode becomes supply_only
  useEffect(() => {
    if (mode === 'supply_only') {
      setHardwareType('none');
    }
  }, [mode]);

  // Upgrade Option
  const [hasUpgradeOption, setHasUpgradeOption] = useState<boolean>(false);
  const [upgradeTitle, setUpgradeTitle] = useState<string>('Triple Pane Glass Upgrade');
  const [upgradeInksterPrice, setUpgradeInksterPrice] = useState<string>('1450');

  // Additional Notes
  const [notes, setNotes] = useState<string>('');

  // Selected preset object
  const currentPreset = useMemo(() => {
    return presets.find((p) => p.id === selectedPresetId) || presets[0];
  }, [presets, selectedPresetId]);

  // When preset changes, automatically sync category and description if untouched
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = presets.find((p) => p.id === presetId);
    if (found) {
      setCategory(found.category);
      const isDefault =
        !customDescription ||
        presets.some(
          (p) =>
            p.label === customDescription ||
            (p.description && p.description.trim() === customDescription.trim())
        );
      if (isDefault) {
        setCustomDescription(found.description?.trim() || found.label);
      }
    }
  };

  // Sync initial description when database presets finish loading
  useEffect(() => {
    if (!editingItem && presets.length > 0) {
      const current = presets.find((p) => p.id === selectedPresetId) || presets[0];
      if (current) {
        const isDefault =
          !customDescription ||
          presets.some(
            (p) =>
              p.label === customDescription ||
              (p.description && p.description.trim() === customDescription.trim())
          );
        if (isDefault) {
          setCustomDescription(current.description?.trim() || current.label);
          setCategory(current.category);
        }
      }
    }
  }, [presets, editingItem, selectedPresetId, customDescription]);

  // Populate from editingItem
  useEffect(() => {
    if (editingItem) {
      setSelectedPresetId(editingItem.presetId);
      setCustomDescription(editingItem.customDescription || editingItem.presetLabel);
      setCategory(editingItem.category);
      setQuantity(String(editingItem.quantity || 1));
      setInksterBasePrice(String(editingItem.inksterBasePrice));
      setHardwareType(editingItem.hardwareType);
      if (editingItem.customHardwareName) setCustomHardwareName(editingItem.customHardwareName);
      if (editingItem.customHardwarePrice !== undefined) {
        setCustomHardwarePrice(String(editingItem.customHardwarePrice));
      }
      setNotes(editingItem.notes || '');

      if (editingItem.upgradeOption?.enabled) {
        setHasUpgradeOption(true);
        setUpgradeTitle(editingItem.upgradeOption.title);
        setUpgradeInksterPrice(String(editingItem.upgradeOption.inksterPrice));
      } else {
        setHasUpgradeOption(false);
      }
    }
  }, [editingItem]);

  // Upgrade option calculations
  const upgradeDiff = useMemo(() => {
    if (!hasUpgradeOption) return null;
    const baseP = parseFloat(inksterBasePrice) || 0;
    const optP = parseFloat(upgradeInksterPrice) || 0;
    return calculateDoorUpgradeDifference(
      baseP,
      optP,
      category,
      formula.surchargeRate,
      formula.doorDiscountPercent
    );
  }, [hasUpgradeOption, inksterBasePrice, upgradeInksterPrice, category, formula]);

  const parsedQuantity = Math.max(1, parseInt(quantity, 10) || 1);

  // Preview Line Item with ID preservation
  const previewItem = useMemo(() => {
    const baseP = parseFloat(inksterBasePrice) || 0;
    const customHwP = hardwareType === 'custom' ? parseFloat(customHardwarePrice) || 0 : undefined;

    let upgradeObj: DoorUpgradeOption | undefined = undefined;
    if (hasUpgradeOption && upgradeDiff) {
      upgradeObj = {
        enabled: true,
        title: upgradeTitle.trim() || 'Option for door',
        inksterPrice: parseFloat(upgradeInksterPrice) || 0,
        netOptionDoorPrice: upgradeDiff.optionNetPrice,
        subtotalDifference: upgradeDiff.subtotalDifference,
        totalWithTaxDifference: upgradeDiff.totalDifference,
      };
    }

    return buildDoorLineItem({
      id: editingItem?.id,
      preset: currentPreset,
      customDescription: customDescription.trim() || currentPreset.description?.trim() || currentPreset.label,
      category,
      inksterBasePrice: baseP,
      quantity: parsedQuantity,
      hardwareType,
      customHardwareName: hardwareType === 'custom' ? customHardwareName : undefined,
      customHardwarePrice: customHwP,
      formula,
      upgradeOption: upgradeObj,
      notes,
    });
  }, [
    editingItem,
    currentPreset,
    customDescription,
    category,
    inksterBasePrice,
    parsedQuantity,
    hardwareType,
    customHardwareName,
    customHardwarePrice,
    formula,
    hasUpgradeOption,
    upgradeTitle,
    upgradeInksterPrice,
    upgradeDiff,
    notes,
  ]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseP = parseFloat(inksterBasePrice) || 0;
    if (baseP <= 0) {
      toast.error('Please enter a valid Inkster base price');
      return;
    }

    onSaveItem(previewItem);
    toast.success(editingItem ? 'Door updated successfully' : 'Door added to quote');

    if (!editingItem) {
      setInksterBasePrice('1200');
      setQuantity('1');
      setHasUpgradeOption(false);
      setNotes('');
    }
  };

  const handleResetClick = () => {
    if (onResetQuote) {
      onResetQuote();
    } else {
      setInksterBasePrice('1200');
      setQuantity('1');
      setHasUpgradeOption(false);
      setHardwareType(mode === 'supply_only' ? 'none' : 'standard');
      setNotes('');
      toast.info('Door form reset');
    }
  };

  return {
    selectedPresetId,
    handlePresetSelect,
    category,
    setCategory,
    customDescription,
    setCustomDescription,
    quantity,
    setQuantity,
    inksterBasePrice,
    setInksterBasePrice,
    hardwareType,
    setHardwareType,
    customHardwareName,
    setCustomHardwareName,
    customHardwarePrice,
    setCustomHardwarePrice,
    hasUpgradeOption,
    setHasUpgradeOption,
    upgradeTitle,
    setUpgradeTitle,
    upgradeInksterPrice,
    setUpgradeInksterPrice,
    upgradeDiff,
    parsedQuantity,
    previewItem,
    handleSubmit,
    handleResetClick,
    currentPreset,
  };
}

