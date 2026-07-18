import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';

export default function CTA({ content = {}, branding = {}, background = {} }) {
  const { title, subtitle, buttonText, buttonLink } = content;
  const colors = branding.colors || {};

  if (!title) return null;

  const bgStyle = background?.type === 'color'
    ? { backgroundColor: background.value || colors.primary }
    : { background: background.value || `linear-gradient(135deg, ${colors.primary || '#6366F1'}, ${colors.secondary || '#14B8A6'})` };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={bgStyle}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1, y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)`,
          filter: 'blur(60px)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1, y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)`,
          filter: 'blur(60px)',
          transform: 'translate(-30%, 30%)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          <a
            href={buttonLink || '#contact'}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-white hover:bg-white/90 text-gray-900 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
            <span>{buttonText || 'Get Started'}</span>
            <HiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
