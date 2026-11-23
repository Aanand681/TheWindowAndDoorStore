import Notification from "@/models/Notification"
import { triggerPusherEvent } from "@/lib/pusher-server"
import { sendQuoteReviewRequestedEmail, getAppUrl } from "@/lib/email"
import { cacheDelPattern } from "@/lib/redis"

export interface DispatchQuoteNotificationsParams {
  isDirectApprove: boolean
  odooAssignedTo?: string
  clerkUser?: any
  reviewerUser?: any
  assignedTo?: string
  currentUsername: string
  quoteNumber: string
  customerName: string
  preparerNotes?: string
  newQuoteId: string
  request: Request
}

export async function dispatchQuoteNotifications(
  p: DispatchQuoteNotificationsParams
): Promise<void> {
  const {
    isDirectApprove,
    odooAssignedTo,
    clerkUser,
    reviewerUser,
    assignedTo,
    currentUsername,
    quoteNumber,
    customerName,
    preparerNotes,
    newQuoteId,
    request,
  } = p

  if (isDirectApprove && odooAssignedTo) {
    const clerkUsername = clerkUser?.username || odooAssignedTo
    try {
      const clerkNotif = await Notification.create({
        recipientUsername: clerkUsername,
        senderUsername: currentUsername,
        type: "QUOTE_ODOO_ASSIGNED",
        title: `Quote #${quoteNumber} Ready for Odoo`,
        message: `${currentUsername} approved Quote #${quoteNumber} (${customerName}) and assigned it to you for Odoo entry.`,
        quoteId: newQuoteId,
        quoteNumber,
        customerName,
        isRead: false,
      })
      await triggerPusherEvent(
        `user-${clerkUsername.toLowerCase()}`,
        "notification",
        clerkNotif
      )
      await triggerPusherEvent("global-quotes", "QUOTE_COUNT_UPDATED", {
        quoteNumber,
      })
    } catch (err) {
      console.error("Failed to notify Odoo clerk on direct approve:", err)
    }
  } else if (!isDirectApprove) {
    const reviewerUsername = reviewerUser?.username || assignedTo
    if (
      reviewerUsername &&
      reviewerUsername.toLowerCase() !== currentUsername.toLowerCase()
    ) {
      try {
        const createdNotif = await Notification.create({
          recipientUsername: reviewerUsername,
          senderUsername: currentUsername,
          type: "QUOTE_SUBMITTED",
          title: `New Quote #${quoteNumber} for Review`,
          message: `${currentUsername} submitted quote #${quoteNumber} (${customerName}) for your review.`,
          quoteId: newQuoteId,
          quoteNumber,
          customerName,
          isRead: false,
        })

        await triggerPusherEvent(
          `user-${reviewerUsername.toLowerCase()}`,
          "notification",
          createdNotif
        )
        await triggerPusherEvent("global-quotes", "QUOTE_COUNT_UPDATED", {
          quoteNumber,
        })

        if (
          reviewerUser?.email &&
          (reviewerUser as any)?.receiveQuoteEmails !== false &&
          (reviewerUser as any)?.muteNotifications !== true
        ) {
          sendQuoteReviewRequestedEmail({
            toEmail: reviewerUser.email,
            reviewerName: reviewerUsername,
            preparerName: currentUsername,
            quoteNumber,
            customerName,
            preparerNotes,
            appUrl: getAppUrl(request),
          }).catch((emailErr) =>
            console.error("Failed to send reviewer email:", emailErr)
          )
        }
      } catch (notifErr) {
        console.error("Failed to create reviewer notification:", notifErr)
      }
    }
  }

  cacheDelPattern("quotes:badge:*").catch(() => {})
}
