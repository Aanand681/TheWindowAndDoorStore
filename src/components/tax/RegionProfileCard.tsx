'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionProfileCardProps {
  region: any;
  regions: any[];
  selectedRegionId: string;
  effectiveIsSupplyOnly: boolean;
  readOnly?: boolean;
  onRegionSelect: (regId: string) => void;
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
    <Card className="py-0 gap-0 [--card-spacing:0px] shadow-sm">
      <CardHeader className="py-3 px-5 sm:px-6 !pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">Region Profile</CardTitle>
            <CardDescription className="text-xs">
              Select your regional travel and service profile.
            </CardDescription>
          </div>

          {effectiveIsSupplyOnly && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Supply Only Mode Active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Select
            disabled={readOnly}
            value={selectedRegionId || undefined}
            onValueChange={(val) => onRegionSelect(val ?? '')}
          >
            <SelectTrigger className="w-full sm:w-[300px] h-9 text-xs sm:text-sm">
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
              Free travel within: {region.freeCities?.join(', ')}. Base labour $
              {region.labourPerSqft?.toFixed(2)}/sqft. Default 4 1/2&quot; Jamb &amp; Vinyl Casing active.
            </span>
          )}
        </div>

        {effectiveIsSupplyOnly && (
          <div className="mt-2.5 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="font-bold text-xs sm:text-sm">⚡ Supply Only Order:</span>
            <span>
              Installation labour, travel fees, and setup fees are $0.00. Optional Jamb &amp; Casing defaults to $0.00.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

