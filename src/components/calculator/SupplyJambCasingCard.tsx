'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, Ruler, CheckCircle2, RotateCcw } from 'lucide-react';
import { formatMoney } from '@/lib/promo-logic';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';

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
  const [dbJambs, setDbJambs] = useState<any[]>([]);
  const [dbCasings, setDbCasings] = useState<any[]>([]);
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
    <Card className="bg-card/70 border-primary/25 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <CardHeader className="py-4 px-6 border-b border-border/50 bg-primary/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Layers className="w-5 h-5 text-primary" />
              <span>Supply Only — Jambs &amp; Casings</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Select jamb extension depth and casing style. Linear footage includes {extraLinPerWindow} ft allowance per window from database.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-mono font-semibold text-primary shrink-0">
            <Ruler className="w-3.5 h-3.5" />
            <span>{linearFeet.toFixed(2)} lin ft total</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jamb Extension Selector */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Jamb Extension
              </Label>
              {jambId !== 'none' && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => setJambId('none')}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Set to None
                </button>
              )}
            </div>
            <Select disabled={isReadOnly} value={jambId} onValueChange={(val) => setJambId(val ?? 'none')}>
              <SelectTrigger className="w-full bg-background font-medium">
                <SelectValue placeholder="Select jamb extension" />
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
                  className="bg-background text-xs"
                />
                <Input
                  disabled={isReadOnly}
                  type="number"
                  step="0.01"
                  placeholder="Rate/ft (e.g. 7.50)"
                  value={jambRate}
                  onChange={(e) => setJambRate(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>
            )}

            {jambId !== 'none' && (
              <div className="text-[11px] text-muted-foreground flex justify-between px-1">
                <span>{linearFeet.toFixed(2)} ft × ${effectiveJambRate.toFixed(2)}/ft</span>
                <span className="font-mono font-semibold text-foreground">{formatMoney(jambTotCents)}</span>
              </div>
            )}
          </div>

          {/* Casing Style Selector */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Casing Profile
              </Label>
              {casingId !== 'none' && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => setCasingId('none')}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Set to None
                </button>
              )}
            </div>
            <Select disabled={isReadOnly} value={casingId} onValueChange={(val) => setCasingId(val ?? 'none')}>
              <SelectTrigger className="w-full bg-background font-medium">
                <SelectValue placeholder="Select casing style" />
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
                  className="bg-background text-xs"
                />
                <Input
                  disabled={isReadOnly}
                  type="number"
                  step="0.01"
                  placeholder="Rate/ft (e.g. 5.75)"
                  value={casingRate}
                  onChange={(e) => setCasingRate(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>
            )}

            {casingId !== 'none' && (
              <div className="text-[11px] text-muted-foreground flex justify-between px-1">
                <span>{linearFeet.toFixed(2)} ft × ${effectiveCasingRate.toFixed(2)}/ft</span>
                <span className="font-mono font-semibold text-foreground">{formatMoney(casingTotCents)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Total Cost Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium text-foreground">
              Total Jambs &amp; Casings (added directly to quote):
            </span>
          </div>
          <span className="font-mono font-bold text-base text-primary">
            {formatMoney(jcTotalCents)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default SupplyJambCasingCard;
