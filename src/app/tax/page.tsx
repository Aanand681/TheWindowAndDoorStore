"use client"

import React, { useState, Suspense } from "react"
import { Calculator } from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import TaxCalculatorTab from "@/components/tax/TaxCalculatorTab"

function TaxPageContent() {
  const [windows, setWindows] = useState<any[]>([
    {
      id: "tax-win-1",
      qty: "1",
      base: "",
      argon: "",
      solar: "",
      triple: "",
      w: "",
      h: "",
      color: "White",
    },
  ])

  return (
    <AppLayout currentPath="/tax">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-primary/20 bg-primary/10 p-1.5 text-primary">
              <Calculator className="h-4 w-4" />
            </span>
            <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Tax &amp; Labour Pricing
            </h1>
          </div>
          <div className="hidden text-xs text-muted-foreground sm:block">
            Labour, regional mobilization, and HST configuration
          </div>
        </div>

        <TaxCalculatorTab windows={windows} onWindowsChange={setWindows} />
      </div>
    </AppLayout>
  )
}

export default function TaxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen animate-pulse items-center justify-center bg-background text-sm font-medium text-muted-foreground">
          Loading Tax &amp; Overhead Calculator...
        </div>
      }
    >
      <TaxPageContent />
    </Suspense>
  )
}
