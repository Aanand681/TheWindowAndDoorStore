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
import { ComboPricing } from "@/lib/sealed-units-logic"

interface AdminGlassCombosTabProps {
  title: string
  description: string
  icon: React.ReactNode
  combos: ComboPricing[]
  onPriceChange: (
    comboId: string,
    thickness: number,
    pane: "dual" | "triple",
    value: string
  ) => void
}

export function AdminGlassCombosTab({
  title,
  description,
  icon,
  combos,
  onPriceChange,
}: AdminGlassCombosTabProps) {
  return (
    <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-[10px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="w-64 p-3">Combination Name</th>
                <th className="p-3 text-center" colSpan={2}>
                  3mm ($)
                </th>
                <th className="p-3 text-center" colSpan={2}>
                  4mm ($)
                </th>
                <th className="p-3 text-center" colSpan={2}>
                  5mm ($)
                </th>
                <th className="p-3 text-center" colSpan={2}>
                  6mm ($)
                </th>
              </tr>
              <tr className="border-b border-border/40 text-[9px] text-muted-foreground/80">
                <th className="p-2"></th>
                <th className="p-1 text-center">Dual</th>
                <th className="p-1 text-center">Triple</th>
                <th className="p-1 text-center">Dual</th>
                <th className="p-1 text-center">Triple</th>
                <th className="p-1 text-center">Dual</th>
                <th className="p-1 text-center">Triple</th>
                <th className="p-1 text-center">Dual</th>
                <th className="p-1 text-center">Triple</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {combos.map((combo) => (
                <tr
                  key={combo.id}
                  className="transition-colors hover:bg-muted/20"
                >
                  <td className="p-3 font-semibold text-foreground">
                    {combo.name}
                  </td>
                  {[3, 4, 5, 6].map((th) => (
                    <React.Fragment key={th}>
                      <td className="p-1.5 text-center">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="—"
                          value={
                            combo.prices?.[th]?.dual ??
                            (combo.prices as any)?.[String(th)]?.dual ??
                            ""
                          }
                          onChange={(e) =>
                            onPriceChange(combo.id, th, "dual", e.target.value)
                          }
                          className="mx-auto h-8 w-18 bg-background text-center font-mono text-xs"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="—"
                          value={
                            combo.prices?.[th]?.triple ??
                            (combo.prices as any)?.[String(th)]?.triple ??
                            ""
                          }
                          onChange={(e) =>
                            onPriceChange(
                              combo.id,
                              th,
                              "triple",
                              e.target.value
                            )
                          }
                          className="mx-auto h-8 w-18 bg-background text-center font-mono text-xs"
                        />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
