import User from '@/models/User';
import SavedQuote from '@/models/SavedQuote';
import Notification from '@/models/Notification';
import { triggerPusherEvent } from '@/lib/pusher-server';
import { sendQuoteApprovedEmail, sendQuoteReviewRequestedEmail, getAppUrl } from '@/lib/email';

export async function dispatchQuoteUpdateNotifications(p: {
  request: Request;
  id: string;
  body: any;
  existingQuote: any;
  updatedQuote: any;
  newStatus: string;
  isReviewAction: boolean;
  reviewerUsername: string;
  session: any;
}) {
  const { request, id, body, existingQuote, updatedQuote, newStatus, isReviewAction, reviewerUsername, session } = p;

  // 1. Reassignment notification
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

      if (newAssigneeUser?.email && (newAssigneeUser as any)?.receiveQuoteEmails !== false && (newAssigneeUser as any)?.muteNotifications !== true) {
        sendQuoteReviewRequestedEmail({
          toEmail: newAssigneeUser.email,
          reviewerName: updatedQuote.assignedTo,
          preparerName: reviewerUsername || 'Staff',
          quoteNumber: updatedQuote.quoteNumber,
          customerName: updatedQuote.customerName,
          preparerNotes: updatedQuote.preparerNotes,
          appUrl: getAppUrl(request),
        }).catch((err) => console.error('Failed to send reassignment review email:', err));
      }
    } catch (assignErr) {
      console.error('Failed to create reassignment notification:', assignErr);
    }
  }

  // 2. Resubmission notification for returned quotes
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

  // 3. Review action notification and email
  if (isReviewAction) {
    const preparerUser = await User.findOne({ username: updatedQuote.preparedBy });
    const reviewerDisplay = updatedQuote.reviewedBy || reviewerUsername || updatedQuote.assignedTo || 'Admin';

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

    try {
      const recipientEmail = updatedQuote.preparedByEmail || preparerUser?.email;
      if (recipientEmail && preparerUser?.muteNotifications !== true && (preparerUser as any)?.receiveQuoteEmails !== false) {
        await sendQuoteApprovedEmail({
          toEmail: recipientEmail,
          employeeName: updatedQuote.preparedBy,
          reviewerName: reviewerDisplay,
          quoteNumber: updatedQuote.quoteNumber,
          customerName: updatedQuote.customerName,
          status: newStatus as 'APPROVED' | 'MODIFIED' | 'RETURNED',
          reviewChanges: updatedQuote.reviewChanges,
          reviewerNotes: updatedQuote.reviewerNotes,
          appUrl: getAppUrl(request),
        });
      }
    } catch (emailErr) {
      console.error('Failed to dispatch quote review email:', emailErr);
    }
  }

  // 4. Odoo Clerk Assignment notification
  const isNewOdooAssignment = body.odooAssignedTo && (
    body.odooAssignedTo !== existingQuote.odooAssignedTo ||
    (existingQuote.status !== 'APPROVED' && newStatus === 'APPROVED')
  );
  if (isNewOdooAssignment) {
    try {
      const reviewerDisplay = updatedQuote.reviewedBy || reviewerUsername || (session?.user as any)?.username || 'Admin';
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

  // 5. Odoo completion notification
  if (body.odooStatus === 'COMPLETED' && existingQuote.odooStatus !== 'COMPLETED') {
    try {
      const recipients = new Set<string>();
      if (updatedQuote.preparedBy) recipients.add(updatedQuote.preparedBy);
      if (updatedQuote.reviewedBy) recipients.add(updatedQuote.reviewedBy);
      if (updatedQuote.assignedTo) recipients.add(updatedQuote.assignedTo);
      if (recipients.size === 0) recipients.add('Admin');

      const odooOrderInfo = updatedQuote.odooOrderNumber ? ` (Odoo #${updatedQuote.odooOrderNumber})` : '';

      for (const targetRecipient of recipients) {
        if (targetRecipient.toLowerCase() === (reviewerUsername || '').toLowerCase()) continue;
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
      }
      await triggerPusherEvent('global-quotes', 'QUOTE_COUNT_UPDATED', { quoteNumber: updatedQuote.quoteNumber });
    } catch (odooDoneErr) {
      console.error('Failed to create Odoo done notification:', odooDoneErr);
    }
  }
}
