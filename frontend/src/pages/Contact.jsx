import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi';
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
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Have a question, feedback, or need help? We're here for you.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    placeholder="Your name" />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    placeholder="you@example.com" />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors"
                    placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors"
                    placeholder="How can we help?" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                <textarea rows={5} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none transition-colors ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="Tell us more about what you need..." />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
              </div>
              <Button type="submit" variant="primary" className="w-full rounded-xl py-3.5" loading={loading}>
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
