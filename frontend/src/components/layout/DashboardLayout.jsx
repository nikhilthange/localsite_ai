import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiChevronRight, HiMenu, HiX } from 'react-icons/hi';
import { twMerge } from 'tailwind-merge';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children, user, isAdmin, onLogout, onToggleDark, isDark, title, breadcrumbs }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const defaultBreadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  const crumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <HiMenu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                {crumbs.map((crumb, idx) => (
                  <span key={crumb.href} className="flex items-center space-x-2">
                    {idx > 0 && <HiChevronRight className="w-4 h-4 text-gray-400" />}
                    {idx === crumbs.length - 1 ? (
                      <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.href} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onToggleDark}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        {title && (
          <div className="px-4 lg:px-8 pt-6 pb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
        )}

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <div className="relative h-full">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
              >
                <HiX className="w-5 h-5" />
              </button>
              <Sidebar user={user} isAdmin={isAdmin} collapsed={false} onToggle={() => {}} onLogout={onLogout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
