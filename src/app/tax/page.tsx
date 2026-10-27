'use client';

import React, { useState, Suspense } from 'react';
import { AppLayout } from '@/components/AppLayout';
import TaxCalculatorTab from '@/components/TaxCalculatorTab';

function TaxPageContent() {
  const [windows, setWindows] = useState<any[]>([
    { id: 'tax-win-1', qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' },
  ]);

  return (
    <AppLayout currentPath="/tax">
      <TaxCalculatorTab
        windows={windows}
        onWindowsChange={setWindows}
      />
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
