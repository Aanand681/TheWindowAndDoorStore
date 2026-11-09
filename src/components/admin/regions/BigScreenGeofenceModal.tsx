'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Map, RotateCcw, Trash2, Minimize2 } from 'lucide-react';

const AdminGeofenceMap = dynamic(() => import('@/components/admin/AdminGeofenceMap'), {
  ssr: false,
});

interface BigScreenGeofenceModalProps {
  fullscreenRegion: any;
  onClose: () => void;
  onUpdateRegion: (id: string, field: string, value: any) => void;
}

export function BigScreenGeofenceModal({
  fullscreenRegion,
  onClose,
  onUpdateRegion,
}: BigScreenGeofenceModalProps) {
  if (!fullscreenRegion) return null;

  const poly = fullscreenRegion.polygon || [];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col p-4 md:p-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Geofence Boundary: <span className="text-primary">{fullscreenRegion.name}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to place pins • Drag any pin to reposition • Click a pin to delete it
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted border border-border text-foreground">
            {poly.length} Pins Placed
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUpdateRegion(fullscreenRegion._id, 'polygon', poly.slice(0, -1))}
            disabled={!poly.length}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Undo Last Pin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onUpdateRegion(fullscreenRegion._id, 'polygon', [])}
            className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
            disabled={!poly.length}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear All
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer"
          >
            <Minimize2 className="w-4 h-4 mr-1.5" /> Done (Pop Out)
          </Button>
        </div>
      </div>

      {/* Giant interactive map */}
      <div className="flex-1 w-full mt-4 rounded-xl overflow-hidden border border-border shadow-2xl relative">
        <AdminGeofenceMap
          lat={fullscreenRegion.officeLat}
          lon={fullscreenRegion.officeLon}
          polygon={poly}
          onChangePolygon={(newPoly) => onUpdateRegion(fullscreenRegion._id, 'polygon', newPoly)}
        />
      </div>
    </div>
  );
}

