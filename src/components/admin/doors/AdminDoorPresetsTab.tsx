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
import { Plus, Trash2 } from "lucide-react"
import { DoorPreset, DoorCategory } from "@/lib/doors/types"

export interface AdminDoorPresetsTabProps {
  presets: DoorPreset[]
  onAddPreset: () => void
  onUpdatePreset: (index: number, field: keyof DoorPreset, value: any) => void
  onDeletePreset: (index: number) => void
}

export function AdminDoorPresetsTab({
  presets,
  onAddPreset,
  onUpdatePreset,
  onDeletePreset,
}: AdminDoorPresetsTabProps) {
  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">Standard Door Presets</CardTitle>
          <CardDescription>
            Base installation labour and miscellaneous materials from the shop
            price sheet.
          </CardDescription>
        </div>
        <Button size="sm" onClick={onAddPreset} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Preset
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs tracking-wider text-muted-foreground uppercase">
                <th className="px-3 py-2.5">Preset Name</th>
                <th className="w-36 px-3 py-2.5">Category</th>
                <th className="w-32 px-3 py-2.5">Labour ($)</th>
                <th className="w-32 px-3 py-2.5">Misc Mat ($)</th>
                <th className="px-3 py-2.5">Description / Notes</th>
                <th className="w-16 px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {presets.map((preset, idx) => (
                <tr
                  key={preset.id || idx}
                  className="transition-colors hover:bg-muted/20"
                >
                  <td className="px-3 py-2">
                    <Input
                      value={preset.label}
                      onChange={(e) =>
                        onUpdatePreset(idx, "label", e.target.value)
                      }
                      className="h-8 font-medium"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={preset.category}
                      onChange={(e) =>
                        onUpdatePreset(
                          idx,
                          "category",
                          e.target.value as DoorCategory
                        )
                      }
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-xs focus:ring-1 focus:ring-ring focus:outline-hidden"
                    >
                      <option value="entry">Entry Door</option>
                      <option value="patio">Patio Door</option>
                      <option value="garden">Garden/Terrace</option>
                      <option value="storm">Storm Door</option>
                      <option value="custom">Custom</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative">
                      <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={preset.labour}
                        onChange={(e) =>
                          onUpdatePreset(
                            idx,
                            "labour",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-8 pl-6 text-right font-mono"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative">
                      <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={preset.misc}
                        onChange={(e) =>
                          onUpdatePreset(
                            idx,
                            "misc",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-8 pl-6 text-right font-mono"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={preset.description || ""}
                      onChange={(e) =>
                        onUpdatePreset(idx, "description", e.target.value)
                      }
                      placeholder="Notes or door specs..."
                      className="h-8 text-xs text-muted-foreground"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeletePreset(idx)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      title="Delete preset"
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
