import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SavedQuote from '@/models/SavedQuote';
import User from '@/models/User';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendQuoteApprovedEmail, sendQuoteReviewRequestedEmail, getAppUrl } from '@/lib/email';
import Notification from '@/models/Notification';
import { detectQuoteChanges } from '@/lib/quote-diff';
import { triggerPusherEvent } from '@/lib/pusher-server';
import { cacheDelPattern } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const quote = await SavedQuote.findById(id).lean();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json(quote, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const reviewerUsername = (session.user as any).name || (session.user as any).username;
    const { id } = await params;
    const body = await request.json();

    await dbConnect();

    const existingQuote = await SavedQuote.findById(id);
    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    const userRole = (session.user as any).role;
    const userDept = (session.user as any).department;

    let deptDoc: any = null;
    if (userDept) {
      deptDoc = await Department.findOne({ code: userDept });
    }
    const deptPerms = deptDoc?.permissions || {};

    const canReviewOrApprove = 
      userRole === 'SUPERADMIN' || 
      userRole === 'ADMIN' || 
      deptPerms.canReviewQuote === true || 
      deptPerms.canApproveQuote === true;

    const canEditApprovedQuote = 
      userRole === 'SUPERADMIN' || 
      userRole === 'ADMIN' || 
      deptPerms.canEditApprovedQuote === true;

    // Once a quote is approved or modified, block everyone without permission from editing details
    const isApprovedOrModified = existingQuote.status === 'APPROVED' || existingQuote.status === 'MODIFIED';
    if (isApprovedOrModified && !canEditApprovedQuote) {
      const isOnlyOdooUpdate = Object.keys(body).every(key => 
        ['odooStatus', 'odooOrderNumber', 'odooCompletedAt', 'odooCompletedBy'].includes(key)
      );
      if (!isOnlyOdooUpdate) {
        return NextResponse.json(
          { error: 'Once a quote is approved, only authorized administrators/reviewers can edit quote specifications.' },
          { status: 403, headers: NO_CACHE_HEADERS }
        );
      }
    }

    // Toggle star/keep status
    if (body.isStarred !== undefined && Object.keys(body).length === 1) {
      const updated = await SavedQuote.findByIdAndUpdate(
        id,
        { $set: { isStarred: Boolean(body.isStarred) } },
        { new: true }
      );
      return NextResponse.json({ message: 'Starred status updated', quote: updated }, { headers: NO_CACHE_HEADERS });
    }

    // Build update payload
    const updateData: any = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.reviewerNotes !== undefined) updateData.reviewerNotes = body.reviewerNotes;
    if (Array.isArray(body.reviewChanges)) updateData.reviewChanges = body.reviewChanges;
    if (body.windows !== undefined) updateData.windows = body.windows;
    if (body.taxTotals !== undefined) updateData.taxTotals = body.taxTotals;
    if (body.quoteResult !== undefined) updateData.quoteResult = body.quoteResult;
    if (body.quoteNotes !== undefined) updateData.quoteNotes = body.quoteNotes;
    if (body.surchargeRate !== undefined) updateData.surchargeRate = body.surchargeRate;
    if (body.activePromoId !== undefined) updateData.activePromoId = body.activePromoId;
    if (body.customerName !== undefined) updateData.customerName = body.customerName;
    if (body.quoteNumber !== undefined) updateData.quoteNumber = body.quoteNumber;
    if (body.preparerNotes !== undefined) updateData.preparerNotes = body.preparerNotes;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
    if (body.isStarred !== undefined) updateData.isStarred = Boolean(body.isStarred);

    // Odoo Post-Approval Workflow Fields
    if (body.odooAssignedTo !== undefined) {
      updateData.odooAssignedTo = body.odooAssignedTo;
      if (body.odooAssignedTo && (!existingQuote.odooStatus || existingQuote.odooStatus === '')) {
        updateData.odooStatus = 'PENDING_ENTRY';
      }
    }
    if (body.odooStatus !== undefined) updateData.odooStatus = body.odooStatus;
    if (body.odooCompletedAt !== undefined) {
      updateData.odooCompletedAt = body.odooCompletedAt ? new Date(body.odooCompletedAt) : null;
    }
    if (body.odooCompletedBy !== undefined) updateData.odooCompletedBy = body.odooCompletedBy;

    if (body.odooStatus === 'COMPLETED') {
      const orderNumber = (body.odooOrderNumber !== undefined ? body.odooOrderNumber : existingQuote.odooOrderNumber || '').trim();
      if (!orderNumber) {
        return NextResponse.json(
          { error: 'Odoo Sales Order # is required to complete order entry.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const duplicateSo = await SavedQuote.findOne({
        _id: { $ne: id },
        odooOrderNumber: { $regex: new RegExp(`^${orderNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (duplicateSo) {
        return NextResponse.json(
          { error: `Odoo Sales Order #${orderNumber} is already assigned to Quote #${duplicateSo.quoteNumber} (${duplicateSo.customerName}). Please enter a unique Sales Order #.` },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      updateData.odooOrderNumber = orderNumber;
      updateData.odooStatus = 'COMPLETED';
      if (existingQuote.odooStatus !== 'COMPLETED') {
        updateData.odooCompletedAt = new Date();
        updateData.odooCompletedBy = reviewerUsername || (session.user as any)?.username || 'Clerk';
      }
    } else if (body.odooOrderNumber !== undefined) {
      updateData.odooOrderNumber = body.odooOrderNumber;
    }

    // Summary price override fields
    if (body.customJC !== undefined) updateData.customJC = body.customJC;
    if (body.customMisc !== undefined) updateData.customMisc = body.customMisc;
    if (body.customLabour !== undefined) updateData.customLabour = body.customLabour;
    if (body.includeJCInPromo !== undefined) updateData.includeJCInPromo = body.includeJCInPromo;
    if (body.includeMiscInPromo !== undefined) updateData.includeMiscInPromo = body.includeMiscInPromo;
    if (body.includeLabourInPromo !== undefined) updateData.includeLabourInPromo = body.includeLabourInPromo;
    if (body.quoteSummaryTotal !== undefined) updateData.quoteSummaryTotal = body.quoteSummaryTotal;

    // 1. Establish baseline from initialSnapshot or existing quote values
    const baseline = existingQuote.initialSnapshot || {
      windows: existingQuote.windows,
      taxTotals: existingQuote.taxTotals,
      quoteResult: existingQuote.quoteResult,
      quoteNotes: existingQuote.quoteNotes,
      surchargeRate: existingQuote.surchargeRate,
      activePromoId: existingQuote.activePromoId,
      customJC: existingQuote.customJC,
      customMisc: existingQuote.customMisc,
      customLabour: existingQuote.customLabour,
      includeJCInPromo: existingQuote.includeJCInPromo,
      includeMiscInPromo: existingQuote.includeMiscInPromo,
      includeLabourInPromo: existingQuote.includeLabourInPromo,
      quoteSummaryTotal: existingQuote.quoteSummaryTotal,
    };

    if (!existingQuote.initialSnapshot) {
      updateData.initialSnapshot = baseline;
    }

    // 2. Build target state for comparison
    const targetState = {
      ...(typeof existingQuote.toObject === 'function' ? existingQuote.toObject() : existingQuote),
      ...updateData,
    };

    // 3. Automatically detect all changes against baseline
    const autoDetectedChanges = detectQuoteChanges(baseline, targetState);
    const clientChanges = Array.isArray(body.reviewChanges) ? body.reviewChanges : [];
    const mergedChanges = Array.from(new Set([...autoDetectedChanges, ...clientChanges]));

    if (mergedChanges.length > 0) {
      updateData.reviewChanges = mergedChanges;
      // If approving a quote that has any modified prices or items, GUARANTEE status is MODIFIED
      if (body.status === 'APPROVED' || body.status === 'MODIFIED' || updateData.status === 'APPROVED') {
        updateData.status = 'MODIFIED';
      }
    } else {
      if (Array.isArray(body.reviewChanges)) {
        updateData.reviewChanges = body.reviewChanges;
      }
    }

    const newStatus = updateData.status || body.status;
    const isApproval = (newStatus === 'APPROVED' || newStatus === 'MODIFIED') && existingQuote.status === 'PENDING_REVIEW';

    if (isApproval) {
      const assignedClerk = (body.odooAssignedTo !== undefined ? body.odooAssignedTo : (updateData.odooAssignedTo || existingQuote.odooAssignedTo || '')).trim();
      if (!assignedClerk) {
        return NextResponse.json(
          { error: 'Please select an Odoo clerk before approving the quote.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }
      updateData.odooAssignedTo = assignedClerk;
      if (!existingQuote.odooStatus || existingQuote.odooStatus === '') {
        updateData.odooStatus = 'PENDING_ENTRY';
      }
    }

    // A review action only occurs when body.status is explicitly passed (e.g. approving, modifying, returning from review)
    // and is NOT an Odoo clerk completing or updating order numbers
    const isReviewAction = Boolean(
      body.status &&
      ['APPROVED', 'MODIFIED', 'RETURNED'].includes(body.status) &&
      (existingQuote.status === 'PENDING_REVIEW' || body.status === 'RETURNED' || body.status !== existingQuote.status)
    );

    if (isReviewAction) {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = reviewerUsername || 'Admin';
      updateData.reviewedByRole = userRole || 'ADMIN';
    }

    // Direct atomic update in MongoDB
    const updatedQuote = await SavedQuote.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    if (!updatedQuote) {
      return NextResponse.json({ error: 'Failed to update quote in database' }, { status: 500, headers: NO_CACHE_HEADERS });
    }

    // Handle reassignment notification
    if (body.assignedTo && body.assignedTo !== existingQuote.assignedTo) {
      try {
        const newAssigneeUser = await User.findOne({ username: { $regex: new RegExp(`^${body.assignedTo}$`, 'i') } });
        if (newAssigneeUser?.email) {
          await SavedQuote.findByIdAndUpdate(id, { $set: { assignedToEmail: newAssigneeUser.email } });
        }
        const assignNotif = await Notification.create({
          recipientUsername: updatedQuote.assignedTo,
          senderUsername: reviewerUsername || 'Staff',
          type: 'QUOTE_SUBMITTED',
          title: `Quote #${updatedQuote.quoteNumber} Assigned for Review`,
          message: `${reviewerUsername || 'A team member'} assigned quote #${updatedQuote.quoteNumber} for ${updatedQuote.customerName} to you.`,
          quoteId: updatedQuote._id.toString(),
          quoteNumber: updatedQuote.quoteNumber,
          customerName: updatedQuote.customerName,
          isRead: false,
        });

        await triggerPusherEvent(`user-${updatedQuote.assignedTo.toLowerCase()}`, 'notification', assignNotif);
        await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber: updatedQuote.quoteNumber });

        // Dispatch review requested email to new assignee if opted in
        if (newAssigneeUser?.email && (newAssigneeUser as any)?.receiveQuoteEmails !== false && (newAssigneeUser as any)?.muteNotifications !== true) {
          sendQuoteReviewRequestedEmail({
            toEmail: newAssigneeUser.email,
            reviewerName: updatedQuote.assignedTo,
            preparerName: reviewerUsername || 'Staff',
            quoteNumber: updatedQuote.quoteNumber,
            customerName: updatedQuote.customerName,
            preparerNotes: updatedQuote.preparerNotes,
            appUrl: getAppUrl(request),
          }).catch(err => console.error('Failed to send reassignment review email:', err));
        }
      } catch (assignErr) {
        console.error('Failed to create reassignment notification:', assignErr);
      }
    }

    // Handle resubmission notification for returned quotes
    if (newStatus === 'PENDING_REVIEW' && existingQuote.status === 'RETURNED') {
      try {
        const resubmitNotif = await Notification.create({
          recipientUsername: updatedQuote.assignedTo,
          senderUsername: updatedQuote.preparedBy,
          type: 'QUOTE_SUBMITTED',
          title: `Quote #${updatedQuote.quoteNumber} Resubmitted for Review`,
          message: `${updatedQuote.preparedBy} revised and resubmitted quote #${updatedQuote.quoteNumber} for ${updatedQuote.customerName}.`,
          quoteId: updatedQuote._id.toString(),
          quoteNumber: updatedQuote.quoteNumber,
          customerName: updatedQuote.customerName,
          isRead: false,
        });

        await triggerPusherEvent(`user-${updatedQuote.assignedTo.toLowerCase()}`, 'notification', resubmitNotif);
        await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber: updatedQuote.quoteNumber });
      } catch (resubmitErr) {
        console.error('Failed to create resubmit notification:', resubmitErr);
      }
    }

    // If review action was taken, send in-app notification and email
    if (isReviewAction) {
      const preparerUser = await User.findOne({ username: updatedQuote.preparedBy });
      const reviewerDisplay = updatedQuote.reviewedBy || reviewerUsername || updatedQuote.assignedTo || 'Admin';

      // 1. Create In-App Notification (unless user muted notifications)
      if (updatedQuote.preparedBy && preparerUser?.muteNotifications !== true) {
        try {
          let notifTitle = `Quote #${updatedQuote.quoteNumber} Approved`;
          let notifMsg = `${reviewerDisplay} approved your quote for ${updatedQuote.customerName}.`;
          let notifType: 'QUOTE_APPROVED' | 'QUOTE_MODIFIED' | 'QUOTE_RETURNED' = 'QUOTE_APPROVED';

          if (newStatus === 'MODIFIED') {
            notifTitle = `Quote #${updatedQuote.quoteNumber} Modified & Approved`;
            notifMsg = `${reviewerDisplay} adjusted values and approved your quote for ${updatedQuote.customerName}.`;
            notifType = 'QUOTE_MODIFIED';
          } else if (newStatus === 'RETURNED') {
            notifTitle = `Quote #${updatedQuote.quoteNumber} Returned with Notes`;
            notifMsg = `${reviewerDisplay} returned your quote for revision: "${updatedQuote.reviewerNotes || 'Please review items'}"`;
            notifType = 'QUOTE_RETURNED';
          }

          const actionNotif = await Notification.create({
            recipientUsername: updatedQuote.preparedBy,
            senderUsername: reviewerDisplay,
            type: notifType,
            title: notifTitle,
            message: notifMsg,
            quoteId: updatedQuote._id.toString(),
            quoteNumber: updatedQuote.quoteNumber,
            customerName: updatedQuote.customerName,
            reviewChanges: updatedQuote.reviewChanges || [],
            isRead: false,
          });

          await triggerPusherEvent(`user-${updatedQuote.preparedBy.toLowerCase()}`, 'notification', actionNotif);
          await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber: updatedQuote.quoteNumber });
        } catch (notifErr) {
          console.error('Failed to create in-app notification:', notifErr);
        }
      }

        // 3. Send email notification (if email exists, not muted, and user has opted into quote emails)
        try {
          const recipientEmail = updatedQuote.preparedByEmail || preparerUser?.email;
          if (recipientEmail && preparerUser?.muteNotifications !== true && (preparerUser as any)?.receiveQuoteEmails !== false) {
            await sendQuoteApprovedEmail({
              toEmail: recipientEmail,
              employeeName: updatedQuote.preparedBy,
              reviewerName: reviewerDisplay,
              quoteNumber: updatedQuote.quoteNumber,
              customerName: updatedQuote.customerName,
              status: newStatus,
              reviewChanges: updatedQuote.reviewChanges,
              reviewerNotes: updatedQuote.reviewerNotes,
              appUrl: getAppUrl(request),
            });
          }
        } catch (emailErr) {
          console.error('Failed to dispatch quote review email:', emailErr);
        }
      }

    // 2. If an Odoo employee is newly assigned or quote newly approved, send instant notification to them
    const isNewOdooAssignment = body.odooAssignedTo && (
      body.odooAssignedTo !== existingQuote.odooAssignedTo ||
      (existingQuote.status !== 'APPROVED' && newStatus === 'APPROVED')
    );
    if (isNewOdooAssignment) {
      try {
        const reviewerDisplay = updatedQuote.reviewedBy || reviewerUsername || (session?.user as any)?.username || 'Admin';
        
        // Prevent duplicate spam: if an unread notification already exists for this quote & clerk, don't create duplicate
        const existingNotif = await Notification.findOne({
          quoteId: updatedQuote._id.toString(),
          recipientUsername: { $regex: new RegExp(`^${body.odooAssignedTo}$`, 'i') },
          type: 'QUOTE_ODOO_ASSIGNED',
          isRead: false,
        });

        if (!existingNotif) {
          const odooClerkNotif = await Notification.create({
            recipientUsername: body.odooAssignedTo,
            senderUsername: reviewerDisplay,
            type: 'QUOTE_ODOO_ASSIGNED',
            title: `Quote #${updatedQuote.quoteNumber} Assigned for Odoo Entry`,
            message: `${reviewerDisplay} assigned quote #${updatedQuote.quoteNumber} (${updatedQuote.customerName}) to you for Odoo entry & physical filing.`,
            quoteId: updatedQuote._id.toString(),
            quoteNumber: updatedQuote.quoteNumber,
            customerName: updatedQuote.customerName,
            isRead: false,
          });

          await triggerPusherEvent(`user-${body.odooAssignedTo.toLowerCase()}`, 'notification', odooClerkNotif);
        }
        await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber: updatedQuote.quoteNumber });
      } catch (odooErr) {
        console.error('Failed to create Odoo assignment notification:', odooErr);
      }
    }

    // 4. Handle Odoo entry completed notification to Reviewer / Admin
    if (body.odooStatus === 'COMPLETED' && existingQuote.odooStatus !== 'COMPLETED') {
      try {
        const targetRecipient = updatedQuote.reviewedBy || updatedQuote.assignedTo || 'Admin';
        const odooOrderInfo = updatedQuote.odooOrderNumber ? ` (Odoo #${updatedQuote.odooOrderNumber})` : '';
        const odooDoneNotif = await Notification.create({
          recipientUsername: targetRecipient,
          senderUsername: reviewerUsername || 'Odoo Clerk',
          type: 'ODOO_ENTRY_COMPLETED',
          title: `Quote #${updatedQuote.quoteNumber} Entered in Odoo`,
          message: `${reviewerUsername || 'Odoo clerk'} confirmed quote #${updatedQuote.quoteNumber} for ${updatedQuote.customerName} has been entered into Odoo${odooOrderInfo} and filed.`,
          quoteId: updatedQuote._id.toString(),
          quoteNumber: updatedQuote.quoteNumber,
          customerName: updatedQuote.customerName,
          isRead: false,
        });

        await triggerPusherEvent(`user-${targetRecipient.toLowerCase()}`, 'notification', odooDoneNotif);
        await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber: updatedQuote.quoteNumber });
      } catch (odooDoneErr) {
        console.error('Failed to create Odoo done notification:', odooDoneErr);
      }
    }

    // Invalidate badge counters
    cacheDelPattern('quotes:badge:*').catch(() => {});

    return NextResponse.json({
      message: isReviewAction ? `Quote marked as ${newStatus}` : 'Quote updated successfully',
      quote: updatedQuote,
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    const { id } = await params;

    await dbConnect();

    const quote = await SavedQuote.findById(id);
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    // Only Admin, SuperAdmin, or the preparer can delete
    const currentUser = (session.user as any).name || (session.user as any).username;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && quote.preparedBy !== currentUser) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403, headers: NO_CACHE_HEADERS });
    }

    await SavedQuote.findByIdAndDelete(id);

    // Broadcast deletion in real-time to all connected users
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
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
