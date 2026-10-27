import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promo from '@/models/Promo';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cacheDel } from '@/lib/redis';

import mongoose from 'mongoose';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds must be an array of IDs' }, { status: 400 });
    }

    await dbConnect();

    // Directly write to MongoDB collection using bulkWrite to guarantee order is persisted
    const bulkOps = orderedIds.map((id: string, index: number) => {
      let filter: any;
      try {
        filter = { _id: new mongoose.Types.ObjectId(id) };
      } catch {
        filter = { _id: id };
      }
      return {
        updateOne: {
          filter,
          update: { $set: { order: index } },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Promo.collection.bulkWrite(bulkOps);
    }

    cacheDel('promos:active', 'promos:all').catch(() => {});

    return NextResponse.json({ message: 'Promos reordered successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
