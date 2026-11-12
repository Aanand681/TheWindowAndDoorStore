"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SmartBackButton({
  fallbackUrl = "/",
  className,
  title,
  label = "Go Back",
}: {
  fallbackUrl?: string
  className?: string
  title?: string
  label?: string
}) {
  const router = useRouter()
  const effectiveTitle = title || label

  const handleBack = () => {
    if (typeof window !== "undefined") {
      // If we have history within the app
      if (
        window.history.length > 1 &&
        document.referrer &&
        document.referrer.includes(window.location.host)
      ) {
        router.back()
        return
      }
      // Otherwise navigate reliably to fallback URL
      router.push(fallbackUrl)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleBack}
      variant="outline"
      size="icon"
      className={cn(
        "cursor-pointer rounded-full bg-card/50 shadow-xs backdrop-blur",
        className
      )}
      title={effectiveTitle}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  )
}
