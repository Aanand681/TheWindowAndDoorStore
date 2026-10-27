'use client';

import { useState, useRef, useMemo } from 'react';
import { toCents } from '@/lib/promo-logic';
import { readPdfItems, parseManufacturerPdfItems, extractPdfMetadata } from '@/lib/pdf-parser';
import { toast } from 'sonner';

export type UIWindowItem = {
  id: string;
  qty: string;
  base: string;
  argon: string;
  solar: string;
  triple: string;
  w?: string;
  h?: string;
  color?: string; // 'White' | 'Painted'
};

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useCalculatorWindows() {
  const [windows, setWindows] = useState<UIWindowItem[]>([
    { id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const windowEndRef = useRef<HTMLDivElement>(null);

  const handleAddWindow = (onResetLockedPromo?: () => void) => {
    onResetLockedPromo?.();
    setWindows(prev => [
      ...prev,
      { id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' },
    ]);
    setTimeout(() => {
      windowEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const container = windowEndRef.current?.parentElement;
      if (container) {
        const inputs = container.querySelectorAll('input');
        if (inputs.length > 0) inputs[inputs.length - 6]?.focus();
      }
    }, 50);
  };

  const handleRemoveWindow = (id: string, onResetLockedPromo?: () => void) => {
    onResetLockedPromo?.();
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const handleWindowChange = (id: string, field: keyof UIWindowItem, value: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== id) return w;
        return { ...w, [field]: value };
      })
    );
  };

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    callbacks?: {
      onSetCustomerName?: (name: string) => void;
      onSetQuoteNumber?: (num: string) => void;
      onResetCalculator?: () => void;
    }
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.info('Parsing PDF...');
      const items = await readPdfItems(file);

      const meta = extractPdfMetadata(items);
      if (meta.customerName && callbacks?.onSetCustomerName) {
        callbacks.onSetCustomerName(meta.customerName);
      }
      if (meta.quoteNumber && callbacks?.onSetQuoteNumber) {
        callbacks.onSetQuoteNumber(meta.quoteNumber);
      }

      const imported = parseManufacturerPdfItems(items).map(w => ({
        id: w.id,
        qty: String(w.qty),
        base: w.base ? (w.base / 100).toString() : '',
        argon: w.argon ? (w.argon / 100).toString() : '',
        solar: w.solar ? (w.solar / 100).toString() : '',
        triple: w.triple ? (w.triple / 100).toString() : '',
        w: w.w || '',
        h: w.h || '',
        color: w.color || 'White',
      }));

      setWindows(
        imported.length > 0
          ? imported
          : [{ id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' }]
      );

      callbacks?.onResetCalculator?.();
      toast.success(`Imported ${imported.length} window(s) from ${file.name}.`);
    } catch (error: any) {
      toast.error(`PDF import failed: ${error.message}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const summaryWindowGroups = useMemo(() => {
    let dW = 0; // dual white
    let tW = 0; // triple white
    let dP = 0; // dual painted
    let tP = 0; // triple painted
    let totalBaseCents = 0;

    windows.forEach(w => {
      const q = Math.max(1, Number(w.qty) || 1);
      const itemBase = toCents(w.base);
      const isTriple = Number(w.triple) > 0 || toCents(w.triple) > 0;
      const isPainted = w.color && w.color.toLowerCase() === 'painted';

      if (isPainted) {
        if (isTriple) tP += q;
        else dP += q;
      } else {
        if (isTriple) tW += q;
        else dW += q;
      }
      totalBaseCents += itemBase;
    });

    const totalQty = dW + tW + dP + tP;
    if (totalQty === 0) return [];

    let paintedPart = '';
    if (dP > 0 && tP > 0) {
      paintedPart = `${dP} dual & ${tP} triple pane painted`;
    } else if (dP > 0) {
      paintedPart = `${dP} dual pane painted`;
    } else if (tP > 0) {
      paintedPart = `${tP} triple pane painted`;
    }

    let whitePart = '';
    if (dW > 0 && tW > 0) {
      whitePart = `${dW} dual & ${tW} triple pane white`;
    } else if (dW > 0) {
      whitePart = `${dW} dual pane white`;
    } else if (tW > 0) {
      whitePart = `${tW} triple pane white`;
    }

    let fullLabel = '';
    const plural = totalQty > 1 ? 'windows' : 'window';

    if (paintedPart && whitePart) {
      const separator = (paintedPart.includes('&') || whitePart.includes('&')) ? ', ' : ' and ';
      fullLabel = `${paintedPart}${separator}${whitePart} ${plural}`;
    } else if (paintedPart) {
      fullLabel = `${paintedPart} ${plural}`;
    } else if (whitePart) {
      fullLabel = `${whitePart} ${plural}`;
    }

    return [{
      key: 'all_windows',
      label: fullLabel,
      baseCents: totalBaseCents,
      qty: totalQty,
    }];
  }, [windows]);

  return {
    windows,
    setWindows,
    fileInputRef,
    windowEndRef,
    handleAddWindow,
    handleRemoveWindow,
    handleWindowChange,
    handlePdfUpload,
    summaryWindowGroups,
  };
}
