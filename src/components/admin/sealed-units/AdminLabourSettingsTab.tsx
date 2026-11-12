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
import { Wrench } from "lucide-react"
import { SealedUnitLabourSettings } from "@/lib/sealed-units-logic"

interface AdminLabourSettingsTabProps {
  labour: SealedUnitLabourSettings
  setLabour: React.Dispatch<React.SetStateAction<SealedUnitLabourSettings>>
}

export function AdminLabourSettingsTab({
  labour,
  setLabour,
}: AdminLabourSettingsTabProps) {
  return (
    <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wrench className="h-5 w-5 text-emerald-500" />
          <span>Installation Labour, Misc Supplies &amp; Travel Rules</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Configured in accordance with the shop Sealed Units Excel spreadsheet
          calculations.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label
              htmlFor="labourRate"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Installation Labour Rate ($/sqft)
            </Label>
            <Input
              id="labourRate"
              type="number"
              step="0.01"
              min="0"
              value={labour.labourRatePerSqft}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  labourRatePerSqft: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Standard rate: $14.40 per square foot
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="labourMin"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Labour Minimum Fee ($/unit)
            </Label>
            <Input
              id="labourMin"
              type="number"
              step="1"
              min="0"
              value={labour.labourMinPerUnit}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  labourMinPerUnit: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Standard minimum: $120.00 per window
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="miscRate"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Misc Supplies Rate ($/sqft)
            </Label>
            <Input
              id="miscRate"
              type="number"
              step="0.01"
              min="0"
              value={labour.miscRatePerSqft}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  miscRatePerSqft: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Standard rate: $2.40 per square foot
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="setupDefault"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Standard Setup Fee ($)
            </Label>
            <Input
              id="setupDefault"
              type="number"
              step="1"
              min="0"
              value={labour.setupFeeDefault}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  setupFeeDefault: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Default local setup under $5,000: $140.00
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="setupFarStd"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Far Area Standard Setup Fee ($)
            </Label>
            <Input
              id="setupFarStd"
              type="number"
              step="0.1"
              min="0"
              value={labour.setupFeeFarStandard}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  setupFeeFarStandard: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Kenora, Dryden, Sioux Lookout: $727.50
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="setupFarSmall"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Far Area Small Job Setup Fee ($)
            </Label>
            <Input
              id="setupFarSmall"
              type="number"
              step="0.1"
              min="0"
              value={labour.setupFeeFarSmall}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  setupFeeFarSmall: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Smaller far-area jobs: $363.50
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="vehicleRate"
              className="text-xs font-bold tracking-wider uppercase"
            >
              Vehicle Travel Rate ($/km)
            </Label>
            <Input
              id="vehicleRate"
              type="number"
              step="0.01"
              min="0"
              value={labour.vehicleRatePerKm}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  vehicleRatePerKm: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Both ways travel: $0.98 per KM
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="crew2"
              className="text-xs font-bold tracking-wider uppercase"
            >
              2-Man Crew Travel Rate ($/hr)
            </Label>
            <Input
              id="crew2"
              type="number"
              step="1"
              min="0"
              value={labour.crewHourly2Men}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  crewHourly2Men: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Standard rate: $150.00 / hour
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="crew3"
              className="text-xs font-bold tracking-wider uppercase"
            >
              3-Man Crew Travel Rate ($/hr)
            </Label>
            <Input
              id="crew3"
              type="number"
              step="1"
              min="0"
              value={labour.crewHourly3Men}
              onChange={(e) =>
                setLabour({
                  ...labour,
                  crewHourly3Men: Number(e.target.value) || 0,
                })
              }
              className="bg-background font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Standard rate: $200.00 / hour
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
