import mongoose, { Schema, Document } from 'mongoose';

interface IContactForm extends Document {
  websiteId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: string;
  createdAt: Date;
}

const contactFormSchema = new Schema<IContactForm>(
  {
    websiteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'] },
    phone: { type: String },
    message: { type: String, required: true },
    source: { type: String, required: true },
  },
  { timestamps: true }
);

contactFormSchema.index({ websiteId: 1, createdAt: -1 });
contactFormSchema.index({ email: 1, websiteId: 1 });
contactFormSchema.index({ status: 1 });

export const ContactForm = mongoose.model<IContactForm>('ContactForm', contactFormSchema);
