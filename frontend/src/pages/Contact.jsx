import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi';
import { FiSend, FiArrowRight } from 'react-icons/fi';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/contact/send', form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: HiMail, label: 'Email', value: 'hello@localsite.ai' },
    { icon: HiPhone, label: 'Phone', value: '+1 (555) 123-4567' },
    { icon: HiLocationMarker, label: 'Location', value: 'San Francisco, CA' },
    { icon: HiClock, label: 'Hours', value: 'Mon-Fri 9AM-6PM PST' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="section-heading mb-4">Get in Touch</h1>
          <p className="section-subheading mx-auto">Have a question, feedback, or need help? We're here for you.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="card-hover flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{item.label}</p>
                    <p className="font-medium text-[rgb(var(--color-text))]">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="card">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={`input-field ${errors.name ? 'input-error' : ''}`}
                    placeholder="Your name" />
                  {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className={`input-field ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@example.com" />
                  {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="input-field" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    className="input-field" placeholder="How can we help?" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Message *</label>
                <textarea rows={5} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className={`input-field resize-none ${errors.message ? 'input-error' : ''}`}
                  placeholder="Tell us more about what you need..." />
                {errors.message && <p className="mt-1.5 text-sm text-red-500">{errors.message}</p>}
              </div>
              <Button type="submit" variant="primary" className="w-full py-3.5" loading={loading}>
                <FiSend className="w-4 h-4" /> Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
