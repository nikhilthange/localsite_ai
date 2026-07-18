import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';

export default function Navbar({ content = {}, branding = {} }) {
  const { logo, links = [], cta, sticky = true } = content;
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const colors = branding.colors || {};

  useEffect(() => {
    if (!sticky) return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  if (links.length === 0) return null;

  return (
    <nav
      className={`w-full z-50 transition-all duration-500 ${sticky ? 'fixed top-0' : 'relative'}`}
      style={{
        backgroundColor: scrolled ? `${colors.surface || '#FFFFFF'}E6` : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.border || '#E4E4E7'}40` : '1px solid transparent',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#home" className="text-xl font-bold tracking-tight relative group" style={{ color: scrolled ? (colors.text || '#18181B') : '#FFFFFF' }}>
            <span className="relative z-10">{logo || 'Logo'}</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: colors.primary || '#6366F1' }} />
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-white/10"
                style={{ color: scrolled ? (colors.text || '#18181B') : '#FFFFFFCC' }}
              >
                {link.label}
              </a>
            ))}
            {cta && (
              <a
                href={cta.href || '#contact'}
                className="ml-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)/30] hover:-translate-y-0.5"
                style={{ backgroundColor: colors.primary || '#6366F1' }}
              >
                {cta.text}
              </a>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: scrolled ? (colors.text || '#18181B') : '#FFFFFF' }}
          >
            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t"
            style={{
              backgroundColor: colors.surface || '#FFFFFF',
              borderColor: `${colors.border || '#E4E4E7'}40`,
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ color: colors.text || '#18181B' }}
                >
                  {link.label}
                </a>
              ))}
              {cta && (
                <a
                  href={cta.href || '#contact'}
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-5 py-3 rounded-xl text-sm font-semibold text-white mt-3 transition-all hover:shadow-lg"
                  style={{ backgroundColor: colors.primary || '#6366F1' }}
                >
                  {cta.text}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
