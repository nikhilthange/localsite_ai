import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { HiChevronRight, HiMenu, HiX, HiSearch, HiBell, HiSun, HiMoon } from 'react-icons/hi';
import { cn } from '../../utils/cn';
import Sidebar from './Sidebar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/websites': 'Websites',
  '/websites/generate': 'Generate Website',
  '/websites/': 'Website Details',
  '/analytics': 'Analytics',
  '/leads': 'Leads & CRM',
  '/billing': 'Billing',
  '/settings': 'Settings',
  '/growth': 'Growth Assistant',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'User Management',
};

export default function DashboardLayout({ children, user, isAdmin, onLogout, onToggleDark, isDark }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', href: '/dashboard' }];
  let accum = '';
  for (const part of pathParts) {
    accum += `/${part}`;
    const label = pageTitles[accum] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({ label, href: accum });
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
      <div className="hidden lg:block z-40">
        <Sidebar
          user={user}
          isAdmin={isAdmin}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={onLogout}
        />
      </div>

      <div className={cn(
        'flex-1 flex flex-col transition-all duration-300 min-h-screen relative',
        sidebarCollapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64'
      )}>
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-surface-950/70 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center justify-between h-16 px-4 sm:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
                aria-label="Open menu"
              >
                <HiMenu className="w-6 h-6" />
              </button>

              <nav className="hidden sm:flex items-center gap-2 text-sm" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={`${crumb.href}-${idx}`} className="flex items-center gap-2">
                    {idx > 0 && <HiChevronRight className="w-4 h-4 text-surface-400" />}
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="text-surface-950 dark:text-white font-semibold">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.href} className="text-surface-500 hover:text-surface-900 dark:hover:text-surface-300 transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900 text-sm text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors w-56"
              >
                <HiSearch className="w-4 h-4" />
                <span>Quick search...</span>
                <span className="ml-auto kbd">Ctrl K</span>
              </button>

              <div className="flex items-center gap-1 border-l border-surface-200 dark:border-surface-800 pl-3">
                <button
                  className="relative p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
                  aria-label="Notifications"
                >
                  <HiBell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white dark:ring-surface-950" />
                </button>

                <button
                  onClick={onToggleDark}
                  className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-surface-950 shadow-2xl"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-900 z-50"
                >
                  <HiX className="w-5 h-5" />
                </button>
                <Sidebar user={user} isAdmin={isAdmin} collapsed={false} onToggle={() => {}} onLogout={onLogout} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
