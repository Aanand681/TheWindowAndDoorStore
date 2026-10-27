import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promo from '@/models/Promo';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cacheDel } from '@/lib/redis';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    await dbConnect();

    // If they are just an ADMIN, allow updating isActive and order
    let updateData = { ...body };
    if (role === 'ADMIN') {
      updateData = {};
      if (body.isActive !== undefined) {
        updateData.isActive = body.isActive;
      }
      if (body.order !== undefined) {
        updateData.order = body.order;
      }
    }

    const updatedPromo = await Promo.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedPromo) {
      return NextResponse.json({ error: 'Promo not found' }, { status: 404 });
    }

    cacheDel('promos:active', 'promos:all').catch(() => {});

    return NextResponse.json({ message: 'Promo updated successfully', promo: updatedPromo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const deletedPromo = await Promo.findByIdAndDelete(id);

    if (!deletedPromo) {
      return NextResponse.json({ error: 'Promo not found' }, { status: 404 });
    }

    cacheDel('promos:active', 'promos:all').catch(() => {});

    return NextResponse.json({ message: 'Promo deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
