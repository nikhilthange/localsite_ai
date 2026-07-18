import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiLogout } from 'react-icons/hi';
import { FiGrid, FiGlobe, FiEdit3, FiBarChart2, FiShield, FiTrendingUp, FiSettings, FiUsers, FiDollarSign, FiLayout } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

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
      className={cn(
        'fixed left-0 top-0 h-full bg-surface-50 dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800 z-40 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-[4.5rem]' : 'w-64'
      )}
    >
      <div className={cn(
        'flex items-center h-16 border-b border-surface-200 dark:border-surface-800',
        isCollapsed ? 'justify-center px-3' : 'px-5 justify-between'
      )}>
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-glow transition-all duration-300">
              <FiLayout className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-display font-bold text-surface-950 dark:text-white">
              Local<span className="text-primary-500">Site</span>
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link to="/dashboard">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-glow">
              <FiLayout className="text-white w-4 h-4" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-100 transition-colors',
            isCollapsed && 'hidden'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1.5 px-3 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                active
                  ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-white shadow-sm border border-surface-200 dark:border-surface-700'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-200/50 dark:hover:bg-surface-900/50 hover:text-surface-900 dark:hover:text-surface-100 border border-transparent'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-colors', active ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-surface-900 dark:group-hover:text-white')} />
              {!isCollapsed && <span>{item.label}</span>}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className={cn('border-t border-surface-200 dark:border-surface-800 my-4', isCollapsed && 'mx-2')} />
            <div className={cn('px-3 py-1 text-xs font-semibold uppercase tracking-wider text-surface-400', isCollapsed && 'text-center')}>
              {!isCollapsed && 'Admin'}
            </div>
            {adminLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent',
                    active
                      ? 'bg-white dark:bg-surface-900 text-amber-600 dark:text-amber-400 shadow-sm border-surface-200 dark:border-surface-700'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-200/50 dark:hover:bg-surface-900/50 hover:text-surface-900 dark:hover:text-surface-100'
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

      <div className={cn('p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-100/50 dark:bg-surface-900/50', isCollapsed && 'px-2 flex flex-col items-center')}>
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-950 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-surface-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors',
            isCollapsed && 'justify-center p-2'
          )}
        >
          <HiLogout className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
