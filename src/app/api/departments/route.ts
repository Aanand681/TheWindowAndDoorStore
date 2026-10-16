import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Department, { DEFAULT_DEPARTMENTS } from '@/models/Department';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    let departments = await Department.find({}).sort({ isSystem: -1, createdAt: 1 });
    
    // Seed default departments if none exist
    if (!departments || departments.length === 0) {
      await Department.insertMany(DEFAULT_DEPARTMENTS);
      departments = await Department.find({}).sort({ isSystem: -1, createdAt: 1 });
    }

    return NextResponse.json(departments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Only Superadmin can create custom departments' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, description, permissions } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
    }

    await dbConnect();

    const existing = await Department.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'A department with this code already exists' }, { status: 400 });
    }

    const newDept = await Department.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description || '',
      isSystem: false,
      permissions: permissions || {},
    });

    return NextResponse.json({ message: 'Department created successfully', department: newDept }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Only Superadmin can update department permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    await dbConnect();
    const dept = await Department.findById(id);
    if (!dept) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    if (permissions) {
      dept.permissions = { ...dept.permissions, ...permissions };
    }
    if (name) dept.name = name.trim();
    if (description !== undefined) dept.description = description.trim();

    await dept.save();

    return NextResponse.json({ message: 'Department updated successfully', department: dept });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
