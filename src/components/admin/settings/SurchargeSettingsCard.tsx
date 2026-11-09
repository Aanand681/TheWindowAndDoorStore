'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

export interface SurchargeSettingsCardProps {
  surcharge: string;
  setSurcharge: (val: string) => void;
  loading: boolean;
}

export function SurchargeSettingsCard({
  surcharge,
  setSurcharge,
  loading,
}: SurchargeSettingsCardProps) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
      <CardHeader className="border-b border-border/50 pb-6">
        <CardTitle className="text-xl flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Pricing Constants
        </CardTitle>
        <CardDescription>Update global pricing modifiers used across the calculator.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading settings...</p>
        ) : (
          <div className="max-w-xs space-y-2">
            <Label htmlFor="surcharge">Global Surcharge (%)</Label>
            <Input
              id="surcharge"
              type="number"
              step="0.01"
              min="0"
              required
              value={surcharge}
              onChange={(e) => setSurcharge(e.target.value)}
              className="bg-background"
            />
            <p className="text-[11px] text-muted-foreground">
              This percentage is automatically added to the base price of all windows during calculation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

