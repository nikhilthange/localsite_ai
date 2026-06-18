import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { HiGlobe, HiEye, HiUserGroup, HiSparkles, HiPlus, HiChartBar, HiArrowUp } from 'react-icons/hi';
import { FiArrowRight, FiActivity } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useWebsites } from '@/context/WebsiteContext';

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

export default function Dashboard() {
  const { user } = useAuth();
  const { websites, fetchWebsites } = useWebsites();
  const navigate = useNavigate();

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  const stats = [
    { label: 'Websites', value: websites?.length || 0, icon: HiGlobe, change: '+2', color: 'from-violet-500 to-indigo-600' },
    { label: 'Total Views', value: '12,847', icon: HiEye, change: '+18%', color: 'from-emerald-500 to-teal-600' },
    { label: 'Leads', value: '342', icon: HiUserGroup, change: '+12%', color: 'from-blue-500 to-cyan-600' },
    { label: 'AI Credits', value: '850', icon: HiSparkles, change: '150 used', color: 'from-amber-500 to-orange-600' },
  ];

  const recentWebsites = (websites || []).slice(0, 4);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name || 'User'}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your websites.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => navigate('/websites/generate')} className="rounded-xl">
            <HiPlus className="w-5 h-5 mr-1.5" /> New Website
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')} className="rounded-xl">
            <HiChartBar className="w-5 h-5 mr-1.5" /> Analytics
          </Button>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } } }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                  <HiArrowUp className="w-3.5 h-3.5" /> {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Websites</h2>
                <Link to="/websites" className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">View all</Link>
              </div>
            </div>
            {recentWebsites.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {recentWebsites.map((site, i) => (
                  <motion.div key={site._id || site.id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-center justify-between"
                    onClick={() => navigate(`/websites/${site._id || site.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <HiGlobe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{site.name || site.businessName || 'Untitled'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{site.domain || 'Not deployed'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={twMerge('px-2.5 py-1 rounded-full text-xs font-medium', statusColors[site.status] || statusColors.draft)}>
                        {site.status || 'draft'}
                      </span>
                      <FiArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiGlobe className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No websites yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first AI-powered website.</p>
                <Button variant="primary" className="rounded-xl" onClick={() => navigate('/websites/generate')}>
                  <HiPlus className="w-5 h-5 mr-1.5" /> Generate Your First Website
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid sm:grid-cols-2 gap-4">
            <button onClick={() => navigate('/websites/generate')} className="p-6 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl text-left text-white group hover:shadow-xl hover:shadow-violet-500/20 transition-shadow">
              <HiSparkles className="w-8 h-8 mb-4 text-violet-200" />
              <h3 className="font-semibold text-lg mb-1">Generate New Website</h3>
              <p className="text-sm text-violet-200 mb-4">Create a stunning AI-powered website in minutes.</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-white group-hover:gap-2 transition-all">Get Started <FiArrowRight className="w-4 h-4" /></span>
            </button>
            <button onClick={() => navigate('/settings')} className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-left group hover:shadow-md transition-shadow">
              <HiChartBar className="w-8 h-8 mb-4 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">View Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Track performance, views, and conversions.</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:gap-2 transition-all">View Reports <FiArrowRight className="w-4 h-4" /></span>
            </button>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FiActivity className="w-5 h-5" /> Activity</h2>
            </div>
            <div className="p-4 space-y-1">
              {activities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={twMerge('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      activity.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400')}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{activity.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Current Plan</span>
              <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium">Professional</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">Websites used</span>
                <span className="text-gray-900 dark:text-white font-medium">3 of 10</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full" />
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">AI Credits</span>
                <span className="text-gray-900 dark:text-white font-medium">850 / 1000</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl text-sm" onClick={() => navigate('/pricing')}>Upgrade Plan</Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
