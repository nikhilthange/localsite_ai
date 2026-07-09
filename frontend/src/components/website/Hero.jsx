import { motion } from 'framer-motion';
import { HiArrowRight, HiPlay } from 'react-icons/hi';
import { ImageService } from './ImageService';

const imgService = new ImageService();

function Centered({ data, colors, heroImage }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {heroImage && (
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      )}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}CC, ${colors.secondary}88)` }} />
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {data.badge && (
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium border border-white/30 text-white/90 bg-white/10 backdrop-blur-sm mb-6"
          >
            {data.badge}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
        >
          {data.title || 'Welcome'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10"
        >
          {data.subtitle || ''}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={data.ctaLink || '#contact'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: colors.primary || '#6366F1' }}
          >
            {data.ctaPrimary || 'Get Started'} <HiArrowRight className="w-5 h-5" />
          </a>
          {data.ctaSecondary && (
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/90 hover:text-white border border-white/20 hover:border-white/40"
            >
              <HiPlay className="w-5 h-5" /> {data.ctaSecondary}
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Split({ data, colors, heroImage, textSide = 'left' }) {
  const content = (
    <div className="relative z-10 flex items-center px-4 sm:px-8 lg:px-16 py-20 lg:py-0">
      <div className="max-w-xl">
        {data.badge && (
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium border border-white/30 text-white/90 bg-white/10 backdrop-blur-sm mb-6"
          >{data.badge}</motion.span>
        )}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
        >{data.title || 'Welcome'}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
          className="text-lg sm:text-xl text-white/80 mb-10"
        >{data.subtitle || ''}</motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a href={data.ctaLink || '#contact'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: colors.primary || '#6366F1' }}
          >{data.ctaPrimary || 'Get Started'} <HiArrowRight className="w-5 h-5" /></a>
          {data.ctaSecondary && (
            <a href="#about" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/80 hover:text-white border border-white/20">{data.ctaSecondary}</a>
          )}
        </motion.div>
      </div>
    </div>
  );

  const imageSection = (
    <div className="relative lg:absolute lg:inset-y-0 lg:w-1/2 overflow-hidden">
      {heroImage && <img src={heroImage} alt="" className="w-full h-full object-cover" loading="lazy" />}
      <div className="absolute inset-0 lg:hidden" style={{ background: `linear-gradient(135deg, ${colors.primary}CC, ${colors.secondary}88)` }} />
    </div>
  );

  return (
    <div className="relative min-h-screen lg:flex">
      {textSide === 'left' ? (
        <><div className="relative z-10 lg:w-1/2">{content}</div>{imageSection}</>
      ) : (
        <>{imageSection}<div className="relative z-10 lg:w-1/2">{content}</div></>
      )}
    </div>
  );
}

function Minimal({ data, colors, heroImage }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {heroImage && <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}CC, ${colors.secondary}88)` }} />
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
        {data.badge && (
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium border border-white/30 text-white/90 bg-white/10 backdrop-blur-sm mb-6"
          >{data.badge}</motion.span>
        )}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight mb-6"
        >{data.title || 'Welcome'}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
          className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto mb-10 font-light"
        >{data.subtitle || ''}</motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
          <a href={data.ctaLink || '#contact'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium text-white transition-all shadow-lg hover:shadow-xl"
            style={{ backgroundColor: colors.primary || '#6366F1' }}
          >{data.ctaPrimary || 'Get Started'}</a>
        </motion.div>
      </div>
    </div>
  );
}

export default function Hero({ content = {}, branding = {}, section = {}, category = 'default' }) {
  const colors = branding.colors || {};
  const layout = content.layout || 'centered';
  const variant = section.variant || layout;
  const heroImage = imgService.getHeroImage(category);

  return (
    <section id="hero" className="relative overflow-hidden">
      {variant === 'split' && <Split data={content} colors={colors} heroImage={heroImage} />}
      {variant === 'minimal' && <Minimal data={content} colors={colors} heroImage={heroImage} />}
      {(!variant || variant === 'centered' || variant === 'fullscreen' || variant === 'overlay') && (
        <Centered data={content} colors={colors} heroImage={heroImage} />
      )}
    </section>
  );
}
