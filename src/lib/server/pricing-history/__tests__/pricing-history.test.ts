import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  recordPricingSnapshot,
  getPricingHistory,
  deletePricingSnapshot,
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
      findById: vi.fn().mockImplementation((id: string) => ({
        lean: vi.fn().mockImplementation(async () => {
          return mockEntries.find((e) => e._id === id) || null
        }),
      })),
      countDocuments: vi.fn().mockImplementation(async () => mockEntries.length),
      deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 }),
      findByIdAndDelete: vi.fn().mockImplementation((id: string) => ({
        lean: vi.fn().mockImplementation(async () => {
          const idx = mockEntries.findIndex((e) => e._id === id)
          if (idx !== -1) {
            return mockEntries.splice(idx, 1)[0]
          }
          return { _id: id }
        }),
      })),
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

  it("prevents deleting when only one snapshot exists", async () => {
    // When only 1 entry exists from the first test
    const history = await getPricingHistory("WINDOW_LABOUR", 10)
    expect(history.length).toBe(1)
    const result = await deletePricingSnapshot(history[0]._id.toString())
    expect(result.success).toBe(false)
    expect(result.status).toBe(400)
    expect(result.error).toContain("only remaining version")
  })

  it("prevents deleting the active latest version when multiple versions exist", async () => {
    const v2 = await recordPricingSnapshot(
      "WINDOW_LABOUR",
      { windowLabourPerSqft: 25 },
      "test_admin"
    )
    const result = await deletePricingSnapshot(v2._id.toString())
    expect(result.success).toBe(false)
    expect(result.status).toBe(400)
    expect(result.error).toContain("active live version")
  })

  it("successfully deletes an older historical version", async () => {
    const history = await getPricingHistory("WINDOW_LABOUR", 10)
    expect(history.length).toBe(2)
    const older = history[1] // The older version
    const result = await deletePricingSnapshot(older._id.toString())
    expect(result.success).toBe(true)
    expect(result.deleted).toBeDefined()
  })
})

