"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sliders, FileText, Compass, Check, RotateCcw } from "lucide-react"
import type { SavedQuoteLayout } from "@/lib/quotes/invoice-layout-engine"

interface QuotingDefaultsCardProps {
  defaultQuotingMode: "installation" | "supply_only"
  setDefaultQuotingMode: (mode: "installation" | "supply_only") => void
  savedQuoteLayout: SavedQuoteLayout | null
  onResetSavedLayout: () => void
  landingPage: string
  setLandingPage: (page: string) => void
  role?: string
}

export function QuotingDefaultsCard({
  defaultQuotingMode,
  setDefaultQuotingMode,
  savedQuoteLayout,
  onResetSavedLayout,
  landingPage,
  setLandingPage,
  role,
}: QuotingDefaultsCardProps) {
  const isAdminOrSuper = role === "ADMIN" || role === "SUPERADMIN"

  return (
    <Card className="border-border bg-card/50 shadow-md backdrop-blur-xl">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sliders className="h-5 w-5 text-primary" />
          Quoting &amp; Navigation Defaults
        </CardTitle>
        <CardDescription>
          Configure how quoting workspaces open and format outputs for your workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Default Quoting Mode */}
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Default Quoting Mode</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDefaultQuotingMode("installation")}
              className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                defaultQuotingMode === "installation"
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background hover:bg-muted/50 text-foreground"
              }`}
            >
              <span>Installation</span>
              {defaultQuotingMode === "installation" && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDefaultQuotingMode("supply_only")}
              className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                defaultQuotingMode === "supply_only"
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background hover:bg-muted/50 text-foreground"
              }`}
            >
              <span>Supply only</span>
              {defaultQuotingMode === "supply_only" && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sets the initial mode when starting a fresh quote in the calculator.
          </p>
        </div>

        {/* Universal PDF Saved Layout */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              Universal Quote PDF Layout
            </Label>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background/80 p-3">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-foreground">
                {savedQuoteLayout
                  ? "Custom Composer Layout Active"
                  : "Smart 1-Page Auto-Fit (Default)"}
              </div>
              <div className="text-xs text-muted-foreground">
                {savedQuoteLayout
                  ? `${savedQuoteLayout.rows.length} layout row(s)${
                      savedQuoteLayout.fontSize
                        ? ` · ${savedQuoteLayout.fontSize.toFixed(1)}px font`
                        : ""
                    } — applied to all your future quotes.`
                  : "Open any Quote Preview to drag cards, resize widths, and click Save as My Default."}
              </div>
            </div>
            {savedQuoteLayout && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetSavedLayout}
                className="h-8 gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Auto-Fit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Default Landing Page */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="landingPage" className="text-sm font-semibold">
              Default Landing Page Upon Login
            </Label>
            <Compass className="h-4 w-4 text-muted-foreground" />
          </div>
          <select
            id="landingPage"
            value={landingPage}
            onChange={(e) => setLandingPage(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="calculator">Window Calculator (/)</option>
            <option value="doors">Door Calculator (/doors)</option>
            <option value="sealed_units">Sealed Units (/sealed-units)</option>
            <option value="quote_studio">Quote PDF Studio (/quote-studio)</option>
            <option value="quotes">Quote Review &amp; Bin (/quotes)</option>
            {isAdminOrSuper && (
              <option value="admin">Admin Dashboard (/admin)</option>
            )}
          </select>
          <p className="text-xs text-muted-foreground">
            Where you land automatically right after signing in.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
