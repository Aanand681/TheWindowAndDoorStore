import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const reviewersOnly = searchParams.get('reviewersOnly') === 'true';
    const assignees = searchParams.get('assignees') === 'true';
    const roleParam = searchParams.get('role');

    if (reviewersOnly || assignees) {
      // Return all staff members eligible for assignment (Employees + Admins, strictly excluding SUPERADMIN)
      const staff = await User.find(
        {
          role: { $nin: ['SUPERADMIN', 'superadmin'] },
          username: { $not: /^cheeku$/i },
        },
        'username role email department'
      ).sort({ username: 1 });
      return NextResponse.json(staff, { headers: NO_CACHE_HEADERS });
    }

    if (roleParam) {
      if (['SUPERADMIN', 'superadmin'].includes(roleParam)) {
        return NextResponse.json([], { headers: NO_CACHE_HEADERS });
      }
      const users = await User.find({ 
        role: roleParam,
        username: { $not: /^cheeku$/i }
      }, '-password').sort({ createdAt: -1 });
      return NextResponse.json(users, { headers: NO_CACHE_HEADERS });
    }

    // Exclude SUPERADMIN for general staff listings
    const users = await User.find({ 
      role: { $nin: ['SUPERADMIN', 'superadmin'] },
      username: { $not: /^cheeku$/i }
    }, '-password').sort({ createdAt: -1 });
    return NextResponse.json(users, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, role, email, department } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Strictly disallow creating a SUPERADMIN account
    if (role === 'SUPERADMIN') {
      return NextResponse.json({ error: 'Creating superadmin accounts is not allowed' }, { status: 403 });
    }

    // Only allow valid staff roles
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';
    const assignedDept = department || (assignedRole === 'ADMIN' ? 'MANAGER' : 'SALES');

    await dbConnect();

    // Check if user exists
    const existing = await User.findOne({ username });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email: email || undefined,
      password: hashedPassword,
      role: assignedRole,
      department: assignedDept,
    });

    return NextResponse.json({ 
      message: 'User created successfully', 
      user: { 
        username: newUser.username, 
        role: newUser.role, 
        department: newUser.department 
      } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
