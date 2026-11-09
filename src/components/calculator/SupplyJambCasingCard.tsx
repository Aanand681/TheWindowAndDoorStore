'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';
import { computeTotalLinearFeet } from './supply-jc/supply-jc-calculator';
import { SupplyJambSelector } from './supply-jc/SupplyJambSelector';
import { SupplyCasingSelector } from './supply-jc/SupplyCasingSelector';

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

  const linearFeet = useMemo(() => {
    return computeTotalLinearFeet(windows, extraLinPerWindow);
  }, [windows, extraLinPerWindow]);

  const effectiveJambRate = useMemo(() => {
    if (jambId === 'none') return 0;
    if (jambId === 'custom') return parseFloat(jambRate) || 0;
    const found = dbJambs.find((j) => j.id === jambId);
    return found ? Number(found.rate ?? found.pricePerFoot ?? 0) : 0;
  }, [jambId, jambRate, dbJambs]);

  const effectiveCasingRate = useMemo(() => {
    if (casingId === 'none') return 0;
    if (casingId === 'custom') return parseFloat(casingRate) || 0;
    const found = dbCasings.find((c) => c.id === casingId);
    return found ? Number(found.rate ?? found.pricePerFoot ?? 0) : 0;
  }, [casingId, casingRate, dbCasings]);

  const jambTotCents = Math.round(linearFeet * effectiveJambRate * 100);
  const casingTotCents = Math.round(linearFeet * effectiveCasingRate * 100);
  const jcTotalCents = jambTotCents + casingTotCents;

  const selectedJambLabel = useMemo(() => {
    if (jambId === 'none') return 'None';
    if (jambId === 'custom') return jambName || 'Custom';
    return dbJambs.find((j) => j.id === jambId)?.label || 'None';
  }, [jambId, jambName, dbJambs]);

  const selectedCasingLabel = useMemo(() => {
    if (casingId === 'none') return 'None';
    if (casingId === 'custom') return casingName || 'Custom';
    return dbCasings.find((c) => c.id === casingId)?.label || 'None';
  }, [casingId, casingName, dbCasings]);

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

  useEffect(() => {
    onJCCalculated({
      linearFeet,
      jambTotCents,
      casingTotCents,
      jcTotalCents,
      selectedJamb: selectedJambObj,
      selectedCasing: selectedCasingObj,
    });
  }, [linearFeet, jambTotCents, casingTotCents, jcTotalCents, selectedJambObj, selectedCasingObj, onJCCalculated]);

  return (
    <Card className="bg-card/70 border-primary/25 backdrop-blur-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 py-0 gap-0 [--card-spacing:0px]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/40 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Supply Jambs &amp; Casings (Optional)</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {linearFeet.toFixed(2)} lin ft total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SupplyJambSelector
            isReadOnly={isReadOnly}
            jambId={jambId}
            setJambId={setJambId}
            jambName={jambName}
            setJambName={setJambName}
            jambRate={jambRate}
            setJambRate={setJambRate}
            dbJambs={dbJambs}
            selectedJambLabel={selectedJambLabel}
          />

          <SupplyCasingSelector
            isReadOnly={isReadOnly}
            casingId={casingId}
            setCasingId={setCasingId}
            casingName={casingName}
            setCasingName={setCasingName}
            casingRate={casingRate}
            setCasingRate={setCasingRate}
            dbCasings={dbCasings}
            selectedCasingLabel={selectedCasingLabel}
          />
        </div>

        {jcTotalCents > 0 && (
          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-mono font-bold text-foreground">
            <span className="text-muted-foreground font-sans font-medium text-[11px]">
              Jambs (${(jambTotCents / 100).toFixed(2)}) + Casings (${(casingTotCents / 100).toFixed(2)})
            </span>
            <span className="text-primary font-bold">
              Total: ${(jcTotalCents / 100).toFixed(2)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
