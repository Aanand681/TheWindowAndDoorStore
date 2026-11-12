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
import { Plus, Trash2, Layers } from "lucide-react"

interface AdminJambsCasingsTabProps {
  jambs: any[]
  setJambs: React.Dispatch<React.SetStateAction<any[]>>
  casings: any[]
  setCasings: React.Dispatch<React.SetStateAction<any[]>>
  updateItem: (setter: any, index: number, field: string, value: any) => void
  removeItem: (setter: any, index: number) => void
  onAddJamb: () => void
  onAddCasing: () => void
}

export function AdminJambsCasingsTab({
  jambs,
  setJambs,
  casings,
  setCasings,
  updateItem,
  removeItem,
  onAddJamb,
  onAddCasing,
}: AdminJambsCasingsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Jambs Card */}
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  Extension Jambs
                </CardTitle>
                <CardDescription className="text-xs">
                  Price per linear foot based on wall depth.
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onAddJamb}
              className="h-8 cursor-pointer gap-1 px-2.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Jamb</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          {jambs.map((j, i) => (
            <div
              key={j.id || i}
              className="flex items-end gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5"
            >
              <div className="flex-1 space-y-1">
                <Label className="text-xs font-semibold">
                  Jamb Specification
                </Label>
                <Input
                  className="h-8.5 text-xs"
                  value={j.label}
                  onChange={(e) =>
                    updateItem(setJambs, i, "label", e.target.value)
                  }
                  placeholder="e.g. Vinyl Wrapped Jamb – 3/4 x 4 1/2"
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs font-semibold">Rate ($/ft)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="h-8.5 font-mono text-xs"
                  value={j.rate === 0 ? "" : j.rate}
                  onChange={(e) =>
                    updateItem(
                      setJambs,
                      i,
                      "rate",
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  placeholder="0.00"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8.5 w-8.5 shrink-0 cursor-pointer text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(setJambs, i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {jambs.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground italic">
              No extension jambs defined.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Casings Card */}
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  Trim &amp; Casings
                </CardTitle>
                <CardDescription className="text-xs">
                  Price per linear foot for interior/exterior trim.
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onAddCasing}
              className="h-8 cursor-pointer gap-1 px-2.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Casing</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          {casings.map((c, i) => (
            <div
              key={c.id || i}
              className="flex items-end gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5"
            >
              <div className="flex-1 space-y-1">
                <Label className="text-xs font-semibold">
                  Casing Specification
                </Label>
                <Input
                  className="h-8.5 text-xs"
                  value={c.label}
                  onChange={(e) =>
                    updateItem(setCasings, i, "label", e.target.value)
                  }
                  placeholder="e.g. Vinyl casing charge"
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs font-semibold">Rate ($/ft)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="h-8.5 font-mono text-xs"
                  value={c.rate === 0 ? "" : c.rate}
                  onChange={(e) =>
                    updateItem(
                      setCasings,
                      i,
                      "rate",
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  placeholder="0.00"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8.5 w-8.5 shrink-0 cursor-pointer text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(setCasings, i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {casings.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground italic">
              No casings defined.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
