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
import { Plus, Trash2 } from "lucide-react"
import { DoorUpchargeConfig, DoorFormulaSettings } from "@/lib/doors/types"

export interface AdminDoorUpchargesTabProps {
  upcharges: DoorUpchargeConfig[]
  formula: DoorFormulaSettings
  setFormula: React.Dispatch<React.SetStateAction<DoorFormulaSettings>>
  onAddUpcharge: () => void
  onUpdateUpcharge: (
    index: number,
    field: keyof DoorUpchargeConfig,
    value: any
  ) => void
  onDeleteUpcharge: (index: number) => void
}

export function AdminDoorUpchargesTab({
  upcharges,
  formula,
  setFormula,
  onAddUpcharge,
  onUpdateUpcharge,
  onDeleteUpcharge,
}: AdminDoorUpchargesTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Upcharges Table */}
      <div className="space-y-4 lg:col-span-2">
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">
                Jobsite Labour Upcharges
              </CardTitle>
              <CardDescription>
                Custom site additions such as transoms, extra height, and
                complex trims.
              </CardDescription>
            </div>
            <Button size="sm" onClick={onAddUpcharge} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Upcharge
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-xs tracking-wider text-muted-foreground uppercase">
                    <th className="px-3 py-2.5">Label</th>
                    <th className="w-32 px-3 py-2.5">Rate ($)</th>
                    <th className="w-32 px-3 py-2.5">Unit / Billing</th>
                    <th className="px-3 py-2.5">Description</th>
                    <th className="w-16 px-3 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {upcharges.map((upcharge, idx) => (
                    <tr
                      key={upcharge.id || idx}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-3 py-2">
                        <Input
                          value={upcharge.label}
                          onChange={(e) =>
                            onUpdateUpcharge(idx, "label", e.target.value)
                          }
                          className="h-8 font-medium"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.5"
                            value={upcharge.rate}
                            onChange={(e) =>
                              onUpdateUpcharge(
                                idx,
                                "rate",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-8 pl-6 text-right font-mono"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          value={upcharge.unit}
                          onChange={(e) =>
                            onUpdateUpcharge(idx, "unit", e.target.value)
                          }
                          placeholder="e.g. 1 Hour"
                          className="h-8 font-mono text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          value={upcharge.description || ""}
                          onChange={(e) =>
                            onUpdateUpcharge(idx, "description", e.target.value)
                          }
                          placeholder="Description..."
                          className="h-8 text-xs text-muted-foreground"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteUpcharge(idx)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
      </div>

      {/* Hardware Prices Card */}
      <div className="space-y-4">
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Hardware Standard Rates</CardTitle>
            <CardDescription>
              Lockset, deadbolt, and customer-supplied hardware charges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">
                Standard Lockset &amp; Deadbolt Hardware ($)
              </Label>
              <div className="relative">
                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="1"
                  value={formula.locksetDeadboltPrice}
                  onChange={(e) =>
                    setFormula((prev) => ({
                      ...prev,
                      locksetDeadboltPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pl-6 font-mono font-medium"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Default shop price: $147.00 per set
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                Customer-Supplied Hardware Fee ($)
              </Label>
              <div className="relative">
                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="1"
                  value={formula.customerSuppliedHardwareFee}
                  onChange={(e) =>
                    setFormula((prev) => ({
                      ...prev,
                      customerSuppliedHardwareFee:
                        parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pl-6 font-mono font-medium"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Default install charge: $80.00
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
