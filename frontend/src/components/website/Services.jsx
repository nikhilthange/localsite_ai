import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiCheck, HiCurrencyDollar } from 'react-icons/hi';

function ServiceCard({ service, i, primaryColor, colors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ y: -4 }}
      className="group p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg"
      style={{ backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border || '#E4E4E7' }}
    >
      {service.icon && (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl" style={{ backgroundColor: primaryColor + '15', color: primaryColor }}>
          {service.icon}
        </div>
      )}
      <h3 className="text-lg md:text-xl font-semibold mb-2" style={{ color: colors.text }}>{service.title}</h3>
      <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: colors.textSecondary }}>{service.description}</p>
      {service.price && (
        <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: primaryColor }}>
          <HiCurrencyDollar className="w-4 h-4" /> {service.price}
          {service.period && <span className="font-normal opacity-70">/{service.period}</span>}
        </div>
      )}
      {service.features?.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t" style={{ borderColor: colors.border || '#E4E4E7' }}>
          {service.features.map((f, j) => (
            <div key={j} className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
              <HiCheck className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} /> {f}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function Services({ content = {}, branding = {} }) {
  const { title, description, items = [], layout: dataLayout } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: colors.surfaceAlt || '#F4F4F5' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((service, i) => (
            <ServiceCard key={i} service={service} i={i} primaryColor={primaryColor} colors={colors} />
          ))}
        </div>
      </div>
    </section>
  );
}
