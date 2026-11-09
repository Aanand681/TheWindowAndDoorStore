'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

interface RequestOtpStepProps {
  identifier: string;
  setIdentifier: (val: string) => void;
  loading: boolean;
  onSubmit: (e?: React.FormEvent) => void;
}

export function RequestOtpStep({
  identifier,
  setIdentifier,
  loading,
  onSubmit,
}: RequestOtpStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Username or Registered Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="identifier"
            type="text"
            placeholder="e.g. jdoe or john@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="pl-9 h-11"
            required
            autoFocus
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !identifier.trim()}
        className="w-full h-11 text-base font-medium shadow-sm transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking account &amp; sending code...
          </>
        ) : (
          'Send Verification Code'
        )}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

