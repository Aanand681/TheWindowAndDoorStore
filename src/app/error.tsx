"use client"

import { useEffect } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application Error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected application error occurred."}
          </p>
          {error.digest && (
            <p className="rounded-md bg-muted/50 p-2 font-mono text-xs text-muted-foreground/80">
              Error Digest: {error.digest}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={reset} className="cursor-pointer gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              className: "cursor-pointer gap-2",
            })}
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
