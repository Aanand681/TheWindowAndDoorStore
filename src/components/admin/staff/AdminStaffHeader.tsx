'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Briefcase, Component } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import NotificationBell from '@/components/shared/NotificationBell';
import QuotesBinPill from '@/components/quotes/QuotesBinPill';
import SmartBackButton from '@/components/shared/SmartBackButton';

export interface AdminStaffHeaderProps {
  onOpenDeptModal: () => void;
}

export function AdminStaffHeader({ onOpenDeptModal }: AdminStaffHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        <SmartBackButton fallbackUrl="/admin" label="Back to Admin" />
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer group"
          title="Window & Door Store - Home / Calculator"
        >
          <Component className="w-6 h-6 transition-transform group-hover:scale-105" />
          <span className="text-xl font-semibold tracking-wider uppercase">Window &amp; Door Store</span>
        </Link>
        <span className="text-muted-foreground/40 hidden sm:inline">/</span>
        <div className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-base font-semibold tracking-wider uppercase">Staff Directory</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <QuotesBinPill />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenDeptModal}
          className="gap-2 border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold cursor-pointer"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Departments &amp; Permissions</span>
        </Button>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}

