'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={
        className ??
        cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'rounded-full text-muted-foreground hover:text-destructive transition-colors'
        )
      }
      title="Sign out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
