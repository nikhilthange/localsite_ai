import { motion } from 'framer-motion';
import { HiSearch, HiChat, HiCheckCircle, HiLightningBolt, HiPhone, HiPencilAlt } from 'react-icons/hi';

const iconMap = {
  search: HiSearch, 'message-circle': HiChat, 'check-circle': HiCheckCircle,
  zap: HiLightningBolt, phone: HiPhone, edit: HiPencilAlt,
};

export default function Process({ content = {}, branding = {} }) {
  const { title, description, steps = [] } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (steps.length === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: colors.background || '#FAFAFA' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => {
            const Icon = iconMap[step.icon] || HiCheckCircle;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5"
                    style={{ backgroundColor: primaryColor + '30' }}
                  />
                )}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold relative z-10"
                  style={{ backgroundColor: primaryColor + '15', color: primaryColor }}
                >
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
