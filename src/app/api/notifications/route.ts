import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Notification from "@/models/Notification"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const currentUsername = session.user.username || session.user.name || ""
    if (!currentUsername) return NextResponse.json([])

    await dbConnect()

    // Auto-flush notifications older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    await Notification.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
    }).catch((err) => console.error("Failed to flush old notifications:", err))

    const notifications = await Notification.find({
      recipientUsername: { $regex: new RegExp(`^${currentUsername}$`, "i") },
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = await Notification.countDocuments({
      recipientUsername: { $regex: new RegExp(`^${currentUsername}$`, "i") },
      isRead: false,
      createdAt: { $gte: sevenDaysAgo },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const currentUsername = session.user.username || session.user.name || ""
    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    await dbConnect()

    if (markAllAsRead) {
      const result = await Notification.updateMany(
        {
          $or: [
            {
              recipientUsername: {
                $regex: new RegExp(`^${currentUsername}$`, "i"),
              },
            },
            { recipientUsername: currentUsername },
          ],
          isRead: false,
        },
        { $set: { isRead: true } }
      )
      return NextResponse.json({
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      })
    }

    if (notificationId) {
      if (
        typeof notificationId !== "string" ||
        !/^[0-9a-fA-F]{24}$/.test(notificationId)
      ) {
        return NextResponse.json(
          { error: "Invalid notification ID format" },
          { status: 400 }
        )
      }

      await Notification.updateOne(
        {
          _id: notificationId,
          recipientUsername: {
            $regex: new RegExp(`^${currentUsername}$`, "i"),
          },
        },
        { $set: { isRead: true } }
      )
      return NextResponse.json({ message: "Notification marked as read" })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  return PUT(request)
}
