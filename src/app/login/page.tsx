'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to app automatically
  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          router.replace('/');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      usernameOrEmail: username,
      password: password,
    });

    if (res?.error) {
      setError('Invalid username or password. Please try again.');
      setLoading(false);
    } else {
      try {
        const profRes = await fetch('/api/profile');
        if (profRes.ok) {
          const prof = await profRes.json();
          if (prof.landingPage === 'admin' && (prof.role === 'ADMIN' || prof.role === 'SUPERADMIN')) {
            router.push('/admin');
            router.refresh();
            return;
          } else if (prof.landingPage === 'quotes') {
            router.push('/quotes');
            router.refresh();
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching landing page preference:', err);
      }
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo / Brand */}
      <div className="relative z-10 mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-8 ring-primary/5">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          The Window & Door Store
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Staff Portal — Sign in to continue
        </p>
      </div>

      {/* Card */}
      <Card className="relative z-10 w-full max-w-md border border-border/60 bg-card/90 shadow-2xl backdrop-blur-sm">
        <CardContent className="pt-6 pb-8 px-7 space-y-5">

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm animate-in fade-in duration-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Username or Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  autoFocus
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              id="login-submit"
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full h-11 text-base font-semibold mt-2 shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Forgot password — standard placement below submit */}
            <div className="text-center pt-1">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="relative z-10 mt-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} The Window & Door Store. All rights reserved.
      </p>
    </div>
  );
}
