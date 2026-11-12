"use client"

export interface NotificationItem {
  _id: string
  recipientUsername: string
  senderUsername: string
  type:
    | "QUOTE_APPROVED"
    | "QUOTE_MODIFIED"
    | "QUOTE_RETURNED"
    | "QUOTE_ASSIGNED"
    | "QUOTE_SUBMITTED"
    | "QUOTE_ODOO_ASSIGNED"
    | "ODOO_ENTRY_COMPLETED"
  title: string
  message: string
  quoteId: string
  quoteNumber: string
  customerName: string
  reviewChanges?: string[]
  isRead: boolean
  createdAt: string
}
