import React from "react"
import type { QuotesSubTabType } from "./types"
import { AdminStatsCards } from "./ribbon/AdminStatsCards"
import { EmployeeStatsCards } from "./ribbon/EmployeeStatsCards"
import { ClerkStatsCards } from "./ribbon/ClerkStatsCards"

export interface QuotesStatsRibbonProps {
  canReview: boolean
  isEmployee: boolean
  isClerk: boolean
  hasOdooAccess: boolean
  activeTab: QuotesSubTabType
  handleTabChange: (tab: QuotesSubTabType) => void
  adminPendingCount: number
  adminOdooCount: number
  adminArchiveCount: number
  employeeInReviewCount: number
  employeeOdooDoneCount: number
  employeeHistoryCount: number
  clerkPendingCount: number
  clerkCompletedCount: number
  clerkTotalAssignedCount: number
}

export function QuotesStatsRibbon({
  canReview,
  isEmployee,
  isClerk,
  hasOdooAccess: _hasOdooAccess,
  activeTab,
  handleTabChange,
  adminPendingCount,
  adminOdooCount,
  adminArchiveCount,
  employeeInReviewCount,
  employeeOdooDoneCount,
  employeeHistoryCount,
  clerkPendingCount,
  clerkCompletedCount,
  clerkTotalAssignedCount,
}: QuotesStatsRibbonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {canReview && (
        <AdminStatsCards
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          adminPendingCount={adminPendingCount}
          adminOdooCount={adminOdooCount}
          adminArchiveCount={adminArchiveCount}
        />
      )}

      {isEmployee && (
        <EmployeeStatsCards
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          employeeInReviewCount={employeeInReviewCount}
          employeeOdooDoneCount={employeeOdooDoneCount}
          employeeHistoryCount={employeeHistoryCount}
        />
      )}

      {isClerk && (
        <ClerkStatsCards
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          clerkPendingCount={clerkPendingCount}
          clerkCompletedCount={clerkCompletedCount}
          clerkTotalAssignedCount={clerkTotalAssignedCount}
        />
      )}
    </div>
  )
}
