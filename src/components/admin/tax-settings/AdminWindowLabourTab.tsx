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
import { Wrench, Info } from "lucide-react"

interface AdminWindowLabourTabProps {
  windowLabourPerSqft: number
  setWindowLabourPerSqft: (val: number) => void
  windowMiscPerSqft: number
  setWindowMiscPerSqft: (val: number) => void
  windowLabourMin: number
  setWindowLabourMin: (val: number) => void
  windowMiscMin: number
  setWindowMiscMin: (val: number) => void
  extraLinPerWindow: number
  setExtraLinPerWindow: (val: number) => void
}

export function AdminWindowLabourTab({
  windowLabourPerSqft,
  setWindowLabourPerSqft,
  windowMiscPerSqft,
  setWindowMiscPerSqft,
  windowLabourMin,
  setWindowLabourMin,
  windowMiscMin,
  setWindowMiscMin,
  extraLinPerWindow,
  setExtraLinPerWindow,
}: AdminWindowLabourTabProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Window Installation &amp; Labour Formula
              </CardTitle>
              <CardDescription>
                Global square-footage rates, minimums per unit, and perimeter
                allowance across all window installations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Square footage rates */}
            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <h4 className="text-xs font-bold tracking-wider text-primary uppercase">
                Square Footage Rates ($/sqft)
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Labour Rate per Sq Ft ($)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 font-mono text-xs"
                    value={windowLabourPerSqft === 0 ? "" : windowLabourPerSqft}
                    onChange={(e) =>
                      setWindowLabourPerSqft(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    placeholder="19.00"
                  />
                  <span className="block text-[11px] text-muted-foreground">
                    Default: $19.00/sqft for standard window installation
                    labour.
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Misc &amp; Consumables per Sq Ft ($)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 font-mono text-xs"
                    value={windowMiscPerSqft === 0 ? "" : windowMiscPerSqft}
                    onChange={(e) =>
                      setWindowMiscPerSqft(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    placeholder="8.00"
                  />
                  <span className="block text-[11px] text-muted-foreground">
                    Default: $8.00/sqft for fasteners, sealants, shims &amp;
                    foam.
                  </span>
                </div>
              </div>
            </div>

            {/* Minimums per window */}
            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <h4 className="text-xs font-bold tracking-wider text-primary uppercase">
                Per-Window Minimum Floors ($)
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Min. Labour per Window ($)
                  </Label>
                  <Input
                    type="number"
                    step="1"
                    className="h-9 font-mono text-xs"
                    value={windowLabourMin === 0 ? "" : windowLabourMin}
                    onChange={(e) =>
                      setWindowLabourMin(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    placeholder="325"
                  />
                  <span className="block text-[11px] text-muted-foreground">
                    Floor: Minimum labour charged per window unit (default
                    $325.00).
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Min. Misc per Window ($)
                  </Label>
                  <Input
                    type="number"
                    step="1"
                    className="h-9 font-mono text-xs"
                    value={windowMiscMin === 0 ? "" : windowMiscMin}
                    onChange={(e) =>
                      setWindowMiscMin(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    placeholder="74"
                  />
                  <span className="block text-[11px] text-muted-foreground">
                    Floor: Minimum misc materials per window unit (default
                    $74.00).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linear allowance */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
            <h4 className="text-xs font-bold tracking-wider text-primary uppercase">
              Perimeter &amp; Jamb Allowance
            </h4>
            <div className="max-w-md space-y-1">
              <Label className="text-xs font-semibold">
                Extra Linear Footage Per Window (ft)
              </Label>
              <Input
                type="number"
                step="0.01"
                className="h-9 max-w-xs font-mono text-xs"
                value={extraLinPerWindow === 0 ? "" : extraLinPerWindow}
                onChange={(e) =>
                  setExtraLinPerWindow(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                placeholder="2.17"
              />
              <span className="block text-[11px] text-muted-foreground">
                Standard: 2.17 ft added per window to account for cuts, waste,
                and corners in jamb calculations.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              These rates apply globally to all window installations. Geographic
              travel distance and mobilization are configured separately in{" "}
              <strong>Regions</strong> and apply to all product lines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
