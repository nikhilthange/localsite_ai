import mongoose, { Schema } from 'mongoose';
import { AITaskType, AIModel } from '../types';

const aiUsageLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      index: true,
    },
    taskType: {
      type: String,
      enum: Object.values(AITaskType),
      required: true,
      index: true,
    },
    model: {
      type: String,
      enum: Object.values(AIModel),
      required: true,
    },
    promptTokens: { type: Number, required: true, min: 0 },
    completionTokens: { type: Number, required: true, min: 0 },
    totalTokens: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    creditsConsumed: { type: Number, required: true, min: 0, default: 0 },
    latency: { type: Number, required: true, min: 0 },
    cached: { type: Boolean, default: false },
    success: { type: Boolean, required: true },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

aiUsageLogSchema.index({ userId: 1, createdAt: -1 });
aiUsageLogSchema.index({ taskType: 1, createdAt: -1 });
aiUsageLogSchema.index({ model: 1, createdAt: -1 });
aiUsageLogSchema.index({ websiteId: 1, createdAt: -1 });
aiUsageLogSchema.index({ createdAt: -1 });
aiUsageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const AiUsageLog = mongoose.model('AiUsageLog', aiUsageLogSchema);
