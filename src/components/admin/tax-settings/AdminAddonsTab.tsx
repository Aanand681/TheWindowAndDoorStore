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
import { Plus, Trash2, PackagePlus } from "lucide-react"

interface AdminAddonsTabProps {
  addons: any[]
  setAddons: React.Dispatch<React.SetStateAction<any[]>>
  updateItem: (setter: any, index: number, field: string, value: any) => void
  removeItem: (setter: any, index: number) => void
  onAddAddon: () => void
}

export function AdminAddonsTab({
  addons,
  setAddons,
  updateItem,
  removeItem,
  onAddAddon,
}: AdminAddonsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Extras, Upcharges &amp; Addons
                </CardTitle>
                <CardDescription>
                  Manage flat labour and material charges for special jobsite
                  conditions (e.g. Brick, Siding removal, Scaffolding, Blinds).
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onAddAddon}
              className="shrink-0 cursor-pointer gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Extra</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3.5">
            {addons.map((a, i) => (
              <div
                key={a.id || i}
                className="flex flex-col items-stretch gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 sm:flex-row sm:items-end"
              >
                <div className="flex-1 space-y-1">
                  <Label className="text-xs font-semibold">
                    Description / Label
                  </Label>
                  <Input
                    className="h-9 text-xs"
                    value={a.label}
                    onChange={(e) =>
                      updateItem(setAddons, i, "label", e.target.value)
                    }
                    placeholder="e.g. Scaffolding set up 1 section"
                  />
                </div>
                <div className="w-full space-y-1 sm:w-32">
                  <Label className="text-xs font-semibold">Labour ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 font-mono text-xs"
                    value={a.lab === 0 ? "" : a.lab}
                    onChange={(e) =>
                      updateItem(
                        setAddons,
                        i,
                        "lab",
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="w-full space-y-1 sm:w-32">
                  <Label className="text-xs font-semibold">Misc ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 font-mono text-xs"
                    value={a.misc === 0 ? "" : a.misc}
                    onChange={(e) =>
                      updateItem(
                        setAddons,
                        i,
                        "misc",
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    placeholder="0.00"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 cursor-pointer self-end text-destructive hover:bg-destructive/10 sm:self-auto"
                  onClick={() => removeItem(setAddons, i)}
                  title="Delete extra"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {addons.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground italic">
                No extras defined. Click &quot;Add Extra&quot; above to create
                one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
