'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DoorUpchargeConfig,
  DoorSelectedUpcharge,
} from '@/lib/doors/types';
import { Wrench, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoorSiteUpchargesSectionProps {
  availableUpcharges: DoorUpchargeConfig[];
  globalUpcharges: DoorSelectedUpcharge[];
  onUpdateGlobalUpcharges: (upcharges: DoorSelectedUpcharge[]) => void;
}

export function DoorSiteUpchargesSection({
  availableUpcharges,
  globalUpcharges,
  onUpdateGlobalUpcharges,
}: DoorSiteUpchargesSectionProps) {
  const [showUpchargesAccordion, setShowUpchargesAccordion] = useState(true);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

  const handleQtyChange = (config: DoorUpchargeConfig, valStr: string) => {
    setQtyInputs((prev) => ({ ...prev, [config.id]: valStr }));
    const valNum = parseFloat(valStr);

    if (isNaN(valNum) || valNum <= 0) {
      onUpdateGlobalUpcharges(globalUpcharges.filter((u) => u.upchargeId !== config.id));
    } else {
      const existing = globalUpcharges.find((u) => u.upchargeId === config.id);
      if (existing) {
        onUpdateGlobalUpcharges(
          globalUpcharges.map((u) =>
            u.upchargeId === config.id
              ? { ...u, qty: valNum, total: Math.round(u.rate * valNum * 100) / 100 }
              : u
          )
        );
      } else {
        onUpdateGlobalUpcharges([
          ...globalUpcharges,
          {
            upchargeId: config.id,
            label: config.label,
            rate: config.rate,
            qty: valNum,
            total: Math.round(config.rate * valNum * 100) / 100,
          },
        ]);
      }
    }
  };

  const globalUpchargesTotal = globalUpcharges.reduce((acc, u) => acc + u.total, 0);

  return (
    <div className="border border-border/70 rounded-xl overflow-hidden bg-card/40">
      <button
        type="button"
        onClick={() => setShowUpchargesAccordion(!showUpchargesAccordion)}
        className="w-full flex items-center justify-between p-3 text-xs font-semibold hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" />
          <span>Jobsite Labour &amp; Hardware ({globalUpcharges.length} active)</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            (Enter quantity or hours directly on any line)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {globalUpchargesTotal > 0 && (
            <span className="text-xs font-mono text-primary font-bold">
              +${globalUpchargesTotal.toFixed(2)}
            </span>
          )}
          {showUpchargesAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {showUpchargesAccordion && (
        <div className="p-3 pt-0 border-t border-border/40 space-y-1.5 mt-2">
          <div className="space-y-1.5">
            {availableUpcharges.map((upcharge) => {
              const active = globalUpcharges.find((u) => u.upchargeId === upcharge.id);
              const isSelected = !!active && active.qty > 0;
              const inputValue =
                qtyInputs[upcharge.id] !== undefined
                  ? qtyInputs[upcharge.id]
                  : active
                  ? String(active.qty)
                  : '';

              return (
                <div
                  key={upcharge.id}
                  className={cn(
                    'flex items-center justify-between py-1.5 px-3 rounded-lg border text-xs transition-colors gap-2',
                    isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/60 hover:bg-muted/20'
                  )}
                >
                  <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                    <span className="font-medium truncate text-foreground">{upcharge.label}</span>
                    <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                      ${upcharge.rate.toFixed(2)} / {upcharge.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">Qty:</span>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={inputValue}
                        onChange={(e) => handleQtyChange(upcharge, e.target.value)}
                        className="w-16 h-7 text-xs text-center font-mono p-1 bg-background"
                      />
                    </div>
                    <span className={cn(
                      'font-mono text-xs font-bold min-w-[60px] text-right',
                      isSelected ? 'text-primary' : 'text-muted-foreground/60'
                    )}>
                      ${(active ? active.total : 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Jobsite Labour Items */}
          {globalUpcharges
            .filter((u) => u.upchargeId.startsWith('custom_') || (u as unknown as { isCustom?: boolean }).isCustom)
            .map((customU) => (
              <div
                key={customU.upchargeId}
                className="flex items-center justify-between gap-2 p-2 rounded-lg border border-primary/40 bg-primary/5 text-xs animate-in fade-in"
              >
                <div className="flex-1">
                  <Input
                    placeholder="Custom labour description"
                    value={customU.label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      onUpdateGlobalUpcharges(
                        globalUpcharges.map((u) =>
                          u.upchargeId === customU.upchargeId ? { ...u, label: newLabel } : u
                        )
                      );
                    }}
                    className="h-7 text-xs bg-background"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="Rate"
                      value={customU.rate || ''}
                      onChange={(e) => {
                        const newRate = parseFloat(e.target.value) || 0;
                        onUpdateGlobalUpcharges(
                          globalUpcharges.map((u) =>
                            u.upchargeId === customU.upchargeId
                              ? { ...u, rate: newRate, total: Math.round(newRate * u.qty * 100) / 100 }
                              : u
                          )
                        );
                      }}
                      className="w-18 h-7 text-xs font-mono bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Qty:</span>
                    <Input
                      type="number"
                      step="any"
                      min="0.1"
                      placeholder="Qty"
                      value={customU.qty || ''}
                      onChange={(e) => {
                        const newQty = parseFloat(e.target.value) || 1;
                        onUpdateGlobalUpcharges(
                          globalUpcharges.map((u) =>
                            u.upchargeId === customU.upchargeId
                              ? { ...u, qty: newQty, total: Math.round(u.rate * newQty * 100) / 100 }
                              : u
                          )
                        );
                      }}
                      className="w-14 h-7 text-xs text-center font-mono bg-background"
                    />
                  </div>
                  <span className="font-mono font-bold text-primary min-w-[50px] text-right">
                    ${Number(customU.total || 0).toFixed(2)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onUpdateGlobalUpcharges(globalUpcharges.filter((u) => u.upchargeId !== customU.upchargeId));
                    }}
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newId = 'custom_' + Date.now();
              onUpdateGlobalUpcharges([
                ...globalUpcharges,
                {
                  upchargeId: newId,
                  label: '',
                  rate: 0,
                  qty: 1,
                  total: 0,
                  isCustom: true,
                } as unknown as DoorSelectedUpcharge,
              ]);
            }}
            className="w-full mt-2 h-7.5 text-xs border-dashed text-primary hover:bg-primary/5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Custom Labour / Upcharge
          </Button>
        </div>
      )}
    </div>
  );
}
