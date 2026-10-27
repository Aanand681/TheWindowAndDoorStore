'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, RotateCcw } from 'lucide-react';
import { formatMoney } from '@/lib/promo-logic';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';

const DEFAULT_JAMBS = [
  { id: 'j1', label: 'Vinyl Wrapped Jamb – 2 1/2', rate: 5.05 },
  { id: 'j2', label: 'Vinyl Wrapped Jamb – 3 1/4', rate: 6.05 },
  { id: 'j3', label: 'Vinyl Wrapped Jamb – 4 1/2', rate: 7.34 },
  { id: 'j4', label: 'Vinyl Wrapped Jamb – 5 1/4', rate: 8.49 },
  { id: 'j5', label: 'Vinyl Wrapped Jamb – 6 3/4', rate: 10.31 },
];

const DEFAULT_CASINGS = [
  { id: 'vinyl', label: 'Vinyl casing charge', rate: 5.69 },
  { id: 'oak', label: 'Oak casing charge', rate: 8.16 },
];

function parseInches(v: string | undefined | null) {
  const s = String(v ?? '').trim().replace(/"/g, '');
  if (!s) return null;
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export interface SupplyJambCasingCardProps {
  windows: UIWindowItem[];
  isReadOnly?: boolean;
  jambId: string;
  setJambId: (val: string) => void;
  jambName: string;
  setJambName: (val: string) => void;
  jambRate: string;
  setJambRate: (val: string) => void;
  casingId: string;
  setCasingId: (val: string) => void;
  casingName: string;
  setCasingName: (val: string) => void;
  casingRate: string;
  setCasingRate: (val: string) => void;
  onJCCalculated: (data: {
    linearFeet: number;
    jambTotCents: number;
    casingTotCents: number;
    jcTotalCents: number;
    selectedJamb: any;
    selectedCasing: any;
  }) => void;
}

export function SupplyJambCasingCard({
  windows,
  isReadOnly = false,
  jambId,
  setJambId,
  jambName,
  setJambName,
  jambRate,
  setJambRate,
  casingId,
  setCasingId,
  casingName,
  setCasingName,
  casingRate,
  setCasingRate,
  onJCCalculated,
}: SupplyJambCasingCardProps) {
  const [dbJambs, setDbJambs] = useState<any[]>(DEFAULT_JAMBS);
  const [dbCasings, setDbCasings] = useState<any[]>(DEFAULT_CASINGS);
  const [extraLinPerWindow, setExtraLinPerWindow] = useState<number>(2.17);

  // Fetch jambs, casings, and supply-only linear allowance from database
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.jambs?.length) setDbJambs(d.jambs);
        if (d?.casings?.length) setDbCasings(d.casings);
      })
      .catch(console.error);

    fetch('/api/regions')
      .then((r) => r.json())
      .then((regions) => {
        if (Array.isArray(regions)) {
          const supply = regions.find(
            (r: any) => r.isSupplyOnly || r.name?.toLowerCase().includes('supply')
          );
          if (supply && supply.extraLinPerWindow !== undefined) {
            setExtraLinPerWindow(Number(supply.extraLinPerWindow) || 2.17);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Compute total perimeter linear feet from windows
  const linearFeet = useMemo(() => {
    let ln = 0;
    windows.forEach((w) => {
      const W = parseInches(w.w);
      const H = parseInches(w.h);
      const q = Math.max(1, Number(w.qty) || 1);
      if (W && H) {
        const itemLin = ((W * 2 + H * 2) / 12) * q + q * extraLinPerWindow;
        ln += itemLin;
      }
    });
    return Math.round(ln * 100) / 100;
  }, [windows, extraLinPerWindow]);

  // Compute rates and totals
  const effectiveJambRate = useMemo(() => {
    if (jambId === 'none') return 0;
    if (jambId === 'custom') return Number(jambRate) || 0;
    const match = dbJambs.find((j) => j.id === jambId);
    return match ? Number(match.rate) : 0;
  }, [jambId, jambRate, dbJambs]);

  const effectiveCasingRate = useMemo(() => {
    if (casingId === 'none') return 0;
    if (casingId === 'custom') return Number(casingRate) || 0;
    const match = dbCasings.find((c) => c.id === casingId);
    return match ? Number(match.rate) : 0;
  }, [casingId, casingRate, dbCasings]);

  const jambTotCents = Math.round(linearFeet * effectiveJambRate * 100);
  const casingTotCents = Math.round(linearFeet * effectiveCasingRate * 100);
  const jcTotalCents = jambTotCents + casingTotCents;

  const selectedJambLabel = useMemo(() => {
    if (jambId === 'none') return 'None ($0.00)';
    if (jambId === 'custom') return jambName ? `${jambName} ($${Number(jambRate || 0).toFixed(2)}/ft)` : 'Custom...';
    const match = dbJambs.find((j) => j.id === jambId);
    return match ? `${match.label} ($${Number(match.rate).toFixed(2)}/ft)` : 'None';
  }, [jambId, jambName, jambRate, dbJambs]);

  const selectedCasingLabel = useMemo(() => {
    if (casingId === 'none') return 'None ($0.00)';
    if (casingId === 'custom') return casingName ? `${casingName} ($${Number(casingRate || 0).toFixed(2)}/ft)` : 'Custom...';
    const match = dbCasings.find((c) => c.id === casingId);
    return match ? `${match.label} ($${Number(match.rate).toFixed(2)}/ft)` : 'None';
  }, [casingId, casingName, casingRate, dbCasings]);

  // Selected item objects for QuoteInvoice representation
  const selectedJambObj = useMemo(() => {
    if (jambId === 'none') return null;
    return {
      id: jambId,
      name:
        jambId === 'custom'
          ? jambName || 'Custom Jamb'
          : dbJambs.find((j) => j.id === jambId)?.label || 'Jamb',
      rate: effectiveJambRate,
      total: jambTotCents / 100,
    };
  }, [jambId, jambName, effectiveJambRate, jambTotCents, dbJambs]);

  const selectedCasingObj = useMemo(() => {
    if (casingId === 'none') return null;
    return {
      id: casingId,
      name:
        casingId === 'custom'
          ? casingName || 'Custom Casing'
          : dbCasings.find((c) => c.id === casingId)?.label || 'Casing',
      rate: effectiveCasingRate,
      total: casingTotCents / 100,
    };
  }, [casingId, casingName, effectiveCasingRate, casingTotCents, dbCasings]);

  // Emit calculation to parent
  useEffect(() => {
    onJCCalculated({
      linearFeet,
      jambTotCents,
      casingTotCents,
      jcTotalCents,
      selectedJamb: selectedJambObj,
      selectedCasing: selectedCasingObj,
    });
  }, [linearFeet, jambTotCents, casingTotCents, jcTotalCents, selectedJambObj, selectedCasingObj]);

  return (
    <Card className="bg-card/70 border-primary/25 backdrop-blur-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <CardContent className="p-4 space-y-3">
        {/* Slim Top Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Supply Jambs &amp; Casings (Optional)</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {linearFeet.toFixed(2)} lin ft total
          </span>
        </div>

        {/* Compact 2-Column Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Jamb Extension Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Jamb Extension
              </Label>
              {jambId !== 'none' && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => setJambId('none')}
                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> None
                </button>
              )}
            </div>
            <Select disabled={isReadOnly} value={jambId} onValueChange={(val) => setJambId(val ?? 'none')}>
              <SelectTrigger className="w-full h-9 bg-background text-xs font-medium">
                <SelectValue placeholder="Select jamb extension">
                  {selectedJambLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None ($0.00)</SelectItem>
                {dbJambs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.label} (${Number(j.rate).toFixed(2)}/ft)
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>

            {jambId === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
                <Input
                  disabled={isReadOnly}
                  placeholder="Custom Jamb Name"
                  value={jambName}
                  onChange={(e) => setJambName(e.target.value)}
                  className="bg-background h-8 text-xs"
                />
                <Input
                  disabled={isReadOnly}
                  type="number"
                  step="0.01"
                  placeholder="Rate/ft"
                  value={jambRate}
                  onChange={(e) => setJambRate(e.target.value)}
                  className="bg-background h-8 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Casing Style Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Casing Profile
              </Label>
              {casingId !== 'none' && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => setCasingId('none')}
                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> None
                </button>
              )}
            </div>
            <Select disabled={isReadOnly} value={casingId} onValueChange={(val) => setCasingId(val ?? 'none')}>
              <SelectTrigger className="w-full h-9 bg-background text-xs font-medium">
                <SelectValue placeholder="Select casing style">
                  {selectedCasingLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None ($0.00)</SelectItem>
                {dbCasings.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label} (${Number(c.rate).toFixed(2)}/ft)
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>

            {casingId === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
                <Input
                  disabled={isReadOnly}
                  placeholder="Custom Casing Name"
                  value={casingName}
                  onChange={(e) => setCasingName(e.target.value)}
                  className="bg-background h-8 text-xs"
                />
                <Input
                  disabled={isReadOnly}
                  type="number"
                  step="0.01"
                  placeholder="Rate/ft"
                  value={casingRate}
                  onChange={(e) => setCasingRate(e.target.value)}
                  className="bg-background h-8 text-xs font-mono"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SupplyJambCasingCard;
