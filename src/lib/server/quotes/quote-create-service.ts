import { NextResponse } from 'next/server';
import SavedQuote from '@/models/SavedQuote';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { triggerPusherEvent } from '@/lib/pusher-server';
import { sendQuoteReviewRequestedEmail, getAppUrl } from '@/lib/email';
import { cacheDelPattern } from '@/lib/redis';

export async function createQuoteService(request: Request, session: any, body: any, headers: Record<string, string>) {
  const currentUsername = session.user.username || session.user.name || '';
  const {
    quoteNumber,
    customerName,
    assignedTo,
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
    attachedUpgrade,
    attachedSealedUnit,
    attachedDoorQuote,
    wantsUpgrade,
    isSupplyOnly,
    isServiceOnly,
    quoteSummaryTotal,
    odooAssignedTo,
    directApprove,
  } = body;

  if (!quoteNumber || typeof quoteNumber !== 'string' || !quoteNumber.trim()) {
    return NextResponse.json(
      { error: 'Quote Number is required' },
      { status: 400, headers }
    );
  }

  if (quoteNumber.length > 60) {
    return NextResponse.json(
      { error: 'Quote Number cannot exceed 60 characters' },
      { status: 400, headers }
    );
  }

  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    return NextResponse.json(
      { error: 'Customer Name is required' },
      { status: 400, headers }
    );
  }

  if (customerName.length > 200) {
    return NextResponse.json(
      { error: 'Customer Name cannot exceed 200 characters' },
      { status: 400, headers }
    );
  }

  if (quoteNotes && typeof quoteNotes === 'string' && quoteNotes.length > 10000) {
    return NextResponse.json(
      { error: 'Quote Notes cannot exceed 10,000 characters' },
      { status: 400, headers }
    );
  }

  if (preparerNotes && typeof preparerNotes === 'string' && preparerNotes.length > 10000) {
    return NextResponse.json(
      { error: 'Preparer Notes cannot exceed 10,000 characters' },
      { status: 400, headers }
    );
  }

  if (windows && Array.isArray(windows) && windows.length > 200) {
    return NextResponse.json(
      { error: 'A quote cannot contain more than 200 window items' },
      { status: 400, headers }
    );
  }

  const cleanQuoteNumber = quoteNumber.trim();
  const cleanCustomerName = customerName.trim();

  // Look up emails for preparer, assigned reviewer, and odoo clerk
  const [preparerUser, reviewerUser, clerkUser] = await Promise.all([
    User.findOne({ username: currentUsername }),
    assignedTo ? User.findOne({ username: { $regex: new RegExp(`^${assignedTo}$`, 'i') } }) : null,
    odooAssignedTo ? User.findOne({ username: { $regex: new RegExp(`^${odooAssignedTo}$`, 'i') } }) : null,
  ]);

  const isDirectApprove = Boolean(directApprove);

  const newQuote = await SavedQuote.create({
    quoteNumber: cleanQuoteNumber,
    customerName: cleanCustomerName,
    status: isDirectApprove ? 'APPROVED' : 'PENDING_REVIEW',
    approvedBy: isDirectApprove ? currentUsername : undefined,
    approvedAt: isDirectApprove ? new Date() : undefined,
    preparedBy: currentUsername,
    preparedByEmail: preparerUser?.email || session.user.email || '',
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
    attachedUpgrade,
    attachedSealedUnit,
    attachedDoorQuote,
    wantsUpgrade,
    isSupplyOnly,
    isServiceOnly,
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
      attachedUpgrade,
      attachedSealedUnit,
      attachedDoorQuote,
      wantsUpgrade,
      isSupplyOnly,
      isServiceOnly,
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

        if (reviewerUser?.email && (reviewerUser as any)?.receiveQuoteEmails !== false && (reviewerUser as any)?.muteNotifications !== true) {
          sendQuoteReviewRequestedEmail({
            toEmail: reviewerUser.email,
            reviewerName: reviewerUsername,
            preparerName: currentUsername,
            quoteNumber,
            customerName,
            preparerNotes,
            appUrl: getAppUrl(request),
          }).catch((emailErr) => console.error('Failed to send reviewer email:', emailErr));
        }
      } catch (notifErr) {
        console.error('Failed to create reviewer notification:', notifErr);
      }
    }
  }

  cacheDelPattern('quotes:badge:*').catch(() => {});

  return NextResponse.json(
    { message: 'Quote submitted for review successfully', quote: newQuote },
    { status: 201, headers }
  );
}

