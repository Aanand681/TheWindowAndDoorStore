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
import { formatMoney } from "@/lib/promo-logic"

interface WindowsSizesLabourCardProps {
  windows: any[]
  onWindowsChange: (w: any[]) => void
  calculatedTotals: any
  isSupplyOnly: boolean
  readOnly?: boolean
}

export function WindowsSizesLabourCard({
  windows,
  onWindowsChange,
  calculatedTotals,
  isSupplyOnly,
  readOnly = false,
}: WindowsSizesLabourCardProps) {
  const lines = calculatedTotals?.lines

  return (
    <Card className="gap-0 py-0 shadow-sm [--card-spacing:0px]">
      <CardHeader className="border-b border-border/50 px-5 py-3 !pb-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg">
          Windows Sizes &amp; Labour
        </CardTitle>
        <CardDescription className="text-xs">
          Sizes accepted in inches (e.g. 61 1/4 or 61.25). You can edit width
          and height here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="max-h-[420px] w-full overflow-auto rounded-xl border bg-background/50">
          <div className="border-b border-border/40 bg-muted/30 px-4 py-2 text-[11px] font-medium text-muted-foreground/80 md:hidden">
            ← Swipe horizontally to edit sizes &amp; view labour →
          </div>
          <div className="min-w-[700px] space-y-2 p-3">
            {windows.map((w, i) => {
              const line = lines?.[i]
              return (
                <div
                  key={w.id || i}
                  className="grid grid-cols-12 items-center gap-3 rounded-xl border border-border/80 bg-card p-2.5 shadow-xs"
                >
                  <div className="col-span-1 text-center font-mono text-xs text-muted-foreground">
                    {i + 1}
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Width&quot;
                    </Label>
                    <Input
                      disabled={readOnly}
                      className="h-8 font-mono text-xs"
                      value={w.w || ""}
                      onChange={(e) => {
                        const nw = [...windows]
                        nw[i].w = e.target.value.replace(/[^0-9\s./-]/g, "")
                        onWindowsChange(nw)
                      }}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Height&quot;
                    </Label>
                    <Input
                      disabled={readOnly}
                      className="h-8 font-mono text-xs"
                      value={w.h || ""}
                      onChange={(e) => {
                        const nw = [...windows]
                        nw[i].h = e.target.value.replace(/[^0-9\s./-]/g, "")
                        onWindowsChange(nw)
                      }}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Qty
                    </Label>
                    <Input
                      disabled={readOnly}
                      type="number"
                      min="1"
                      className="h-8 font-mono text-xs"
                      value={w.qty}
                      onChange={(e) => {
                        const nw = [...windows]
                        nw[i].qty = e.target.value
                        onWindowsChange(nw)
                      }}
                    />
                  </div>
                  <div className="col-span-4 mt-3 space-y-0.5 text-xs">
                    {line ? (
                      <>
                        <div className="text-[11px] font-medium text-muted-foreground">
                          Sqft: {line.sqft.toFixed(2)} | LinFt:{" "}
                          {line.lin.toFixed(2)}
                        </div>
                        {isSupplyOnly ? (
                          <div className="text-xs font-semibold text-amber-500">
                            Supply Only (No Install Labour)
                          </div>
                        ) : (
                          <div className="text-xs font-semibold text-primary">
                            Lab: {formatMoney(line.lab * 100)} | Misc:{" "}
                            {formatMoney(line.misc * 100)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        Invalid size
                      </div>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Button
                      disabled={readOnly}
                      variant="ghost"
                      size="icon"
                      className="mt-3 h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        const nw = windows.filter((_, idx) => idx !== i)
                        onWindowsChange(
                          nw.length
                            ? nw
                            : [
                                {
                                  id: Math.random().toString(),
                                  qty: "1",
                                  base: "",
                                  argon: "",
                                  solar: "",
                                  triple: "",
                                  w: "",
                                  h: "",
                                },
                              ]
                        )
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <Button
          disabled={readOnly}
          variant="secondary"
          size="sm"
          className="h-8 cursor-pointer text-xs font-semibold"
          onClick={() =>
            onWindowsChange([
              ...windows,
              {
                id: Math.random().toString(),
                qty: "1",
                base: "",
                argon: "",
                solar: "",
                triple: "",
                w: "",
                h: "",
              },
            ])
          }
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Window Manually
        </Button>
      </CardContent>
    </Card>
  )
}
