'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function SuccessStep() {
  const router = useRouter();

  return (
    <div className="space-y-5 text-center py-2">
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm">
        Your password has been changed securely. You can now use your new password to sign into your account.
      </div>

      <Button
        onClick={() => router.push('/login')}
        className="w-full h-11 text-base font-medium"
      >
        Proceed to Sign In
      </Button>
    </div>
  );
}

