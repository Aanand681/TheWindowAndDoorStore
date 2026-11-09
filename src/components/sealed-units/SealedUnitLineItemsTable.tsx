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
  labourMin?: number;
  onRemoveItem: (id: string) => void;
  onResetQuote: () => void;
}

export function SealedUnitLineItemsTable({
  lineItems,
  isInstallation: _isInstallation,
  mode = 'installation',
  labourRate = 14.40,
  miscRate = 2.40,
  labourMin = 120.0,
  onRemoveItem,
  onResetQuote,
}: SealedUnitLineItemsTableProps) {
  const isService = mode === 'service_only';
  const isInstall = mode === 'installation';

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
              ? 'On-site service charges: Labour is calculated on actual square footage (min $120.00/unit).'
              : 'Review glass specifications, grill layout, manufacturing base price, labour, and misc.'}
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
                ? 'Configure your glass units above to calculate itemized service labour and dimensions.'
                : 'Configure your first sealed unit above and click "Add to Quote".'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/50 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-2.5 text-center w-8">#</th>
                  <th className="py-2.5 px-2.5">Glass Specs</th>
                  <th className="py-2.5 px-2.5">Dimension</th>
                  <th className="py-2.5 px-2.5">Grills</th>
                  <th className="py-2.5 px-2 text-center w-12">Qty</th>
                  <th className="py-2.5 px-2.5 text-right w-24">Base Price</th>
                  <th className="py-2.5 px-2.5 text-right w-24">Labour</th>
                  <th className="py-2.5 px-2.5 text-right w-20">Misc</th>
                  <th className="py-2.5 px-2.5 text-right w-24">Line Total</th>
                  <th className="py-2.5 px-2.5 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {lineItems.map((item, idx) => {
                  const unitServiceLabour = Math.max(item.actualSqft * labourRate, labourMin);
                  const totalItemServiceLabour = Math.round(unitServiceLabour * item.quantity * 100) / 100;
                  const unitServiceMisc = Math.round(item.actualSqft * miscRate * 100) / 100;
                  const totalItemServiceMisc = Math.round(unitServiceMisc * item.quantity * 100) / 100;

                  const lineTotal = isService
                    ? Math.round((totalItemServiceLabour + totalItemServiceMisc) * 100) / 100
                    : isInstall
                    ? Math.round((item.lineGlassTotal + item.totalLabour + item.totalMisc) * 100) / 100
                    : item.lineGlassTotal;

                  const hasGrill = item.rawGrillCost > 0 || Boolean(item.grill);
                  const grillDimText = item.grill?.colsCount && item.grill?.rowsCount
                    ? `${item.grill.colsCount} × ${item.grill.rowsCount}`
                    : '';

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-2.5 text-muted-foreground font-semibold text-center font-mono">
                        {idx + 1}
                      </td>

                      {/* Glass Specs: Empty in Service Only */}
                      <td className="py-2.5 px-2.5 font-sans">
                        {!isService ? (
                          <>
                            <div className="font-bold text-foreground">{item.combinationName}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <span className="capitalize font-semibold">{item.treatment}</span>
                              <span>•</span>
                              <span className="uppercase font-semibold">{item.paneType}</span>
                              <span>•</span>
                              <span className="font-mono bg-muted px-1 rounded text-[10px]">
                                {item.thicknessMm}mm
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground font-mono">—</span>
                        )}
                      </td>

                      {/* Dimension: e.g. 31" wide × 78" high (16.79 sqft) */}
                      <td className="py-2.5 px-2.5 font-sans">
                        <div className="font-bold text-foreground whitespace-nowrap">
                          {item.widthIn}&quot; wide × {item.heightIn}&quot; high
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {item.actualSqft.toFixed(2)} sqft
                          {!isService && item.billableSqft !== Math.round(item.actualSqft) ? ` (${item.billableSqft} billable)` : ''}
                        </div>
                      </td>

                      {/* Grills: e.g. 3 x 5 / Brass Grills */}
                      <td className="py-2.5 px-2.5 font-sans">
                        {!isService && hasGrill ? (
                          <div>
                            {grillDimText ? (
                              <div className="font-bold text-foreground font-mono text-[11px]">
                                {grillDimText}
                              </div>
                            ) : null}
                            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate">
                              {item.grill?.color ? `${item.grill.color} Grills` : (item.grillDescription || 'Grills')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-mono">—</span>
                        )}
                      </td>

                      {/* Qty */}
                      <td className="py-2.5 px-2 text-center font-bold font-mono text-foreground">
                        {item.quantity}
                      </td>

                      {/* Base Price: Clean base price before 8% surcharge (Empty in Service Only) */}
                      <td className="py-2.5 px-2.5 text-right font-mono">
                        {!isService ? (
                          <>
                            <div className="font-bold text-foreground">
                              ${(item.multipliedTotal ?? (item.multipliedAmount * item.quantity)).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              ${Number(item.multipliedAmount || (item.multipliedTotal ? item.multipliedTotal / item.quantity : 0)).toFixed(2)}/ea
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Labour: Populated in Service Only (min $120) and Installation */}
                      <td className="py-2.5 px-2.5 text-right font-mono">
                        {isService ? (
                          <>
                            <div className="font-bold text-foreground">
                              ${totalItemServiceLabour.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              ${unitServiceLabour.toFixed(2)}/ea
                            </div>
                          </>
                        ) : isInstall ? (
                          <>
                            <div className="font-bold text-foreground">
                              ${item.totalLabour.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              ${item.unitLabour.toFixed(2)}/ea
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Misc */}
                      <td className="py-2.5 px-2.5 text-right font-mono">
                        {isService ? (
                          <span className="font-medium text-muted-foreground">
                            ${totalItemServiceMisc.toFixed(2)}
                          </span>
                        ) : isInstall ? (
                          <span className="font-medium text-muted-foreground">
                            ${item.totalMisc.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Line Total */}
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-foreground">
                        ${lineTotal.toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-2.5 text-center">
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
