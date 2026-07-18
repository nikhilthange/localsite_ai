import { motion } from 'framer-motion';
import { HiCheck, HiCurrencyDollar, HiArrowRight } from 'react-icons/hi';

function ServiceCard({ service, i, primaryColor, colors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative p-6 md:p-8 rounded-2xl border transition-all duration-500 hover:shadow-xl hover:shadow-[var(--color-primary)/8]"
      style={{ backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border || '#E4E4E7' }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}08, ${primaryColor}03)`,
        }}
      />
      <div className="relative z-10">
        {service.icon && (
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
            style={{ backgroundColor: primaryColor + '12', color: primaryColor }}
          >
            {service.icon}
          </div>
        )}
        <h3 className="text-xl font-semibold mb-3" style={{ color: colors.text }}>{service.title}</h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: colors.textSecondary }}>{service.description}</p>
        {service.price && (
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>{service.price}</span>
            {service.period && <span className="text-sm opacity-60" style={{ color: colors.textSecondary }}>/{service.period}</span>}
          </div>
        )}
        {service.features?.length > 0 && (
          <div className="space-y-2.5 mt-6 pt-6 border-t" style={{ borderColor: colors.border || '#E4E4E7' }}>
            {service.features.map((f, j) => (
              <div key={j} className="flex items-start gap-3 text-sm" style={{ color: colors.textSecondary }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0" style={{ backgroundColor: primaryColor + '15' }}>
                  <HiCheck className="w-3 h-3" style={{ color: primaryColor }} />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Services({ content = {}, branding = {} }) {
  const { title, description, items = [], layout: dataLayout } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (items.length === 0) return null;

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: colors.surfaceAlt || '#F4F4F5' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14 md:mb-20"
          >
            {title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: colors.text }}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: colors.textSecondary }}>
                {description}
              </p>
            )}
          </motion.div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((service, i) => (
            <ServiceCard key={i} service={service} i={i} primaryColor={primaryColor} colors={colors} />
          ))}
        </div>
      </div>
    </section>
  );
}
