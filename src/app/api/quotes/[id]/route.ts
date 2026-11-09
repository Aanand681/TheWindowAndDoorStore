import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SavedQuote from '@/models/SavedQuote';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { triggerPusherEvent } from '@/lib/pusher-server';
import { cacheDelPattern } from '@/lib/redis';
import { handleApiError } from '@/lib/api-error';
import { checkQuoteUpdateSecurity } from '@/lib/server/quotes/quote-update-security';
import { buildQuoteUpdatePayload } from '@/lib/server/quotes/quote-update-payload';
import { dispatchQuoteUpdateNotifications } from '@/lib/server/quotes/quote-update-notifications';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });

    const { id } = await params;
    if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid quote ID format' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await dbConnect();

    const quote = await SavedQuote.findById(id).lean();
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json(quote, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const reviewerUsername = session.user.username || session.user.name || '';
    const userRole = session.user.role;
    const { id } = await params;
    const body = await request.json();

    await dbConnect();

    const existingQuote = await SavedQuote.findById(id);
    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    // Star toggle fast-path
    if (body.isStarred !== undefined && Object.keys(body).length === 1) {
      const updated = await SavedQuote.findByIdAndUpdate(
        id,
        { $set: { isStarred: Boolean(body.isStarred) } },
        { new: true }
      );
      return NextResponse.json({ message: 'Starred status updated', quote: updated }, { headers: NO_CACHE_HEADERS });
    }

    // Security and permission check
    const sec = await checkQuoteUpdateSecurity({ session, existingQuote, body });
    if (!sec.allowed) {
      return NextResponse.json({ error: sec.error }, { status: sec.statusCode || 403, headers: NO_CACHE_HEADERS });
    }

    // Build update payload
    const payloadRes = await buildQuoteUpdatePayload({
      id,
      body,
      existingQuote,
      reviewerUsername,
      userRole,
    });
    if (payloadRes.error) {
      return NextResponse.json({ error: payloadRes.error }, { status: payloadRes.statusCode || 400, headers: NO_CACHE_HEADERS });
    }

    const { updateData, newStatus, isReviewAction } = payloadRes;

    // Direct atomic update in MongoDB
    const updatedQuote = await SavedQuote.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    if (!updatedQuote) {
      return NextResponse.json({ error: 'Failed to update quote in database' }, { status: 500, headers: NO_CACHE_HEADERS });
    }

    // Notifications and emails
    await dispatchQuoteUpdateNotifications({
      request,
      id,
      body,
      existingQuote,
      updatedQuote,
      newStatus: newStatus || '',
      isReviewAction: Boolean(isReviewAction),
      reviewerUsername,
      session,
    });

    // Invalidate badge counters
    cacheDelPattern('quotes:badge:*').catch(() => {});

    return NextResponse.json({
      message: isReviewAction ? `Quote marked as ${newStatus}` : 'Quote updated successfully',
      quote: updatedQuote,
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });

    const role = session.user.role;
    const { id } = await params;

    if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid quote ID format' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await dbConnect();

    const quote = await SavedQuote.findById(id);
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    // Only Admin, SuperAdmin, or the preparer can delete
    const currentUser = session.user.username || session.user.name || '';
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && quote.preparedBy !== currentUser) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403, headers: NO_CACHE_HEADERS });
    }

    await SavedQuote.findByIdAndDelete(id);

    // Broadcast deletion in real-time
    await triggerPusherEvent('global-quotes', 'QUOTE_DELETED', {
      quoteId: id,
      quoteNumber: quote.quoteNumber,
      deletedBy: currentUser,
    });
    await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', {
      quoteNumber: quote.quoteNumber,
    });

    // Invalidate badge counters
    cacheDelPattern('quotes:badge:*').catch(() => {});

    return NextResponse.json({ message: 'Quote deleted successfully' }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS);
  }
}
