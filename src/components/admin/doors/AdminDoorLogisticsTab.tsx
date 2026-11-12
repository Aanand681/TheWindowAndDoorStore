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
import { DollarSign, Truck, Wrench } from "lucide-react"
import { DoorLogisticsSettings } from "@/lib/doors/types"

export interface AdminDoorLogisticsTabProps {
  logistics: DoorLogisticsSettings
  setLogistics: React.Dispatch<React.SetStateAction<DoorLogisticsSettings>>
}

export function AdminDoorLogisticsTab({
  logistics,
  setLogistics,
}: AdminDoorLogisticsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Setup Fees */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-primary" />
            Base Setup Fees
          </CardTitle>
          <CardDescription>
            Standard truck &amp; site mobilization charges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Local Setup Fee ($)</Label>
            <div className="relative">
              <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="5"
                value={logistics.setupFeeDefault}
                onChange={(e) =>
                  setLogistics((prev) => ({
                    ...prev,
                    setupFeeDefault: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pl-6 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Standard in-town setup ($140.00)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Dryden / Sioux Lookout Standard ($)
            </Label>
            <div className="relative">
              <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.5"
                value={logistics.setupFeeFarStandard}
                onChange={(e) =>
                  setLogistics((prev) => ({
                    ...prev,
                    setupFeeFarStandard: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pl-6 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Standard remote setup ($727.50)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Dryden / Sioux Lookout Small ($)</Label>
            <div className="relative">
              <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.5"
                value={logistics.setupFeeFarSmall}
                onChange={(e) =>
                  setLogistics((prev) => ({
                    ...prev,
                    setupFeeFarSmall: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pl-6 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Single unit / partial setup ($363.50)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mileage & Vehicle */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-primary" />
            Vehicle Mileage
          </CardTitle>
          <CardDescription>
            Rate per kilometer traveled outside standard zone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Vehicle Rate per KM ($/km)</Label>
            <div className="relative">
              <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                value={logistics.vehicleRatePerKm}
                onChange={(e) =>
                  setLogistics((prev) => ({
                    ...prev,
                    vehicleRatePerKm: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pl-6 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Default rate: $0.98/km
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Crew Hourly Rates */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4 text-primary" />
            Crew Travel Hourly Rates
          </CardTitle>
          <CardDescription>
            Hourly billing for crew transit time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">2-Man Crew Rate ($/hr)</Label>
            <div className="relative">
              <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="5"
                value={logistics.crewHourly2Men}
                onChange={(e) =>
                  setLogistics((prev) => ({
                    ...prev,
                    crewHourly2Men: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pl-6 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Default 2-man rate: $150.00/hr
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">3-Man Crew Rate ($/hr)</Label>
            <div className="relative">
              <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="5"
                value={logistics.crewHourly3Men}
                onChange={(e) =>
                  setLogistics((prev) => ({
                    ...prev,
                    crewHourly3Men: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pl-6 font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Default 3-man rate: $200.00/hr
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
