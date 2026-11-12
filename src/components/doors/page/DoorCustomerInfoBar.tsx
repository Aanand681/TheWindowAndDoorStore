"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Hash } from "lucide-react"

interface DoorCustomerInfoBarProps {
  customerName: string
  setCustomerName: (name: string) => void
  quoteNumber: string
  setQuoteNumber: (num: string) => void
}

export function DoorCustomerInfoBar({
  customerName,
  setCustomerName,
  quoteNumber,
  setQuoteNumber,
}: DoorCustomerInfoBarProps) {
  return (
    <Card className="border-border bg-card/50 shadow-sm backdrop-blur-xl">
      <CardContent className="p-3.5 sm:p-4">
        <div className="grid grid-cols-1 items-center gap-3.5 sm:grid-cols-12">
          <div className="space-y-1 sm:col-span-8">
            <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Customer Name *</span>
            </Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="h-8.5 bg-background text-xs"
            />
          </div>

          <div className="space-y-1 sm:col-span-4">
            <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Hash className="h-3.5 w-3.5 text-primary" />
              <span>Quote Number *</span>
            </Label>
            <Input
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              placeholder="Quote #"
              className="h-8.5 bg-background font-mono text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
