import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiChevronDown, HiSun, HiMoon } from 'react-icons/hi';
import { FiLogOut, FiSettings, FiLayout } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Button from '../common/Button';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar({ user, onLogout, onToggleDark, isDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={twMerge('fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg' : 'bg-transparent')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FiLayout className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">LocalSite AI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={onToggleDark}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode">
              {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
                  <HiChevronDown className={twMerge('w-4 h-4 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1">
                      <button onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <FiLayout className="w-4 h-4" /> <span>Dashboard</span>
                      </button>
                      <button onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <FiSettings className="w-4 h-4" /> <span>Settings</span>
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button onClick={() => { onLogout?.(); setDropdownOpen(false); }}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <FiLogOut className="w-4 h-4" /> <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>Sign Up</Button>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu">
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-3 space-y-2 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Login</Button>
                  <Button variant="primary" className="w-full" onClick={() => navigate('/signup')}>Sign Up</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
