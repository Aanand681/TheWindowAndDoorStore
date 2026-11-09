'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Map, Plus, Component } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import NotificationBell from '@/components/shared/NotificationBell';
import QuotesBinPill from '@/components/quotes/QuotesBinPill';
import SmartBackButton from '@/components/shared/SmartBackButton';

interface AdminRegionsHeaderProps {
  onOpenCreate: () => void;
}

export function AdminRegionsHeader({ onOpenCreate }: AdminRegionsHeaderProps) {
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
          <span className="text-xl font-semibold tracking-wider uppercase">
            Window &amp; Door Store
          </span>
        </Link>
        <span className="text-muted-foreground/40 hidden sm:inline">/</span>
        <div className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Map className="w-5 h-5 text-primary" />
          <span className="text-base font-semibold tracking-wider uppercase">
            Region Pricing &amp; Defaults
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <QuotesBinPill />
        <Button
          onClick={onOpenCreate}
          size="sm"
          className="bg-primary text-primary-foreground font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Region</span>
        </Button>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}

