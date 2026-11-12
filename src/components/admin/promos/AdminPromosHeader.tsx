"use client"

import React from "react"
import Link from "next/link"
import { Component, Tag } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import NotificationBell from "@/components/shared/NotificationBell"
import QuotesBinPill from "@/components/quotes/QuotesBinPill"
import SmartBackButton from "@/components/shared/SmartBackButton"

export function AdminPromosHeader() {
  return (
    <header className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="flex flex-wrap items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" label="Back to Admin" />
        <Link
          href="/"
          className="group inline-flex cursor-pointer items-center gap-2 text-primary transition-opacity hover:opacity-80"
          title="Window & Door Store - Home / Calculator"
        >
          <Component className="h-6 w-6 transition-transform group-hover:scale-105" />
          <span className="text-xl font-semibold tracking-wider uppercase">
            Window &amp; Door Store
          </span>
        </Link>
        <span className="hidden text-muted-foreground/40 sm:inline">/</span>
        <div className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Tag className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold tracking-wider uppercase">
            Promos &amp; Sales
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <QuotesBinPill />
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
