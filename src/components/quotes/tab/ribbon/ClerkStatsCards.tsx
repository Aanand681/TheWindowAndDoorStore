'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, CheckSquare, FileText } from 'lucide-react';
import type { QuotesSubTabType } from '../types';

export interface ClerkStatsCardsProps {
  activeTab: QuotesSubTabType;
  handleTabChange: (tab: QuotesSubTabType) => void;
  clerkPendingCount: number;
  clerkCompletedCount: number;
  clerkTotalAssignedCount: number;
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
        className={`border cursor-pointer transition-all duration-200 ${
          activeTab === 'odoo'
            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20'
            : 'bg-card/40 border-border/70 hover:border-border'
        }`}
        onClick={() => handleTabChange('odoo')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-indigo-500 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Pending Odoo Entry</span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-foreground">
              {clerkPendingCount}
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-indigo-500/20 text-indigo-500">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Clerk Card 2: Completed in Odoo */}
      <Card
        className={`border cursor-pointer transition-all duration-200 ${
          activeTab === 'odoo_completed'
            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20'
            : 'bg-card/40 border-border/70 hover:border-border'
        }`}
        onClick={() => handleTabChange('odoo_completed')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Completed in Odoo</span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-foreground">
              {clerkCompletedCount}
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-500">
            <CheckSquare className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Clerk Card 3: Total Assigned */}
      <Card
        className={`border cursor-pointer transition-all duration-200 ${
          activeTab === 'all_assigned'
            ? 'bg-primary/10 border-primary/50 shadow-md ring-2 ring-primary/20'
            : 'bg-card/40 border-border/70 hover:border-border'
        }`}
        onClick={() => handleTabChange('all_assigned')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Total Assigned</span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-foreground">
              {clerkTotalAssignedCount}
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-primary/20 text-primary">
            <FileText className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

