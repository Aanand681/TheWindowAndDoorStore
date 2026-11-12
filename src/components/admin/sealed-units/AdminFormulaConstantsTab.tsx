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
import { Sliders } from "lucide-react"
import {
  SealedUnitFormulaConstants,
  ThicknessBreak,
} from "@/lib/sealed-units-logic"

interface AdminFormulaConstantsTabProps {
  formula: SealedUnitFormulaConstants
  setFormula: React.Dispatch<React.SetStateAction<SealedUnitFormulaConstants>>
  thicknessBreaks: ThicknessBreak[]
}

export function AdminFormulaConstantsTab({
  formula,
  setFormula,
  thicknessBreaks,
}: AdminFormulaConstantsTabProps) {
  return (
    <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sliders className="h-5 w-5 text-primary" />
          <span>Pricing Formula Modifiers &amp; Ladder</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Controls the step multipliers: (Rate + Argon) × Area + Surcharge ×
          Step + Final Addon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label
              htmlFor="argonRate"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Argon Gas Surcharge ($/sqft)
            </Label>
            <Input
              id="argonRate"
              type="number"
              step="0.01"
              min="0"
              value={formula.argonPerSqft}
              onChange={(e) =>
                setFormula({
                  ...formula,
                  argonPerSqft: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Default: $0.60 per square foot
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="surchargeRate"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Glass Surcharge Rate (decimal)
            </Label>
            <Input
              id="surchargeRate"
              type="number"
              step="0.01"
              min="0"
              value={formula.surchargeRate}
              onChange={(e) =>
                setFormula({
                  ...formula,
                  surchargeRate: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Default: 0.27 (27% surcharge)
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="stepMult"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Step Multiplier
            </Label>
            <Input
              id="stepMult"
              type="number"
              step="0.1"
              min="1"
              value={formula.stepMultiplier}
              onChange={(e) =>
                setFormula({
                  ...formula,
                  stepMultiplier: Number(e.target.value) || 1,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Default: 2.5 multiplier
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="finalAddon"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Final Addon Rate (decimal)
            </Label>
            <Input
              id="finalAddon"
              type="number"
              step="0.01"
              min="0"
              value={formula.finalAddonRate}
              onChange={(e) =>
                setFormula({
                  ...formula,
                  finalAddonRate: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Default: 0.08 (8% addon)
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="minSqft"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Minimum Billable Area (sqft)
            </Label>
            <Input
              id="minSqft"
              type="number"
              step="0.1"
              min="1"
              value={formula.minSqft}
              onChange={(e) =>
                setFormula({ ...formula, minSqft: Number(e.target.value) || 1 })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Default: 4.0 sq ft minimum on source sheet
            </p>
          </div>
        </div>

        {/* Thickness Ladder */}
        <div className="space-y-3 border-t border-border/50 pt-4">
          <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Area to Glass Thickness Ladder
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {thicknessBreaks.map((b, idx) => (
              <div
                key={idx}
                className="space-y-1 rounded-xl border border-border/60 bg-muted/30 p-3"
              >
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Tier {idx + 1} (&lt; {b.upperBoundExclusive} sqft)
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    Thickness:
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {b.thicknessMm}mm
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
