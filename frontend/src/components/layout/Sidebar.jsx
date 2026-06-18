import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiCog, HiLogout } from 'react-icons/hi';
import { FiGrid, FiGlobe, FiEdit3, FiBarChart2, FiShield, FiTrendingUp, FiSettings, FiUsers, FiDollarSign } from 'react-icons/fi';
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
  { label: 'Users', icon: FiGrid, href: '/admin/users' },
];

export default function Sidebar({ user, isAdmin, collapsed, onToggle, onLogout }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const isCollapsed = collapsed && !hovered;

  return (
    <motion.aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={twMerge(
        'fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FiGlobe className="text-white w-3.5 h-3.5" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">LocalSite AI</span>
          </Link>
        )}
        {isCollapsed && (
          <Link to="/dashboard" className="mx-auto">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FiGlobe className="text-white w-3.5 h-3.5" />
            </div>
          </Link>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {isCollapsed ? <HiChevronRight className="w-5 h-5" /> : <HiChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href + '/'));
          return (
            <Link key={item.href} to={item.href}
              className={twMerge('flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                active ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white')}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className={twMerge('border-t border-gray-200 dark:border-gray-800 my-2', isCollapsed && 'mx-2')} />
            {adminLinks.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} to={item.href}
                  className={twMerge('flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    active ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white')}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        {!isCollapsed && user && (
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <HiLogout className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
