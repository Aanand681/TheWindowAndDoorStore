import SavedQuote from "@/models/SavedQuote"
import Department from "@/models/Department"
import dbConnect from "@/lib/mongodb"
import { cacheGet, cacheSet } from "@/lib/redis"

export async function getQuotesBadgeCounts(session: any, currentUser: string) {
  const cacheKey = `quotes:badge:${currentUser || "anon"}`
  const cached = await cacheGet(cacheKey)
  if (cached) {
    return cached
  }

  await dbConnect()

  const userRole = session.user.role
  const userDept = session.user.department
  let deptDoc: any = null
  if (userDept) {
    deptDoc = await Department.findOne({ code: userDept })
  }
  const canReview =
    userRole === "ADMIN" ||
    userRole === "SUPERADMIN" ||
    deptDoc?.permissions?.canReviewQuote === true
  const isSuperAdmin = userRole === "SUPERADMIN"

  // Pending reviews specifically assigned to this user (SuperAdmin sees all)
  const pendingReviewCount = isSuperAdmin
    ? await SavedQuote.countDocuments({ status: "PENDING_REVIEW" })
    : await SavedQuote.countDocuments({
        status: "PENDING_REVIEW",
        $or: [
          { assignedTo: { $regex: new RegExp(`^${currentUser}$`, "i") } },
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
        odooAssignedTo: { $regex: new RegExp(`^${currentUser}$`, "i") },
      })

  // Recent approved/modified quotes prepared by this user
  const myUpdatesCount = await SavedQuote.countDocuments({
    preparedBy: { $regex: new RegExp(`^${currentUser}$`, "i") },
    status: { $in: ["APPROVED", "MODIFIED", "RETURNED"] },
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })

  const totalActionableCount = isSuperAdmin
    ? pendingReviewCount + pendingOdooCount
    : canReview
      ? pendingReviewCount + pendingOdooCount
      : pendingOdooCount

  const badgeData = {
    pendingReviewCount,
    pendingOdooCount,
    totalActionableCount,
    myUpdatesCount,
  }

  cacheSet(cacheKey, badgeData, 30).catch(() => {})
  return badgeData
}
