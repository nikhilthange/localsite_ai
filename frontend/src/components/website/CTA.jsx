import { motion } from 'framer-motion';

export default function CTA({ content = {}, branding = {}, background = {} }) {
  const { title, subtitle, buttonText, buttonLink } = content;
  const colors = branding.colors || {};

  if (!title) return null;

  const bgStyle = background?.type === 'color'
    ? { backgroundColor: background.value || colors.primary }
    : { background: background.value || colors.gradients?.primary || `linear-gradient(135deg, ${colors.primary || '#6366F1'}, ${colors.secondary || '#14B8A6'})` };

  return (
    <section className="py-20 md:py-28" style={bgStyle}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          {subtitle && <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">{subtitle}</p>}
          <a
            href={buttonLink || '#contact'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-white hover:bg-white/90 text-gray-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {buttonText || 'Get Started'}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
