import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';

export default function Navbar({ content = {}, branding = {} }) {
  const { logo, links = [], cta, sticky = true } = content;
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const colors = branding.colors || {};

  useEffect(() => {
    if (!sticky) return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  const bgColor = scrolled ? (colors.surface || '#FFFFFF') : 'transparent';
  const textColor = scrolled ? (colors.text || '#18181B') : '#FFFFFF';
  const shadow = scrolled ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none';

  if (links.length === 0) return null;

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 ${sticky ? 'fixed top-0' : 'relative'}`}
      style={{ backgroundColor: bgColor, boxShadow: shadow }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#home" className="text-xl font-bold tracking-tight" style={{ color: textColor }}>
            {logo || 'Logo'}
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: textColor }}
              >
                {link.label}
              </a>
            ))}
            {cta && (
              <a
                href={cta.href || '#contact'}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: colors.primary || '#6366F1' }}
              >
                {cta.text}
              </a>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: textColor }}
          >
            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t"
          style={{ backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border || '#E4E4E7' }}
        >
          <div className="px-4 py-4 space-y-3">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm font-medium py-2"
                style={{ color: colors.text || '#18181B' }}
              >
                {link.label}
              </a>
            ))}
            {cta && (
              <a
                href={cta.href || '#contact'}
                onClick={() => setIsOpen(false)}
                className="block text-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: colors.primary || '#6366F1' }}
              >
                {cta.text}
              </a>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
