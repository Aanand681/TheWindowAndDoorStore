import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SavedQuote from '@/models/SavedQuote';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

import { triggerPusherEvent } from '@/lib/pusher-server';
import { broadcastSSE } from '@/lib/sse-broker';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalQuotes, flushableCount, starredCount] = await Promise.all([
      SavedQuote.countDocuments(),
      SavedQuote.countDocuments({
        createdAt: { $lte: thirtyDaysAgo },
        isStarred: { $ne: true },
      }),
      SavedQuote.countDocuments({ isStarred: true }),
    ]);

    // Rough estimate: ~3.5 KB per quote JSON
    const estimatedStorageKb = Math.round(totalQuotes * 3.5);

    return NextResponse.json({
      totalQuotes,
      flushableCount,
      starredCount,
      estimatedStorageKb,
      atlasQuotaKb: 512 * 1024, // 512 MB in KB
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const days = parseInt(body.days || '30', 10);
    const thresholdDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    await dbConnect();

    // Delete only unstarred quotes older than threshold
    const result = await SavedQuote.deleteMany({
      createdAt: { $lte: thresholdDate },
      isStarred: { $ne: true },
    });

    if (result.deletedCount > 0) {
      await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', {});
      broadcastSSE({ type: 'QUOTE_COUNT_UPDATED' });
    }

    return NextResponse.json({
      message: `Successfully flushed ${result.deletedCount} quotes older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
