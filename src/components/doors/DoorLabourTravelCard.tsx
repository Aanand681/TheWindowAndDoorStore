'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DoorLogisticsSettings,
  DoorQuotingMode,
  DoorUpchargeConfig,
  DoorSelectedUpcharge,
} from '@/lib/doors/types';
import { Truck, MapPin, Users, Wrench, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoorLabourTravelCardProps {
  mode: DoorQuotingMode;
  availableUpcharges: DoorUpchargeConfig[];
  globalUpcharges: DoorSelectedUpcharge[];
  onUpdateGlobalUpcharges: (upcharges: DoorSelectedUpcharge[]) => void;
  travelFeeType: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  logistics: DoorLogisticsSettings;
  onUpdateParams: (updates: {
    travelFeeType?: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
    customTravelFee?: string;
    showOutTownTravel?: boolean;
    travelKm?: string;
    crewHours?: string;
    crewSize?: '2' | '3';
  }) => void;
  className?: string;
}

export function DoorLabourTravelCard({
  mode,
  availableUpcharges,
  globalUpcharges,
  onUpdateGlobalUpcharges,
  travelFeeType,
  customTravelFee,
  showOutTownTravel,
  travelKm,
  crewHours,
  crewSize,
  logistics,
  onUpdateParams,
  className,
}: DoorLabourTravelCardProps) {
  const isInstallation = mode === 'installation';
  const [showUpchargesAccordion, setShowUpchargesAccordion] = useState(true);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

  if (!isInstallation) {
    return (
      <Card className={cn('bg-card/40 border-border/60 opacity-60 py-0 gap-0 [--card-spacing:0px]', className)}>
        <CardContent className="py-4 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span>Setup &amp; Logistics fees are excluded in Supply Only mode.</span>
          </div>
          <span className="font-mono font-semibold">$0.00</span>
        </CardContent>
      </Card>
    );
  }

  // Pre-calculate travel breakdown
  const km = parseFloat(travelKm) || 0;
  const hours = parseFloat(crewHours) || 0;
  const vehicleCost = showOutTownTravel ? km * logistics.vehicleRatePerKm : 0;
  const crewHourlyRate = crewSize === '3' ? logistics.crewHourly3Men : logistics.crewHourly2Men;
  const crewCost = showOutTownTravel ? hours * crewHourlyRate : 0;

  // Global upcharges helper
  const handleToggleUpcharge = (config: DoorUpchargeConfig) => {
    const existing = globalUpcharges.find((u) => u.upchargeId === config.id);
    if (existing) {
      setQtyInputs((prev) => {
        const next = { ...prev };
        delete next[config.id];
        return next;
      });
      onUpdateGlobalUpcharges(globalUpcharges.filter((u) => u.upchargeId !== config.id));
    } else {
      setQtyInputs((prev) => ({ ...prev, [config.id]: '1' }));
      onUpdateGlobalUpcharges([
        ...globalUpcharges,
        {
          upchargeId: config.id,
          label: config.label,
          rate: config.rate,
          qty: 1,
          total: config.rate,
        },
      ]);
    }
  };

  const handleUpdateUpchargeQty = (id: string, qty: number) => {
    if (qty <= 0) {
      onUpdateGlobalUpcharges(globalUpcharges.filter((u) => u.upchargeId !== id));
    } else {
      onUpdateGlobalUpcharges(
        globalUpcharges.map((u) => {
          if (u.upchargeId !== id) return u;
          return {
            ...u,
            qty,
            total: Math.round(u.rate * qty * 100) / 100,
          };
        })
      );
    }
  };

  const globalUpchargesTotal = globalUpcharges.reduce((acc, u) => acc + u.total, 0);

  // Setup fee breakdown
  const baseSetup = logistics.setupFeeDefault || 140.0;
  let remoteExtra = 0;
  if (travelFeeType === 'far_std') remoteExtra = logistics.setupFeeFarStandard || 727.5;
  if (travelFeeType === 'far_small') remoteExtra = logistics.setupFeeFarSmall || 363.5;
  if (travelFeeType === 'custom') remoteExtra = Math.max(0, parseFloat(customTravelFee) || 0);

  const totalSetup = travelFeeType === 'none' ? 0 : baseSetup + remoteExtra;

  return (
    <Card className={cn('bg-card/70 backdrop-blur-md border-border shadow-md !py-0 !gap-0 [--card-spacing:0px]', className)}>
      <CardHeader className="p-3.5 !pb-2.5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">Site Setup, Upcharges &amp; Logistics</CardTitle>
              <CardDescription className="text-xs">
                Base $140 setup (fixed), remote travel on top, and one-time jobsite labour upcharges.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 !pt-3 space-y-3.5">
        {/* SECTION 1: Jobsite Labour Upcharges (Added ONCE for all doors) */}
        <div className="border border-border/70 rounded-xl overflow-hidden bg-card/40">
          <button
            type="button"
            onClick={() => setShowUpchargesAccordion(!showUpchargesAccordion)}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold hover:bg-muted/40 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <span>Jobsite Labour Upcharges ({globalUpcharges.length} active)</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                (Applies once for the entire job)
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
            <div className="p-3 pt-0 border-t border-border/40 space-y-2 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableUpcharges.map((upcharge) => {
                  const active = globalUpcharges.find((u) => u.upchargeId === upcharge.id);
                  const isSelected = !!active;
                  const currentQty = active ? active.qty : 1;

                  return (
                    <div
                      key={upcharge.id}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors',
                        isSelected ? 'border-primary/50 bg-primary/5' : 'border-border/60 hover:bg-muted/20'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleUpcharge(upcharge)}
                          className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{upcharge.label}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            ${upcharge.rate.toFixed(2)} ({upcharge.unit})
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="text-[10px] text-muted-foreground">Qty:</span>
                          <Input
                            type="number"
                            min="0.1"
                            step="any"
                            value={qtyInputs[upcharge.id] !== undefined ? qtyInputs[upcharge.id] : String(currentQty)}
                            onChange={(e) => {
                              const valStr = e.target.value;
                              setQtyInputs((prev) => ({ ...prev, [upcharge.id]: valStr }));
                              const valNum = parseFloat(valStr);
                              if (!isNaN(valNum) && valNum > 0) {
                                handleUpdateUpchargeQty(upcharge.id, valNum);
                              }
                            }}
                            onBlur={() => {
                              const valStr = qtyInputs[upcharge.id] ?? '';
                              const valNum = parseFloat(valStr);
                              if (isNaN(valNum) || valNum <= 0) {
                                setQtyInputs((prev) => ({ ...prev, [upcharge.id]: '1' }));
                                handleUpdateUpchargeQty(upcharge.id, 1);
                              } else {
                                setQtyInputs((prev) => ({ ...prev, [upcharge.id]: String(valNum) }));
                              }
                            }}
                            className="w-16 h-6 text-xs text-center font-mono p-1"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom Jobsite Labour Items */}
              {globalUpcharges.filter((u) => u.upchargeId.startsWith('custom_') || (u as any).isCustom).map((customU) => (
                <div
                  key={customU.upchargeId}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-primary/40 bg-primary/5 text-xs animate-in fade-in"
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
                        className="w-20 h-7 text-xs font-mono bg-background"
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
                        className="w-16 h-7 text-xs text-center font-mono bg-background"
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
                    } as any,
                  ]);
                }}
                className="w-full mt-2 h-8 text-xs border-dashed text-primary hover:bg-primary/5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Custom Labour / Upcharge
              </Button>
            </div>
          )}
        </div>

        {/* SECTION 2: Base Setup & Remote Fee Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Base Setup &amp; Remote Jobsite Mobilization</Label>
            <span className="text-xs font-mono font-bold text-primary">
              Total Setup: ${totalSetup.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onUpdateParams({ travelFeeType: 'local_std' })}
              className={cn(
                'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
                travelFeeType === 'local_std'
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border hover:bg-muted/40 text-muted-foreground'
              )}
            >
              <div className="font-semibold">Local (In-Town)</div>
              <div className="text-[11px] font-mono mt-0.5">${baseSetup.toFixed(2)} Base</div>
              <div className="text-[10px] text-muted-foreground">Fixed Base Setup</div>
            </button>

            <button
              type="button"
              onClick={() => onUpdateParams({ travelFeeType: 'far_std' })}
              className={cn(
                'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
                travelFeeType === 'far_std'
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border hover:bg-muted/40 text-muted-foreground'
              )}
            >
              <div className="font-semibold">Dryden / Sioux Lookout</div>
              <div className="text-[11px] font-mono mt-0.5">
                ${(baseSetup + (logistics.setupFeeFarStandard || 727.5)).toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                ${baseSetup} + ${logistics.setupFeeFarStandard}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onUpdateParams({ travelFeeType: 'far_small' })}
              className={cn(
                'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
                travelFeeType === 'far_small'
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border hover:bg-muted/40 text-muted-foreground'
              )}
            >
              <div className="font-semibold">Dryden Small Job</div>
              <div className="text-[11px] font-mono mt-0.5">
                ${(baseSetup + (logistics.setupFeeFarSmall || 363.5)).toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                ${baseSetup} + ${logistics.setupFeeFarSmall}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onUpdateParams({ travelFeeType: 'custom' })}
              className={cn(
                'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
                travelFeeType === 'custom'
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border hover:bg-muted/40 text-muted-foreground'
              )}
            >
              <div className="font-semibold">Custom Remote</div>
              <div className="text-[11px] font-mono mt-0.5">
                ${(baseSetup + (parseFloat(customTravelFee) || 0)).toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">${baseSetup} + Custom</div>
            </button>
          </div>

          {travelFeeType === 'custom' && (
            <div className="pt-2">
              <Label className="text-xs">Additional Remote Travel Fee on top of $140 ($)</Label>
              <div className="relative mt-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                <Input
                  type="number"
                  step="1"
                  value={customTravelFee}
                  onChange={(e) => onUpdateParams({ customTravelFee: e.target.value })}
                  placeholder="0.00"
                  className="pl-6 h-8 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Additional Mileage & Crew Hours (Default 3 Men) */}
        <div className="border border-border/70 rounded-xl overflow-hidden bg-card/40">
          <div className="flex items-center justify-between p-3 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOutTownTravel}
                onChange={(e) => onUpdateParams({ showOutTownTravel: e.target.checked })}
                className="rounded border-input text-primary focus:ring-primary w-4 h-4"
              />
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Additional Out-of-Town Mileage &amp; Crew Travel Time
              </span>
            </label>
            {showOutTownTravel && (
              <span className="text-[11px] font-mono text-primary font-bold">
                +${(vehicleCost + crewCost).toFixed(2)}
              </span>
            )}
          </div>

          {showOutTownTravel && (
            <div className="p-3 pt-0 border-t border-border/40 space-y-3 mt-2 bg-muted/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Distance (km)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={travelKm}
                    onChange={(e) => onUpdateParams({ travelKm: e.target.value })}
                    placeholder="e.g. 200"
                    className="h-8 text-xs font-mono"
                  />
                  <div className="text-[10px] text-muted-foreground">
                    @ ${logistics.vehicleRatePerKm.toFixed(2)}/km = ${vehicleCost.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Crew Transit (Hours)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={crewHours}
                    onChange={(e) => onUpdateParams({ crewHours: e.target.value })}
                    placeholder="e.g. 2.5"
                    className="h-8 text-xs font-mono"
                  />
                  <div className="text-[10px] text-muted-foreground">
                    @ ${crewHourlyRate.toFixed(2)}/hr = ${crewCost.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Crew Size (Default: 3 Men)</Label>
                  <select
                    value={crewSize}
                    onChange={(e) => onUpdateParams({ crewSize: e.target.value as '2' | '3' })}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus:ring-1 focus:ring-ring font-medium"
                  >
                    <option value="3">3-Man Crew (${logistics.crewHourly3Men}/hr) [Default]</option>
                    <option value="2">2-Man Crew (${logistics.crewHourly2Men}/hr)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
