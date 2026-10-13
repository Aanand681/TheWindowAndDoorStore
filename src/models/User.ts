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
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
