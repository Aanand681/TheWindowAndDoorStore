'use client';

import dynamic from 'next/dynamic';

const QuotePdfStudioClient = dynamic(
  () => import('@/components/quotes/QuotePdfStudioClient'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
        Loading Quote PDF Studio...
      </div>
    ),
  }
);

export default function QuoteStudioPage() {
  return <QuotePdfStudioClient />;
}
