import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    // Check target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protect superadmin from modification via staff management
    if (targetUser.role === 'SUPERADMIN') {
      return NextResponse.json({ error: 'Cannot modify this user' }, { status: 403 });
    }

    // Prevent promoting anyone to SUPERADMIN
    if (body.role === 'SUPERADMIN') {
      return NextResponse.json({ error: 'Cannot promote to superadmin' }, { status: 403 });
    }

    const updateData: any = {};
    if (body.role !== undefined) {
      updateData.role = body.role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';
    }
    if (body.department !== undefined) {
      updateData.department = String(body.department).toUpperCase().trim();
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    // Protect superadmin from deletion
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (targetUser.role === 'SUPERADMIN') {
      return NextResponse.json({ error: 'Cannot delete this user' }, { status: 403 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
