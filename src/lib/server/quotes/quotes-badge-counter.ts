import SavedQuote from "@/models/SavedQuote"
import dbConnect from "@/lib/mongodb"
import { cacheGet, cacheSet } from "@/lib/redis"
import { exactCaseInsensitiveRegex } from "@/lib/regex"

export async function getQuotesBadgeCounts(session: any, currentUser: string) {
  const cacheKey = `quotes:badge:${currentUser || "anon"}`
  const cached = await cacheGet(cacheKey)
  if (cached) {
    return cached
  }

  await dbConnect()

  const userRole = session.user.role
  const isSuperAdmin = userRole === "SUPERADMIN"

  const currentUserRegex = exactCaseInsensitiveRegex(currentUser)

  // Pending reviews specifically assigned to this user (visible to assigned admin only)
  const pendingReviewCount = await SavedQuote.countDocuments({
    status: "PENDING_REVIEW",
    $or: [
      { assignedTo: { $regex: currentUserRegex } },
      ...(currentUser?.toLowerCase() === "admin"
        ? [
            { assignedTo: "Admin" },
            { assignedTo: { $exists: false } },
            { assignedTo: "" },
          ]
        : []),
    ],
  })

  // Pending Odoo entries assigned to this user (or all pending if SuperAdmin)
  const pendingOdooCount = isSuperAdmin
    ? await SavedQuote.countDocuments({ odooStatus: "PENDING_ENTRY" })
    : await SavedQuote.countDocuments({
        odooStatus: "PENDING_ENTRY",
        odooAssignedTo: { $regex: currentUserRegex },
      })

  // Recent approved/modified quotes prepared by this user
  const myUpdatesCount = await SavedQuote.countDocuments({
    preparedBy: { $regex: currentUserRegex },
    status: { $in: ["APPROVED", "MODIFIED", "RETURNED"] },
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })

  // Returned quotes prepared by this user that require revision
  const returnedCount = await SavedQuote.countDocuments({
    status: "RETURNED",
    preparedBy: { $regex: currentUserRegex },
  })

  const totalActionableCount =
    pendingReviewCount + pendingOdooCount + returnedCount

  const badgeData = {
    pendingReviewCount,
    pendingOdooCount,
    returnedCount,
    totalActionableCount,
    myUpdatesCount,
  }

  cacheSet(cacheKey, badgeData, 30).catch(() => {})
  return badgeData
}
