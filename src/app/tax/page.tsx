'use client';

import React, { useState, Suspense } from 'react';
import { Calculator } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import TaxCalculatorTab from '@/components/tax/TaxCalculatorTab';

function TaxPageContent() {
  const [windows, setWindows] = useState<any[]>([
    { id: 'tax-win-1', qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' },
  ]);

  return (
    <AppLayout currentPath="/tax">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Calculator className="w-4 h-4" />
            </span>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Tax &amp; Labour Pricing
            </h1>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Labour, regional mobilization, and HST configuration
          </div>
        </div>

        <TaxCalculatorTab
          windows={windows}
          onWindowsChange={setWindows}
        />
      </div>
    </AppLayout>
  );
}

export default function TaxPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
          Loading Tax &amp; Overhead Calculator...
        </div>
      }
    >
      <TaxPageContent />
    </Suspense>
  );
}
