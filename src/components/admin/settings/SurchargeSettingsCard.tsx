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
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"

export interface SurchargeSettingsCardProps {
  surcharge: string
  setSurcharge: (val: string) => void
  loading: boolean
}

export function SurchargeSettingsCard({
  surcharge,
  setSurcharge,
  loading,
}: SurchargeSettingsCardProps) {
  return (
    <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 pb-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <DollarSign className="h-5 w-5 text-primary" />
          Pricing Constants
        </CardTitle>
        <CardDescription>
          Update global pricing modifiers used across the calculator.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        ) : (
          <div className="max-w-xs space-y-2">
            <Label htmlFor="surcharge">Global Surcharge (%)</Label>
            <Input
              id="surcharge"
              type="number"
              step="0.01"
              min="0"
              required
              value={surcharge}
              onChange={(e) => setSurcharge(e.target.value)}
              className="bg-background"
            />
            <p className="text-[11px] text-muted-foreground">
              This percentage is automatically added to the base price of all
              windows during calculation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
