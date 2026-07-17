import { motion } from 'framer-motion';
import { HiUsers, HiStar, HiTrendingUp, HiClock, HiGlobe, HiHeart } from 'react-icons/hi';

const iconMap = {
  users: HiUsers, star: HiStar, 'trending-up': HiTrendingUp, clock: HiClock, globe: HiGlobe, heart: HiHeart,
};

export default function Stats({ content = {}, branding = {} }) {
  const { items = [] } = content;
  const colors = branding.colors || {};

  if (items.length === 0) return null;

  return (
    <section
      className="py-16 md:py-20"
      style={{
        background: colors.gradients?.primary || `linear-gradient(135deg, ${colors.primary || '#6366F1'}, ${colors.secondary || '#14B8A6'})`,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {items.map((stat, i) => {
            const Icon = iconMap[stat.icon] || HiStar;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/80 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
