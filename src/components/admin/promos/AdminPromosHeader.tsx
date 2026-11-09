'use client';

import React from 'react';
import Link from 'next/link';
import { Component, Tag } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import NotificationBell from '@/components/shared/NotificationBell';
import QuotesBinPill from '@/components/quotes/QuotesBinPill';
import SmartBackButton from '@/components/shared/SmartBackButton';

export function AdminPromosHeader() {
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
          <Tag className="w-5 h-5 text-primary" />
          <span className="text-base font-semibold tracking-wider uppercase">Promos &amp; Sales</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <QuotesBinPill />
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}

