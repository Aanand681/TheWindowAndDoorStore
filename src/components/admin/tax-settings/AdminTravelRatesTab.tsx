"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Truck, Users } from "lucide-react"

interface AdminTravelRatesTabProps {
  vehicleRate: number
  setVehicleRate: (val: number) => void
  crewRates: any[]
  setCrewRates: React.Dispatch<React.SetStateAction<any[]>>
  updateItem: (setter: any, index: number, field: string, value: any) => void
  removeItem: (setter: any, index: number) => void
  onAddCrew: () => void
}

export function AdminTravelRatesTab({
  vehicleRate,
  setVehicleRate,
  crewRates,
  setCrewRates,
  updateItem,
  removeItem,
  onAddCrew,
}: AdminTravelRatesTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Vehicle Rate */}
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                Vehicle Travel Mileage
              </CardTitle>
              <CardDescription className="text-xs">
                Reimbursement and fuel/fleet rate per round-trip kilometer.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          <div className="max-w-xs space-y-1.5">
            <Label className="text-xs font-semibold">
              Vehicle Mileage Rate ($/km)
            </Label>
            <Input
              type="number"
              step="0.01"
              className="h-9 font-mono text-xs"
              value={vehicleRate === 0 ? "" : vehicleRate}
              onChange={(e) =>
                setVehicleRate(
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              placeholder="0.98"
            />
            <span className="block text-[11px] text-muted-foreground">
              Standard: $0.98/km charged on round-trip travel outside of free
              zones.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Crew Rates */}
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  Crew Transit Hourly Rates
                </CardTitle>
                <CardDescription className="text-xs">
                  Hourly rate for technician transit time during travel.
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onAddCrew}
              className="h-8 cursor-pointer gap-1 px-2.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Crew Tier</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          {crewRates.map((cr, i) => (
            <div
              key={i}
              className="flex items-end gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5"
            >
              <div className="flex-1 space-y-1">
                <Label className="text-xs font-semibold">
                  Crew Configuration
                </Label>
                <Input
                  className="h-8.5 text-xs"
                  value={cr.crewSize}
                  onChange={(e) =>
                    updateItem(setCrewRates, i, "crewSize", e.target.value)
                  }
                  placeholder="e.g. 2 or 3"
                />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs font-semibold">Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="1"
                  className="h-8.5 font-mono text-xs"
                  value={cr.hourlyRate === 0 ? "" : cr.hourlyRate}
                  onChange={(e) =>
                    updateItem(
                      setCrewRates,
                      i,
                      "hourlyRate",
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  placeholder="150"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8.5 w-8.5 shrink-0 cursor-pointer text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(setCrewRates, i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {crewRates.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground italic">
              No crew transit rates defined.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
