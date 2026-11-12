import mongoose, { Schema, Document, Model } from "mongoose"

export interface IQuoteWindowItem {
  id: string
  w?: string
  h?: string
  qty?: number | string
  base?: string | number
  argon?: string | number
  solar?: string | number
  triple?: string | number
  color?: string
  [key: string]: unknown
}

export interface IQuoteTaxTotals {
  subtotalPreTax?: number
  taxAmount?: number
  grandTotal?: number
  labour?: number
  misc?: number
  jc?: number
  surcharge?: number
  [key: string]: unknown
}

export interface IAttachedUpgrade {
  title: string
  amountPreTaxCents: number
}

export interface ISavedQuote extends Document {
  quoteNumber: string
  customerName: string
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "MODIFIED" | "RETURNED"
  preparedBy: string
  preparedByEmail?: string
  assignedTo: string
  assignedToEmail?: string
  preparerNotes?: string
  reviewerNotes?: string
  reviewChanges?: string[]
  isStarred?: boolean
  initialSnapshot?: Record<string, unknown>

  // Snapshot Payload
  windows: IQuoteWindowItem[]
  taxTotals?: IQuoteTaxTotals | Record<string, unknown>
  quoteResult?: Record<string, unknown>
  quoteNotes: string
  surchargeRate: number
  activePromoId?: string
  customJC?: string | number
  customMisc?: string | number
  customLabour?: string | number
  includeJCInPromo?: boolean
  includeMiscInPromo?: boolean
  includeLabourInPromo?: boolean
  attachedUpgrade?: IAttachedUpgrade | null
  attachedSealedUnit?: Record<string, unknown> | null
  attachedDoorQuote?: Record<string, unknown> | null
  attachedWindowQuote?: Record<string, unknown> | null
  supplyJambId?: string
  supplyJambRate?: string
  supplyCasingId?: string
  supplyCasingRate?: string
  wantsUpgrade?: boolean
  isSupplyOnly?: boolean
  isServiceOnly?: boolean
  quoteSummaryTotal?: number
  approvedBy?: string
  approvedAt?: Date

  // Odoo Entry Tracking
  odooAssignedTo?: string
  odooAssignedToEmail?: string
  odooStatus?: "PENDING_ENTRY" | "COMPLETED"
  odooCompletedAt?: Date
  odooCompletedBy?: string
  odooOrderNumber?: string

  reviewedAt?: Date
  reviewedBy?: string
  reviewedByRole?: string
  lastReminderSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const SavedQuoteSchema = new Schema<ISavedQuote>(
  {
    quoteNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "APPROVED", "MODIFIED", "RETURNED"],
      default: "PENDING_REVIEW",
      index: true,
    },
    preparedBy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    preparedByEmail: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: String,
      default: "Admin",
      trim: true,
      index: true,
    },
    assignedToEmail: {
      type: String,
      trim: true,
    },
    preparerNotes: {
      type: String,
      maxlength: 10000,
      default: "",
    },
    reviewerNotes: {
      type: String,
      maxlength: 10000,
      default: "",
    },
    reviewChanges: {
      type: [String],
      default: [],
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true,
    },
    windows: {
      type: Schema.Types.Mixed,
      default: [],
    },
    taxTotals: {
      type: Schema.Types.Mixed,
      default: null,
    },
    quoteResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
    quoteNotes: {
      type: String,
      maxlength: 10000,
      default: "",
    },
    surchargeRate: {
      type: Number,
      default: 8,
    },
    activePromoId: {
      type: String,
      default: "none",
    },
    customJC: {
      type: Schema.Types.Mixed,
      default: "",
    },
    customMisc: {
      type: Schema.Types.Mixed,
      default: "",
    },
    customLabour: {
      type: Schema.Types.Mixed,
      default: "",
    },
    includeJCInPromo: {
      type: Boolean,
      default: true,
    },
    includeMiscInPromo: {
      type: Boolean,
      default: true,
    },
    includeLabourInPromo: {
      type: Boolean,
      default: true,
    },
    attachedUpgrade: {
      type: Schema.Types.Mixed,
      default: null,
    },
    attachedSealedUnit: {
      type: Schema.Types.Mixed,
      default: null,
    },
    attachedDoorQuote: {
      type: Schema.Types.Mixed,
      default: null,
    },
    attachedWindowQuote: {
      type: Schema.Types.Mixed,
      default: null,
    },
    supplyJambId: {
      type: String,
      default: "none",
      trim: true,
    },
    supplyJambRate: {
      type: String,
      default: "",
      trim: true,
    },
    supplyCasingId: {
      type: String,
      default: "none",
      trim: true,
    },
    supplyCasingRate: {
      type: String,
      default: "",
      trim: true,
    },
    wantsUpgrade: {
      type: Boolean,
      default: false,
    },
    isSupplyOnly: {
      type: Boolean,
      default: false,
    },
    isServiceOnly: {
      type: Boolean,
      default: false,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedByRole: {
      type: String,
      default: "",
      trim: true,
    },
    odooAssignedTo: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    odooAssignedToEmail: {
      type: String,
      default: "",
      trim: true,
    },
    odooStatus: {
      type: String,
      enum: ["PENDING_ENTRY", "COMPLETED", ""],
      default: "",
      index: true,
    },
    odooCompletedAt: {
      type: Date,
      default: null,
    },
    odooCompletedBy: {
      type: String,
      default: "",
      trim: true,
    },
    odooOrderNumber: {
      type: String,
      default: "",
      trim: true,
    },
    lastReminderSentAt: {
      type: Date,
      default: null,
    },
    initialSnapshot: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true, strict: false }
)

// Compound and search indexes for query optimization
SavedQuoteSchema.index(
  { status: 1, assignedTo: 1, createdAt: -1 },
  { name: "reviewer_queue" }
)
SavedQuoteSchema.index(
  { odooAssignedTo: 1, odooStatus: 1, createdAt: -1 },
  { name: "clerk_odoo_queue" }
)
SavedQuoteSchema.index(
  { preparedBy: 1, status: 1, createdAt: -1 },
  { name: "employee_history" }
)
SavedQuoteSchema.index({ createdAt: -1 }, { name: "admin_archive" })
SavedQuoteSchema.index(
  {
    quoteNumber: "text",
    customerName: "text",
    preparedBy: "text",
    odooOrderNumber: "text",
  },
  { name: "quote_text_search" }
)

if (
  mongoose.models.SavedQuote &&
  (!mongoose.models.SavedQuote.schema.path("quoteNumber") ||
    !mongoose.models.SavedQuote.schema.path("odooStatus"))
) {
  delete (mongoose.models as Record<string, unknown>).SavedQuote
}

const SavedQuoteModel: Model<ISavedQuote> =
  (mongoose.models.SavedQuote as Model<ISavedQuote>) ||
  mongoose.model<ISavedQuote>("SavedQuote", SavedQuoteSchema)
export default SavedQuoteModel
