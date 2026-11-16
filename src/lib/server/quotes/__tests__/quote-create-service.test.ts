import { describe, it, expect, vi, beforeEach } from "vitest"
import { createQuoteService } from "../quote-create-service"
import SavedQuote from "@/models/SavedQuote"
import User from "@/models/User"

vi.mock("@/models/SavedQuote", () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
  },
}))

vi.mock("@/models/User", () => ({
  default: {
    findOne: vi.fn(),
  },
}))

vi.mock("@/models/Notification", () => ({
  default: {
    create: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock("@/lib/pusher-server", () => ({
  triggerPusherEvent: vi.fn().mockResolvedValue({}),
}))

vi.mock("@/lib/email", () => ({
  sendQuoteReviewRequestedEmail: vi.fn().mockResolvedValue({}),
  getAppUrl: vi.fn().mockReturnValue("https://example.com"),
}))

vi.mock("@/lib/redis", () => ({
  cacheDelPattern: vi.fn().mockResolvedValue(true),
}))

describe("createQuoteService Security & Self-Submission Rules", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const dummyHeaders = { "Content-Type": "application/json" }

  it("blocks a user from submitting a quote for review to themselves", async () => {
    vi.mocked(User.findOne).mockResolvedValueOnce({
      username: "john_sales",
      role: "EMPLOYEE",
    } as any)

    const request = new Request("http://localhost:3000/api/quotes", {
      method: "POST",
    })
    const session = {
      user: { username: "john_sales", role: "EMPLOYEE" },
    }
    const body = {
      quoteNumber: "Q-1001",
      customerName: "Jane Doe",
      assignedTo: "john_sales",
      directApprove: false,
    }

    const res = await createQuoteService(request, session, body, dummyHeaders)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain(
      "You cannot submit a quote for review to yourself"
    )
    expect(SavedQuote.create).not.toHaveBeenCalled()
  })

  it("blocks a non-admin user from directly approving a quote", async () => {
    vi.mocked(User.findOne).mockResolvedValueOnce({
      username: "john_sales",
      role: "EMPLOYEE",
    } as any)

    const request = new Request("http://localhost:3000/api/quotes", {
      method: "POST",
    })
    const session = {
      user: { username: "john_sales", role: "EMPLOYEE" },
    }
    const body = {
      quoteNumber: "Q-1001",
      customerName: "Jane Doe",
      directApprove: true,
      odooAssignedTo: "clerk_1",
    }

    const res = await createQuoteService(request, session, body, dummyHeaders)
    const json = await res.json()

    expect(res.status).toBe(403)
    expect(json.error).toContain("Only administrators can directly approve")
    expect(SavedQuote.create).not.toHaveBeenCalled()
  })

  it("allows an admin user to directly approve their own quote", async () => {
    vi.mocked(User.findOne).mockResolvedValueOnce({
      username: "admin_user",
      role: "ADMIN",
    } as any)
    vi.mocked(SavedQuote.create).mockResolvedValueOnce({
      _id: "quote-123",
      quoteNumber: "Q-1001",
      status: "APPROVED",
      assignedTo: "admin_user",
    } as any)

    const request = new Request("http://localhost:3000/api/quotes", {
      method: "POST",
    })
    const session = {
      user: { username: "admin_user", role: "ADMIN" },
    }
    const body = {
      quoteNumber: "Q-1001",
      customerName: "Jane Doe",
      directApprove: true,
      odooAssignedTo: "clerk_1",
    }

    const res = await createQuoteService(request, session, body, dummyHeaders)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.message).toContain("Quote submitted for review successfully")
    expect(SavedQuote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "APPROVED",
        quoteNumber: "Q-1001",
      })
    )
  })

  it("allows a user to submit a quote for review to another team member", async () => {
    // preparer lookup
    ;(User.findOne as any).mockImplementation(async (query: any) => {
      if (query?.username?.test?.("john_sales")) {
        return { username: "john_sales", role: "EMPLOYEE" }
      }
      if (query?.username?.test?.("sarah_reviewer")) {
        return {
          username: "sarah_reviewer",
          role: "EMPLOYEE",
          email: "sarah@example.com",
        }
      }
      return null
    })

    vi.mocked(SavedQuote.create).mockResolvedValueOnce({
      _id: "quote-456",
      quoteNumber: "Q-1002",
      status: "PENDING_REVIEW",
      assignedTo: "sarah_reviewer",
    } as any)

    const request = new Request("http://localhost:3000/api/quotes", {
      method: "POST",
    })
    const session = {
      user: { username: "john_sales", role: "EMPLOYEE" },
    }
    const body = {
      quoteNumber: "Q-1002",
      customerName: "Alice Smith",
      assignedTo: "sarah_reviewer",
      directApprove: false,
    }

    const res = await createQuoteService(request, session, body, dummyHeaders)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.message).toContain("Quote submitted for review successfully")
    expect(SavedQuote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "PENDING_REVIEW",
        assignedTo: "sarah_reviewer",
      })
    )
  })

  it("updates an existing DRAFT into PENDING_REVIEW in-place when submitted", async () => {
    ;(User.findOne as any).mockImplementation(async (query: any) => {
      if (query?.username?.test?.("john_sales")) {
        return { username: "john_sales", role: "EMPLOYEE" }
      }
      if (query?.username?.test?.("sarah_reviewer")) {
        return {
          username: "sarah_reviewer",
          role: "EMPLOYEE",
          email: "sarah@example.com",
        }
      }
      return null
    })

    const mockDraftDoc: any = {
      _id: "draft-789",
      quoteNumber: "Q-1003",
      customerName: "Draft Customer",
      status: "DRAFT",
      preparedBy: "john_sales",
      save: vi.fn().mockImplementation(async function (this: any) {
        return this
      }),
    }
    vi.mocked(SavedQuote.findOne).mockResolvedValueOnce(mockDraftDoc)

    const request = new Request("http://localhost:3000/api/quotes", {
      method: "POST",
    })
    const session = {
      user: { username: "john_sales", role: "EMPLOYEE" },
    }
    const body = {
      quoteNumber: "Q-1003",
      customerName: "Final Customer Name",
      assignedTo: "sarah_reviewer",
      directApprove: false,
    }

    const res = await createQuoteService(request, session, body, dummyHeaders)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(mockDraftDoc.save).toHaveBeenCalled()
    expect(mockDraftDoc.status).toBe("PENDING_REVIEW")
    expect(mockDraftDoc.customerName).toBe("Final Customer Name")
    expect(mockDraftDoc.assignedTo).toBe("sarah_reviewer")
    // Verifies it did NOT create a duplicate record
    expect(SavedQuote.create).not.toHaveBeenCalled()
  })
})
