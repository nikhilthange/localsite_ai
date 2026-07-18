import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';

export default function About({ content = {}, branding = {} }) {
  const { title, content: text, image, stats = [], features = [] } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (!title && !text) return null;

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: colors.background || '#FAFAFA' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-1 rounded-full mb-6" style={{ backgroundColor: primaryColor }} />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight" style={{ color: colors.text }}>
              {title || 'About Us'}
            </h2>
            {text && (
              <div className="space-y-5">
                {text.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="leading-relaxed text-base md:text-lg" style={{ color: colors.textSecondary }}>{p}</p>
                ))}
              </div>
            )}
            {features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" style={{ backgroundColor: primaryColor + '08' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor + '20' }}>
                      <HiCheck className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: colors.text }}>{f}</span>
                  </div>
                ))}
              </div>
            )}
            {stats.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 pt-10 border-t" style={{ borderColor: colors.border || '#E4E4E7' }}>
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-bold tracking-tight" style={{ color: primaryColor }}>{stat.value}</div>
                    <div className="text-sm mt-1.5 font-medium" style={{ color: colors.textSecondary }}>{stat.label}</div>
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
              <div className="absolute -inset-4 rounded-3xl opacity-20" style={{ backgroundColor: primaryColor }} />
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
