import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getServerSession } from "next-auth/next"
import SavedQuote from "@/models/SavedQuote"
import User from "@/models/User"
import {
  escapeRegex,
  exactCaseInsensitiveRegex,
  containsCaseInsensitiveRegex,
} from "@/lib/regex"

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}))

vi.mock("@/lib/mongodb", () => ({
  default: vi.fn().mockResolvedValue({}),
}))

vi.mock("@/models/SavedQuote", () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}))

vi.mock("@/models/User", () => ({
  default: {
    findOne: vi.fn(),
  },
}))

vi.mock("@/models/Settings", () => ({
  default: {
    findOne: vi.fn(),
  },
}))

vi.mock("@/models/Department", () => ({
  default: {
    findOne: vi.fn(),
  },
}))

vi.mock("@/models/Notification", () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
  },
}))

vi.mock("@/lib/redis", () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(true),
  cacheDel: vi.fn().mockResolvedValue(true),
  cacheDelPattern: vi.fn().mockResolvedValue(true),
}))

vi.mock("@/lib/pusher-server", () => ({
  triggerPusherEvent: vi.fn().mockResolvedValue({}),
}))

vi.mock("@/lib/email", () => ({
  sendQuoteReminderEmail: vi.fn().mockResolvedValue(true),
  sendQuoteApprovedEmail: vi.fn().mockResolvedValue(true),
  sendQuoteReviewRequestedEmail: vi.fn().mockResolvedValue(true),
  getAppUrl: vi.fn().mockReturnValue("https://example.com"),
}))

import { GET as getQuotes } from "@/app/api/quotes/route"
import { PUT as putQuoteById, DELETE as deleteQuoteById } from "@/app/api/quotes/[id]/route"
import { GET as getReminders } from "@/app/api/quotes/reminders/route"
import { GET as getGeocode } from "@/app/api/geocode/route"
import { GET as getRoute } from "@/app/api/route/route"
import { GET as getSettings } from "@/app/api/settings/route"

const VALID_ID = "507f1f77bcf86cd799439011"

