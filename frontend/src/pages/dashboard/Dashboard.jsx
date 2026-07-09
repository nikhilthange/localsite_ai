import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { HiGlobe, HiEye, HiUserGroup, HiSparkles, HiPlus, HiChartBar, HiArrowUp, HiTrendingUp } from 'react-icons/hi';
import { FiArrowRight, FiActivity } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useWebsites } from '@/hooks/useWebsite';

const statusColors = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  generating: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  generated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const activities = [
  { icon: HiGlobe, text: 'Website published successfully', time: '2 hours ago', type: 'success' },
  { icon: HiSparkles, text: 'AI generated content for website', time: '5 hours ago', type: 'info' },
  { icon: HiEye, text: 'New template applied', time: '1 day ago', type: 'info' },
  { icon: HiUserGroup, text: '5 new leads received', time: '2 days ago', type: 'success' },
  { icon: HiChartBar, text: 'Website views exceeded 10,000', time: '3 days ago', type: 'success' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 18 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 80, damping: 16 },
  }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const { websites, fetchWebsites } = useWebsites();
  const navigate = useNavigate();

  const websiteList = Array.isArray(websites) ? websites : [];

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  const stats = [
    { label: 'Websites', value: websiteList.length, icon: HiGlobe, change: '+2', color: 'from-violet-500 to-indigo-600' },
    { label: 'Total Views', value: '12,847', icon: HiEye, change: '+18%', color: 'from-emerald-500 to-teal-600' },
    { label: 'Leads', value: '342', icon: HiUserGroup, change: '+12%', color: 'from-blue-500 to-cyan-600' },
    { label: 'AI Credits', value: '850', icon: HiSparkles, change: '150 used', color: 'from-amber-500 to-orange-600' },
  ];

  const recentWebsites = websiteList.slice(0, 4);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-5"
      >
        <div>
          <h1 className="gradient-text text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-1.5 text-base">
            Here's what's happening with your websites today.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="primary" onClick={() => navigate('/websites/generate')}>
            <HiPlus className="w-5 h-5" /> New Website
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <HiChartBar className="w-5 h-5" /> Analytics
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={itemVariants} whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }} className="card-hover group cursor-default">
              <div className="flex items-start justify-between mb-4">
                <div className={twMerge(
                  'w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0 shadow-sm',
                  stat.color
                )}>
                  <Icon className="w-5.5 h-5.5 text-white" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                  <HiArrowUp className="w-3 h-3" /> {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[rgb(var(--color-text))] mb-0.5 tabular-nums tracking-tight">{stat.value}</p>
              <p className="text-sm text-[rgb(var(--color-text-muted))]">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-7">
        <div className="lg:col-span-2 space-y-7">
          <motion.div
            custom={0}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="card p-0 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[rgb(var(--color-border))]">
              <h2 className="text-base font-semibold text-[rgb(var(--color-text))]">Recent Websites</h2>
              <Link to="/websites" className="btn-ghost text-sm gap-1 px-3 py-1.5 rounded-lg group">
                View all <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            {recentWebsites.length > 0 ? (
              <div className="divide-y divide-[rgb(var(--color-border))]">
                {recentWebsites.map((site, i) => (
                  <motion.div
                    key={site._id || site.id || i}
                    custom={i}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ backgroundColor: 'rgba(var(--color-surface), 0.6)' }}
                    className="flex items-center justify-between px-6 py-4 cursor-pointer transition-colors"
                    onClick={() => navigate(`/websites/${site._id || site.id}`)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                        <HiGlobe className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[rgb(var(--color-text))] truncate">{site.name || site.businessName || 'Untitled'}</p>
                        <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5 truncate">{site.domain || 'Not deployed'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={twMerge('badge', statusColors[site.status] || statusColors.draft)}>
                        {site.status || 'draft'}
                      </span>
                      <FiArrowRight className="w-4 h-4 text-[rgb(var(--color-text-muted))] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                custom={0}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="py-14 px-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[rgb(var(--color-surface))] flex items-center justify-center mx-auto mb-5">
                  <HiGlobe className="w-7 h-7 text-[rgb(var(--color-text-muted))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-1.5">No websites yet</h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">Create your first AI-powered website in minutes.</p>
                <Button variant="primary" onClick={() => navigate('/websites/generate')}>
                  <HiPlus className="w-5 h-5" /> Generate Your First Website
                </Button>
              </motion.div>
            )}
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            <motion.button
              custom={1}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate('/websites/generate')}
              className="card p-6 text-left bg-gradient-to-br from-violet-600 to-indigo-700 border-0 text-white group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <HiSparkles className="w-8 h-8 mb-4 text-violet-200" />
              <h3 className="font-semibold text-lg mb-1">Generate New Website</h3>
              <p className="text-sm text-violet-200/80 mb-4 leading-relaxed">Create a stunning AI-powered website in minutes.</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white group-hover:gap-2.5 transition-all duration-200">
                Get Started <FiArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
            <motion.button
              custom={2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate('/settings')}
              className="card p-6 text-left group overflow-hidden"
            >
              <HiChartBar className="w-8 h-8 mb-4 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold text-lg text-[rgb(var(--color-text))] mb-1">View Analytics</h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4 leading-relaxed">Track performance, views, and conversions.</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 group-hover:gap-2.5 transition-all duration-200">
                View Reports <FiArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            custom={3}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="card p-0 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[rgb(var(--color-border))]">
              <FiActivity className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
              <h2 className="text-base font-semibold text-[rgb(var(--color-text))]">Activity</h2>
            </div>
            <div className="p-4 space-y-0.5">
              {activities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={i}
                    custom={4 + i}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 3 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[rgb(var(--color-surface))] transition-all duration-200 cursor-default group"
                  >
                    <div className={twMerge(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      activity.type === 'success'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/40'
                        : 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/40'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-snug">{activity.text}</p>
                      <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">{activity.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="card overflow-hidden"
          >
            <h2 className="text-base font-semibold text-[rgb(var(--color-text))] mb-5">Subscription</h2>

            <div className="flex items-center justify-between mb-5">
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Current Plan</span>
              <span className="badge bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold">Professional</span>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[rgb(var(--color-text-secondary))]">Websites used</span>
                  <span className="text-[rgb(var(--color-text))] font-semibold tabular-nums">3 of 10</span>
                </div>
                <div className="w-full h-2 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0, scaleX: 0 }}
                    animate={{ width: '30%', scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 origin-left"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[rgb(var(--color-text-secondary))]">AI Credits</span>
                  <span className="text-[rgb(var(--color-text))] font-semibold tabular-nums">850 / 1000</span>
                </div>
                <div className="w-full h-2 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0, scaleX: 0 }}
                    animate={{ width: '85%', scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 origin-left"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[rgb(var(--color-border))]">
              <Button variant="outline" className="w-full" onClick={() => navigate('/pricing')}>
                <HiTrendingUp className="w-4 h-4" /> Upgrade Plan
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
