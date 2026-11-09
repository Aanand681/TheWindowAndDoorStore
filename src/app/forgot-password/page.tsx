'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Component
} from 'lucide-react';
import {
  useForgotPasswordState,
  RequestOtpStep,
  VerifyOtpStep,
  SuccessStep,
} from '@/components/auth/forgot-password';

export default function ForgotPasswordPage() {
  const {
    step,
    setStep,
    identifier,
    setIdentifier,
    maskedEmail,
    isSimulated,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    loading,
    resending,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    cooldown,
    handleRequestOtp,
    handleResendOtp,
    handleResetPassword,
  } = useForgotPasswordState();

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
              <RequestOtpStep
                identifier={identifier}
                setIdentifier={setIdentifier}
                loading={loading}
                onSubmit={handleRequestOtp}
              />
            )}

            {/* STEP 2: Verify OTP & Set New Password */}
            {step === 'verify' && (
              <VerifyOtpStep
                otp={otp}
                setOtp={setOtp}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                loading={loading}
                resending={resending}
                cooldown={cooldown}
                handleResendOtp={handleResendOtp}
                onUseDifferentAccount={() => {
                  setStep('request');
                  setError('');
                  setSuccessMsg('');
                  setOtp('');
                }}
                onSubmit={handleResetPassword}
              />
            )}

            {/* STEP 3: Success Screen */}
            {step === 'success' && <SuccessStep />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
