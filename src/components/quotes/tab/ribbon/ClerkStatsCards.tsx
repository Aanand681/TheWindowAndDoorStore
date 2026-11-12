"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardCheck, CheckSquare, FileText } from "lucide-react"
import type { QuotesSubTabType } from "../types"

export interface ClerkStatsCardsProps {
  activeTab: QuotesSubTabType
  handleTabChange: (tab: QuotesSubTabType) => void
  clerkPendingCount: number
  clerkCompletedCount: number
  clerkTotalAssignedCount: number
}

export function ClerkStatsCards({
  activeTab,
  handleTabChange,
  clerkPendingCount,
  clerkCompletedCount,
  clerkTotalAssignedCount,
}: ClerkStatsCardsProps) {
  return (
    <>
      {/* Clerk Card 1: Pending Odoo Entry */}
      <Card
        className={`cursor-pointer border transition-all duration-200 ${
          activeTab === "odoo"
            ? "border-indigo-500/50 bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/20"
            : "border-border/70 bg-card/40 hover:border-border"
        }`}
        onClick={() => handleTabChange("odoo")}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-indigo-500 uppercase">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>Pending Odoo Entry</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-foreground">
              {clerkPendingCount}
            </div>
          </div>
          <div className="rounded-full bg-indigo-500/20 p-2.5 text-indigo-500">
            <ClipboardCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Clerk Card 2: Completed in Odoo */}
      <Card
        className={`cursor-pointer border transition-all duration-200 ${
          activeTab === "odoo_completed"
            ? "border-emerald-500/50 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20"
            : "border-border/70 bg-card/40 hover:border-border"
        }`}
        onClick={() => handleTabChange("odoo_completed")}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-500 uppercase">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Completed in Odoo</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-foreground">
              {clerkCompletedCount}
            </div>
          </div>
          <div className="rounded-full bg-emerald-500/20 p-2.5 text-emerald-500">
            <CheckSquare className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Clerk Card 3: Total Assigned */}
      <Card
        className={`cursor-pointer border transition-all duration-200 ${
          activeTab === "all_assigned"
            ? "border-primary/50 bg-primary/10 shadow-md ring-2 ring-primary/20"
            : "border-border/70 bg-card/40 hover:border-border"
        }`}
        onClick={() => handleTabChange("all_assigned")}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase">
              <FileText className="h-3.5 w-3.5" />
              <span>Total Assigned</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-foreground">
              {clerkTotalAssignedCount}
            </div>
          </div>
          <div className="rounded-full bg-primary/20 p-2.5 text-primary">
            <FileText className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
