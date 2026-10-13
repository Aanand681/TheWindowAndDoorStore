import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
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

    const now = new Date();
    if (now > new Date(user.resetOtpExpiry)) {
      await User.updateOne(
        { _id: user._id },
        { $unset: { resetOtp: '', resetOtpExpiry: '' } },
        { strict: false }
      );
      return NextResponse.json(
        { error: 'The verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.resetOtp !== cleanOtp) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check the code and try again.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetOtp: '', resetOtpExpiry: '' },
      },
      { strict: false }
    );

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
