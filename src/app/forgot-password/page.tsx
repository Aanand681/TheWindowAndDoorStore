'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  KeyRound, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  RefreshCw,
  ShieldCheck,
  Component
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard Step: 'request' | 'verify' | 'success'
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');

  // Form States
  const [identifier, setIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status States
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Handle Request OTP (Step 1)
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your username or registered email.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send recovery code.');
      } else {
        setMaskedEmail(data.maskedEmail || identifier);
        setIsSimulated(Boolean(data.simulated));
        setStep('verify');
        setCooldown(60); // 60s cooldown for resend
        setSuccessMsg(`We sent a 6-digit code to ${data.maskedEmail || 'your email'}.`);
      }
    } catch (err: any) {
      console.error(err);
      setError('A network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend code.');
      } else {
        setSuccessMsg('A new verification code has been dispatched.');
        setCooldown(60);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Handle Verify OTP & Reset Password (Step 2)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('The verification code must be exactly 6 digits.');
      return;
    }

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
      } else {
        setStep('success');
      }
    } catch (err: any) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background text-foreground selection:bg-primary/20">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Brand Logo Link to Home / Calculator */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer group"
            title="Window & Door Store - Home / Calculator"
          >
            <Component className="w-6 h-6 transition-transform group-hover:scale-105" />
            <span className="text-xl font-semibold tracking-wider uppercase">Window &amp; Door Store</span>
          </Link>
        </div>

        <Card className="border border-border/80 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
              {step === 'success' ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              ) : step === 'verify' ? (
                <KeyRound className="h-7 w-7" />
              ) : (
                <ShieldCheck className="h-7 w-7" />
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold tracking-tight">
              {step === 'request' && 'Recover Account'}
              {step === 'verify' && 'Verify & Reset Password'}
              {step === 'success' && 'Password Reset Complete!'}
            </CardTitle>

            <CardDescription className="text-sm mt-1">
              {step === 'request' && 'Enter your username or saved email address to receive a 6-digit recovery code.'}
              {step === 'verify' && (
                <>
                  Enter the one-time code sent to <span className="font-semibold text-foreground">{maskedEmail}</span>.
                </>
              )}
              {step === 'success' && 'Your account password has been updated successfully.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Info Notice Banner */}
            {successMsg && step === 'verify' && !error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm border border-emerald-500/20 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Dev Mode Simulation Notice */}
            {isSimulated && step === 'verify' && (
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs border border-amber-500/20">
                <b>Development Mode:</b> Since SMTP credentials are not configured in <code className="font-mono text-xs">.env.local</code>, your 6-digit OTP has been printed directly to the server terminal.
              </div>
            )}

            {/* STEP 1: Request OTP */}
            {step === 'request' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
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
                      Checking account & sending code...
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
            )}

            {/* STEP 2: Verify OTP & Set New Password */}
            {step === 'verify' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* 6-Digit OTP */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      6-Digit Code
                    </Label>
                    <span className="text-xs text-muted-foreground">Expires in 15 mins</span>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-12 text-center text-2xl font-mono tracking-[0.5em] font-bold focus:ring-2"
                    required
                    autoFocus
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || otp.length !== 6 || !newPassword || !confirmPassword} 
                  className="w-full h-11 text-base font-medium shadow-sm transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                {/* Resend & Back controls */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || resending}
                    className="text-primary hover:underline font-medium inline-flex items-center disabled:opacity-50 disabled:no-underline"
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('request');
                      setError('');
                      setSuccessMsg('');
                      setOtp('');
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Use different account
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Success Screen */}
            {step === 'success' && (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
