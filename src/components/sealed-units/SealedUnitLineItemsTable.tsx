"use client"

import React from "react"
import { PackageCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"

export interface SealedUnitLineItemsTableProps {
  lineItems: SealedUnitLineItem[]
  isInstallation: boolean
  mode?: "installation" | "supply_only" | "service_only"
  labourRate?: number
  miscRate?: number
  labourMin?: number
  onRemoveItem: (id: string) => void
  onResetQuote: () => void
}

export function SealedUnitLineItemsTable({
  lineItems,
  isInstallation: _isInstallation,
  mode = "installation",
  labourRate = 14.4,
  miscRate = 2.4,
  labourMin = 120.0,
  onRemoveItem,
  onResetQuote,
}: SealedUnitLineItemsTableProps) {
  const isService = mode === "service_only"
  const isInstall = mode === "installation"

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/20 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <PackageCheck className="h-4 w-4 text-primary" />
            <span>Added Sealed Units ({lineItems.length})</span>
          </div>
          <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
            {isService
              ? "On-site service charges: Labour is calculated on actual square footage (min $120.00/unit)."
              : "Review glass specifications, grill layout, manufacturing base price, labour, and misc."}
          </p>
        </div>
        {lineItems.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetQuote}
            className="h-7 cursor-pointer self-start px-2.5 text-xs text-destructive hover:bg-destructive/10 sm:self-auto"
          >
            Clear All Items
          </Button>
        )}
      </div>

      <div className="p-0">
        {lineItems.length === 0 ? (
          <div className="space-y-2 py-12 text-center text-muted-foreground">
            <PackageCheck className="mx-auto h-10 w-10 text-muted-foreground opacity-30" />
            <div className="text-sm font-semibold">
              {isService
                ? "No individual glass units added"
                : "No glass units in quote"}
            </div>
            <p className="mx-auto max-w-sm text-xs text-muted-foreground/80">
              {isService
                ? "Configure your glass units above to calculate itemized service labour and dimensions."
                : 'Configure your first sealed unit above and click "Add to Quote".'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/50 bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="w-8 px-2.5 py-2.5 text-center">#</th>
                  <th className="px-2.5 py-2.5">Glass Specs</th>
                  <th className="px-2.5 py-2.5">Dimension</th>
                  <th className="px-2.5 py-2.5">Grills</th>
                  <th className="w-12 px-2 py-2.5 text-center">Qty</th>
                  <th className="w-24 px-2.5 py-2.5 text-right">Base Price</th>
                  <th className="w-24 px-2.5 py-2.5 text-right">Labour</th>
                  <th className="w-20 px-2.5 py-2.5 text-right">Misc</th>
                  <th className="w-24 px-2.5 py-2.5 text-right">Line Total</th>
                  <th className="w-12 px-2.5 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {lineItems.map((item, idx) => {
                  const unitServiceLabour = Math.max(
                    item.actualSqft * labourRate,
                    labourMin
                  )
                  const totalItemServiceLabour =
                    Math.round(unitServiceLabour * item.quantity * 100) / 100
                  const unitServiceMisc =
                    Math.round(item.actualSqft * miscRate * 100) / 100
                  const totalItemServiceMisc =
                    Math.round(unitServiceMisc * item.quantity * 100) / 100

                  const lineTotal = isService
                    ? Math.round(
                        (totalItemServiceLabour + totalItemServiceMisc) * 100
                      ) / 100
                    : isInstall
                      ? Math.round(
                          (item.lineGlassTotal +
                            item.totalLabour +
                            item.totalMisc) *
                            100
                        ) / 100
                      : item.lineGlassTotal

                  const hasGrill = item.rawGrillCost > 0 || Boolean(item.grill)
                  const grillDimText =
                    item.grill?.colsCount && item.grill?.rowsCount
                      ? `${item.grill.colsCount} × ${item.grill.rowsCount}`
                      : ""

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-2.5 py-2.5 text-center font-mono font-semibold text-muted-foreground">
                        {idx + 1}
                      </td>

                      {/* Glass Specs: Empty in Service Only */}
                      <td className="px-2.5 py-2.5 font-sans">
                        {!isService ? (
                          <>
                            <div className="font-bold text-foreground">
                              {item.combinationName}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <span className="font-semibold capitalize">
                                {item.treatment}
                              </span>
                              <span>•</span>
                              <span className="font-semibold uppercase">
                                {item.paneType}
                              </span>
                              <span>•</span>
                              <span className="rounded bg-muted px-1 font-mono text-[10px]">
                                {item.thicknessMm}mm
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="font-mono text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      {/* Dimension: e.g. 31" wide × 78" high (16.79 sqft) */}
                      <td className="px-2.5 py-2.5 font-sans">
                        <div className="font-bold whitespace-nowrap text-foreground">
                          {item.widthIn}&quot; wide × {item.heightIn}&quot; high
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {item.actualSqft.toFixed(2)} sqft
                          {!isService &&
                          item.billableSqft !== Math.round(item.actualSqft)
                            ? ` (${item.billableSqft} billable)`
                            : ""}
                        </div>
                      </td>

                      {/* Grills: e.g. 3 x 5 / Brass Grills */}
                      <td className="px-2.5 py-2.5 font-sans">
                        {!isService && hasGrill ? (
                          <div>
                            {grillDimText ? (
                              <div className="font-mono text-[11px] font-bold text-foreground">
                                {grillDimText}
                              </div>
                            ) : null}
                            <div className="truncate text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                              {item.grill?.color
                                ? `${item.grill.color} Grills`
                                : item.grillDescription || "Grills"}
                            </div>
                          </div>
                        ) : (
                          <span className="font-mono text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      {/* Qty */}
                      <td className="px-2 py-2.5 text-center font-mono font-bold text-foreground">
                        {item.quantity}
                      </td>

                      {/* Base Price: Clean base price before 8% surcharge (Empty in Service Only) */}
                      <td className="px-2.5 py-2.5 text-right font-mono">
                        {!isService ? (
                          <>
                            <div className="font-bold text-foreground">
                              $
                              {(
                                item.multipliedTotal ??
                                item.multipliedAmount * item.quantity
                              ).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              $
                              {Number(
                                item.multipliedAmount ||
                                  (item.multipliedTotal
                                    ? item.multipliedTotal / item.quantity
                                    : 0)
                              ).toFixed(2)}
                              /ea
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Labour: Populated in Service Only (min $120) and Installation */}
                      <td className="px-2.5 py-2.5 text-right font-mono">
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
                      <td className="px-2.5 py-2.5 text-right font-mono">
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
                      <td className="px-2.5 py-2.5 text-right font-mono font-bold text-foreground">
                        ${lineTotal.toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="px-2.5 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="cursor-pointer rounded-md p-1 text-destructive transition-colors hover:bg-destructive/10"
                          title="Remove unit"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
