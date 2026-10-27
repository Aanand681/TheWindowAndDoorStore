import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Promo from '@/models/Promo';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const cacheKey = activeOnly ? 'promos:active' : 'promos:all';

    // 1. Check Redis Cache
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    // 2. Fetch from MongoDB
    await dbConnect();
    const query = activeOnly ? { isActive: true } : {};
    const promos = await Promo.find(query).sort({ order: 1, createdAt: -1 });

    // 3. Store in Redis (1 hour TTL)
    cacheSet(cacheKey, promos, 3600).catch(() => {});
    
    return NextResponse.json(promos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    const count = await Promo.countDocuments();
    const newPromo = await Promo.create({
      ...body,
      order: body.order !== undefined ? body.order : count,
    });

    // Invalidate promo caches
    cacheDel('promos:active', 'promos:all').catch(() => {});

    return NextResponse.json({ message: 'Promo created successfully', promo: newPromo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
