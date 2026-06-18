import mongoose, { Schema } from 'mongoose';

const aiCreditSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, required: true, default: 0, min: 0 },
    lifetimeUsed: { type: Number, default: 0, min: 0 },
    lifetimePurchased: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

export const AiCredit = mongoose.model('AiCredit', aiCreditSchema);

const aiCreditTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['consumption', 'purchase', 'bonus', 'refund', 'subscription_allotment'],
      required: true,
      index: true,
    },
    taskType: { type: String },
    description: { type: String, required: true },
    referenceId: { type: String },
  },
  {
    timestamps: true,
  }
);

aiCreditTransactionSchema.index({ userId: 1, createdAt: -1 });
aiCreditTransactionSchema.index({ type: 1, createdAt: -1 });

export const AiCreditTransaction = mongoose.model('AiCreditTransaction', aiCreditTransactionSchema);
