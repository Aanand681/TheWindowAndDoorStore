'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const MapComponent = dynamic(() => import('@/components/admin/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

interface TravelSetupCardProps {
  region: any;
  isSupplyOnly: boolean;
  readOnly?: boolean;
  travel: {
    coords: string;
    setCoords: (c: string) => void;
    travelInfo: any;
    manualKm: string;
    setManualKm: (km: string) => void;
    manualHours: string;
    setManualHours: (hours: string) => void;
    setupFee: string;
    setSetupFee: (fee: string) => void;
    calculateTravelFromCoords: (lat: number, lon: number) => Promise<any>;
  };
  crew: string;
  setCrew: (crew: string) => void;
  dbCrewRates: any[];
}

export function TravelSetupCard({
  region,
  isSupplyOnly,
  readOnly = false,
  travel,
  crew,
  setCrew,
  dbCrewRates,
}: TravelSetupCardProps) {
  const {
    coords,
    setCoords,
    travelInfo,
    manualKm,
    setManualKm,
    manualHours,
    setManualHours,
    setupFee,
    setSetupFee,
    calculateTravelFromCoords,
  } = travel;

  return (
    <Card className="py-0 gap-0 [--card-spacing:0px] shadow-sm">
      <CardHeader className="py-3 px-5 sm:px-6 !pb-3 border-b border-border/50">
        <CardTitle className="text-base sm:text-lg">Travel &amp; Set-up</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {isSupplyOnly ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-2">
            <div className="text-amber-500 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm">
              <span>⚡ Supply Only Order Active</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Customer pickup / contractor supply. Vehicle mileage, crew travel hours, and job setup fees are $0.00 and not charged.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Paste Coordinates / Google Maps link
                </Label>
                <div className="flex gap-2">
                  <Input
                    disabled={readOnly}
                    className="h-9 text-xs"
                    value={coords}
                    onChange={(e) => setCoords(e.target.value)}
                    placeholder="48.6094, -93.4108"
                  />
                  <Button
                    disabled={readOnly}
                    size="sm"
                    variant="secondary"
                    className="h-9 text-xs font-semibold whitespace-nowrap"
                    onClick={() => {
                      const cMatch = coords.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
                      if (cMatch) {
                        calculateTravelFromCoords(Number(cMatch[1]), Number(cMatch[2]));
                      } else {
                        toast.error('Invalid coordinates format. Use e.g. 48.6094, -93.4108');
                      }
                    }}
                  >
                    Calculate Travel
                  </Button>
                </div>
              </div>
            </div>

            {travelInfo && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  travelInfo.isFree
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-primary/10 border-primary/20'
                }`}
              >
                <div className="font-semibold">{travelInfo.label}</div>
                <div className="mt-0.5">
                  City matched: <b>{travelInfo.city}</b>.
                  {travelInfo.isFree
                    ? ` This is within ${region?.name}'s free zone. No travel charged.`
                    : ` Outside free zone. One way is ${travelInfo.km?.toFixed(1)} km. Round trip charged.`}
                </div>
              </div>
            )}

            <div className="border border-border rounded-lg overflow-hidden h-[210px] z-0 relative">
              <MapComponent
                lat={travelInfo?.lat || region?.officeLat}
                lon={travelInfo?.lon || region?.officeLon}
                markerLat={travelInfo?.lat}
                markerLon={travelInfo?.lon}
                polygon={region?.polygon}
                onMarkerDragEnd={(lat, lon) => {
                  setCoords(`${lat}, ${lon}`);
                  calculateTravelFromCoords(lat, lon);
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Round-trip km</Label>
                <Input
                  disabled={readOnly}
                  className="h-9 text-xs font-mono"
                  type="number"
                  value={manualKm === '0' ? '' : manualKm}
                  onChange={(e) => setManualKm(e.target.value.replace(/^0+(?=\d)/, ''))}
                />
              </div>
              <div className="space-y-1 col-span-1 md:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground">Crew</Label>
                <Select disabled={readOnly} value={crew} onValueChange={(val) => setCrew(val ?? '')}>
                  <SelectTrigger className="w-full h-9 text-xs font-medium border border-primary/30 hover:border-primary/60 transition-colors bg-primary/5">
                    <SelectValue placeholder="Select crew size" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbCrewRates.map((cr) => (
                      <SelectItem key={cr.crewSize} value={cr.crewSize}>
                        {cr.crewSize} men @ ${cr.hourlyRate}/hr
                      </SelectItem>
                    ))}
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Round-trip hours</Label>
                <Input
                  disabled={readOnly || crew === 'none'}
                  className="h-9 text-xs font-mono"
                  type="number"
                  value={manualHours === '0' ? '' : manualHours}
                  onChange={(e) => setManualHours(e.target.value.replace(/^0+(?=\d)/, ''))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                Per-job set-up fee (Region Specific)
              </Label>
              <Select disabled={readOnly} value={setupFee} onValueChange={(val) => setSetupFee(val ?? '')}>
                <SelectTrigger className="w-full sm:w-[350px] h-9 text-xs">
                  <SelectValue>
                    {(region?.setupFeeOptions || []).find((o: any) => String(o.value) === setupFee)?.label ||
                      'Select Setup Fee'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[350px]">
                  {(region?.setupFeeOptions || []).map((opt: any, idx: number) => (
                    <SelectItem key={`${opt.label}-${opt.value}-${idx}`} value={String(opt.value)}>
                      {opt.label} (${opt.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                An additional fixed &quot;All Job Set Up Fee&quot; of ${region?.fixedSetupFee} is always included.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

