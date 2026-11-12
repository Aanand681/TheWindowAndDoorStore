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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import type { CustomMaterialItem } from "@/types/calculator"

interface ExtrasAndJambsCardProps {
  readOnly?: boolean
  dbAddons: any[]
  setDbAddons: React.Dispatch<React.SetStateAction<any[]>>
  addons: Record<string, string>
  setAddons: React.Dispatch<React.SetStateAction<Record<string, string>>>
  isSupplyOnly: boolean
  linearFt: number
  dbJambs: any[]
  jambId: string
  setJambId: (id: string) => void
  jambName: string
  setJambName: (name: string) => void
  jambRate: string
  setJambRate: (rate: string) => void
  dbCasings: any[]
  casingId: string
  setCasingId: (id: string) => void
  casingName: string
  setCasingName: (name: string) => void
  casingRate: string
  setCasingRate: (rate: string) => void
  customMaterials?: CustomMaterialItem[]
  setCustomMaterials?: React.Dispatch<
    React.SetStateAction<CustomMaterialItem[]>
  >
}

export function ExtrasAndJambsCard({
  readOnly = false,
  dbAddons,
  setDbAddons,
  addons,
  setAddons,
  isSupplyOnly,
  linearFt,
  dbJambs,
  jambId,
  setJambId,
  jambName,
  setJambName,
  jambRate,
  setJambRate,
  dbCasings,
  casingId,
  setCasingId,
  casingName,
  setCasingName,
  casingRate,
  setCasingRate,
  customMaterials = [],
  setCustomMaterials,
}: ExtrasAndJambsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
      {/* Extras Card */}
      <Card className="gap-0 py-0 shadow-sm [--card-spacing:0px]">
        <CardHeader className="border-b border-border/50 px-4 py-3 !pb-3 sm:px-5">
          <CardTitle className="text-base">Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {dbAddons.map((a: any, index: number) => (
            <div key={a.id} className="flex items-center justify-between gap-3">
              {a.isCustom ? (
                <div className="flex-1 space-y-1.5">
                  <Input
                    disabled={readOnly}
                    placeholder="Description"
                    className="h-8 text-xs"
                    value={a.label}
                    onChange={(e) => {
                      const newDb = [...dbAddons]
                      newDb[index].label = e.target.value
                      setDbAddons(newDb)
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      disabled={readOnly}
                      type="number"
                      placeholder="Lab $"
                      className="h-8 w-20 font-mono text-xs"
                      value={a.lab || ""}
                      onChange={(e) => {
                        const newDb = [...dbAddons]
                        newDb[index].lab = Number(e.target.value)
                        setDbAddons(newDb)
                        if (!addons[a.id] || addons[a.id] === "0") {
                          setAddons((prev) => ({ ...prev, [a.id]: "1" }))
                        }
                      }}
                    />
                    <Input
                      disabled={readOnly}
                      type="number"
                      placeholder="Misc $"
                      className="h-8 w-20 font-mono text-xs"
                      value={a.misc || ""}
                      onChange={(e) => {
                        const newDb = [...dbAddons]
                        newDb[index].misc = Number(e.target.value)
                        setDbAddons(newDb)
                        if (!addons[a.id] || addons[a.id] === "0") {
                          setAddons((prev) => ({ ...prev, [a.id]: "1" }))
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <Label className="flex-1 text-xs text-muted-foreground">
                  {a.label}
                </Label>
              )}
              <div className="flex items-center gap-1.5">
                <Input
                  disabled={readOnly}
                  type="number"
                  className="h-8 w-16 font-mono text-xs"
                  placeholder={a.isCustom ? "1" : "Qty"}
                  min="0"
                  value={addons[a.id] || ""}
                  onChange={(e) =>
                    setAddons({ ...addons, [a.id]: e.target.value })
                  }
                />
                {!readOnly && a.isCustom && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      setDbAddons(dbAddons.filter((item) => item.id !== a.id))
                      const newAddonsMap = { ...addons }
                      delete newAddonsMap[a.id]
                      setAddons(newAddonsMap)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1.5 h-8 w-full border-dashed text-xs"
              onClick={() => {
                const newId = "custom_" + Date.now()
                setDbAddons([
                  ...dbAddons,
                  { id: newId, label: "", lab: 0, misc: 0, isCustom: true },
                ])
                setAddons((prev) => ({ ...prev, [newId]: "1" }))
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Custom Extra
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Jambs & Casing Card */}
      <Card className="gap-0 py-0 shadow-sm [--card-spacing:0px]">
        <CardHeader className="border-b border-border/50 px-4 py-3 !pb-3 sm:px-5">
          <CardTitle className="text-base">Jambs &amp; Casing</CardTitle>
          <CardDescription className="text-xs">
            {isSupplyOnly
              ? `Perimeter linear ft: ${linearFt.toFixed(2)} ft (Supply-Only defaults to None)`
              : `Priced on total linear ft: ${linearFt.toFixed(2)} ft`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 p-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Jamb
            </Label>
            <Select
              disabled={readOnly}
              value={jambId}
              onValueChange={(val) => setJambId(val ?? "")}
            >
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue>
                  {jambId === "none"
                    ? "None"
                    : jambId === "custom"
                      ? "Custom..."
                      : dbJambs.find((j) => j.id === jambId)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[280px]">
                <SelectItem value="none">None</SelectItem>
                {dbJambs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {jambId === "custom" && (
              <div className="mt-2 flex gap-2">
                <Input
                  disabled={readOnly}
                  className="h-8 text-xs"
                  placeholder="Name"
                  value={jambName}
                  onChange={(e) => setJambName(e.target.value)}
                />
                <Input
                  disabled={readOnly}
                  className="h-8 font-mono text-xs"
                  placeholder="Rate/ft"
                  type="number"
                  value={jambRate}
                  onChange={(e) => setJambRate(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Casing
            </Label>
            <Select
              disabled={readOnly}
              value={casingId}
              onValueChange={(val) => setCasingId(val ?? "")}
            >
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue>
                  {casingId === "none"
                    ? "None"
                    : casingId === "custom"
                      ? "Custom..."
                      : dbCasings.find((c) => c.id === casingId)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[280px]">
                <SelectItem value="none">None</SelectItem>
                {dbCasings.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {casingId === "custom" && (
              <div className="mt-2 flex gap-2">
                <Input
                  disabled={readOnly}
                  className="h-8 text-xs"
                  placeholder="Name"
                  value={casingName}
                  onChange={(e) => setCasingName(e.target.value)}
                />
                <Input
                  disabled={readOnly}
                  className="h-8 font-mono text-xs"
                  placeholder="Rate/ft"
                  type="number"
                  value={casingRate}
                  onChange={(e) => setCasingRate(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Additional Materials */}
          <div className="space-y-2 border-t border-border/50 pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">
                Additional Materials
              </Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                (Eligible for Material Exemption)
              </span>
            </div>

            {customMaterials.length > 0 && (
              <div className="space-y-2">
                {customMaterials.map((mat, index) => (
                  <div key={mat.id} className="flex items-center gap-2">
                    <Input
                      disabled={readOnly}
                      placeholder="e.g. Jamb as stop"
                      className="h-8 flex-1 text-xs"
                      value={mat.label}
                      onChange={(e) => {
                        if (!setCustomMaterials) return
                        const updated = [...customMaterials]
                        updated[index] = {
                          ...updated[index],
                          label: e.target.value,
                        }
                        setCustomMaterials(updated)
                      }}
                    />
                    <div className="relative w-24 shrink-0">
                      <span className="absolute top-2 left-2 text-xs text-muted-foreground">
                        $
                      </span>
                      <Input
                        disabled={readOnly}
                        type="number"
                        placeholder="0.00"
                        className="h-8 pl-5 font-mono text-xs"
                        value={mat.amount || ""}
                        onChange={(e) => {
                          if (!setCustomMaterials) return
                          const updated = [...customMaterials]
                          updated[index] = {
                            ...updated[index],
                            amount: parseFloat(e.target.value) || 0,
                          }
                          setCustomMaterials(updated)
                        }}
                      />
                    </div>
                    {!readOnly && setCustomMaterials && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => {
                          setCustomMaterials(
                            customMaterials.filter((m) => m.id !== mat.id)
                          )
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!readOnly && setCustomMaterials && (
              <Button
                variant="outline"
                size="sm"
                className="mt-1 h-8 w-full border-dashed text-xs"
                onClick={() => {
                  const newMat: CustomMaterialItem = {
                    id: "mat_" + Date.now(),
                    label: "",
                    amount: 0,
                  }
                  setCustomMaterials([...customMaterials, newMat])
                }}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Material
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
