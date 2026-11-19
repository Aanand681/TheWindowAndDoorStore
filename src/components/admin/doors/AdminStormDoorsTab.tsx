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
import { StormDoorCatalogItem } from "@/lib/doors/storm-door-types"
import { ShieldCheck, DoorClosed } from "lucide-react"

export interface AdminStormDoorsTabProps {
  stormDoors: StormDoorCatalogItem[]
  onUpdateStormDoor: (
    index: number,
    field: keyof StormDoorCatalogItem,
    value: any
  ) => void
}

export function AdminStormDoorsTab({
  stormDoors,
  onUpdateStormDoor,
}: AdminStormDoorsTabProps) {
  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <DoorClosed className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              York Aluminum Storm Door Pricing Catalog
            </CardTitle>
          </div>
          <CardDescription>
            Fixed manufacturer material prices for York Aluminum storm doors. 
            Exempt from standard 10% door discount. 8% factory surcharge applies.
          </CardDescription>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Database Managed</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs tracking-wider text-muted-foreground uppercase">
                <th className="px-3 py-2.5">Model Name</th>
                <th className="w-24 px-3 py-2.5">Profile</th>
                <th className="w-32 px-3 py-2.5">Standard ($)</th>
                <th className="w-32 px-3 py-2.5">Hidden Vent ($)</th>
                <th className="w-32 px-3 py-2.5">Screen Only ($)</th>
                <th className="w-32 px-3 py-2.5">Inswing ($)</th>
                <th className="px-3 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {stormDoors.map((door, idx) => (
                <tr
                  key={door.id || idx}
                  className="transition-colors hover:bg-muted/20"
                >
                  <td className="px-3 py-2 font-semibold text-foreground">
                    {door.name}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {door.profile}
                  </td>

                  {/* Standard Price */}
                  <td className="px-3 py-2">
                    <div className="relative">
                      <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={door.standardPrice ?? ""}
                        onChange={(e) =>
                          onUpdateStormDoor(
                            idx,
                            "standardPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-8 pl-6 text-right font-mono text-xs font-bold"
                      />
                    </div>
                  </td>

                  {/* Hidden Vent Price */}
                  <td className="px-3 py-2">
                    {door.hiddenVentPrice !== undefined ? (
                      <div className="relative">
                        <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={door.hiddenVentPrice ?? ""}
                          onChange={(e) =>
                            onUpdateStormDoor(
                              idx,
                              "hiddenVentPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 pl-6 text-right font-mono text-xs font-bold"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic">
                        N/A
                      </span>
                    )}
                  </td>

                  {/* Screen Only Price */}
                  <td className="px-3 py-2">
                    {door.screenOnlyPrice !== undefined ? (
                      <div className="relative">
                        <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={door.screenOnlyPrice ?? ""}
                          onChange={(e) =>
                            onUpdateStormDoor(
                              idx,
                              "screenOnlyPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 pl-6 text-right font-mono text-xs font-bold"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic">
                        N/A
                      </span>
                    )}
                  </td>

                  {/* Inswing Price */}
                  <td className="px-3 py-2">
                    {door.inswingPrice !== undefined ? (
                      <div className="relative">
                        <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={door.inswingPrice ?? ""}
                          onChange={(e) =>
                            onUpdateStormDoor(
                              idx,
                              "inswingPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 pl-6 text-right font-mono text-xs font-bold"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic">
                        N/A
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {door.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
