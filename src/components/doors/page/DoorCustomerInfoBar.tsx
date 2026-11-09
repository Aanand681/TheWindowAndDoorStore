'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Hash } from 'lucide-react';

interface DoorCustomerInfoBarProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  quoteNumber: string;
  setQuoteNumber: (num: string) => void;
}

export function DoorCustomerInfoBar({
  customerName,
  setCustomerName,
  quoteNumber,
  setQuoteNumber,
}: DoorCustomerInfoBarProps) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-xl shadow-sm">
      <CardContent className="p-3.5 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          <div className="sm:col-span-8 space-y-1">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Customer Name *</span>
            </Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe, Lakeview Builders"
              className="h-8.5 text-xs bg-background"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
              <Hash className="w-3.5 h-3.5 text-primary" />
              <span>Quote Number *</span>
            </Label>
            <Input
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              placeholder="e.g. Q-84920"
              className="h-8.5 text-xs font-mono bg-background"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

