import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiStar, HiShieldCheck, HiHeart, HiLightningBolt, HiGlobe, HiUsers, HiCube, HiChartBar } from 'react-icons/hi';

const iconMap = {
  star: HiStar, shield: HiShieldCheck, heart: HiHeart, zap: HiLightningBolt,
  globe: HiGlobe, users: HiUsers, cube: HiCube, 'chart-bar': HiChartBar,
};

export default function Features({ content = {}, branding = {} }) {
  const { title, description, items = [], columns = 3 } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (items.length === 0) return null;

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'sm:grid-cols-2 lg:grid-cols-3';

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
        <div className={twMerge('grid grid-cols-1', gridCols, 'gap-8')}>
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] || HiStar;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: primaryColor + '15', color: primaryColor }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
