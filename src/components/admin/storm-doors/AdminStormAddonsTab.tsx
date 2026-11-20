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
import { Trash2, Sparkles, Plus } from "lucide-react"
import { StormDoorAddonOption } from "@/lib/doors/storm-door-types"

export interface AdminStormAddonsTabProps {
  addons: StormDoorAddonOption[]
  onUpdateAddon: (
    index: number,
    field: keyof StormDoorAddonOption,
    value: any
  ) => void
  onDeleteAddon: (index: number) => void
  onOpenAddAddon: () => void
}

export function AdminStormAddonsTab({
  addons,
  onUpdateAddon,
  onDeleteAddon,
  onOpenAddAddon,
}: AdminStormAddonsTabProps) {
  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Storm Door Add-ons &amp; Upgrades ({addons.length})
            </CardTitle>
          </div>
          <CardDescription>
            Manage interchangeable screen inserts, decorative floral glass, sandblast patterns, and accessories.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onOpenAddAddon}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Add-on</span>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs tracking-wider text-muted-foreground uppercase">
                <th className="px-3 py-2.5">Add-on Label</th>
                <th className="w-32 px-3 py-2.5">Price ($)</th>
                <th className="px-3 py-2.5">Applicable Styles (comma separated)</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="w-16 px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {addons.map((addon, idx) => (
                <tr key={addon.id || idx} className="hover:bg-muted/20">
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      value={addon.label}
                      onChange={(e) => onUpdateAddon(idx, "label", e.target.value)}
                      className="h-8 text-xs font-semibold"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={addon.price ?? ""}
                      onChange={(e) =>
                        onUpdateAddon(idx, "price", parseFloat(e.target.value) || 0)
                      }
                      className="h-8 text-right font-mono text-xs font-bold"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      placeholder="e.g. one_lite, full_view (or leave empty for all)"
                      value={(addon.applicableStyles || []).join(", ")}
                      onChange={(e) => {
                        const raw = e.target.value
                        const styles = raw
                          ? raw.split(",").map((s) => s.trim()).filter(Boolean)
                          : undefined
                        onUpdateAddon(idx, "applicableStyles", styles)
                      }}
                      className="h-8 font-mono text-xs text-muted-foreground"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      value={addon.description || ""}
                      onChange={(e) => onUpdateAddon(idx, "description", e.target.value)}
                      className="h-8 text-xs text-muted-foreground"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteAddon(idx)}
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
