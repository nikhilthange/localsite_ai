import { Schema } from 'mongoose';

export interface SoftDelete {
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

export function softDeletePlugin(schema: Schema): void {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
  });

  schema.pre('find', function () {
    if (!this.getQuery().includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
  });

  schema.pre('findOne', function () {
    if (!this.getQuery().includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
  });

  schema.pre('countDocuments', function () {
    if (!this.getQuery().includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
  });

  schema.pre('aggregate', function () {
    const pipeline = this.pipeline() as any[];
    const hasIncludeDeleted = pipeline.some(
      (stage: any) => stage.$match && stage.$match.includeDeleted
    );
    if (!hasIncludeDeleted) {
      pipeline.unshift({ $match: { isDeleted: { $ne: true } } });
    }
  });

  schema.methods.softDelete = async function (deletedBy?: string) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy || null;
    return this.save();
  };

  schema.statics.softDeleteMany = async function (filter: Record<string, any>, deletedBy?: string) {
    return this.updateMany(filter, {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy || null,
      },
    });
  };

  schema.statics.restore = async function (id: string) {
    return this.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false, deletedAt: null, deletedBy: null } },
      { new: true }
    );
  };
}

export function auditPlugin(schema: Schema): void {
  schema.add({
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  });
}