describe("Batch A — Regex Escaping & API Security Fixes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("regex helper (@/lib/regex)", () => {
    it("escapes metacharacters so arbitrary input never throws or widens matches", () => {
      const dangerous = "john+doe(admin)[1].*?$^\\|{}"
      expect(escapeRegex(dangerous)).toBe(
        "john\\+doe\\(admin\\)\\[1\\]\\.\\*\\?\\$\\^\\\\\\|\\{\\}"
      )

      const exact = exactCaseInsensitiveRegex("Alice.[Admin]+")
      expect(exact.test("alice.[admin]+")).toBe(true)
      expect(exact.test("aliceX[Admin]")).toBe(false)

      const partial = containsCaseInsensitiveRegex("foo[(bar)*")
      expect(partial.test("prefix foo[(BAR)* suffix")).toBe(true)
      expect(partial.test("foo")).toBe(false)
    })
  })

  describe("GET /api/quotes regex injection protection", () => {
    it("handles unmatched regex brackets in search without throwing 500", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { username: "alice", role: "EMPLOYEE" },
      } as any)

      const limitMock = vi.fn().mockResolvedValue([])
      const sortMock = vi.fn().mockReturnValue({ limit: limitMock })
      vi.mocked(SavedQuote.find).mockReturnValueOnce({ sort: sortMock } as any)

      const req = new Request(
        "http://localhost:3000/api/quotes?search=bad[(input*"
      )
      const res = await getQuotes(req)

      expect(res.status).toBe(200)
      expect(SavedQuote.find).toHaveBeenCalledTimes(1)
      const filterArg = vi.mocked(SavedQuote.find).mock.calls[0][0] as any
      expect(Array.isArray(filterArg.$and)).toBe(true)
    })
  })

  describe("GET /api/quotes/reminders authentication & cron secret", () => {
    it("rejects unauthenticated requests without session or secret (401)", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null)
      const req = new Request("http://localhost:3000/api/quotes/reminders")
      const res = await getReminders(req)
      expect(res.status).toBe(401)
    })

    it("rejects regular EMPLOYEE sessions (403)", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { username: "john_sales", role: "EMPLOYEE" },
      } as any)
      const req = new Request("http://localhost:3000/api/quotes/reminders")
      const res = await getReminders(req)
      expect(res.status).toBe(403)
    })

    it("rejects invalid Bearer cron tokens when no session is present (401)", async () => {
      vi.stubEnv("CRON_SECRET", "expected-secret-123")
      vi.mocked(getServerSession).mockResolvedValueOnce(null)
      const req = new Request("http://localhost:3000/api/quotes/reminders", {
        headers: { authorization: "Bearer wrong-secret-000" },
      })
      const res = await getReminders(req)
      expect(res.status).toBe(401)
    })

    it("allows valid Bearer CRON_SECRET and escapes reviewer regex safely", async () => {
      vi.stubEnv("CRON_SECRET", "expected-secret-123")
      vi.mocked(SavedQuote.find).mockResolvedValueOnce([
        {
          _id: VALID_ID,
          assignedTo: "admin(1)[test]",
          quoteNumber: "Q-100",
        },
      ] as any)
      vi.mocked(User.findOne).mockResolvedValueOnce(null)

      const req = new Request("http://localhost:3000/api/quotes/reminders", {
        headers: { authorization: "Bearer expected-secret-123" },
      })
      const res = await getReminders(req)

      expect(res.status).toBe(200)
      expect(User.findOne).toHaveBeenCalledTimes(1)
      const userQuery = vi.mocked(User.findOne).mock.calls[0][0] as any
      expect(userQuery.username.$regex).toBeInstanceOf(RegExp)
      expect(userQuery.username.$regex.test("admin(1)[test]")).toBe(true)
    })

    it("allows ADMIN sessions", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { username: "admin", role: "ADMIN" },
      } as any)
      vi.mocked(SavedQuote.find).mockResolvedValueOnce([])

      const req = new Request("http://localhost:3000/api/quotes/reminders")
      const res = await getReminders(req)
      expect(res.status).toBe(200)
    })
  })

  describe("PUT / DELETE /api/quotes/[id] authorization", () => {
    it("blocks unrelated employee from starring/unstarring another user's quote (403)", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { username: "bob", role: "EMPLOYEE" },
      } as any)
      vi.mocked(SavedQuote.findById).mockResolvedValueOnce({
        _id: VALID_ID,
        quoteNumber: "Q-200",
        status: "APPROVED",
        preparedBy: "alice",
        assignedTo: "admin1",
      } as any)

      const req = new Request(`http://localhost:3000/api/quotes/${VALID_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: false }),
      })
      const res = await putQuoteById(req, {
        params: Promise.resolve({ id: VALID_ID }),
      })

      expect(res.status).toBe(403)
      expect(SavedQuote.findByIdAndUpdate).not.toHaveBeenCalled()
    })

    it("enforces PENDING_REVIEW isolation on star toggles even for another admin", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { username: "admin2", role: "ADMIN" },
      } as any)
      vi.mocked(SavedQuote.findById).mockResolvedValueOnce({
        _id: VALID_ID,
        quoteNumber: "Q-201",
        status: "PENDING_REVIEW",
        preparedBy: "alice",
        assignedTo: "admin1",
      } as any)

      const req = new Request(`http://localhost:3000/api/quotes/${VALID_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: true }),
      })
      const res = await putQuoteById(req, {
        params: Promise.resolve({ id: VALID_ID }),
      })

      expect(res.status).toBe(403)
      expect(SavedQuote.findByIdAndUpdate).not.toHaveBeenCalled()
    })

    it("allows the preparer to star their own APPROVED quote (case-insensitive)", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { username: "alice", role: "EMPLOYEE" },
      } as any)
      vi.mocked(SavedQuote.findById).mockResolvedValueOnce({
        _id: VALID_ID,
        quoteNumber: "Q-202",
        status: "APPROVED",
        preparedBy: "Alice",
        assignedTo: "admin1",
      } as any)
      vi.mocked(SavedQuote.findByIdAndUpdate).mockResolvedValueOnce({
        _id: VALID_ID,
        isStarred: true,
      } as any)

      const req = new Request(`http://localhost:3000/api/quotes/${VALID_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: true }),
      })
      const res = await putQuoteById(req, {
        params: Promise.resolve({ id: VALID_ID }),
      })

      expect(res.status).toBe(200)
      expect(SavedQuote.findByIdAndUpdate).toHaveBeenCalledTimes(1)
    })

    it("allows preparer to delete their own quote regardless of username casing", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { username: "john_sales", role: "EMPLOYEE" },
      } as any)
      vi.mocked(SavedQuote.findById).mockResolvedValueOnce({
        _id: VALID_ID,
        quoteNumber: "Q-203",
        preparedBy: "John_Sales",
      } as any)
      vi.mocked(SavedQuote.findByIdAndDelete).mockResolvedValueOnce({
        _id: VALID_ID,
      } as any)

      const req = new Request(`http://localhost:3000/api/quotes/${VALID_ID}`, {
        method: "DELETE",
      })
      const res = await deleteQuoteById(req, {
        params: Promise.resolve({ id: VALID_ID }),
      })

      expect(res.status).toBe(200)
      expect(SavedQuote.findByIdAndDelete).toHaveBeenCalledWith(VALID_ID)
    })
  })

  describe("Defense-in-depth GET auth guards (/geocode, /route, /settings)", () => {
    it("returns 401 when unauthenticated on GET /api/geocode, /api/route, and /api/settings", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const geocodeRes = await getGeocode(
        new Request("http://localhost:3000/api/geocode?q=Thunder+Bay")
      )
      const routeRes = await getRoute(
        new Request(
          "http://localhost:3000/api/route?lon=-89.2&lat=48.4&officeLon=-89.2&officeLat=48.4"
        )
      )
      const settingsRes = await getSettings()

      expect(geocodeRes.status).toBe(401)
      expect(routeRes.status).toBe(401)
      expect(settingsRes.status).toBe(401)
    })
  })
})
