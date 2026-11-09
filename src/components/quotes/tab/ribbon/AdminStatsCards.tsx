'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertCircle, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import type { QuotesSubTabType } from '../types';

export interface AdminStatsCardsProps {
  activeTab: QuotesSubTabType;
  handleTabChange: (tab: QuotesSubTabType) => void;
  adminPendingCount: number;
  adminOdooCount: number;
  adminArchiveCount: number;
}

export function AdminStatsCards({
  activeTab,
  handleTabChange,
  adminPendingCount,
  adminOdooCount,
  adminArchiveCount,
}: AdminStatsCardsProps) {
  return (
    <>
      {/* Admin Card 1: Pending Review */}
      <Card
        className={`border cursor-pointer transition-all duration-200 ${
          activeTab === 'review'
            ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-2 ring-amber-500/20'
            : 'bg-card/40 border-border/70 hover:border-border'
        }`}
        onClick={() => handleTabChange('review')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-foreground">
              {adminPendingCount}
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Admin Card 2: Odoo Entry Queue */}
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
              <span>Odoo Entry Queue</span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-foreground">
              {adminOdooCount}
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-indigo-500/20 text-indigo-500">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Admin Card 3: All Quotes Archive */}
      <Card
        className={`border cursor-pointer transition-all duration-200 ${
          activeTab === 'all'
            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20'
            : 'bg-card/40 border-border/70 hover:border-border'
        }`}
        onClick={() => handleTabChange('all')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Quotes Archive</span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-foreground">
              {adminArchiveCount}
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

