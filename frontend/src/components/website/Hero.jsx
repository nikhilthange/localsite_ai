import { motion } from 'framer-motion';
import { HiArrowRight, HiPlay } from 'react-icons/hi';
import { ImageService } from './ImageService';

const imgService = new ImageService();

function FloatingShape({ color, size, top, left, delay, duration }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15, y: [0, -30, 0] }}
      transition={{ duration: duration || 6, repeat: Infinity, delay: delay || 0, ease: 'easeInOut' }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size || 300, height: size || 300,
        background: `radial-gradient(circle, ${color || '#6366F1'} 0%, transparent 70%)`,
        top: top || '10%', left: left || '10%',
        filter: 'blur(60px)',
      }}
    />
  );
}

function Centered({ data, colors, heroImage }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {heroImage && (
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      )}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}D9, ${colors.secondary}99)` }} />
      <FloatingShape color={colors.primary} size={400} top="-10%" left="-5%" delay={0} duration={7} />
      <FloatingShape color={colors.secondary} size={350} top="60%" left="70%" delay={2} duration={9} />
      <FloatingShape color={colors.accent || colors.primary} size={250} top="20%" left="80%" delay={4} duration={8} />
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {data.badge && (
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-block px-5 py-2 rounded-full text-sm font-medium border border-white/20 text-white/90 bg-white/10 backdrop-blur-md mb-8"
          >
            {data.badge}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] mb-6 tracking-tight"
        >
          {data.title || 'Welcome'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed"
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
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            style={{ backgroundColor: colors.primary || '#6366F1' }}
          >
            <span>{data.ctaPrimary || 'Get Started'}</span>
            <HiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          {data.ctaSecondary && (
            <a
              href="#about"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1"
            >
              <HiPlay className="w-5 h-5" />
              <span>{data.ctaSecondary}</span>
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
            className="inline-block px-5 py-2 rounded-full text-sm font-medium border border-white/20 text-white/90 bg-white/10 backdrop-blur-md mb-8"
          >{data.badge}</motion.span>
        )}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight"
        >{data.title || 'Welcome'}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
          className="text-lg sm:text-xl text-white/70 leading-relaxed mb-12"
        >{data.subtitle || ''}</motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a href={data.ctaLink || '#contact'}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            style={{ backgroundColor: colors.primary || '#6366F1' }}
          >
            <span>{data.ctaPrimary || 'Get Started'}</span>
            <HiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          {data.ctaSecondary && (
            <a href="#about"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1"
            >
              <HiPlay className="w-5 h-5" />
              <span>{data.ctaSecondary}</span>
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );

  const imageSection = (
    <div className="relative lg:absolute lg:inset-y-0 lg:w-1/2 overflow-hidden">
      {heroImage && <img src={heroImage} alt="" className="w-full h-full object-cover" loading="eager" />}
      <div className="absolute inset-0 lg:hidden" style={{ background: `linear-gradient(135deg, ${colors.primary}D9, ${colors.secondary}99)` }} />
    </div>
  );

  return (
    <div className="relative min-h-screen lg:flex overflow-hidden">
      <FloatingShape color={colors.primary} size={300} top="10%" left={textSide === 'left' ? '45%' : '5%'} delay={0} duration={7} />
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
      {heroImage && <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}D9, ${colors.secondary}99)` }} />
      <FloatingShape color={colors.primary} size={350} top="-5%" left="-5%" delay={0} duration={8} />
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
        {data.badge && (
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-block px-5 py-2 rounded-full text-sm font-medium border border-white/20 text-white/90 bg-white/10 backdrop-blur-md mb-8"
          >{data.badge}</motion.span>
        )}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-6 tracking-tight"
        >{data.title || 'Welcome'}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
          className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto mb-12 font-light leading-relaxed"
        >{data.subtitle || ''}</motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
          <a href={data.ctaLink || '#contact'}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            style={{ backgroundColor: colors.primary || '#6366F1' }}
          >
            <span>{data.ctaPrimary || 'Get Started'}</span>
          </a>
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
