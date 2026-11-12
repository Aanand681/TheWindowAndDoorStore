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
import { Percent, Info } from "lucide-react"
import { DoorFormulaSettings } from "@/lib/doors/types"

export interface AdminDoorFormulaTabProps {
  formula: DoorFormulaSettings
  setFormula: React.Dispatch<React.SetStateAction<DoorFormulaSettings>>
}

export function AdminDoorFormulaTab({
  formula,
  setFormula,
}: AdminDoorFormulaTabProps) {
  return (
    <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="h-5 w-5 text-primary" />
            Door Surcharge Rate
          </CardTitle>
          <CardDescription>
            Manufacturer price surcharge applied to base Inkster door pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Surcharge Percentage (%)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                value={formula.surchargeRate}
                onChange={(e) =>
                  setFormula((prev) => ({
                    ...prev,
                    surchargeRate: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pr-8 font-mono text-lg font-bold"
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 font-semibold text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Typically 8% aligned with the manufacturer pricing adjustments.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="h-5 w-5 text-emerald-500" />
            Door Discount Rate
          </CardTitle>
          <CardDescription>
            Standard discount applied to Entry, Patio, and Garden doors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Standard Door Discount (%)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                value={formula.doorDiscountPercent}
                onChange={(e) =>
                  setFormula((prev) => ({
                    ...prev,
                    doorDiscountPercent: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pr-8 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400"
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 font-semibold text-muted-foreground">
                %
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong>Note:</strong> Storm doors are strictly{" "}
                <strong>0% discount</strong> (exempt from the standard door
                discount per shop policy).
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
