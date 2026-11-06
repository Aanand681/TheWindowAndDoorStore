'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DoorLineItem, DoorQuotingMode } from '@/lib/doors/types';
import {
  DoorClosed,
  Copy,
  Edit,
  Trash2,
  Sparkles,
  KeyRound,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoorLineItemsTableProps {
  lineItems: DoorLineItem[];
  mode: DoorQuotingMode;
  onEdit: (item: DoorLineItem) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function DoorLineItemsTable({
  lineItems,
  mode,
  onEdit,
  onDuplicate,
  onDelete,
  className,
}: DoorLineItemsTableProps) {
  if (lineItems.length === 0) {
    return (
      <Card className={cn('bg-card/50 border-dashed border-2 border-border/80 text-center py-10', className)}>
        <CardContent className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <DoorClosed className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">No doors added to quote yet</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use the form on the left to configure doors from your Inkster software specs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isInstallation = mode === 'installation';

  return (
    <Card className={cn('bg-card/70 backdrop-blur-md border-border shadow-md overflow-hidden py-0 gap-0 [--card-spacing:0px]', className)}>
      <CardHeader className="p-3.5 pb-2.5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">
                Configured Doors ({lineItems.length} {lineItems.length === 1 ? 'Entry' : 'Entries'})
              </CardTitle>
              <CardDescription className="text-xs">
                Review items, quantities, hardware, and customer upgrade options.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                <th className="py-2.5 px-3 w-12 text-center">Qty</th>
                <th className="py-2.5 px-3">Door Specifications</th>
                <th className="py-2.5 px-3 w-36">Preset &amp; Category</th>
                <th className="py-2.5 px-3 w-32 text-right">Door Base Price</th>
                {isInstallation && <th className="py-2.5 px-3 w-32 text-right">Labour &amp; Misc</th>}
                <th className="py-2.5 px-3 w-32 text-right">Line Total</th>
                <th className="py-2.5 px-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {lineItems.map((item, idx) => {
                const hasHardware = item.hardwareType !== 'none';
                const hasUpgrade = item.upgradeOption?.enabled;

                let hwLabel = 'None';
                if (item.hardwareType === 'standard') hwLabel = `Standard Set ($${item.hardwarePrice.toFixed(0)})`;
                else if (item.hardwareType === 'customer_supplied') hwLabel = `Customer ($${(item.customerHardwareFee || 80).toFixed(0)} Reinstall Labour)`;
                else if (item.hardwareType === 'custom') hwLabel = `${item.customHardwareName || 'Custom'} ($${item.hardwarePrice.toFixed(0)})`;

                return (
                  <React.Fragment key={item.id || idx}>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                        {item.quantity}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-xs sm:text-sm text-foreground">
                          {item.customDescription || item.presetLabel}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                          <span>Inkster Base: ${item.inksterBasePrice.toFixed(2)}/unit</span>
                          {hasHardware && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                              <KeyRound className="w-2.5 h-2.5" />
                              {hwLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-xs font-medium">{item.presetLabel}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {item.category}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-medium text-xs">
                          ${(item.inksterBasePrice * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          ${item.inksterBasePrice.toFixed(2)}/ea
                        </div>
                      </td>

                      {isInstallation && (
                        <td className="py-3 px-3 text-right">
                          <div className="font-mono font-medium text-xs">
                            ${(
                              item.lineLabourTotal +
                              item.lineMiscTotal +
                              item.lineHardwareTotal
                            ).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Lab: ${item.lineLabourTotal.toFixed(2)}
                          </div>
                        </td>
                      )}

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-sm text-foreground">
                          ${(isInstallation ? item.lineGrandTotal : (item.lineSupplyTotal ?? (item.lineDoorSupplyTotal + item.lineHardwareTotal + (item.surchargeAmount * item.quantity) - (item.discountAmount * item.quantity)))).toFixed(2)}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit Door"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDuplicate(item.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Duplicate Door"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item.id)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete Door"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Upgrade Option Row: Showing ONLY pre-tax difference */}
                    {hasUpgrade && item.upgradeOption && (
                      <tr className="bg-emerald-50/5 border-b border-emerald-500/20">
                        <td colSpan={isInstallation ? 7 : 6} className="py-2 px-4">
                          <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                Option for door:
                              </span>
                              <span>{item.upgradeOption.title}</span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                (Inkster Base: ${item.upgradeOption.inksterPrice.toFixed(2)})
                              </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                Upgrade Difference: +${item.upgradeOption.subtotalDifference.toFixed(2)}/unit
                                {item.quantity > 1 ? (
                                  <span className="ml-1 text-primary">
                                    (+${(item.upgradeOption.subtotalDifference * item.quantity).toFixed(2)} total for {item.quantity} doors)
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
