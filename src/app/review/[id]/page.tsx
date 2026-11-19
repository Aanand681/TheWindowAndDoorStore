"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { PromoCalculator } from "@/components/calculator/PromoCalculator"
import { DoorCalculator } from "@/components/doors/DoorCalculator"
import { SealedUnitsCalculator } from "@/components/sealed-units/SealedUnitsCalculator"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"

type DeterminedQuoteType = "window" | "door" | "sealed_unit"

function ReviewPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const quoteId = (params?.id as string) || ""
  const isEdit = searchParams?.get("edit") === "true"
  const typeParam = searchParams?.get("type") as DeterminedQuoteType | null
  const subParam = searchParams?.get("sub") || undefined

  const [quoteType, setQuoteType] = useState<DeterminedQuoteType | null>(
    typeParam === "door" || typeParam === "sealed_unit" || typeParam === "window"
      ? typeParam
      : null
  )
  const [loading, setLoading] = useState<boolean>(!typeParam)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quoteId) {
      setError("No quote ID provided")
      setLoading(false)
      return
    }

    if (quoteType) {
      setLoading(false)
      return
    }

    let isMounted = true
    fetch(`/api/quotes/${quoteId}?t=${Date.now()}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Quote not found (Status ${res.status})`)
        }
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return
        if (!data || !data._id) {
          throw new Error("Invalid quote data received")
        }

        const rawType = data.quoteType
        const isDoor =
          rawType === "door" ||
          (Array.isArray(data.windows) &&
            data.windows.some((w: any) => w.doorPresetId || w.presetId))
        const isSU =
          rawType === "sealed_unit" ||
          Boolean(data.taxTotals?.isSealedUnitQuote) ||
          Boolean(data.sealedUnitMode)

        if (isDoor) {
          setQuoteType("door")
        } else if (isSU) {
          setQuoteType("sealed_unit")
        } else {
          setQuoteType("window")
        }
      })
      .catch((err: any) => {
        if (isMounted) setError(err.message || "Failed to load quote")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [quoteId, quoteType])

  if (loading) {
    return (
      <div className="flex min-h-screen animate-pulse items-center justify-center bg-background text-sm font-medium text-muted-foreground">
        Loading Quote Review Mode...
      </div>
    )
  }

  if (error || !quoteType) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            Quote Review Not Found
          </h2>
          <p className="max-w-md text-xs text-muted-foreground">
            {error || "Unable to determine quote type for review."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back()
              return
            }
            router.push(subParam ? `/quotes?sub=${subParam}` : "/quotes")
          }}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Quotes</span>
        </Button>
      </div>
    )
  }

  if (quoteType === "door") {
    return (
      <DoorCalculator
        initialReviewQuoteId={quoteId}
        initialIsEditMode={isEdit}
        originSubTab={subParam}
      />
    )
  }

  if (quoteType === "sealed_unit") {
    return (
      <SealedUnitsCalculator
        initialReviewQuoteId={quoteId}
        initialIsEditMode={isEdit}
        originSubTab={subParam}
      />
    )
  }

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
