"use client"

import { useState, useEffect } from "react"

export function useForgotPasswordState() {
  // Wizard Step: 'request' | 'verify' | 'success'
  const [step, setStep] = useState<"request" | "verify" | "success">("request")

  // Form States
  const [identifier, setIdentifier] = useState("")
  const [maskedEmail, setMaskedEmail] = useState("")
  const [isSimulated, setIsSimulated] = useState(false)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Status States
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  // Handle Request OTP (Step 1)
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!identifier.trim()) {
      setError("Please enter your username or registered email.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send recovery code.")
      } else {
        setMaskedEmail(data.maskedEmail || identifier)
        setIsSimulated(Boolean(data.simulated))
        setStep("verify")
        setCooldown(60) // 60s cooldown for resend
        setSuccessMsg(
          `We sent a 6-digit code to ${data.maskedEmail || "your email"}.`
        )
      }
    } catch (err: any) {
      console.error(err)
      setError(
        "A network error occurred. Please check your connection and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return
    setError("")
    setResending(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to resend code.")
      } else {
        setSuccessMsg("A new verification code has been dispatched.")
        setCooldown(60)
      }
    } catch (err: any) {
      console.error(err)
      setError("Failed to resend code. Please try again.")
    } finally {
      setResending(false)
    }
  }

  // Handle Verify OTP & Reset Password (Step 2)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code.")
      return
    }

    if (otp.trim().length !== 6) {
      setError("The verification code must be exactly 6 digits.")
      return
    }

    if (!newPassword) {
      setError("Please enter your new password.")
      return
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to reset password.")
      } else {
        setStep("success")
      }
    } catch (err: any) {
      console.error(err)
      setError("A network error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}
