import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { QuotesSubTabType } from './types';

export interface QuotesFilterToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  activeTab: QuotesSubTabType;
  handleTabChange: (tab: QuotesSubTabType) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  canReview: boolean;
  isClerk: boolean;
  isEmployee: boolean;
  hasOdooAccess: boolean;
  adminPendingCount: number;
  adminOdooCount: number;
  employeeInReviewCount: number;
  employeeOdooDoneCount: number;
  clerkPendingCount: number;
  clerkCompletedCount: number;
  clerkTotalAssignedCount: number;
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
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/40 border border-border/70 p-3 rounded-xl backdrop-blur">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Quote #, Odoo Sales Order #, Customer, Staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8 h-9 bg-background/80 text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
          {canReview && (
            <>
              <Button
                variant={activeTab === 'review' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('review')}
                className="h-7 text-xs font-semibold cursor-pointer"
              >
                Pending ({adminPendingCount})
              </Button>
              <Button
                variant={activeTab === 'odoo' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('odoo')}
                className={`h-7 text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                  adminOdooCount > 0 ? 'text-indigo-500 font-bold' : ''
                }`}
              >
                <span>Odoo Queue</span>
                {adminOdooCount > 0 && (
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {adminOdooCount}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('all')}
                className="h-7 text-xs font-semibold cursor-pointer"
              >
                All Quotes
              </Button>
            </>
          )}

          {isEmployee && (
            <>
              <Button
                variant={activeTab === 'review' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('review')}
                className="h-7 text-xs font-semibold cursor-pointer"
              >
                In Review ({employeeInReviewCount})
              </Button>
              {hasOdooAccess ? (
                <Button
                  variant={activeTab === 'odoo' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleTabChange('odoo')}
                  className={`h-7 text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                    adminOdooCount > 0 ? 'text-indigo-500 font-bold' : ''
                  }`}
                >
                  <span>Odoo Queue</span>
                  {adminOdooCount > 0 && (
                    <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {adminOdooCount}
                    </span>
                  )}
                </Button>
              ) : (
                <Button
                  variant={activeTab === 'odoo_completed' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleTabChange('odoo_completed')}
                  className="h-7 text-xs font-semibold cursor-pointer"
                >
                  Entered in Odoo ({employeeOdooDoneCount})
                </Button>
              )}
              <Button
                variant={activeTab === 'my' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('my')}
                className="h-7 text-xs font-semibold cursor-pointer"
              >
                My History
              </Button>
            </>
          )}

          {isClerk && (
            <>
              <Button
                variant={activeTab === 'odoo' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('odoo')}
                className={`h-7 text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                  clerkPendingCount > 0 ? 'text-indigo-500 font-bold' : ''
                }`}
              >
                <span>Pending Entry</span>
                {clerkPendingCount > 0 && (
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {clerkPendingCount}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === 'odoo_completed' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('odoo_completed')}
                className="h-7 text-xs font-semibold cursor-pointer"
              >
                Completed ({clerkCompletedCount})
              </Button>
              <Button
                variant={activeTab === 'all_assigned' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange('all_assigned')}
                className="h-7 text-xs font-semibold cursor-pointer"
              >
                Total Assigned ({clerkTotalAssignedCount})
              </Button>
            </>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
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
  );
}

