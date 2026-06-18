import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { HiUsers, HiCurrencyDollar, HiGlobe, HiSparkles, HiArrowUp, HiTrendingUp } from 'react-icons/hi';
import { FiUsers, FiDollarSign, FiActivity, FiServer } from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line,
} from 'recharts';
import api from '@/lib/axios';

const chartData = [
  { month: 'Jan', users: 400, revenue: 2400, websites: 240 },
  { month: 'Feb', users: 600, revenue: 3200, websites: 380 },
  { month: 'Mar', users: 800, revenue: 4800, websites: 520 },
  { month: 'Apr', users: 1200, revenue: 5600, websites: 680 },
  { month: 'May', users: 1800, revenue: 7200, websites: 920 },
  { month: 'Jun', users: 2400, revenue: 9600, websites: 1200 },
];

const recentUsers = [
  { name: 'John Smith', email: 'john@example.com', plan: 'Professional', status: 'active', date: '2 hours ago' },
  { name: 'Sarah Johnson', email: 'sarah@example.com', plan: 'Starter', status: 'active', date: '5 hours ago' },
  { name: 'Mike Brown', email: 'mike@example.com', plan: 'Free', status: 'active', date: '1 day ago' },
  { name: 'Emily Davis', email: 'emily@example.com', plan: 'Enterprise', status: 'active', date: '2 days ago' },
  { name: 'Alex Wilson', email: 'alex@example.com', plan: 'Professional', status: 'inactive', date: '3 days ago' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.data || data);
      } catch {
        // Use default stats
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const adminStats = [
    { label: 'Total Users', value: stats?.totalUsers || '2,451', icon: FiUsers, change: '+12%', color: 'from-violet-500 to-indigo-600' },
    { label: 'Monthly Revenue', value: `$${stats?.monthlyRevenue?.toLocaleString() || '9,600'}`, icon: FiDollarSign, change: '+18%', color: 'from-emerald-500 to-teal-600' },
    { label: 'Active Websites', value: stats?.activeWebsites || '1,234', icon: FiServer, change: '+24%', color: 'from-blue-500 to-cyan-600' },
    { label: 'AI Generations', value: stats?.aiGenerations || '8,947', icon: FiActivity, change: '+31%', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your platform's performance</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
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
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="websites" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
          <Link to="/admin/users" className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentUsers.map((u) => (
                <tr key={u.email} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.plan}</td>
                  <td className="px-6 py-4">
                    <span className={twMerge('px-2.5 py-1 rounded-full text-xs font-medium',
                      u.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription Distribution</h3>
          <div className="space-y-3">
            {[
              { plan: 'Free', count: '1,200', color: 'bg-gray-400', width: '48%' },
              { plan: 'Starter', count: '680', color: 'bg-blue-500', width: '27%' },
              { plan: 'Professional', count: '420', color: 'bg-violet-500', width: '17%' },
              { plan: 'Enterprise', count: '151', color: 'bg-emerald-500', width: '8%' },
            ].map(({ plan, count, color, width }) => (
              <div key={plan}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{plan}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Usage Overview</h3>
          <div className="text-center py-8">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">8,947</div>
            <p className="text-gray-500">Total AI Generations</p>
            <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-violet-700 dark:text-violet-300">Today</span>
                <span className="text-violet-700 dark:text-violet-300 font-medium">+247</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">This week</span>
                <span className="text-gray-900 dark:text-white font-medium">+1,832</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Manage Templates', link: '/admin/templates' },
              { label: 'View All Users', link: '/admin/users' },
              { label: 'Subscription Plans', link: '/admin/plans' },
              { label: 'System Settings', link: '/admin/settings' },
            ].map((action) => (
              <Link key={action.label} to={action.link}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                <HiArrowUp className="w-4 h-4 text-gray-400 rotate-45" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
