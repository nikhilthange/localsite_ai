import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';

export default function About({ content = {}, branding = {} }) {
  const { title, content: text, image, stats = [], features = [] } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (!title && !text) return null;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: colors.background || '#FAFAFA' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: colors.text }}>{title || 'About Us'}</h2>
            {text && (
              <div className="space-y-4">
                {text.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="leading-relaxed" style={{ color: colors.textSecondary }}>{p}</p>
                ))}
              </div>
            )}
            {features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: colors.text }}>
                    <HiCheck className="w-4 h-4 shrink-0" style={{ color: primaryColor }} /> {f}
                  </div>
                ))}
              </div>
            )}
            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t" style={{ borderColor: colors.border || '#E4E4E7' }}>
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold" style={{ color: primaryColor }}>{stat.value}</div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          {image && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
