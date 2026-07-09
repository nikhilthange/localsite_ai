import mongoose, { Schema } from 'mongoose';
import type { IAppointment } from '../../../types/models';

const appointmentSchema = new Schema<IAppointment>(
  {
    websiteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    staffId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    email: { type: String, required: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'] },
    phone: { type: String },
    remindersSent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

appointmentSchema.index({ websiteId: 1, startTime: -1 });
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ staffId: 1, startTime: -1 });
appointmentSchema.index({ email: 1 });
appointmentSchema.index({ status: 1, startTime: -1 });

appointmentSchema.pre('validate', function(next) {
  if (this.endTime && this.startTime && this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
