import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiCheck } from 'react-icons/hi';

export default function Pricing({ content = {}, branding = {} }) {
  const { title, description, items = [] } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: colors.background || '#FAFAFA' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {items.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={twMerge(
                'relative rounded-3xl p-8 transition-all duration-300 border',
                plan.featured
                  ? 'md:scale-110 z-10 shadow-xl'
                  : 'hover:shadow-lg'
              )}
              style={{
                backgroundColor: plan.featured ? colors.surface || '#FFFFFF' : colors.surface || '#FFFFFF',
                borderColor: plan.featured ? primaryColor : (colors.border || '#E4E4E7'),
              }}
            >
              {plan.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>{plan.title}</h3>
              <div className="mb-4">
                <span className="text-4xl font-extrabold" style={{ color: primaryColor }}>{plan.price}</span>
                {plan.period && <span className="text-sm ml-1" style={{ color: colors.textSecondary }}>/{plan.period}</span>}
              </div>
              <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {(plan.features || []).map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor + '20' }}>
                      <HiCheck className="w-3 h-3" style={{ color: primaryColor }} />
                    </div>
                    <span style={{ color: colors.text }}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={twMerge(
                  'w-full py-3.5 rounded-2xl text-sm font-semibold transition-all',
                  plan.featured
                    ? 'text-white shadow-lg hover:shadow-xl'
                    : 'border-2 hover:bg-gray-50'
                )}
                style={plan.featured ? { backgroundColor: primaryColor } : { borderColor: primaryColor, color: primaryColor }}
              >
                {plan.cta || 'Get Started'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
