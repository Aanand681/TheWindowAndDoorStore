import React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { QuotesSubTabType } from "./types"

export interface QuotesFilterToolbarProps {
  search: string
  setSearch: (val: string) => void
  activeTab: QuotesSubTabType
  handleTabChange: (tab: QuotesSubTabType) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  canReview: boolean
  isClerk: boolean
  isEmployee: boolean
  hasOdooAccess: boolean
  adminPendingCount: number
  adminOdooCount: number
  employeeInReviewCount: number
  employeeOdooDoneCount: number
  clerkPendingCount: number
  clerkCompletedCount: number
  clerkTotalAssignedCount: number
}

export function QuotesFilterToolbar({
  search,
  setSearch,
  activeTab,
  handleTabChange,
  statusFilter,
  setStatusFilter,
  canReview,
  isClerk,
  isEmployee,
  hasOdooAccess,
  adminPendingCount,
  adminOdooCount,
  employeeInReviewCount,
  employeeOdooDoneCount,
  clerkPendingCount,
  clerkCompletedCount,
  clerkTotalAssignedCount,
}: QuotesFilterToolbarProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/40 p-3 backdrop-blur sm:flex-row">
      <div className="relative w-full sm:w-96">
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Quote #, Odoo Sales Order #, Customer, Staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 bg-background/80 pr-8 pl-9 text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute top-2.5 right-2.5 cursor-pointer text-xs font-bold text-muted-foreground hover:text-foreground"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1">
          {canReview && (
            <>
              <Button
                variant={activeTab === "review" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("review")}
                className="h-7 cursor-pointer text-xs font-semibold"
              >
                Pending ({adminPendingCount})
              </Button>
              <Button
                variant={activeTab === "odoo" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("odoo")}
                className={`flex h-7 cursor-pointer items-center gap-1.5 text-xs font-semibold ${
                  adminOdooCount > 0 ? "font-bold text-indigo-500" : ""
                }`}
              >
                <span>Odoo Queue</span>
                {adminOdooCount > 0 && (
                  <span className="py-0.2 rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                    {adminOdooCount}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("all")}
                className="h-7 cursor-pointer text-xs font-semibold"
              >
                All Quotes
              </Button>
            </>
          )}

          {isEmployee && (
            <>
              <Button
                variant={activeTab === "review" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("review")}
                className="h-7 cursor-pointer text-xs font-semibold"
              >
                In Review ({employeeInReviewCount})
              </Button>
              {hasOdooAccess ? (
                <Button
                  variant={activeTab === "odoo" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleTabChange("odoo")}
                  className={`flex h-7 cursor-pointer items-center gap-1.5 text-xs font-semibold ${
                    adminOdooCount > 0 ? "font-bold text-indigo-500" : ""
                  }`}
                >
                  <span>Odoo Queue</span>
                  {adminOdooCount > 0 && (
                    <span className="py-0.2 rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                      {adminOdooCount}
                    </span>
                  )}
                </Button>
              ) : (
                <Button
                  variant={
                    activeTab === "odoo_completed" ? "secondary" : "ghost"
                  }
                  size="sm"
                  onClick={() => handleTabChange("odoo_completed")}
                  className="h-7 cursor-pointer text-xs font-semibold"
                >
                  Entered in Odoo ({employeeOdooDoneCount})
                </Button>
              )}
              <Button
                variant={activeTab === "my" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("my")}
                className="h-7 cursor-pointer text-xs font-semibold"
              >
                My History
              </Button>
            </>
          )}

          {isClerk && (
            <>
              <Button
                variant={activeTab === "odoo" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("odoo")}
                className={`flex h-7 cursor-pointer items-center gap-1.5 text-xs font-semibold ${
                  clerkPendingCount > 0 ? "font-bold text-indigo-500" : ""
                }`}
              >
                <span>Pending Entry</span>
                {clerkPendingCount > 0 && (
                  <span className="py-0.2 rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                    {clerkPendingCount}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === "odoo_completed" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("odoo_completed")}
                className="h-7 cursor-pointer text-xs font-semibold"
              >
                Completed ({clerkCompletedCount})
              </Button>
              <Button
                variant={activeTab === "all_assigned" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("all_assigned")}
                className="h-7 cursor-pointer text-xs font-semibold"
              >
                Total Assigned ({clerkTotalAssignedCount})
              </Button>
            </>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 cursor-pointer rounded-lg border border-border bg-background px-2.5 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="MODIFIED">Modified &amp; Approved</option>
          <option value="RETURNED">Returned</option>
          <option value="ODOO_PENDING">Odoo: Pending Entry</option>
          <option value="ODOO_COMPLETED">Odoo: Entered / Completed</option>
        </select>
      </div>
    </div>
  )
}
