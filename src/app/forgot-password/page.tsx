"use client"

import React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Component,
} from "lucide-react"
import {
  useForgotPasswordState,
  RequestOtpStep,
  VerifyOtpStep,
  SuccessStep,
} from "@/components/auth/forgot-password"

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
  } = useForgotPasswordState()

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 text-foreground selection:bg-primary/20">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Brand Logo Link to Home / Calculator */}
        <div className="text-center">
          <Link
            href="/"
            className="group inline-flex cursor-pointer items-center gap-2 text-primary transition-opacity hover:opacity-80"
            title="Window & Door Store - Home / Calculator"
          >
            <Component className="h-6 w-6 transition-transform group-hover:scale-105" />
            <span className="text-xl font-semibold tracking-wider uppercase">
              Window &amp; Door Store
            </span>
          </Link>
        </div>

        <Card className="border border-border/80 bg-card/95 shadow-2xl backdrop-blur-sm">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
              {step === "success" ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              ) : step === "verify" ? (
                <KeyRound className="h-7 w-7" />
              ) : (
                <ShieldCheck className="h-7 w-7" />
              )}
            </div>

            <CardTitle className="text-2xl font-bold tracking-tight">
              {step === "request" && "Recover Account"}
              {step === "verify" && "Verify & Reset Password"}
              {step === "success" && "Password Reset Complete!"}
            </CardTitle>

            <CardDescription className="mt-1 text-sm">
              {step === "request" &&
                "Enter your username or saved email address to receive a 6-digit recovery code."}
              {step === "verify" && (
                <>
                  Enter the one-time code sent to{" "}
                  <span className="font-semibold text-foreground">
                    {maskedEmail}
                  </span>
                  .
                </>
              )}
              {step === "success" &&
                "Your account password has been updated successfully."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Error Banner */}
            {error && (
              <div className="flex animate-in items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive duration-200 fade-in">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Info Notice Banner */}
            {successMsg && step === "verify" && !error && (
              <div className="flex animate-in items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 duration-200 fade-in dark:text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Dev Mode Simulation Notice */}
            {isSimulated && step === "verify" && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <b>Development Mode:</b> Since SMTP credentials are not
                configured in{" "}
                <code className="font-mono text-xs">.env.local</code>, your
                6-digit OTP has been printed directly to the server terminal.
              </div>
            )}

            {/* STEP 1: Request OTP */}
            {step === "request" && (
              <RequestOtpStep
                identifier={identifier}
                setIdentifier={setIdentifier}
                loading={loading}
                onSubmit={handleRequestOtp}
              />
            )}

            {/* STEP 2: Verify OTP & Set New Password */}
            {step === "verify" && (
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
                  setStep("request")
                  setError("")
                  setSuccessMsg("")
                  setOtp("")
                }}
                onSubmit={handleResetPassword}
              />
            )}

            {/* STEP 3: Success Screen */}
            {step === "success" && <SuccessStep />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
