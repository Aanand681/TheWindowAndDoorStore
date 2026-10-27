'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HomeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    const reviewQuoteId = searchParams.get('reviewQuoteId') || searchParams.get('quoteId');
    const isEdit = searchParams.get('edit') === 'true';
    const sub = searchParams.get('sub');
    const previewQuoteId = searchParams.get('previewQuoteId');

    if (reviewQuoteId) {
      router.replace(`/review/${reviewQuoteId}${isEdit ? '?edit=true' : ''}`);
    } else if (tab === 'quotes') {
      const queryParams = new URLSearchParams();
      if (sub) queryParams.set('sub', sub);
      if (previewQuoteId) queryParams.set('previewQuoteId', previewQuoteId);
      const queryStr = queryParams.toString();
      router.replace(`/quotes${queryStr ? `?${queryStr}` : ''}`);
    } else if (tab === 'tax') {
      router.replace('/tax');
    } else {
      router.replace('/calculator');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
      Loading Window &amp; Door Store...
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
          Loading...
        </div>
      }
    >
      <HomeRedirect />
    </Suspense>
  );
}
