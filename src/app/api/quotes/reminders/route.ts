import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SavedQuote from '@/models/SavedQuote';
import User from '@/models/User';
import { sendQuoteReminderEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find quotes pending for 3+ days that haven't been reminded in the last 24h
    const overdueQuotes = await SavedQuote.find({
      status: 'PENDING_REVIEW',
      createdAt: { $lte: threeDaysAgo },
      $or: [
        { lastReminderSentAt: null },
        { lastReminderSentAt: { $exists: false } },
        { lastReminderSentAt: { $lte: oneDayAgo } },
      ],
    });

    if (overdueQuotes.length === 0) {
      return NextResponse.json({ message: 'No overdue quotes needing reminders', remindersSent: 0 });
    }

    // Group by assigned reviewer
    const groupedByReviewer: Record<string, typeof overdueQuotes> = {};
    for (const q of overdueQuotes) {
      const reviewer = q.reviewedBy || q.assignedTo || 'Admin';
      if (!groupedByReviewer[reviewer]) groupedByReviewer[reviewer] = [];
      groupedByReviewer[reviewer].push(q);
    }

    let remindersSent = 0;

    for (const [reviewerName, quotes] of Object.entries(groupedByReviewer)) {
      // Find reviewer's email
      const user = await User.findOne({ username: { $regex: new RegExp(`^${reviewerName}$`, 'i') } });
      const targetEmail = user?.email || quotes[0].assignedToEmail;

      if (!targetEmail) {
        console.warn(`[Quote Reminder] No email found for reviewer "${reviewerName}"`);
        continue;
      }

      const pendingQuotesPayload = quotes.map(q => {
        const days = Math.floor((Date.now() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return {
          quoteNumber: q.quoteNumber,
          customerName: q.customerName,
          preparedBy: q.preparedBy,
          daysPending: days,
        };
      });

      const res = await sendQuoteReminderEmail({
        toEmail: targetEmail,
        reviewerName,
        pendingQuotes: pendingQuotesPayload,
      });

      if (res.success) {
        remindersSent++;
        // Update lastReminderSentAt for all these quotes
        const ids = quotes.map(q => q._id);
        await SavedQuote.updateMany(
          { _id: { $in: ids } },
          { $set: { lastReminderSentAt: new Date() } }
        );
      }
    }

    return NextResponse.json({
      message: `Processed reminders for ${overdueQuotes.length} quote(s)`,
      remindersSent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
