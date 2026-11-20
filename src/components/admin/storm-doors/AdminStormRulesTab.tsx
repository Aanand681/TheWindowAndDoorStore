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
import { Palette, ShieldCheck, Info } from "lucide-react"
import { StormDoorGlobalRules } from "@/lib/doors/storm-door-types"
import { AdminColorTagManager } from "./AdminColorTagManager"

export interface AdminStormRulesTabProps {
  rules: StormDoorGlobalRules
  onUpdateRule: (field: keyof StormDoorGlobalRules, value: any) => void
}

export function AdminStormRulesTab({
  rules,
  onUpdateRule,
}: AdminStormRulesTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Custom Paint Rates */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Custom Paint Rates</CardTitle>
          </div>
          <CardDescription>
            Fixed manufacturer custom paint rates from York Aluminum price sheet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Single Door Custom Paint ($)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                step="1"
                value={rules.customPaintSinglePrice ?? 1113}
                onChange={(e) =>
                  onUpdateRule("customPaintSinglePrice", parseFloat(e.target.value) || 0)
                }
                className="pl-7 font-mono text-sm font-bold"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Includes door closer painted to match custom paint colour.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              French Double Doors Custom Paint ($)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                step="1"
                value={rules.customPaintDoublePrice ?? 2184}
                onChange={(e) =>
                  onUpdateRule("customPaintDoublePrice", parseFloat(e.target.value) || 0)
                }
                className="pl-7 font-mono text-sm font-bold"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              York price sheet standard for double door pairs ($2,184.00).
            </p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Info className="h-4 w-4 text-primary" />
              <span>Quote Surcharge Application</span>
            </div>
            <p>
              Storm door list prices are entered as clean manufacturer base prices. The standard 8% materials surcharge is automatically applied once at the quote-level ledger, preventing double-counting.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Finishes & Color Palettes (Tag Manager - No Comma Bugs) */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Color Finishes &amp; Hardware</CardTitle>
          </div>
          <CardDescription>
            Manage factory colors for each door profile. Click &quot;×&quot; to remove or type to add.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminColorTagManager
            label='2" Profile Available Colors'
            colors={rules.colors2Inch || []}
            onChange={(colors) => onUpdateRule("colors2Inch", colors)}
          />

          <AdminColorTagManager
            label='2-1/4" Profile Available Colors'
            colors={rules.colors2QuarterInch || []}
            onChange={(colors) => onUpdateRule("colors2QuarterInch", colors)}
          />

          <AdminColorTagManager
            label='1-1/4" Project Available Colors'
            colors={rules.colorsProject || []}
            onChange={(colors) => onUpdateRule("colorsProject", colors)}
          />

          <AdminColorTagManager
            label="Inswing Papaiz Lever Finishes"
            colors={rules.papaizFinishes || []}
            onChange={(finishes) => onUpdateRule("papaizFinishes", finishes)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
