import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api-error';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid notification ID format' }, { status: 400 });
    }

    const currentUsername = session.user.username || session.user.name || '';
    await dbConnect();

    const notif = await Notification.findById(id);
    if (!notif) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (
      notif.recipientUsername.toLowerCase() !== currentUsername.toLowerCase() &&
      session.user.role !== 'SUPERADMIN'
    ) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    notif.isRead = true;
    await notif.save();

    return NextResponse.json({ message: 'Notification marked as read', notification: notif });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export const PUT = PATCH;
