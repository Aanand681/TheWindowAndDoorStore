'use client';

import React from 'react';
import Link from 'next/link';
import { Component, Calculator, Inbox, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import NotificationBell from '@/components/shared/NotificationBell';
import UserProfileMenu from '@/components/shared/UserProfileMenu';
import QuotesBinPill from '@/components/quotes/QuotesBinPill';
import ToolsMenu from './ToolsMenu';
import { useSession } from 'next-auth/react';

import { cachedFetch, getCachedData } from '@/lib/client-cache';

interface AppHeaderProps {
  currentPath: string;
  showQuotesBin?: boolean;
}

export function AppHeader({ currentPath, showQuotesBin = true }: AppHeaderProps) {
  const sessionResult = useSession();
  const sessionUser = sessionResult?.data?.user as any;
  const [profileUser, setProfileUser] = React.useState<any>(
    () => getCachedData('/api/profile') || null
  );

  React.useEffect(() => {
    if (!profileUser) {
      cachedFetch('/api/profile')
        .then((data) => {
          if (data) setProfileUser(data);
        })
        .catch(() => {});
    }
  }, [profileUser]);

  const user = sessionUser || profileUser;
  const canAccessAdmin = Boolean(
    user?.canAccessAdmin || user?.role === 'SUPERADMIN' || user?.role === 'ADMIN'
  );

  const isCalculatorActive = currentPath === '/calculator' || currentPath === '/';
  const isQuotesActive = currentPath === '/quotes';
  const isStudioActive = currentPath === '/quote-studio';
  const isAdminActive = currentPath.startsWith('/admin');

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
      <Link
        href="/calculator"
        className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer group"
        title="Window & Door Store - Home"
      >
        <Component className="w-6 h-6 transition-transform group-hover:scale-105" />
        <span className="text-xl font-semibold tracking-wider uppercase">Window &amp; Door Store</span>
      </Link>

      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
        <Link
          href="/calculator"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors cursor-pointer',
            isCalculatorActive
              ? 'border-primary text-primary bg-primary/10 hover:bg-primary/15'
              : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
          )}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculator</span>
        </Link>

        <Link
          href="/quotes"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors cursor-pointer',
            isQuotesActive
              ? 'border-amber-500/50 text-amber-500 bg-amber-500/10 hover:bg-amber-500/15'
              : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
          )}
        >
          <Inbox className="w-3.5 h-3.5 text-amber-500" />
          <span>Quotes &amp; Bin</span>
          {showQuotesBin && <QuotesBinPill badgeOnly />}
        </Link>

        <ToolsMenu currentPath={currentPath} />

        {canAccessAdmin && (
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'rounded-full gap-1.5 text-xs font-semibold shadow-sm cursor-pointer',
              isAdminActive
                ? 'border-primary text-primary bg-primary/10 hover:bg-primary/15'
                : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Dashboard</span>
          </Link>
        )}

        <NotificationBell />
        <ThemeToggle />
        <UserProfileMenu user={user} />
      </div>
    </header>
  );
}
