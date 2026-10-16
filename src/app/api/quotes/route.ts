import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SavedQuote from '@/models/SavedQuote';
import User from '@/models/User';
import Department from '@/models/Department';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { triggerPusherEvent } from '@/lib/pusher-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUser = (session.user as any).name || (session.user as any).username;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const preparedBy = searchParams.get('preparedBy');
    const search = searchParams.get('search');
    const countOnly = searchParams.get('countOnly') === 'true';

    await dbConnect();

    // If requesting badge counts for notifications
    if (countOnly) {
      const userRole = (session.user as any).role;
      const userDept = (session.user as any).department;
      let deptDoc: any = null;
      if (userDept) {
        deptDoc = await Department.findOne({ code: userDept });
      }
      const canReview = userRole === 'ADMIN' || userRole === 'SUPERADMIN' || deptDoc?.permissions?.canReviewQuote === true;
      const canAccessOdooQueue = userRole === 'ADMIN' || userRole === 'SUPERADMIN' || deptDoc?.permissions?.canAccessOdooQueue === true;

      // Pending reviews
      const pendingReviewCount = canReview
        ? await SavedQuote.countDocuments({ status: 'PENDING_REVIEW' })
        : await SavedQuote.countDocuments({
            status: 'PENDING_REVIEW',
            assignedTo: { $regex: new RegExp(`^${currentUser}$`, 'i') },
          });

      // Pending Odoo entries assigned to this user (or all pending if authorized)
      const pendingOdooCount = canAccessOdooQueue
        ? await SavedQuote.countDocuments({ odooStatus: 'PENDING_ENTRY' })
        : await SavedQuote.countDocuments({
            odooStatus: 'PENDING_ENTRY',
            odooAssignedTo: { $regex: new RegExp(`^${currentUser}$`, 'i') },
          });

      // Recent approved/modified quotes prepared by this user
      const myUpdatesCount = await SavedQuote.countDocuments({
        preparedBy: { $regex: new RegExp(`^${currentUser}$`, 'i') },
        status: { $in: ['APPROVED', 'MODIFIED', 'RETURNED'] },
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // past 7 days
      });

      const totalActionableCount = canReview
        ? pendingReviewCount + pendingOdooCount
        : pendingOdooCount;

      return NextResponse.json({
        pendingReviewCount,
        pendingOdooCount,
        totalActionableCount,
        myUpdatesCount,
      }, { headers: NO_CACHE_HEADERS });
    }

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (assignedTo) {
      filter.assignedTo = { $regex: new RegExp(`^${assignedTo}$`, 'i') };
    }

    if (preparedBy) {
      filter.preparedBy = { $regex: new RegExp(`^${preparedBy}$`, 'i') };
    }

    if (search) {
      const sRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { customerName: sRegex },
        { quoteNumber: sRegex },
        { preparedBy: sRegex },
      ];
    }

    const quotes = await SavedQuote.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100);

    return NextResponse.json(quotes, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUsername = (session.user as any).name || (session.user as any).username || 'Anonymous';
    const body = await request.json();

    const {
      quoteNumber,
      customerName,
      assignedTo = 'Admin',
      preparerNotes = '',
      windows = [],
      taxTotals = null,
      quoteResult = null,
      quoteNotes = '',
      surchargeRate = 8,
      activePromoId = 'none',
      customJC,
      customMisc,
      customLabour,
      includeJCInPromo,
      includeMiscInPromo,
      includeLabourInPromo,
      quoteSummaryTotal,
    } = body;

    if (!quoteNumber || !customerName) {
      return NextResponse.json(
        { error: 'Quote Number and Customer Name are required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    await dbConnect();

    // Look up emails for preparer and assigned reviewer
    const [preparerUser, reviewerUser] = await Promise.all([
      User.findOne({ username: currentUsername }),
      User.findOne({ username: { $regex: new RegExp(`^${assignedTo}$`, 'i') } }),
    ]);

    const newQuote = await SavedQuote.create({
      quoteNumber,
      customerName,
      status: 'PENDING_REVIEW',
      preparedBy: currentUsername,
      preparedByEmail: preparerUser?.email || (session.user as any).email || '',
      assignedTo: reviewerUser?.username || assignedTo,
      assignedToEmail: reviewerUser?.email || '',
      preparerNotes,
      windows,
      taxTotals,
      quoteResult,
      quoteNotes,
      surchargeRate,
      activePromoId,
      customJC,
      customMisc,
      customLabour,
      includeJCInPromo,
      includeMiscInPromo,
      includeLabourInPromo,
      quoteSummaryTotal,
      isStarred: false,
      initialSnapshot: {
        windows,
        taxTotals,
        quoteResult,
        quoteNotes,
        surchargeRate,
        activePromoId,
        customJC,
        customMisc,
        customLabour,
        includeJCInPromo,
        includeMiscInPromo,
        includeLabourInPromo,
        quoteSummaryTotal,
      },
    });

    // Notify the assigned reviewer (e.g. Kyle) immediately
    const reviewerUsername = reviewerUser?.username || assignedTo;
    if (reviewerUsername) {
      try {
        const createdNotif = await Notification.create({
          recipientUsername: reviewerUsername,
          senderUsername: currentUsername,
          type: 'QUOTE_SUBMITTED',
          title: `New Quote #${quoteNumber} for Review`,
          message: `${currentUsername} submitted quote #${quoteNumber} (${customerName}) for your review.`,
          quoteId: newQuote._id.toString(),
          quoteNumber,
          customerName,
          isRead: false,
        });

        // Instant Real-Time Push via Pusher (Serverless WebSockets)
        await triggerPusherEvent(`user-${reviewerUsername.toLowerCase()}`, 'notification', createdNotif);
        await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber });
      } catch (notifErr) {
        console.error('Failed to create reviewer notification:', notifErr);
      }
    }


    return NextResponse.json(
      { message: 'Quote submitted for review successfully', quote: newQuote },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

