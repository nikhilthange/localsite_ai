import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Newsletter({ content = {}, branding = {} }) {
  const { title, description, placeholder, buttonText } = content;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const colors = branding.colors || {};

  if (!title) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <section className="py-16" style={{ backgroundColor: colors.surfaceAlt || '#F4F4F5' }}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: colors.text }}>{title}</h3>
          {description && <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>{description}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder || 'Enter your email'}
              required
              className="flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: colors.border || '#E4E4E7', color: colors.text, backgroundColor: colors.surface }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primary || '#6366F1' }}
            >
              {status === 'success' ? 'Subscribed!' : (buttonText || 'Subscribe')}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
