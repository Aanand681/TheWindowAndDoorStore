import mongoose, { Schema, Document, Model } from "mongoose"

export type QuoteDraftType = "window" | "sealed_unit" | "door"

export interface IQuoteDraft extends Document {
  username: string
  type: QuoteDraftType
  quoteNumber: string
  customerName: string
  itemCount: number
  subtotal: number
  grandTotal: number
  summaryLabel: string
  data: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const QuoteDraftSchema = new Schema<IQuoteDraft>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["window", "sealed_unit", "door"],
      required: true,
      index: true,
    },
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
    },
    itemCount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    summaryLabel: {
      type: String,
      default: "",
      maxlength: 500,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: false,
  }
)

QuoteDraftSchema.index(
  { username: 1, type: 1, quoteNumber: 1 },
  { unique: true }
)
QuoteDraftSchema.index({ username: 1, updatedAt: -1 })

if (
  mongoose.models.QuoteDraft &&
  !mongoose.models.QuoteDraft.schema.path("username")
) {
  delete (mongoose.models as Record<string, unknown>).QuoteDraft
}

const QuoteDraftModel: Model<IQuoteDraft> =
  (mongoose.models.QuoteDraft as Model<IQuoteDraft>) ||
  mongoose.model<IQuoteDraft>("QuoteDraft", QuoteDraftSchema)

export default QuoteDraftModel
