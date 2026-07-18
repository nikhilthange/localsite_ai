import { motion } from 'framer-motion';
import { HiUsers, HiStar, HiTrendingUp, HiClock, HiGlobe, HiHeart, HiCheckCircle } from 'react-icons/hi';

const iconMap = {
  users: HiUsers, star: HiStar, 'trending-up': HiTrendingUp, clock: HiClock,
  globe: HiGlobe, heart: HiHeart, 'check-circle': HiCheckCircle,
};

export default function Stats({ content = {}, branding = {} }) {
  const { items = [] } = content;
  const colors = branding.colors || {};

  if (items.length === 0) return null;

  return (
    <section
      className="relative py-20 md:py-24 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.primary || '#6366F1'}, ${colors.secondary || '#14B8A6'})`,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1, y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`,
          filter: 'blur(60px)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm text-white/70 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
