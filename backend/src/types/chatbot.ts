import { Document, Types } from 'mongoose';

export interface IChatbot extends Document {
  _id: Types.ObjectId;
  websiteId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  name: string;
  greeting: string;
  avatar?: string;
  theme: Record<string, any>;
  trainingData: Array<{ question: string; answer: string }>;
  fallbackMessage: string;
  settings: {
    leadCapture: boolean;
    leadFormFields: string[];
    appointmentBooking: boolean;
    appointmentTypes: string[];
    whatsappHandoff: boolean;
    whatsappNumber?: string;
    emailNotifications: boolean;
    notificationEmail?: string;
    workingHours: {
      start: string;
      end: string;
      timezone: string;
      enabled: boolean;
    };
    appearance: {
      position: 'left' | 'right';
      bubbleColor: string;
      textColor: string;
      showBranding: boolean;
    };
    aiModel: string;
    temperature: number;
    maxTokens: number;
  };
  isActive: boolean;
  conversations: number;
  leadsCaptured: number;
  rating: number;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}
