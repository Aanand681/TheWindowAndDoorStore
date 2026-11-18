import { Suspense } from "react"
import { SealedUnitsCalculator } from "@/components/sealed-units/SealedUnitsCalculator"

export const metadata = {
  title: "Sealed Units Calculator | The Window & Door Store",
  description: "Interactive sealed units pricing, configuration, and quote calculator.",
}

export default function SealedUnitsCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen animate-pulse items-center justify-center bg-background text-sm font-medium text-muted-foreground">
          Loading Sealed Units Calculator...
        </div>
      }
    >
      <SealedUnitsCalculator />
    </Suspense>
  )
}
