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
import { Palette, Percent, ShieldCheck } from "lucide-react"
import { StormDoorGlobalRules } from "@/lib/doors/storm-door-types"

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
      {/* Custom Paint & Surcharges */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Custom Paint &amp; Factory Rates</CardTitle>
          </div>
          <CardDescription>
            Manufacturer standard rates from York Aluminum price sheet.
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              York Factory Material Surcharge (%)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              <Input
                type="number"
                step="0.5"
                value={rules.surchargeRate ?? 8}
                onChange={(e) =>
                  onUpdateRule("surchargeRate", parseFloat(e.target.value) || 0)
                }
                className="pl-7 font-mono text-sm font-bold"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finishes & Color Palettes */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Colors &amp; Hardware Finishes</CardTitle>
          </div>
          <CardDescription>
            Comma separated list of factory standard colors available per profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">2&quot; Profile Colors</Label>
            <Input
              type="text"
              value={(rules.colors2Inch || []).join(", ")}
              onChange={(e) =>
                onUpdateRule(
                  "colors2Inch",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">2-1/4&quot; Profile Colors</Label>
            <Input
              type="text"
              value={(rules.colors2QuarterInch || []).join(", ")}
              onChange={(e) =>
                onUpdateRule(
                  "colors2QuarterInch",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">1-1/4&quot; Project Colors</Label>
            <Input
              type="text"
              value={(rules.colorsProject || []).join(", ")}
              onChange={(e) =>
                onUpdateRule(
                  "colorsProject",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Papaiz Inswing Finishes</Label>
            <Input
              type="text"
              value={(rules.papaizFinishes || []).join(", ")}
              onChange={(e) =>
                onUpdateRule(
                  "papaizFinishes",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
