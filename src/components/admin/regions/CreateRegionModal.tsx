"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, MapPin, Loader2 } from "lucide-react"
import { NewRegionFormState } from "@/hooks/admin/useAdminRegions"
import { CreateRegionStandardInstallFields } from "./CreateRegionStandardInstallFields"

interface CreateRegionModalProps {
  isOpen: boolean
  onClose: () => void
  newRegion: NewRegionFormState
  setNewRegion: React.Dispatch<React.SetStateAction<NewRegionFormState>>
  creating: boolean
  geocoding: string | null
  onToggleSupplyOnly?: (val: boolean) => void
  onAutoLocate: (targetCity: string, isForNewRegion: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

export function CreateRegionModal({
  isOpen,
  onClose,
  newRegion,
  setNewRegion,
  creating,
  geocoding,
  onToggleSupplyOnly: _onToggleSupplyOnly,
  onAutoLocate,
  onSubmit,
}: CreateRegionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm duration-150 fade-in">
      <div className="relative max-h-[90vh] w-full max-w-xl space-y-6 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Add New Region</h3>
              <p className="text-xs text-muted-foreground">
                Configure geographic coordinates, mobilization fee, and dynamic
                travel surcharges.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Region Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="region-name" className="text-xs font-semibold">
                Region / City Name *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex h-6 cursor-pointer items-center gap-1 px-2 text-[11px] text-primary hover:bg-primary/10"
                disabled={geocoding === "new" || !newRegion.name.trim()}
                onClick={() => onAutoLocate(newRegion.name, true)}
                title="Auto-detect city coordinates on OpenStreetMap"
              >
                {geocoding === "new" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                <span>Auto-Locate City</span>
              </Button>
            </div>
            <Input
              id="region-name"
              required
              placeholder="e.g. Kenora, Thunder Bay, Dryden"
              value={newRegion.name}
              onChange={(e) =>
                setNewRegion((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={() => {
                if (
                  newRegion.name.trim().length > 2 &&
                  newRegion.officeLat === 48.6017 &&
                  newRegion.officeLon === -93.3986
                ) {
                  onAutoLocate(newRegion.name, true)
                }
              }}
            />
          </div>

          {/* City Center Coordinates */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-muted/20 p-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground">
                Office / Center Latitude
              </Label>
              <Input
                type="number"
                step="0.0001"
                className="h-8.5 font-mono text-xs"
                value={newRegion.officeLat}
                onChange={(e) =>
                  setNewRegion((prev) => ({
                    ...prev,
                    officeLat: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">
                Office / Center Longitude
              </Label>
              <Input
                type="number"
                step="0.0001"
                className="h-8.5 font-mono text-xs"
                value={newRegion.officeLon}
                onChange={(e) =>
                  setNewRegion((prev) => ({
                    ...prev,
                    officeLon: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <CreateRegionStandardInstallFields
            newRegion={newRegion}
            setNewRegion={setNewRegion}
          />

          <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !newRegion.name.trim()}
              className="bg-primary font-semibold text-primary-foreground"
            >
              {creating ? "Creating..." : "Create Region"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
