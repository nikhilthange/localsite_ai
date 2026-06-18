import { Document, Types } from 'mongoose';

export interface ILead extends Document {
  _id: Types.ObjectId;
  websiteId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: string;
  sourceUrl?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score: number;
  tags: string[];
  notes: Array<{ content: string; addedBy?: Types.ObjectId; addedAt: Date }>;
  convertedAt?: Date;
  convertedToCustomerId?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  lastContactedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface ICustomer extends Document {
  _id: Types.ObjectId;
  websiteId: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tags: string[];
  notes: string[];
  lifetimeValue: number;
  totalOrders: number;
  lastContact?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  websiteId: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  customerId?: Types.ObjectId;
  staffId?: Types.ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  email: string;
  phone?: string;
  remindersSent: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}
