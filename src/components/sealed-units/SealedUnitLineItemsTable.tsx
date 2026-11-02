'use client';

import React from 'react';
import { PackageCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SealedUnitLineItem } from '@/lib/sealed-units-logic';

export interface SealedUnitLineItemsTableProps {
  lineItems: SealedUnitLineItem[];
  isInstallation: boolean;
  mode?: 'installation' | 'supply_only' | 'service_only';
  labourRate?: number;
  miscRate?: number;
  onRemoveItem: (id: string) => void;
  onResetQuote: () => void;
}

export function SealedUnitLineItemsTable({
  lineItems,
  isInstallation,
  mode = 'installation',
  labourRate = 14.40,
  miscRate = 2.40,
  onRemoveItem,
  onResetQuote,
}: SealedUnitLineItemsTableProps) {
  const isService = mode === 'service_only';

  return (
    <div className="bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
      <div className="border-b border-border/50 py-2.5 px-3.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-sm font-bold flex items-center gap-2 text-foreground">
            <PackageCheck className="w-4 h-4 text-primary" />
            <span>Added Sealed Units ({lineItems.length})</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
            {isService
              ? 'Individual glass units being serviced on-site. Labour & misc service charges are calculated on actual square footage.'
              : 'Review individual glass specs, grill designs, manufacturing pricing, and installation lines.'}
          </p>
        </div>
        {lineItems.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetQuote}
            className="text-xs text-destructive hover:bg-destructive/10 self-start sm:self-auto cursor-pointer h-7 px-2.5"
          >
            Clear All Items
          </Button>
        )}
      </div>

      <div className="p-0">
        {lineItems.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <PackageCheck className="w-10 h-10 mx-auto opacity-30 text-muted-foreground" />
            <div className="text-sm font-semibold">
              {isService ? 'No individual glass units added' : 'No glass units in quote'}
            </div>
            <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
              {isService
                ? 'On-site service is charged on total square footage in the Labour & Settings card above. Adding individual glass specs here is optional.'
                : 'Configure your first sealed unit above and click "Add to Quote".'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/50">
                <tr>
                  <th className="py-2 px-2.5">#</th>
                  <th className="py-2 px-2.5">Glass Spec &amp; Combo</th>
                  <th className="py-2 px-2.5">Dimensions &amp; Sq Ft</th>
                  <th className="py-2 px-2.5">Interior Grill</th>
                  <th className="py-2 px-2.5 text-center">Qty</th>
                  {!isService ? (
                    <>
                      <th className="py-2 px-2.5 text-right">Unit Price</th>
                      <th className="py-2 px-2.5 text-right">Glass Total</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2 px-2.5 text-right">Service Labour</th>
                      <th className="py-2 px-2.5 text-right">Service Misc</th>
                      <th className="py-2 px-2.5 text-right">Line Total</th>
                    </>
                  )}
                  {isInstallation && (
                    <>
                      <th className="py-2 px-2.5 text-right">Labour</th>
                      <th className="py-2 px-2.5 text-right">Misc</th>
                    </>
                  )}
                  <th className="py-2 px-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {lineItems.map((item, idx) => {
                  const lineSqft = item.actualSqft * item.quantity;
                  const lineServiceLabour = Math.round(lineSqft * labourRate * 100) / 100;
                  const lineServiceMisc = Math.round(lineSqft * miscRate * 100) / 100;
                  const lineServiceTotal = Math.round((lineServiceLabour + lineServiceMisc) * 100) / 100;

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-2.5 text-muted-foreground font-semibold">{idx + 1}</td>
                      <td className="py-2.5 px-2.5 font-sans">
                        <div className="font-bold text-foreground">{item.combinationName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize font-semibold">{item.treatment}</span>
                          <span>•</span>
                          <span className="uppercase font-semibold text-primary">{item.paneType}</span>
                          <span>•</span>
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground">
                            {item.thicknessMm}mm
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="font-bold text-foreground">
                          {item.widthIn}&quot; × {item.heightIn}&quot;
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.actualSqft.toFixed(2)} sqft {isService ? '' : `→ ${item.billableSqft} sqft billed`}
                        </div>
                        {item.rawShapeCost > 0 && (
                          <div className="text-[10px] font-sans font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                            {item.shapeDescription}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2.5 font-sans">
                        {item.rawGrillCost > 0 ? (
                          <div className="max-w-[200px]">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                              {item.grillDescription}
                            </span>
                            {!isService && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                +${item.rawGrillCost.toFixed(2)} raw
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-foreground">{item.quantity}</td>
                      {!isService ? (
                        <>
                          <td className="py-2.5 px-2.5 text-right">
                            <div className="font-bold text-foreground">${item.finalUnitPrice.toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground">
                              Pre-8%: ${item.multipliedAmount.toFixed(2)} + 8%: ${item.surcharge8PercentAmount.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                            ${item.lineGlassTotal.toFixed(2)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-right text-primary font-bold">
                            ${lineServiceLabour.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-muted-foreground">
                            ${lineServiceMisc.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-blue-600 dark:text-blue-400">
                            ${lineServiceTotal.toFixed(2)}
                          </td>
                        </>
                      )}
                      {isInstallation && (
                        <>
                          <td className="py-3 px-3 text-right text-muted-foreground">
                            ${item.totalLabour.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-muted-foreground">
                            ${item.totalMisc.toFixed(2)}
                          </td>
                        </>
                      )}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Remove unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
