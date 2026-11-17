import { describe, it, expect } from "vitest"
import {
  filterAndSortQuotes,
  computeQuotesTabCounts,
} from "../quotes-tab-filter"

describe("quotes-tab-filter isolation & visibility rules", () => {
  const employeeUsername = "kyle_preparer"
  const reviewerUsername = "sarah_reviewer"

  const sampleQuotes = [
    {
      _id: "q1",
      quoteNumber: "100001",
      customerName: "Alice Pending",
      status: "PENDING_REVIEW",
      preparedBy: employeeUsername,
      assignedTo: reviewerUsername,
      createdAt: "2026-11-16T10:00:00.000Z",
    },
    {
      _id: "q2",
      quoteNumber: "100002",
      customerName: "Bob Approved",
      status: "APPROVED",
      preparedBy: employeeUsername,
      createdAt: "2026-11-15T10:00:00.000Z",
    },
    {
      _id: "q3",
      quoteNumber: "100003",
      customerName: "Charlie Assigned to Kyle",
      status: "PENDING_REVIEW",
      preparedBy: "another_employee",
      assignedTo: employeeUsername,
      createdAt: "2026-11-14T10:00:00.000Z",
    },
    {
      _id: "q4",
      quoteNumber: "100004",
      customerName: "Dave Draft",
      status: "DRAFT",
      preparedBy: employeeUsername,
      createdAt: "2026-11-13T10:00:00.000Z",
    },
  ]

  it("removes PENDING_REVIEW quotes from employee general Quote History ('my' tab)", () => {
    const result = filterAndSortQuotes({
      quotes: sampleQuotes,
      activeTab: "my",
      statusFilter: "all",
      search: "",
      canReview: false,
      isSuperAdmin: false,
      isClerk: false,
      hasOdooAccess: false,
      myUsername: employeeUsername,
    })

    // q1 is PENDING_REVIEW -> must be hidden
    // q4 is DRAFT -> excluded
    // q3 is prepared by another user -> hidden
    // q2 is APPROVED -> visible
    expect(result.map((q) => q._id)).toEqual(["q2"])
  })

  it("shows PENDING_REVIEW quotes in employee 'review' tab (My Submissions)", () => {
    const result = filterAndSortQuotes({
      quotes: sampleQuotes,
      activeTab: "review",
      statusFilter: "all",
      search: "",
      canReview: false,
      isSuperAdmin: false,
      isClerk: false,
      hasOdooAccess: false,
      myUsername: employeeUsername,
    })

    // q1 was prepared by employee and is PENDING_REVIEW
    expect(result.map((q) => q._id)).toEqual(["q1"])
  })

  it("shows assigned quotes in employee 'assigned' tab (Assigned to Me)", () => {
    const result = filterAndSortQuotes({
      quotes: sampleQuotes,
      activeTab: "assigned",
      statusFilter: "all",
      search: "",
      canReview: false,
      isSuperAdmin: false,
      isClerk: false,
      hasOdooAccess: false,
      myUsername: employeeUsername,
    })

    // q3 is assigned to employee Kyle for review
    expect(result.map((q) => q._id)).toEqual(["q3"])
  })

  it("calculates accurate tab counts separating History from In-Review submissions", () => {
    const counts = computeQuotesTabCounts({
      quotes: sampleQuotes,
      isSuperAdmin: false,
      hasOdooAccess: false,
      myUsername: employeeUsername,
    })

    // employeeHistoryCount should only count non-PENDING_REVIEW quotes prepared by user (q2)
    expect(counts.employeeHistoryCount).toBe(1)
    // employeeInReviewCount counts quotes prepared by user in PENDING_REVIEW (q1)
    expect(counts.employeeInReviewCount).toBe(1)
    // employeeAssignedCount counts quotes assigned to user in PENDING_REVIEW (q3)
    expect(counts.employeeAssignedCount).toBe(1)
  })
})
