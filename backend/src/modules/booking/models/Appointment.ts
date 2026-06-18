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
    email: { type: String, required: true },
    phone: { type: String },
    remindersSent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
