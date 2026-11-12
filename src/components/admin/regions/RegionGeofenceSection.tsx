"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Maximize2, RotateCcw, Trash2 } from "lucide-react"

const AdminGeofenceMap = dynamic(
  () => import("@/components/admin/AdminGeofenceMap"),
  {
    ssr: false,
  }
)

interface RegionGeofenceSectionProps {
  region: any
  onUpdateRegion: (id: string, field: string, value: any) => void
  onOpenFullscreen: (regionId: string) => void
}

export function RegionGeofenceSection({
  region,
  onUpdateRegion,
  onOpenFullscreen,
}: RegionGeofenceSectionProps) {
  const polyLength = region.polygon?.length || 0

  return (
    <div className="mt-8 space-y-4 border-t border-border pt-8">
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Geofence &amp; City Limits
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Click on the map to add boundary pins. Drag any pin to adjust its
            position.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
            {polyLength} Pins
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenFullscreen(region._id)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Pop Out Big Screen</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
        {/* Left control panel */}
        <div className="space-y-3 lg:col-span-1">
          <div className="space-y-2.5 rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>Boundary Status</span>
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                  polyLength >= 3
                    ? "bg-emerald-500/10 text-emerald-500"
                    : polyLength > 0
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {polyLength >= 3
                  ? "Active Polygon"
                  : polyLength > 0
                    ? "Connecting"
                    : "No Boundary"}
              </span>
            </div>
            <div className="space-y-1 text-[11px] leading-relaxed text-muted-foreground">
              <div>
                • <strong>Click map:</strong> Drop new pin
              </div>
              <div>
                • <strong>Drag pin:</strong> Move anywhere
              </div>
              <div>
                • <strong>Click pin:</strong> Delete pin
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs font-medium"
              onClick={() => {
                const poly = region.polygon || []
                onUpdateRegion(region._id, "polygon", poly.slice(0, -1))
              }}
              disabled={!region.polygon?.length}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Undo Last Pin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start border-destructive/20 text-xs font-medium text-destructive hover:bg-destructive hover:text-white"
              onClick={() => onUpdateRegion(region._id, "polygon", [])}
              disabled={!region.polygon?.length}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Clear All Pins
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs font-medium"
              onClick={() => onOpenFullscreen(region._id)}
            >
              <Maximize2 className="mr-2 h-3.5 w-3.5 text-primary" />
              Open in Big Screen
            </Button>
          </div>
        </div>

        {/* Right map preview */}
        <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm lg:col-span-3">
          <AdminGeofenceMap
            lat={region.officeLat}
            lon={region.officeLon}
            polygon={region.polygon || []}
            onChangePolygon={(poly) =>
              onUpdateRegion(region._id, "polygon", poly)
            }
          />
          <button
            type="button"
            onClick={() => onOpenFullscreen(region._id)}
            className="absolute top-3 right-3 z-[1000] flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold shadow backdrop-blur transition hover:bg-background"
            title="Click to open big screen"
          >
            <Maximize2 className="h-3.5 w-3.5 text-primary" />
            <span>Click for Big Screen</span>
          </button>
        </div>
      </div>
    </div>
  )
}
