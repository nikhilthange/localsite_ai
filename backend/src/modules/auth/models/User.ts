import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { IUser } from '../../../types/auth';

const SALT_ROUNDS = 12;
const TOKEN_BYTES = 32;

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      maxlength: [128, 'Password cannot exceed 128 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'agency_owner', 'team_member'],
        message: 'Invalid role: {VALUE}',
      },
      default: 'user',
    },
    avatar: { type: String },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshTokens: [{ type: String }],
    googleId: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    agencyId: { type: Schema.Types.ObjectId, ref: 'User' },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    stripeCustomerId: { type: String },
    razorpayCustomerId: { type: String },
    aiUsage: {
      requests: { type: Number, default: 0, min: 0 },
      tokens: { type: Number, default: 0, min: 0 },
      lastRequestAt: { type: Date },
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      notifications: { type: Boolean, default: true },
      emailReports: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    lastLogin: { type: Date },
    lastActiveAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret.__v;
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ stripeCustomerId: 1 }, { sparse: true });
userSchema.index({ razorpayCustomerId: 1 }, { sparse: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ agencyId: 1, role: 1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: 'text', email: 'text' });
userSchema.index({ organizationId: 1, role: 1 });

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateVerificationToken = function (): string {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

userSchema.methods.generateResetToken = function (): string {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  return token;
};

softDeletePlugin(userSchema);
auditPlugin(userSchema);

export const User = mongoose.model<IUser>('User', userSchema);
