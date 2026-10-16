import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientUsername: string;
  senderUsername: string;
  type: 'QUOTE_APPROVED' | 'QUOTE_MODIFIED' | 'QUOTE_RETURNED' | 'QUOTE_ASSIGNED' | 'QUOTE_SUBMITTED' | 'QUOTE_ODOO_ASSIGNED' | 'ODOO_ENTRY_COMPLETED';
  title: string;
  message: string;
  quoteId: string;
  quoteNumber: string;
  customerName: string;
  reviewChanges?: string[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUsername: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    senderUsername: {
      type: String,
      default: 'System',
      trim: true,
    },
    type: {
      type: String,
      enum: ['QUOTE_APPROVED', 'QUOTE_MODIFIED', 'QUOTE_RETURNED', 'QUOTE_ASSIGNED', 'QUOTE_SUBMITTED', 'QUOTE_ODOO_ASSIGNED', 'ODOO_ENTRY_COMPLETED'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    quoteId: {
      type: String,
      default: '',
    },
    quoteNumber: {
      type: String,
      default: '',
    },
    customerName: {
      type: String,
      default: '',
    },
    reviewChanges: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index: Automatically expire notifications older than 30 days (30 * 24 * 60 * 60 seconds)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

if (process.env.NODE_ENV !== 'production') {
  delete (mongoose.models as any).Notification;
}

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

