'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Maximize2, RotateCcw, Trash2 } from 'lucide-react';

const AdminGeofenceMap = dynamic(() => import('@/components/admin/AdminGeofenceMap'), {
  ssr: false,
});

interface RegionGeofenceSectionProps {
  region: any;
  onUpdateRegion: (id: string, field: string, value: any) => void;
  onOpenFullscreen: (regionId: string) => void;
}

export function RegionGeofenceSection({
  region,
  onUpdateRegion,
  onOpenFullscreen,
}: RegionGeofenceSectionProps) {
  const polyLength = region.polygon?.length || 0;

  return (
    <div className="space-y-4 mt-8 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Geofence &amp; City Limits
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click on the map to add boundary pins. Drag any pin to adjust its position.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-foreground">
            {polyLength} Pins
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenFullscreen(region._id)}
            className="inline-flex items-center gap-1.5 text-xs font-medium shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Pop Out Big Screen</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left control panel */}
        <div className="space-y-3 lg:col-span-1">
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-2.5">
            <div className="font-semibold text-foreground flex items-center justify-between">
              <span>Boundary Status</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  polyLength >= 3
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : polyLength > 0
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {polyLength >= 3
                  ? 'Active Polygon'
                  : polyLength > 0
                  ? 'Connecting'
                  : 'No Boundary'}
              </span>
            </div>
            <div className="text-muted-foreground leading-relaxed text-[11px] space-y-1">
              <div>• <strong>Click map:</strong> Drop new pin</div>
              <div>• <strong>Drag pin:</strong> Move anywhere</div>
              <div>• <strong>Click pin:</strong> Delete pin</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs font-medium"
              onClick={() => {
                const poly = region.polygon || [];
                onUpdateRegion(region._id, 'polygon', poly.slice(0, -1));
              }}
              disabled={!region.polygon?.length}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Undo Last Pin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs text-destructive border-destructive/20 hover:bg-destructive hover:text-white font-medium"
              onClick={() => onUpdateRegion(region._id, 'polygon', [])}
              disabled={!region.polygon?.length}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Clear All Pins
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs font-medium"
              onClick={() => onOpenFullscreen(region._id)}
            >
              <Maximize2 className="w-3.5 h-3.5 mr-2 text-primary" />
              Open in Big Screen
            </Button>
          </div>
        </div>

        {/* Right map preview */}
        <div className="lg:col-span-3 h-[420px] w-full bg-muted/20 border border-border rounded-xl overflow-hidden relative shadow-sm">
          <AdminGeofenceMap
            lat={region.officeLat}
            lon={region.officeLon}
            polygon={region.polygon || []}
            onChangePolygon={(poly) => onUpdateRegion(region._id, 'polygon', poly)}
          />
          <button
            type="button"
            onClick={() => onOpenFullscreen(region._id)}
            className="absolute top-3 right-3 bg-background/90 hover:bg-background backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold z-[1000] border border-border shadow flex items-center gap-1.5 transition cursor-pointer"
            title="Click to open big screen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-primary" />
            <span>Click for Big Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
}

