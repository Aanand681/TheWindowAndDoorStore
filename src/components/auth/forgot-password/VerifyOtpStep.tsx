"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react"

interface VerifyOtpStepProps {
  otp: string
  setOtp: (val: string) => void
  newPassword: string
  setNewPassword: (val: string) => void
  confirmPassword: string
  setConfirmPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  loading: boolean
  resending: boolean
  cooldown: number
  handleResendOtp: () => void
  onUseDifferentAccount: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function VerifyOtpStep({
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
  cooldown,
  handleResendOtp,
  onUseDifferentAccount,
  onSubmit,
}: VerifyOtpStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* 6-Digit OTP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="otp"
            className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
          >
            6-Digit Code
          </Label>
          <span className="text-xs text-muted-foreground">
            Expires in 15 mins
          </span>
        </div>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="h-12 text-center font-mono text-2xl font-bold tracking-[0.5em] focus:ring-2"
          required
          autoFocus
        />
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label
          htmlFor="newPassword"
          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
        >
          New Password
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-11 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm New Password */}
      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
        >
          Confirm New Password
        </Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Re-type new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-11"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={
          loading || otp.length !== 6 || !newPassword || !confirmPassword
        }
        className="h-11 w-full text-base font-medium shadow-sm transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Password...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>

      {/* Resend & Back controls */}
      <div className="flex items-center justify-between pt-2 text-xs">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={cooldown > 0 || resending}
          className="inline-flex items-center font-medium text-primary hover:underline disabled:no-underline disabled:opacity-50"
        >
          <RefreshCw
            className={`mr-1 h-3 w-3 ${resending ? "animate-spin" : ""}`}
          />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
        </button>

        <button
          type="button"
          onClick={onUseDifferentAccount}
          className="text-muted-foreground hover:text-foreground"
        >
          Use different account
        </button>
      </div>
    </form>
  )
}
