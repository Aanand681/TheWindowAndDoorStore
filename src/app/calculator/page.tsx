import { Suspense } from 'react';
import { PromoCalculator } from '@/components/calculator/PromoCalculator';

export const metadata = {
  title: 'Pricing & Promo Calculator | The Window & Door Store',
  description: 'Interactive window and door promotion and pricing calculator.',
};

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium animate-pulse">
          Loading Calculator...
        </div>
      }
    >
      <PromoCalculator />
    </Suspense>
  );
}
