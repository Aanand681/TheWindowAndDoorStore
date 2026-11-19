"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sliders, FileText, Compass, Check } from "lucide-react"

interface QuotingDefaultsCardProps {
  defaultQuotingMode: "installation" | "supply_only"
  setDefaultQuotingMode: (mode: "installation" | "supply_only") => void
  favoriteTemplate: string
  setFavoriteTemplate: (tpl: string) => void
  landingPage: string
  setLandingPage: (page: string) => void
  role?: string
}

export function QuotingDefaultsCard({
  defaultQuotingMode,
  setDefaultQuotingMode,
  favoriteTemplate,
  setFavoriteTemplate,
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

        {/* Favorite PDF Template */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="favoriteTemplate" className="text-sm font-semibold">
              Favorite Customer PDF Template
            </Label>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <select
            id="favoriteTemplate"
            value={favoriteTemplate}
            onChange={(e) => setFavoriteTemplate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="cards">Cards (Visual Card Layout)</option>
            <option value="modern">Modern Detailed</option>
            <option value="executive">Executive Classic</option>
            <option value="compact">Compact Table</option>
            <option value="breakdown">Breakdown (Line Items)</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Default invoice style applied when opening quote previews and generating customer PDFs.
          </p>
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
