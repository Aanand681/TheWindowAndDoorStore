'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, MapPin, Loader2 } from 'lucide-react';
import { NewRegionFormState } from '@/hooks/admin/useAdminRegions';
import { CreateRegionStandardInstallFields } from './CreateRegionStandardInstallFields';

interface CreateRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRegion: NewRegionFormState;
  setNewRegion: React.Dispatch<React.SetStateAction<NewRegionFormState>>;
  creating: boolean;
  geocoding: string | null;
  onToggleSupplyOnly: (val: boolean) => void;
  onAutoLocate: (targetCity: string, isForNewRegion: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateRegionModal({
  isOpen,
  onClose,
  newRegion,
  setNewRegion,
  creating,
  geocoding,
  onToggleSupplyOnly,
  onAutoLocate,
  onSubmit,
}: CreateRegionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Add New Region</h3>
              <p className="text-xs text-muted-foreground">
                Configure a standard installation or supply-only region.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Region Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Region Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onToggleSupplyOnly(false)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  !newRegion.isSupplyOnly
                    ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                    : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  🏡 Standard Install
                </span>
                <span className="text-[11px] leading-snug">
                  Full crew labour, travel calculations, and site installation.
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSupplyOnly(true)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  newRegion.isSupplyOnly
                    ? 'border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500'
                    : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <span className="font-semibold text-sm text-amber-500 flex items-center gap-1.5">
                  ⚡ Supply Only
                </span>
                <span className="text-[11px] leading-snug">
                  Window supply &amp; optional trim materials. $0 labour &amp; travel.
                </span>
              </button>
            </div>
          </div>

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
                className="h-6 px-2 text-[11px] flex items-center gap-1 text-primary cursor-pointer hover:bg-primary/10"
                disabled={geocoding === 'new' || !newRegion.name.trim()}
                onClick={() => onAutoLocate(newRegion.name, true)}
                title="Auto-detect city coordinates on OpenStreetMap"
              >
                {geocoding === 'new' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                <span>Auto-Locate City</span>
              </Button>
            </div>
            <Input
              id="region-name"
              required
              placeholder={
                newRegion.isSupplyOnly
                  ? 'e.g., Supply Only'
                  : 'e.g., Kenora, Thunder Bay, Dryden'
              }
              value={newRegion.name}
              onChange={(e) =>
                setNewRegion((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={() => {
                if (
                  !newRegion.isSupplyOnly &&
                  newRegion.name.trim().length > 2 &&
                  newRegion.officeLat === 48.6017 &&
                  newRegion.officeLon === -93.3986
                ) {
                  onAutoLocate(newRegion.name, true);
                }
              }}
            />
          </div>

          {/* City Center Coordinates */}
          <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg border border-border/70 bg-muted/20">
            <div>
              <Label className="text-[11px] text-muted-foreground">Office / Center Latitude</Label>
              <Input
                type="number"
                step="0.0001"
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
              <Label className="text-[11px] text-muted-foreground">Office / Center Longitude</Label>
              <Input
                type="number"
                step="0.0001"
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

          {newRegion.isSupplyOnly ? (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs space-y-1 text-muted-foreground">
              <span className="font-semibold text-amber-500 block">
                Supply Only Defaults Configured
              </span>
              <p className="leading-relaxed">
                All installation labour rates, travel fees, vehicle costs, and fixed setup fees will be locked to <strong>$0.00</strong>.
                Window promo discounts and optional Jamb &amp; Casing materials apply normally.
              </p>
            </div>
          ) : (
            <CreateRegionStandardInstallFields
              newRegion={newRegion}
              setNewRegion={setNewRegion}
            />
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
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
              className="bg-primary text-primary-foreground font-semibold"
            >
              {creating ? 'Creating...' : 'Create Region'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
