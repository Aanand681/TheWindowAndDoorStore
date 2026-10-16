import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedQuote extends Document {
  quoteNumber: string;
  customerName: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'MODIFIED' | 'RETURNED';
  preparedBy: string;
  preparedByEmail?: string;
  assignedTo: string;
  assignedToEmail?: string;
  preparerNotes?: string;
  reviewerNotes?: string;
  reviewChanges?: string[];
  isStarred?: boolean;
  initialSnapshot?: any;
  
  // Snapshot Payload
  windows: any[];
  taxTotals: any;
  quoteResult: any;
  quoteNotes: string;
  surchargeRate: number;
  activePromoId?: string;

  // Odoo Entry Tracking
  odooAssignedTo?: string;
  odooAssignedToEmail?: string;
  odooStatus?: 'PENDING_ENTRY' | 'COMPLETED';
  odooCompletedAt?: Date;
  odooCompletedBy?: string;
  odooOrderNumber?: string;

  reviewedAt?: Date;
  reviewedBy?: string;
  reviewedByRole?: string;
  lastReminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavedQuoteSchema = new Schema<ISavedQuote>(
  {
    quoteNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'MODIFIED', 'RETURNED'],
      default: 'PENDING_REVIEW',
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
      default: 'Admin',
      trim: true,
      index: true,
    },
    assignedToEmail: {
      type: String,
      trim: true,
    },
    preparerNotes: {
      type: String,
      default: '',
    },
    reviewerNotes: {
      type: String,
      default: '',
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
      default: '',
    },
    surchargeRate: {
      type: Number,
      default: 8,
    },
    activePromoId: {
      type: String,
      default: 'none',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedByRole: {
      type: String,
      default: '',
      trim: true,
    },
    odooAssignedTo: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    odooAssignedToEmail: {
      type: String,
      default: '',
      trim: true,
    },
    odooStatus: {
      type: String,
      enum: ['PENDING_ENTRY', 'COMPLETED', ''],
      default: '',
      index: true,
    },
    odooCompletedAt: {
      type: Date,
      default: null,
    },
    odooCompletedBy: {
      type: String,
      default: '',
      trim: true,
    },
    odooOrderNumber: {
      type: String,
      default: '',
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
);

if (mongoose.models.SavedQuote && (!mongoose.models.SavedQuote.schema.path('quoteNumber') || !mongoose.models.SavedQuote.schema.path('odooStatus'))) {
  delete (mongoose.models as any).SavedQuote;
}

export default mongoose.models.SavedQuote || mongoose.model<ISavedQuote>('SavedQuote', SavedQuoteSchema);
