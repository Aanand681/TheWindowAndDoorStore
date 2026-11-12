"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { Inbox } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPusherClient } from "@/lib/pusher-client"
import { useQuery, useQueryClient } from "@tanstack/react-query"

interface QuotesBinPillProps {
  className?: string
  badgeOnly?: boolean
}

export default function QuotesBinPill({
  className,
  badgeOnly = false,
}: QuotesBinPillProps) {
  const queryClient = useQueryClient()

  const { data } = useQuery<{
    totalActionableCount?: number
    pendingReviewCount?: number
  }>({
    queryKey: ["quotes-badge-count"],
    queryFn: async () => {
      const res = await fetch("/api/quotes?countOnly=true")
      if (!res.ok) return { totalActionableCount: 0 }
      return res.json()
    },
    staleTime: 30 * 1000,
  })

  const count = data?.totalActionableCount ?? data?.pendingReviewCount ?? 0

  useEffect(() => {
    const pusher = getPusherClient()
    if (pusher) {
      const channel = pusher.subscribe("quotes-channel")
      const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["quotes-badge-count"] })
      }
      channel.bind("quote-updated", invalidate)
      channel.bind("quote-submitted", invalidate)
      return () => {
        channel.unbind_all()
        pusher.unsubscribe("quotes-channel")
      }
    }
    return undefined
  }, [queryClient])

  if (badgeOnly) {
    if (count <= 0) return null
    return (
      <span
        className={cn(
          "animate-in rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white fade-in",
          className
        )}
      >
        {count}
      </span>
    )
  }

  return (
    <Link
      href="/?tab=quotes"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "cursor-pointer gap-1.5 rounded-full border-amber-500/40 bg-card/50 text-xs font-medium text-amber-500 backdrop-blur transition-colors hover:bg-amber-500/10",
        className
      )}
      title="Quotes & Bin"
    >
      <Inbox className="h-3.5 w-3.5 text-amber-500" />
      <span>Quotes &amp; Bin</span>
      {count > 0 && (
        <span className="animate-in rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white fade-in">
          {count}
        </span>
      )}
    </Link>
  )
}
