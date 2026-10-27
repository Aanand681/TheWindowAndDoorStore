import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SavedQuote from '@/models/SavedQuote';
import User from '@/models/User';
import Department from '@/models/Department';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { triggerPusherEvent } from '@/lib/pusher-server';
import { sendQuoteReviewRequestedEmail, getAppUrl } from '@/lib/email';
import { cacheGet, cacheSet, cacheDelPattern } from '@/lib/redis';

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

    // If requesting badge counts for notifications
    if (countOnly) {
      const cacheKey = `quotes:badge:${currentUser || 'anon'}`;
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return NextResponse.json(cached, { headers: NO_CACHE_HEADERS });
      }

      await dbConnect();

      const userRole = (session.user as any).role;
      const userDept = (session.user as any).department;
      let deptDoc: any = null;
      if (userDept) {
        deptDoc = await Department.findOne({ code: userDept });
      }
      const canReview = userRole === 'ADMIN' || userRole === 'SUPERADMIN' || deptDoc?.permissions?.canReviewQuote === true;
      const canAccessOdooQueue = userRole === 'ADMIN' || userRole === 'SUPERADMIN' || deptDoc?.permissions?.canAccessOdooQueue === true;

      const isSuperAdmin = userRole === 'SUPERADMIN' || currentUser?.toLowerCase() === 'cheeku';

      // Pending reviews specifically assigned to this user (SuperAdmin sees all)
      const pendingReviewCount = isSuperAdmin
        ? await SavedQuote.countDocuments({ status: 'PENDING_REVIEW' })
        : await SavedQuote.countDocuments({
            status: 'PENDING_REVIEW',
            $or: [
              { assignedTo: { $regex: new RegExp(`^${currentUser}$`, 'i') } },
              ...(currentUser?.toLowerCase() === 'admin' ? [{ assignedTo: 'Admin' }, { assignedTo: { $exists: false } }, { assignedTo: '' }] : []),
            ],
          });

      // Pending Odoo entries assigned to this user (or all pending if SuperAdmin)
      const pendingOdooCount = isSuperAdmin
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

      // For pill count:
      // Reviewers count their assigned reviews + any Odoo orders explicitly assigned to them
      // SuperAdmin counts all pending reviews + all pending Odoo orders
      // Clerks count orders assigned to them
      const totalActionableCount = isSuperAdmin
        ? pendingReviewCount + pendingOdooCount
        : canReview
        ? pendingReviewCount + pendingOdooCount
        : pendingOdooCount;

      const badgeData = {
        pendingReviewCount,
        pendingOdooCount,
        totalActionableCount,
        myUpdatesCount,
      };

      cacheSet(cacheKey, badgeData, 30).catch(() => {});

      return NextResponse.json(badgeData, { headers: NO_CACHE_HEADERS });
    }

    await dbConnect();

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
      directApprove = false,
      odooAssignedTo = '',
    } = body;

    if (!quoteNumber || !customerName) {
      return NextResponse.json(
        { error: 'Quote Number and Customer Name are required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    await dbConnect();

    // Look up emails for preparer, assigned reviewer, and odoo clerk
    const [preparerUser, reviewerUser, clerkUser] = await Promise.all([
      User.findOne({ username: currentUsername }),
      assignedTo ? User.findOne({ username: { $regex: new RegExp(`^${assignedTo}$`, 'i') } }) : null,
      odooAssignedTo ? User.findOne({ username: { $regex: new RegExp(`^${odooAssignedTo}$`, 'i') } }) : null,
    ]);

    const isDirectApprove = Boolean(directApprove);

    const newQuote = await SavedQuote.create({
      quoteNumber,
      customerName,
      status: isDirectApprove ? 'APPROVED' : 'PENDING_REVIEW',
      approvedBy: isDirectApprove ? currentUsername : undefined,
      approvedAt: isDirectApprove ? new Date() : undefined,
      preparedBy: currentUsername,
      preparedByEmail: preparerUser?.email || (session.user as any).email || '',
      assignedTo: isDirectApprove ? currentUsername : (reviewerUser?.username || assignedTo),
      assignedToEmail: isDirectApprove ? (preparerUser?.email || '') : (reviewerUser?.email || ''),
      odooAssignedTo: isDirectApprove ? (clerkUser?.username || odooAssignedTo || '') : undefined,
      odooStatus: isDirectApprove && odooAssignedTo ? 'PENDING_ENTRY' : undefined,
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

    if (isDirectApprove && odooAssignedTo) {
      const clerkUsername = clerkUser?.username || odooAssignedTo;
      try {
        const clerkNotif = await Notification.create({
          recipientUsername: clerkUsername,
          senderUsername: currentUsername,
          type: 'QUOTE_ODOO_ASSIGNED',
          title: `Quote #${quoteNumber} Ready for Odoo`,
          message: `${currentUsername} approved Quote #${quoteNumber} (${customerName}) and assigned it to you for Odoo entry.`,
          quoteId: newQuote._id.toString(),
          quoteNumber,
          customerName,
          isRead: false,
        });
        await triggerPusherEvent(`user-${clerkUsername.toLowerCase()}`, 'notification', clerkNotif);
        await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber });
      } catch (err) {
        console.error('Failed to notify Odoo clerk on direct approve:', err);
      }
    } else if (!isDirectApprove) {
      const reviewerUsername = reviewerUser?.username || assignedTo;
      if (reviewerUsername && reviewerUsername.toLowerCase() !== currentUsername.toLowerCase()) {
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

          await triggerPusherEvent(`user-${reviewerUsername.toLowerCase()}`, 'notification', createdNotif);
          await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber });

          // Send email notification to reviewer if opted in
          if (reviewerUser?.email && (reviewerUser as any)?.receiveQuoteEmails !== false && (reviewerUser as any)?.muteNotifications !== true) {
            sendQuoteReviewRequestedEmail({
              toEmail: reviewerUser.email,
              reviewerName: reviewerUsername,
              preparerName: currentUsername,
              quoteNumber,
              customerName,
              preparerNotes,
              appUrl: getAppUrl(request),
            }).catch(emailErr => console.error('Failed to send reviewer email:', emailErr));
          }
        } catch (notifErr) {
          console.error('Failed to create reviewer notification:', notifErr);
        }
      }
    }

    // Invalidate badge counters
    cacheDelPattern('quotes:badge:*').catch(() => {});

    return NextResponse.json(
      { message: 'Quote submitted for review successfully', quote: newQuote },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

