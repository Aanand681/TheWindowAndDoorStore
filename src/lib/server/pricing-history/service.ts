import dbConnect from "@/lib/mongodb"
import PricingHistory, {
  IPricingHistory,
  PricingCategory,
} from "@/models/PricingHistory"

export async function recordPricingSnapshot(
  category: PricingCategory,
  snapshot: Record<string, any>,
  savedBy: string,
  notes?: string
): Promise<IPricingHistory> {
  await dbConnect()

  const lastEntry = await PricingHistory.findOne({ category })
    .sort({ version: -1 })
    .select("version")
    .lean()

  const nextVersion = ((lastEntry as any)?.version || 0) + 1

  const historyItem = await PricingHistory.create({
    category,
    version: nextVersion,
    snapshot,
    savedBy: savedBy || "System Admin",
    notes: notes || `Version ${nextVersion} saved`,
  })

  // Optional housekeeping: keep the latest 50 revisions per category
  try {
    const totalCount = await PricingHistory.countDocuments({ category })
    if (totalCount > 50) {
      const oldestToDrop = await PricingHistory.find({ category })
        .sort({ createdAt: -1 })
        .skip(50)
        .select("_id")
        .lean()

      if (oldestToDrop.length > 0) {
        const ids = oldestToDrop.map((doc: any) => doc._id)
        await PricingHistory.deleteMany({ _id: { $in: ids } })
      }
    }
  } catch (err) {
    console.error("Non-blocking error pruning old pricing history:", err)
  }

  return historyItem
}

export async function getPricingHistory(
  category: PricingCategory,
  limit: number = 20
) {
  await dbConnect()

  const history = await PricingHistory.find({ category })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return history
}

export async function deletePricingSnapshot(id: string): Promise<{
  success: boolean
  error?: string
  status?: number
  deleted?: any
}> {
  await dbConnect()

  const target = await PricingHistory.findById(id).lean()
  if (!target) {
    return { success: false, error: "Snapshot not found", status: 404 }
  }

  const category = (target as any).category
  const totalCount = await PricingHistory.countDocuments({ category })

  if (totalCount <= 1) {
    return {
      success: false,
      error:
        "Cannot delete the only remaining version. At least one baseline snapshot must be preserved.",
      status: 400,
    }
  }

  // Check if target is the active newest version
  const latest = await PricingHistory.findOne({ category })
    .sort({ version: -1 })
    .select("_id version")
    .lean()

  if (latest && (latest as any)._id?.toString() === id.toString()) {
    return {
      success: false,
      error:
        "Cannot delete the active live version. You can only delete older historical revisions.",
      status: 400,
    }
  }

  const deleted = await PricingHistory.findByIdAndDelete(id).lean()
  return { success: true, deleted }
}

