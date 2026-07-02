import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiLogout } from 'react-icons/hi';
import { FiGrid, FiGlobe, FiEdit3, FiBarChart2, FiShield, FiTrendingUp, FiSettings, FiUsers, FiDollarSign, FiLayout } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { label: 'Dashboard', icon: FiGrid, href: '/dashboard' },
  { label: 'Websites', icon: FiGlobe, href: '/websites' },
  { label: 'Generate', icon: FiEdit3, href: '/websites/generate' },
  { label: 'Growth', icon: FiTrendingUp, href: '/growth' },
  { label: 'Analytics', icon: FiBarChart2, href: '/analytics' },
  { label: 'Leads & CRM', icon: FiUsers, href: '/leads' },
  { label: 'Billing', icon: FiDollarSign, href: '/billing' },
  { label: 'Settings', icon: FiSettings, href: '/settings' },
];

const adminLinks = [
  { label: 'Admin Panel', icon: FiShield, href: '/admin' },
  { label: 'Users', icon: FiUsers, href: '/admin/users' },
];

export default function Sidebar({ user, isAdmin, collapsed, onToggle, onLogout }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const isCollapsed = collapsed && !hovered;

  const isActive = (href) => {
    if (href === '/dashboard') return location.pathname === href;
    return location.pathname.startsWith(href + '/') || location.pathname === href;
  };

  return (
    <motion.aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={twMerge(
        'fixed left-0 top-0 h-full bg-white dark:bg-surface-900 border-r border-[rgb(var(--color-border))] z-40 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-[4.5rem]' : 'w-64'
      )}
    >
      <div className={twMerge(
        'flex items-center h-16 border-b border-[rgb(var(--color-border))]',
        isCollapsed ? 'justify-center px-3' : 'px-5 justify-between'
      )}>
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
              <FiLayout className="text-white w-4 h-4" />
            </div>
            <span className="text-base font-bold text-[rgb(var(--color-text))]">
              Local<span className="text-primary-500">AI</span>
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link to="/dashboard">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <FiLayout className="text-white w-4 h-4" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={twMerge(
            'p-1.5 rounded-lg text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text))] transition-colors',
            isCollapsed && 'hidden'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={twMerge(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text))]'
              )}
            >
              <Icon className={twMerge('w-5 h-5 shrink-0', active && 'text-primary-600 dark:text-primary-400')} />
              {!isCollapsed && <span>{item.label}</span>}
              {active && !isCollapsed && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-500 rounded-full"
                />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className={twMerge('border-t border-[rgb(var(--color-border))] my-3', isCollapsed && 'mx-2')} />
            <div className={twMerge('px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text-muted))]', isCollapsed && 'text-center')}>
              {!isCollapsed && 'Admin'}
            </div>
            {adminLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={twMerge(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                      : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text))]'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className={twMerge('p-3 border-t border-[rgb(var(--color-border))]', isCollapsed && 'px-2')}>
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[rgb(var(--color-text))] truncate">{user.name}</p>
              <p className="text-xs text-[rgb(var(--color-text-muted))] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className={twMerge(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <HiLogout className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
