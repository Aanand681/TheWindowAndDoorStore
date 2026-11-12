"use client"

import React from "react"
import Link from "next/link"
import { Component, Calculator, Inbox, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import NotificationBell from "@/components/shared/NotificationBell"
import UserProfileMenu from "@/components/shared/UserProfileMenu"
import QuotesBinPill from "@/components/quotes/QuotesBinPill"
import ToolsMenu from "./ToolsMenu"
import { useSession } from "next-auth/react"

import { cachedFetch, getCachedData } from "@/lib/client-cache"

interface AppHeaderProps {
  currentPath: string
  showQuotesBin?: boolean
}

export function AppHeader({
  currentPath,
  showQuotesBin = true,
}: AppHeaderProps) {
  const sessionResult = useSession()
  const sessionUser = sessionResult?.data?.user as any
  const [profileUser, setProfileUser] = React.useState<any>(
    () => getCachedData("/api/profile") || null
  )

  React.useEffect(() => {
    if (!profileUser) {
      cachedFetch("/api/profile")
        .then((data) => {
          if (data) setProfileUser(data)
        })
        .catch(() => {})
    }
  }, [profileUser])

  const user = sessionUser || profileUser
  const canAccessAdmin = Boolean(
    user?.canAccessAdmin ||
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN"
  )

  const isCalculatorActive =
    currentPath === "/calculator" || currentPath === "/"
  const isQuotesActive = currentPath === "/quotes"
  const isAdminActive = currentPath.startsWith("/admin")

  return (
    <header className="mb-6 flex flex-col items-center justify-between gap-4 sm:mb-8 md:flex-row">
      <Link
        href="/calculator"
        className="group inline-flex cursor-pointer items-center gap-2 text-primary transition-opacity hover:opacity-80"
        title="Window & Door Store - Home"
      >
        <Component className="h-6 w-6 transition-transform group-hover:scale-105" />
        <span className="text-xl font-semibold tracking-wider uppercase">
          Window &amp; Door Store
        </span>
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end md:gap-3">
        <Link
          href="/calculator"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "cursor-pointer gap-1.5 rounded-full bg-card/50 text-xs font-medium backdrop-blur transition-colors",
            isCalculatorActive
              ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
              : "border-border/60 text-muted-foreground hover:bg-muted/30"
          )}
        >
          <Calculator className="h-3.5 w-3.5" />
          <span>Calculator</span>
        </Link>

        <Link
          href="/quotes"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "cursor-pointer gap-1.5 rounded-full bg-card/50 text-xs font-medium backdrop-blur transition-colors",
            isQuotesActive
              ? "border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/15"
              : "border-border/60 text-muted-foreground hover:bg-muted/30"
          )}
        >
          <Inbox className="h-3.5 w-3.5 text-amber-500" />
          <span>Quotes &amp; Bin</span>
          {showQuotesBin && <QuotesBinPill badgeOnly />}
        </Link>

        <ToolsMenu currentPath={currentPath} />

        {canAccessAdmin && (
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "cursor-pointer gap-1.5 rounded-full text-xs font-semibold shadow-sm",
              isAdminActive
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
                : "border-border/60 text-muted-foreground hover:bg-muted/30"
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Dashboard</span>
          </Link>
        )}

        <NotificationBell />
        <ThemeToggle />
        <UserProfileMenu user={user} />
      </div>
    </header>
  )
}
