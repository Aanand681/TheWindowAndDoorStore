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
import { Button } from "@/components/ui/button"
import { Trash2, DoorClosed, Plus } from "lucide-react"
import { StormDoorCatalogItem } from "@/lib/doors/storm-door-types"

export interface AdminStormModelsTabProps {
  models: StormDoorCatalogItem[]
  onUpdateModel: (
    index: number,
    field: keyof StormDoorCatalogItem,
    value: any
  ) => void
  onDeleteModel: (index: number) => void
  onOpenAddModel: () => void
}

export function AdminStormModelsTab({
  models,
  onUpdateModel,
  onDeleteModel,
  onOpenAddModel,
}: AdminStormModelsTabProps) {
  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <DoorClosed className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Storm Door Models Catalog ({models.length})
            </CardTitle>
          </div>
          <CardDescription>
            Manufacturer standard material prices. Enter &quot;0&quot; or leave empty if a vent/swing configuration is not offered for that model.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onOpenAddModel}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Model</span>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs tracking-wider text-muted-foreground uppercase">
                <th className="px-3 py-2.5">Model Name</th>
                <th className="w-24 px-3 py-2.5">Profile</th>
                <th className="w-28 px-3 py-2.5">Standard ($)</th>
                <th className="w-28 px-3 py-2.5">Hidden Vent ($)</th>
                <th className="w-28 px-3 py-2.5">Screen Only ($)</th>
                <th className="w-28 px-3 py-2.5">Inswing ($)</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="w-16 px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {models.map((door, idx) => (
                <tr key={door.id || idx} className="hover:bg-muted/20">
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      value={door.name}
                      onChange={(e) => onUpdateModel(idx, "name", e.target.value)}
                      className="h-8 text-xs font-semibold"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      value={door.profile}
                      onChange={(e) => onUpdateModel(idx, "profile", e.target.value)}
                      className="h-8 font-mono text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={door.standardPrice ?? ""}
                      onChange={(e) =>
                        onUpdateModel(idx, "standardPrice", parseFloat(e.target.value) || 0)
                      }
                      className="h-8 text-right font-mono text-xs font-bold"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="—"
                      value={door.hiddenVentPrice ?? ""}
                      onChange={(e) =>
                        onUpdateModel(
                          idx,
                          "hiddenVentPrice",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className="h-8 text-right font-mono text-xs font-medium"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="—"
                      value={door.screenOnlyPrice ?? ""}
                      onChange={(e) =>
                        onUpdateModel(
                          idx,
                          "screenOnlyPrice",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className="h-8 text-right font-mono text-xs font-medium"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="—"
                      value={door.inswingPrice ?? ""}
                      onChange={(e) =>
                        onUpdateModel(
                          idx,
                          "inswingPrice",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className="h-8 text-right font-mono text-xs font-medium"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      value={door.description || ""}
                      onChange={(e) => onUpdateModel(idx, "description", e.target.value)}
                      className="h-8 text-xs text-muted-foreground"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteModel(idx)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
