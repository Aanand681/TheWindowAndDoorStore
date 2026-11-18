import { Suspense } from "react"
import { DoorCalculator } from "@/components/doors/DoorCalculator"

export const metadata = {
  title: "Door Calculator | The Window & Door Store",
  description: "Interactive door pricing, configuration, and quote calculator.",
}

export default function DoorCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen animate-pulse items-center justify-center bg-background text-sm font-medium text-muted-foreground">
          Loading Door Calculator...
        </div>
      }
    >
      <DoorCalculator />
    </Suspense>
  )
}
