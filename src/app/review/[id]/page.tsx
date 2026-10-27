'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PromoCalculator } from '@/components/calculator/PromoCalculator';

function ReviewPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quoteId = (params?.id as string) || '';
  const isEdit = searchParams?.get('edit') === 'true';

  return (
    <PromoCalculator
      initialReviewQuoteId={quoteId}
      initialIsEditMode={isEdit}
    />
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
          Loading Quote Review Mode...
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
}
