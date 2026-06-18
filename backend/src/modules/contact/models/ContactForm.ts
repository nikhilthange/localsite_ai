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
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    message: { type: String, required: true },
    source: { type: String, required: true },
  },
  { timestamps: true }
);

export const ContactForm = mongoose.model<IContactForm>('ContactForm', contactFormSchema);
