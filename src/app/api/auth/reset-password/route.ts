import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import {
  checkResetPasswordRateLimit,
  recordResetPasswordRequest,
} from '@/lib/login-rate-limiter';
import { cacheSet } from '@/lib/redis';
import { handleApiError } from '@/lib/api-error';

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded
      ? forwarded.split(',')[0].trim()
      : req.headers.get('x-real-ip') || '127.0.0.1';

    const rateLimit = checkResetPasswordRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset attempts. Please wait ${rateLimit.minutesRemaining ?? 15} minute(s) before trying again.`,
        },
        { status: 429 }
      );
    }

    const { identifier, otp, newPassword } = await req.json();

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { error: 'Please enter your username or email address.' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return NextResponse.json(
        { error: 'Please enter the 6-digit verification code.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const cleanOtp = otp.trim();

    await dbConnect();

    const user: any = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { username: { $regex: new RegExp(`^${cleanIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      ],
    }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this username or email.' },
        { status: 404 }
      );
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return NextResponse.json(
        { error: 'No active password reset request found. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Check if max OTP attempts exceeded
    if ((user.resetOtpAttempts || 0) >= 5) {
      await User.updateOne(
        { _id: user._id },
        { $unset: { resetOtp: '', resetOtpExpiry: '', resetOtpAttempts: '' } },
        { strict: false }
      );
      return NextResponse.json(
        { error: 'Too many incorrect verification attempts. This code has been invalidated for security. Please request a new code.' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now > new Date(user.resetOtpExpiry)) {
      await User.updateOne(
        { _id: user._id },
        { $unset: { resetOtp: '', resetOtpExpiry: '', resetOtpAttempts: '' } },
        { strict: false }
      );
      return NextResponse.json(
        { error: 'The verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.resetOtp !== cleanOtp) {
      recordResetPasswordRequest(clientIp);
      const newAttempts = (user.resetOtpAttempts || 0) + 1;
      const remaining = Math.max(0, 5 - newAttempts);

      if (newAttempts >= 5) {
        await User.updateOne(
          { _id: user._id },
          { $unset: { resetOtp: '', resetOtpExpiry: '', resetOtpAttempts: '' } },
          { strict: false }
        );
        return NextResponse.json(
          { error: 'Too many incorrect verification attempts. This code has been invalidated for security. Please request a new code.' },
          { status: 400 }
        );
      }

      await User.updateOne(
        { _id: user._id },
        { $set: { resetOtpAttempts: newAttempts } },
        { strict: false }
      );

      return NextResponse.json(
        { error: `Invalid verification code. You have ${remaining} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // Hash the new password and clear OTP tokens
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetOtp: '', resetOtpExpiry: '', resetOtpAttempts: '' },
      },
      { strict: false }
    );

    // Invalidate any active sessions for this user across all devices
    await cacheSet(`user:revoked:${user._id.toString()}`, Date.now(), 86400).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
