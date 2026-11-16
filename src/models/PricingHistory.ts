import mongoose, { Schema, Document } from "mongoose"

export type PricingCategory =
  | "WINDOW_LABOUR"
  | "DOORS"
  | "SEALED_UNITS"
  | "GLOBAL_SETTINGS"

export interface IPricingHistory extends Document {
  category: PricingCategory
  version: number
  snapshot: Record<string, any>
  savedBy: string
  notes?: string
  createdAt: Date
}

const PricingHistorySchema = new Schema<IPricingHistory>(
  {
    category: {
      type: String,
      required: true,
      enum: ["WINDOW_LABOUR", "DOORS", "SEALED_UNITS", "GLOBAL_SETTINGS"],
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    snapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    savedBy: {
      type: String,
      required: true,
      default: "System Admin",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

PricingHistorySchema.index({ category: 1, createdAt: -1 })

export default mongoose.models.PricingHistory ||
  mongoose.model<IPricingHistory>("PricingHistory", PricingHistorySchema)

