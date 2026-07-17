import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { HiChevronRight, HiMenu, HiX, HiSearch, HiBell, HiSun, HiMoon } from 'react-icons/hi';
import { twMerge } from 'tailwind-merge';
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
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="hidden lg:block">
        <Sidebar
          user={user}
          isAdmin={isAdmin}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={onLogout}
        />
      </div>

      <div className={twMerge(
        'transition-all duration-300 min-h-screen flex flex-col',
        sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-64'
      )}>
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-[rgb(var(--color-border))]">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] transition-colors"
                aria-label="Open menu"
              >
                <HiMenu className="w-5 h-5" />
              </button>

              <nav className="hidden sm:flex items-center gap-2 text-sm" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={`${crumb.href}-${idx}`} className="flex items-center gap-2">
                    {idx > 0 && <HiChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />}
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="text-[rgb(var(--color-text))] font-medium">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.href} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[rgb(var(--color-border))] text-sm text-[rgb(var(--color-text-muted))] hover:border-primary-300 dark:hover:border-primary-700 transition-colors w-48"
              >
                <HiSearch className="w-4 h-4" />
                <span>Search...</span>
                <span className="ml-auto kbd">Ctrl+K</span>
              </button>

              <button
                className="relative p-2.5 rounded-xl text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] transition-colors"
                aria-label="Notifications"
              >
                <HiBell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white dark:ring-surface-900" />
              </button>

              <button
                onClick={onToggleDark}
                className="p-2.5 rounded-xl text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
              </button>

              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute left-0 top-0 bottom-0 w-72"
          >
            <div className="relative h-full">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] z-10"
              >
                <HiX className="w-5 h-5" />
              </button>
              <Sidebar user={user} isAdmin={isAdmin} collapsed={false} onToggle={() => {}} onLogout={onLogout} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
