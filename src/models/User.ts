import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EMPLOYEE';

export interface IUserCustomPermissions {
  canCreateQuote?: boolean;
  canReviewQuote?: boolean;
  canEditApprovedQuote?: boolean;
  canAccessOdooQueue?: boolean;
  canMarkOdooEntry?: boolean;
  canAccessAdmin?: boolean;
}

export interface IUser extends Document {
  username?: string;
  email?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  resetOtp?: string | null;
  resetOtpExpiry?: Date | null;
  resetOtpAttempts?: number;
  landingPage?: 'calculator' | 'quotes' | 'admin';
  muteNotifications?: boolean;
  receiveQuoteEmails?: boolean;
  favoriteTemplate?: 'modern' | 'executive' | 'cards' | 'compact' | 'breakdown';
  department?: string;
  customPermissions?: IUserCustomPermissions;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined to not violate uniqueness
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['SUPERADMIN', 'ADMIN', 'EMPLOYEE'],
      default: 'EMPLOYEE',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiry: {
      type: Date,
      default: null,
    },
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
    landingPage: {
      type: String,
      enum: ['calculator', 'quotes', 'admin'],
      default: 'calculator',
    },
    muteNotifications: {
      type: Boolean,
      default: false,
    },
    receiveQuoteEmails: {
      type: Boolean,
      default: true,
    },
    favoriteTemplate: {
      type: String,
      enum: ['modern', 'executive', 'cards', 'compact', 'breakdown'],
      default: 'modern',
    },
    department: {
      default: 'SALES',
      type: String,
    },
    customPermissions: {
      canCreateQuote: { type: Boolean },
      canReviewQuote: { type: Boolean },
      canEditApprovedQuote: { type: Boolean },
      canAccessOdooQueue: { type: Boolean },
      canMarkOdooEntry: { type: Boolean },
      canAccessAdmin: { type: Boolean },
    },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models.User && (!mongoose.models.User.schema.path('landingPage') || !mongoose.models.User.schema.path('department') || !mongoose.models.User.schema.path('muteNotifications') || !mongoose.models.User.schema.path('receiveQuoteEmails') || !mongoose.models.User.schema.path('favoriteTemplate') || !mongoose.models.User.schema.path('customPermissions'))) {
  delete (mongoose.models as Record<string, unknown>).User;
}

const UserModel: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
export default UserModel;
