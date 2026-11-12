"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Grid } from "lucide-react"
import { SealedUnitGrillSettings } from "@/lib/sealed-units-logic"
import { AdminSunburstGrillCards } from "./AdminSunburstGrillCards"

interface AdminGrillsSettingsTabProps {
  grills: SealedUnitGrillSettings
  onGridRateChange: (profile: string, color: string, value: string) => void
  onBurst3Change: (colorKey: string, value: string) => void
  onBurst5Change: (colorKey: string, value: string) => void
  onGrillExtraChange: (
    field: "tIntersectionPrice" | "bentHubPrice" | "customerOwnGrillPrice",
    value: string
  ) => void
}

const GRILL_COLORS = [
  "White",
  "Brass",
  "Pewter",
  "Brushed Chrome",
  "Black",
  "Black/White",
]

export function AdminGrillsSettingsTab({
  grills,
  onGridRateChange,
  onBurst3Change,
  onBurst5Change,
  onGrillExtraChange,
}: AdminGrillsSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Standard Grid Rates */}
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Grid className="h-5 w-5 text-primary" />
            <span>Standard Interior Grid Pricing (Per Square / Lite)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Base raw cost per grid square formed by intersections. Raw grill
            cost is added to unit price prior to surcharge and formula markups.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 text-[10px] tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="w-56 p-3">Color</th>
                  <th className="p-3 text-center">
                    5/8&quot; × 1/4&quot; ($/sq)
                  </th>
                  <th className="p-3 text-center">
                    3/8&quot; × 1/4&quot; ($/sq)
                  </th>
                  <th className="p-3 text-center">
                    8mm × 18mm Georgian ($/sq)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {GRILL_COLORS.map((color) => {
                  const p58 = grills.gridRates?.['5/8" x 1/4"']?.[color]
                  const p38 = grills.gridRates?.['3/8" x 1/4"']?.[color]
                  const pGeo =
                    grills.gridRates?.["8mm x 18mm Georgian"]?.[color]

                  return (
                    <tr key={color} className="hover:bg-muted/30">
                      <td className="p-3 font-sans font-bold text-foreground">
                        {color}
                      </td>
                      <td className="p-2 text-center">
                        <div className="relative inline-block w-28">
                          <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-[11px] text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            value={p58 ?? ""}
                            placeholder="N/A"
                            onChange={(e) =>
                              onGridRateChange(
                                '5/8" x 1/4"',
                                color,
                                e.target.value
                              )
                            }
                            className="h-8 bg-background pl-6 text-center font-mono text-xs"
                          />
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="relative inline-block w-28">
                          <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-[11px] text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            value={p38 ?? ""}
                            placeholder="N/A"
                            onChange={(e) =>
                              onGridRateChange(
                                '3/8" x 1/4"',
                                color,
                                e.target.value
                              )
                            }
                            className="h-8 bg-background pl-6 text-center font-mono text-xs"
                          />
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="relative inline-block w-28">
                          <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-[11px] text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            value={pGeo ?? ""}
                            placeholder="N/A"
                            onChange={(e) =>
                              onGridRateChange(
                                "8mm x 18mm Georgian",
                                color,
                                e.target.value
                              )
                            }
                            className="h-8 bg-background pl-6 text-center font-mono text-xs"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2. Sunburst Rates (3 Burst & 5 Burst) */}
      <AdminSunburstGrillCards
        grills={grills}
        onBurst3Change={onBurst3Change}
        onBurst5Change={onBurst5Change}
      />

      {/* 3. Accessories & Services */}
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base font-bold">
            Grill Accessories &amp; Custom Installation Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 p-4 text-xs sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="font-bold tracking-wider text-muted-foreground uppercase">
              T-Intersection ($ / connection)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.25"
                value={grills.tIntersectionPrice ?? 5.5}
                onChange={(e) =>
                  onGrillExtraChange("tIntersectionPrice", e.target.value)
                }
                className="bg-background pl-7 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Default: $5.50 per connection
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold tracking-wider text-muted-foreground uppercase">
              Bent Grill Hubs ($ each)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="1"
                value={grills.bentHubPrice ?? 110.0}
                onChange={(e) =>
                  onGrillExtraChange("bentHubPrice", e.target.value)
                }
                className="bg-background pl-7 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Default: $110.00 each
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold tracking-wider text-muted-foreground uppercase">
              Customer&rsquo;s Own Grills ($ / unit)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="1"
                value={grills.customerOwnGrillPrice ?? 33.0}
                onChange={(e) =>
                  onGrillExtraChange("customerOwnGrillPrice", e.target.value)
                }
                className="bg-background pl-7 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Default: $33.00 / unit
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
