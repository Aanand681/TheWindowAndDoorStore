import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  recordPricingSnapshot,
  getPricingHistory,
} from "../service"
import PricingHistory from "@/models/PricingHistory"

vi.mock("@/lib/mongodb", () => ({
  default: vi.fn().mockResolvedValue(true),
}))

vi.mock("@/models/PricingHistory", () => {
  const mockEntries: any[] = []

  return {
    default: {
      findOne: vi.fn().mockImplementation(() => ({
        sort: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockImplementation(() => ({
            lean: vi.fn().mockImplementation(async () => {
              if (mockEntries.length === 0) return null
              return mockEntries[mockEntries.length - 1]
            }),
          })),
        })),
      })),
      create: vi.fn().mockImplementation(async (data) => {
        const entry = { _id: `id_${Date.now()}`, ...data, createdAt: new Date() }
        mockEntries.push(entry)
        return entry
      }),
      find: vi.fn().mockImplementation(() => ({
        sort: vi.fn().mockImplementation(() => ({
          limit: vi.fn().mockImplementation(() => ({
            lean: vi.fn().mockImplementation(async () => {
              return [...mockEntries].reverse()
            }),
          })),
          skip: vi.fn().mockImplementation(() => ({
            select: vi.fn().mockImplementation(() => ({
              lean: vi.fn().mockImplementation(async () => []),
            })),
          })),
        })),
      })),
      countDocuments: vi.fn().mockResolvedValue(1),
      deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 }),
    },
  }
})

describe("PricingHistory Service", () => {
  it("records a new pricing snapshot with incremented version", async () => {
    const result = await recordPricingSnapshot(
      "WINDOW_LABOUR",
      { windowLabourPerSqft: 22, windowLabourMin: 350 },
      "test_admin",
      "Spring price increase"
    )

    expect(result).toBeDefined()
    expect(result.version).toBe(1)
    expect(result.category).toBe("WINDOW_LABOUR")
    expect(result.savedBy).toBe("test_admin")
    expect(result.snapshot.windowLabourPerSqft).toBe(22)
  })

  it("retrieves historical snapshots in reverse chronological order", async () => {
    const history = await getPricingHistory("WINDOW_LABOUR", 10)
    expect(Array.isArray(history)).toBe(true)
    expect(history.length).toBeGreaterThan(0)
    expect(history[0].category).toBe("WINDOW_LABOUR")
  })
})

