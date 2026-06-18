import { Document, Types } from 'mongoose';

export type OrgSubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type OrgMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  owner: Types.ObjectId;
  members: Array<{
    user: Types.ObjectId;
    role: OrgMemberRole;
    joinedAt: Date;
    invitedBy?: Types.ObjectId;
  }>;
  settings: {
    theme: 'light' | 'dark';
    timezone: string;
    locale: string;
    aiModel: string;
    maxWebsites: number;
    maxTeamMembers: number;
    branding?: {
      logo?: string;
      primaryColor?: string;
      favicon?: string;
    };
    features: string[];
  };
  billing: {
    stripeCustomerId?: string;
    razorpayCustomerId?: string;
    taxId?: string;
    billingEmail: string;
    billingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    paymentMethod?: Types.ObjectId;
    invoicePrefix: string;
  };
  subscription?: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
