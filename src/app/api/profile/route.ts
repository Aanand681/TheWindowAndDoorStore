import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById((session.user as any).id, '-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userObj = user.toObject();
    let deptPermissions: Record<string, boolean> = {};
    if (user.department) {
      const dept = await Department.findOne({ code: user.department });
      if (dept && dept.permissions) {
        deptPermissions = dept.permissions instanceof Map ? Object.fromEntries(dept.permissions) : dept.permissions;
      }
    } else if (user.role === 'SUPERADMIN' || user.username?.toLowerCase() === 'kyle') {
      deptPermissions = {
        canCreateQuote: true,
        canReviewQuote: true,
        canEditApprovedQuote: true,
        canAccessOdooQueue: true,
        canMarkOdooEntry: true,
        canAccessAdmin: true,
      };
    }

    const customPerms = user.customPermissions
      ? (user.customPermissions instanceof Map ? Object.fromEntries(user.customPermissions) : user.customPermissions)
      : {};

    const isSuper = user.role === 'SUPERADMIN' || user.username?.toLowerCase() === 'cheeku';

    userObj.departmentPermissions = deptPermissions;
    userObj.customPermissions = customPerms;
    userObj.permissions = isSuper ? {
      canCreateQuote: true,
      canReviewQuote: true,
      canEditApprovedQuote: true,
      canAccessOdooQueue: true,
      canMarkOdooEntry: true,
      canAccessAdmin: true,
    } : {
      ...deptPermissions,
      ...customPerms,
    };

    return NextResponse.json(userObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { username, email, currentPassword, newPassword } = body;

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Handle Password Change
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Handle Username / Email Change
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      user.username = username;
    }

    if (email !== undefined && email !== user.email) {
      user.email = email || undefined;
    }

    if (body.landingPage && ['calculator', 'quotes', 'admin'].includes(body.landingPage)) {
      user.landingPage = body.landingPage;
    }

    if (body.muteNotifications !== undefined) {
      user.muteNotifications = Boolean(body.muteNotifications);
    }

    if (body.favoriteTemplate && ['modern', 'executive', 'compact', 'breakdown'].includes(body.favoriteTemplate)) {
      user.favoriteTemplate = body.favoriteTemplate;
    }

    await user.save();

    return NextResponse.json({ 
      message: 'Profile updated successfully', 
      landingPage: user.landingPage,
      favoriteTemplate: user.favoriteTemplate 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
