"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, Eye, Download } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"

interface TaxSummarySidebarProps {
  isSupplyOnly: boolean
  readOnly?: boolean
  calculatedTotals: any
  includeLabour: boolean
  setIncludeLabour: (v: boolean) => void
  includeMisc: boolean
  setIncludeMisc: (v: boolean) => void
  includeJC: boolean
  setIncludeJC: (v: boolean) => void
  discount: string
  setDiscount: (d: string) => void
  hstOn: boolean
  setHstOn: (v: boolean) => void
  onOpenPreview?: () => void
  summarySlot?: React.ReactNode
}

export function TaxSummarySidebar({
  isSupplyOnly,
  readOnly = false,
  calculatedTotals,
  includeLabour,
  setIncludeLabour,
  includeMisc,
  setIncludeMisc,
  includeJC,
  setIncludeJC,
  discount,
  setDiscount,
  hstOn,
  setHstOn,
  onOpenPreview,
  summarySlot,
}: TaxSummarySidebarProps) {
  if (summarySlot) {
    return <>{summarySlot}</>
  }

  const c = calculatedTotals

  return (
    <div className="sticky top-8 h-fit space-y-6 pb-12 lg:col-span-4">
      <Card className="border-border bg-card/80 shadow-xl backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-5 w-5 text-primary" />
              {isSupplyOnly ? "Supply Materials & Tax" : "Tax & Labour Summary"}
            </CardTitle>
            {isSupplyOnly && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-amber-500 uppercase">
                Supply Only
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {c ? (
            <>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={readOnly}
                      id="incLab"
                      checked={includeLabour}
                      onCheckedChange={(ch) => setIncludeLabour(!!ch)}
                    />
                    <Label
                      htmlFor="incLab"
                      className="cursor-pointer font-normal"
                    >
                      Labour (windows + extras)
                    </Label>
                  </div>
                  <span
                    className={`font-mono ${
                      !includeLabour
                        ? "line-through opacity-50"
                        : "text-foreground"
                    }`}
                  >
                    {formatMoney(c.labourTotal * 100)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={readOnly}
                      id="incMisc"
                      checked={includeMisc}
                      onCheckedChange={(ch) => setIncludeMisc(!!ch)}
                    />
                    <Label
                      htmlFor="incMisc"
                      className="cursor-pointer font-normal"
                    >
                      Miscellaneous
                    </Label>
                  </div>
                  <span
                    className={`font-mono ${
                      !includeMisc
                        ? "line-through opacity-50"
                        : "text-foreground"
                    }`}
                  >
                    {formatMoney(c.miscTotal * 100)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={readOnly}
                      id="incJC"
                      checked={includeJC}
                      onCheckedChange={(ch) => setIncludeJC(!!ch)}
                    />
                    <Label
                      htmlFor="incJC"
                      className="cursor-pointer font-normal"
                    >
                      Jambs + casings
                    </Label>
                  </div>
                  <span
                    className={`font-mono ${
                      !includeJC ? "line-through opacity-50" : "text-foreground"
                    }`}
                  >
                    {formatMoney(c.jc * 100)}
                  </span>
                </div>

                {/* Custom Additional Materials */}
                {c.customMaterials &&
                  Array.isArray(c.customMaterials) &&
                  c.customMaterials.map((mat: any) => {
                    const amt = Number(mat.amount) || 0
                    if (amt <= 0 && !mat.label) return null
                    return (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between text-muted-foreground"
                      >
                        <Label className="font-normal">
                          {mat.label ? `Material: ${mat.label}` : "Material"}
                        </Label>
                        <span className="font-mono text-foreground">
                          {formatMoney(Math.round(amt * 100))}
                        </span>
                      </div>
                    )
                  })}

                <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                  <Label>Monthly discount</Label>
                  <div className="relative w-24">
                    <span className="absolute top-2 left-2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      disabled={readOnly}
                      type="number"
                      className="h-8 pl-5"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Subtotal</span>
                  <span className="font-mono text-lg font-medium">
                    {formatMoney(c.subtotal * 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={readOnly}
                      id="hston"
                      checked={hstOn}
                      onCheckedChange={(ch) => setHstOn(!!ch)}
                    />
                    <Label htmlFor="hston" className="cursor-pointer">
                      HST (13%)
                    </Label>
                  </div>
                  <span className="font-mono text-muted-foreground">
                    {formatMoney(c.hst * 100)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="font-mono text-3xl font-bold tracking-tight text-primary">
                    {formatMoney(c.total * 100)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Enter valid window sizes to see the summary.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Action Preview & Print Bar */}
      {onOpenPreview && (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={onOpenPreview}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-primary text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <Eye className="h-4 w-4" />
            Preview &amp; Print Quote
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onOpenPreview}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Download / Print PDF
          </Button>
        </div>
      )}
    </div>
  )
}
