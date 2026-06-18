import { Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin' | 'agency_owner' | 'team_member';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens: string[];
  googleId?: string;
  organizationId?: Types.ObjectId;
  agencyId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  stripeCustomerId?: string;
  razorpayCustomerId?: string;
  aiUsage: {
    requests: number;
    tokens: number;
    lastRequestAt?: Date;
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    emailReports: boolean;
    marketingEmails: boolean;
  };
  lastLogin?: Date;
  lastActiveAt?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
