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

