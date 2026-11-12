import { Suspense } from "react"
import { PromoCalculator } from "@/components/calculator/PromoCalculator"

export const metadata = {
  title: "Pricing & Promo Calculator | The Window & Door Store",
  description: "Interactive window and door promotion and pricing calculator.",
}

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen animate-pulse items-center justify-center bg-background text-sm font-medium text-muted-foreground">
          Loading Calculator...
        </div>
      }
    >
      <PromoCalculator />
    </Suspense>
  )
}
