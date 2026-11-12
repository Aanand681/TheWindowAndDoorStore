"use client"

import dynamic from "next/dynamic"

const QuotePdfStudioClient = dynamic(
  () => import("@/components/quotes/QuotePdfStudioClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen animate-pulse items-center justify-center bg-background text-sm font-medium text-muted-foreground">
        Loading Quote PDF Studio...
      </div>
    ),
  }
)

export default function QuoteStudioPage() {
  return <QuotePdfStudioClient />
}
