"use client"

import React, { ReactNode } from "react"
import { AppHeader } from "./AppHeader"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: ReactNode
  currentPath: string
  showQuotesBin?: boolean
  className?: string
}

export function AppLayout({
  children,
  currentPath,
  showQuotesBin = true,
  className,
}: AppLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background font-sans text-foreground selection:bg-primary/30",
        className
      )}
    >
      {/* Subtle top ambient radial lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-6 px-4 pt-5 pb-10 sm:space-y-8 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath={currentPath} showQuotesBin={showQuotesBin} />
        <main>{children}</main>
      </div>
    </div>
  )
}
