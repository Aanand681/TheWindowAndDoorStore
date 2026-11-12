"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RegionProfileCardProps {
  region: any
  regions: any[]
  selectedRegionId: string
  effectiveIsSupplyOnly: boolean
  readOnly?: boolean
  onRegionSelect: (regId: string) => void
}

export function RegionProfileCard({
  region,
  regions,
  selectedRegionId,
  effectiveIsSupplyOnly,
  readOnly = false,
  onRegionSelect,
}: RegionProfileCardProps) {
  return (
    <Card className="gap-0 py-0 shadow-sm [--card-spacing:0px]">
      <CardHeader className="border-b border-border/50 px-5 py-3 !pb-3 sm:px-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Region Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Select your regional travel and service profile.
            </CardDescription>
          </div>

          {effectiveIsSupplyOnly && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
              Supply Only Mode Active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            disabled={readOnly}
            value={selectedRegionId || undefined}
            onValueChange={(val) => onRegionSelect(val ?? "")}
          >
            <SelectTrigger className="h-9 w-full text-xs sm:w-[300px] sm:text-sm">
              <SelectValue placeholder="Select Region">
                {regions.find((r) => r._id === selectedRegionId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r._id} value={r._id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!effectiveIsSupplyOnly && region && (
            <span className="text-xs text-muted-foreground">
              Free travel within: {region.freeCities?.join(", ")}. Base labour $
              {region.labourPerSqft?.toFixed(2)}/sqft. Default 4 1/2&quot; Jamb
              &amp; Vinyl Casing active.
            </span>
          )}
        </div>

        {effectiveIsSupplyOnly && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold sm:text-sm">
              ⚡ Supply Only Order:
            </span>
            <span>
              Installation labour, travel fees, and setup fees are $0.00.
              Optional Jamb &amp; Casing defaults to $0.00.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
