import { NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { sendOtpEmail, maskEmail } from "@/lib/email"
import {
  checkForgotPasswordRateLimit,
  recordForgotPasswordRequest,
} from "@/lib/login-rate-limiter"

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get("x-forwarded-for")
    const clientIp = forwarded
      ? forwarded.split(",")[0].trim()
      : req.headers.get("x-real-ip") || "127.0.0.1"

    const rateLimit = checkForgotPasswordRateLimit(clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please wait ${rateLimit.minutesRemaining ?? 15} minute(s) before trying again.`,
        },
        { status: 429 }
      )
    }

    const { identifier } = await req.json()

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { error: "Please enter your username or email address." },
        { status: 400 }
      )
    }

    const cleanIdentifier = identifier.trim()

    await dbConnect()

    // Search user by email (case-insensitive) or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        {
          username: {
            $regex: new RegExp(
              `^${cleanIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i"
            ),
          },
        },
      ],
    })

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this username or email." },
        { status: 404 }
      )
    }

    if (!user.email) {
      return NextResponse.json(
        {
          error:
            "This account does not have a saved recovery email. Please contact an administrator to reset your password.",
        },
        { status: 400 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          error:
            "This account has been deactivated. Please contact an administrator.",
        },
        { status: 403 }
      )
    }

    // Record rate limit attempt
    recordForgotPasswordRequest(clientIp)

    // Generate 6-digit cryptographic numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await User.updateOne(
      { _id: user._id },
      { $set: { resetOtp: otp, resetOtpExpiry: expiry, resetOtpAttempts: 0 } },
      { strict: false }
    )

    // Send email
    const emailResult = await sendOtpEmail(user.email, otp)

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error:
            emailResult.error ||
            "Failed to send recovery email. Please try again later.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${maskEmail(user.email)}`,
      maskedEmail: maskEmail(user.email),
      simulated: emailResult.simulated || false,
    })
  } catch (error: any) {
    console.error("Error in forgot-password API:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    )
  }
}
