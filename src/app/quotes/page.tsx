'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuotesPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?tab=quotes');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
      Loading Quotes &amp; Bin...
    </div>
  );
}
