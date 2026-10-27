'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/AppLayout';
import QuotesTab, { QuotesSubTabType } from '@/components/QuotesTab';

function QuotesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const currentUser = session?.user as any;

  const initialSubTab = (searchParams.get('sub') as QuotesSubTabType) || 'review';
  const previewQuoteId = searchParams.get('previewQuoteId') || undefined;

  const handleOpenQuote = (quoteId: string, isEdit?: boolean, originSubTab?: QuotesSubTabType) => {
    const subParam = originSubTab ? `&sub=${originSubTab}` : '';
    router.push(`/review/${quoteId}?${isEdit ? 'edit=true' : ''}${subParam}`);
  };

  return (
    <AppLayout currentPath="/quotes" showQuotesBin={false}>
      <QuotesTab
        currentUser={currentUser}
        onOpenQuote={handleOpenQuote}
        initialSubTab={initialSubTab}
        initialPreviewQuoteId={previewQuoteId}
      />
    </AppLayout>
  );
}

export default function QuotesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
          Loading Quotes &amp; Bin...
        </div>
      }
    >
      <QuotesPageContent />
    </Suspense>
  );
}
