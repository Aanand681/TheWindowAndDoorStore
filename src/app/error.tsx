'use client';

import { useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6 p-6 rounded-2xl border border-border/60 bg-card shadow-lg">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            {error.message || 'An unexpected application error occurred.'}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/80 bg-muted/50 p-2 rounded-md">
              Error Digest: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", className: "gap-2 cursor-pointer" })}
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
