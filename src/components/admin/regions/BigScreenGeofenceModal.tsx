"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Map, RotateCcw, Trash2, Minimize2 } from "lucide-react"

const AdminGeofenceMap = dynamic(
  () => import("@/components/admin/AdminGeofenceMap"),
  {
    ssr: false,
  }
)

interface BigScreenGeofenceModalProps {
  fullscreenRegion: any
  onClose: () => void
  onUpdateRegion: (id: string, field: string, value: any) => void
}

export function BigScreenGeofenceModal({
  fullscreenRegion,
  onClose,
  onUpdateRegion,
}: BigScreenGeofenceModalProps) {
  if (!fullscreenRegion) return null

  const poly = fullscreenRegion.polygon || []

  return (
    <div className="fixed inset-0 z-50 flex animate-in flex-col bg-background/95 p-4 backdrop-blur-md duration-150 fade-in md:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              Geofence Boundary:{" "}
              <span className="text-primary">{fullscreenRegion.name}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to place pins • Drag any pin to
              reposition • Click a pin to delete it
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
            {poly.length} Pins Placed
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdateRegion(fullscreenRegion._id, "polygon", poly.slice(0, -1))
            }
            disabled={!poly.length}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Undo Last Pin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUpdateRegion(fullscreenRegion._id, "polygon", [])}
            className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
            disabled={!poly.length}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear All
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="cursor-pointer bg-primary px-4 font-semibold text-primary-foreground"
          >
            <Minimize2 className="mr-1.5 h-4 w-4" /> Done (Pop Out)
          </Button>
        </div>
      </div>

      {/* Giant interactive map */}
      <div className="relative mt-4 w-full flex-1 overflow-hidden rounded-xl border border-border shadow-2xl">
        <AdminGeofenceMap
          lat={fullscreenRegion.officeLat}
          lon={fullscreenRegion.officeLon}
          polygon={poly}
          onChangePolygon={(newPoly) =>
            onUpdateRegion(fullscreenRegion._id, "polygon", newPoly)
          }
        />
      </div>
    </div>
  )
}
