import mongoose, { Schema } from 'mongoose';
import { softDeletePlugin, auditPlugin } from '../../../core/database/SoftDeletePlugin';
import type { IChatbot } from '../../../types/chatbot';

const chatbotSchema = new Schema<IChatbot>(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      required: [true, 'Website ID is required'],
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    name: {
      type: String,
      required: [true, 'Chatbot name is required'],
      trim: true,
    },
    greeting: {
      type: String,
      default: 'Hi there! How can I help you today?',
    },
    avatar: { type: String },
    theme: { type: Map, of: Schema.Types.Mixed, default: {} },
    trainingData: [{
      _id: false,
      question: { type: String, required: true },
      answer: { type: String, required: true },
    }],
    fallbackMessage: {
      type: String,
      default: 'Sorry, I didn\'t understand that.',
    },
    settings: {
      leadCapture: { type: Boolean, default: false },
      leadFormFields: [{ type: String }],
      appointmentBooking: { type: Boolean, default: false },
      appointmentTypes: [{ type: String }],
      whatsappHandoff: { type: Boolean, default: false },
      whatsappNumber: { type: String },
      emailNotifications: { type: Boolean, default: true },
      notificationEmail: { type: String },
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
        timezone: { type: String, default: 'UTC' },
        enabled: { type: Boolean, default: true },
      },
      appearance: {
        position: { type: String, enum: ['left', 'right'], default: 'right' },
        bubbleColor: { type: String, default: '#3B82F6' },
        textColor: { type: String, default: '#FFFFFF' },
        showBranding: { type: Boolean, default: true },
      },
      aiModel: { type: String, default: 'meta/llama-3.1-8b-instruct' },
      temperature: { type: Number, default: 0.7, min: 0, max: 2 },
      maxTokens: { type: Number, default: 300, min: 50, max: 2000 },
    },
    isActive: { type: Boolean, default: false, index: true },
    conversations: { type: Number, default: 0, min: 0 },
    leadsCaptured: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    lastActiveAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

chatbotSchema.index({ websiteId: 1 }, { unique: true });
chatbotSchema.index({ organizationId: 1, isActive: 1 });
chatbotSchema.index({ isActive: 1 });
chatbotSchema.index({ rating: -1 });

softDeletePlugin(chatbotSchema);
auditPlugin(chatbotSchema);

export const Chatbot = mongoose.model<IChatbot>('Chatbot', chatbotSchema);
