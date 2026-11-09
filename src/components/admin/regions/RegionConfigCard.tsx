'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Trash2 } from 'lucide-react';
import { RegionPricingForm } from './RegionPricingForm';
import { RegionGeofenceSection } from './RegionGeofenceSection';

interface RegionConfigCardProps {
  region: any;
  saving: boolean;
  geocoding: string | null;
  onSave: (region: any) => void;
  onDeleteConfirm: (region: any) => void;
  onUpdateRegion: (id: string, field: string, value: any) => void;
  onAutoLocate: (targetCity: string, isForNewRegion: boolean, regionId?: string) => void;
  onOpenFullscreen: (regionId: string) => void;
}

export function RegionConfigCard({
  region,
  saving,
  geocoding,
  onSave,
  onDeleteConfirm,
  onUpdateRegion,
  onAutoLocate,
  onOpenFullscreen,
}: RegionConfigCardProps) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <CardTitle className="text-xl text-primary">{region.name}</CardTitle>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Install &amp; Mobilization Zone
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onSave(region)}
              disabled={saving}
              size="sm"
              className="cursor-pointer"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save {region.name}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDeleteConfirm(region)}
              disabled={saving}
              className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </Button>
          </div>
        </div>
        <CardDescription className="mt-1">
          Universal geographic mobilization fees, origin coordinates, and interactive geofence boundary.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <RegionPricingForm
          region={region}
          geocoding={geocoding}
          onUpdateRegion={onUpdateRegion}
          onAutoLocate={onAutoLocate}
        />

        <RegionGeofenceSection
          region={region}
          onUpdateRegion={onUpdateRegion}
          onOpenFullscreen={onOpenFullscreen}
        />
      </CardContent>
    </Card>
  );
}
