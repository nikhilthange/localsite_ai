import mongoose, { Schema } from 'mongoose';
import { AITaskType } from '../types';

const promptTemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    taskType: {
      type: String,
      enum: Object.values(AITaskType),
      required: true,
      index: true,
    },
    systemPrompt: {
      type: String,
      required: true,
    },
    userPromptTemplate: {
      type: String,
      required: true,
    },
    description: { type: String },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    variables: [{ type: String }],
    defaultModel: { type: String },
    defaultTemperature: { type: Number, default: 0.7, min: 0, max: 2 },
    defaultMaxTokens: { type: Number, default: 2000, min: 50 },
  },
  {
    timestamps: true,
  }
);

promptTemplateSchema.index({ taskType: 1, isActive: 1 });
promptTemplateSchema.index({ name: 1, version: -1 });

export const PromptTemplate = mongoose.model('PromptTemplate', promptTemplateSchema);
