"use client"

import React, { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { PromoCalculator } from "@/components/calculator/PromoCalculator"

function ReviewPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quoteId = (params?.id as string) || ""
  const isEdit = searchParams?.get("edit") === "true"

  return (
    <PromoCalculator
      initialReviewQuoteId={quoteId}
      initialIsEditMode={isEdit}
    />
  )
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen animate-pulse items-center justify-center bg-background text-sm font-medium text-muted-foreground">
          Loading Quote Review Mode...
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  )
}
