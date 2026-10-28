'use client';

import React, { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
  showQuotesBin?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  currentPath,
  showQuotesBin = true,
  className,
}: AppLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background text-foreground font-sans selection:bg-primary/30', className)}>
      {/* Subtle top ambient radial lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 relative z-10 space-y-6 sm:space-y-8">
        <AppHeader currentPath={currentPath} showQuotesBin={showQuotesBin} />
        <main>{children}</main>
      </div>
    </div>
  );
}
