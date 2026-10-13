import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    // Exclude SUPERADMIN so superadmin details are never exposed to the frontend
    const users = await User.find({ role: { $ne: 'SUPERADMIN' } }, '-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, role, email } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Strictly disallow creating a SUPERADMIN account
    if (role === 'SUPERADMIN') {
      return NextResponse.json({ error: 'Creating superadmin accounts is not allowed' }, { status: 403 });
    }

    // Only allow valid staff roles
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';

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
    });

    return NextResponse.json({ message: 'User created successfully', user: { username: newUser.username, role: newUser.role } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
