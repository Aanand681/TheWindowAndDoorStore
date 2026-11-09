import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RegionConfig from '@/models/RegionConfig';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cacheDel } from '@/lib/redis';
import { handleApiError } from '@/lib/api-error';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN' && !session.user.canAccessAdmin)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid region ID format' }, { status: 400 });
    }

    await dbConnect();
    const data = await req.json();
    const region = await RegionConfig.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    if (!region) return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    cacheDel('regions:all').catch(() => {});
    return NextResponse.json(region);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN' && !session.user.canAccessAdmin)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid region ID format' }, { status: 400 });
    }

    await dbConnect();
    const region = await RegionConfig.findByIdAndDelete(id);
    if (!region) return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    cacheDel('regions:all').catch(() => {});
    return NextResponse.json({ message: 'Region deleted successfully' });
  } catch (error: any) {
    return handleApiError(error);
  }
}
