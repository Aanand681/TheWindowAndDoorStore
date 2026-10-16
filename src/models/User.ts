import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
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
    landingPage: {
      type: String,
      enum: ['calculator', 'quotes', 'admin'],
      default: 'calculator',
    },
    muteNotifications: {
      type: Boolean,
      default: false,
    },
    favoriteTemplate: {
      type: String,
      enum: ['modern', 'executive', 'cards', 'compact', 'breakdown'],
      default: 'modern',
    },
    department: {
      type: String,
      default: 'SALES',
    },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models.User && (!mongoose.models.User.schema.path('landingPage') || !mongoose.models.User.schema.path('department') || !mongoose.models.User.schema.path('muteNotifications') || !mongoose.models.User.schema.path('favoriteTemplate'))) {
  delete (mongoose.models as any).User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
