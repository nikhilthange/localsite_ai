import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiCalendar, HiDownload, HiRefresh, HiGlobe, HiEye, HiUserGroup, HiClock, HiTrendingUp, HiArrowUp, HiArrowDown } from 'react-icons/hi';
import { FiUsers, FiBarChart2, FiActivity } from 'react-icons/fi';
import { useWebsites } from '@/context/WebsiteContext';
import { analyticsService } from '@/services/analyticsService';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import Button from '@/components/common/Button';

const COLORS = ['#6366f1', '#14b8a6', '#f97316', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6'];
const RANGES = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];
const METRICS = [
  { label: 'Page Views', value: '12,847', change: '+18.2%', up: true, icon: HiEye, color: 'from-violet-500 to-indigo-600' },
  { label: 'Unique Visitors', value: '8,342', change: '+12.5%', up: true, icon: FiUsers, color: 'from-emerald-500 to-teal-600' },
  { label: 'Avg. Session', value: '3m 42s', change: '+8.1%', up: true, icon: HiClock, color: 'from-blue-500 to-cyan-600' },
  { label: 'Bounce Rate', value: '32.4%', change: '-4.2%', up: false, icon: HiTrendingUp, color: 'from-amber-500 to-orange-600' },
];

const pageViewData = [
  { date: 'Mon', views: 1240, visitors: 890 },
  { date: 'Tue', views: 1380, visitors: 960 },
  { date: 'Wed', views: 1520, visitors: 1020 },
  { date: 'Thu', views: 1480, visitors: 980 },
  { date: 'Fri', views: 1680, visitors: 1120 },
  { date: 'Sat', views: 1120, visitors: 740 },
  { date: 'Sun', views: 980, visitors: 650 },
];

const sourceData = [
  { name: 'Direct', value: 35 },
  { name: 'Organic', value: 28 },
  { name: 'Social', value: 20 },
  { name: 'Referral', value: 12 },
  { name: 'Email', value: 5 },
];

const deviceData = [
  { name: 'Desktop', value: 48 },
  { name: 'Mobile', value: 42 },
  { name: 'Tablet', value: 10 },
];

const topPages = [
  { path: '/', views: 3840, avgTime: '2m 34s', exits: 1240 },
  { path: '/services', views: 2140, avgTime: '3m 12s', exits: 680 },
  { path: '/about', views: 1560, avgTime: '2m 48s', exits: 520 },
  { path: '/contact', views: 1280, avgTime: '1m 56s', exits: 890 },
  { path: '/pricing', views: 940, avgTime: '4m 20s', exits: 310 },
];

export default function Analytics() {
  const { websites, fetchWebsites } = useWebsites();
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  useEffect(() => {
    setLoading(true);
    analyticsService.getOverview({ websiteId: selectedWebsite || undefined, range })
      .then(({ data: res }) => setData(res.data || res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedWebsite, range]);

  const chartHeight = 340;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 text-sm">
        <p className="font-medium text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-gray-600 dark:text-gray-400">{p.name}: <span className="font-medium text-gray-900 dark:text-white">{p.value.toLocaleString()}</span></p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <FiBarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your website performance and visitor behavior</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedWebsite} onChange={(e) => setSelectedWebsite(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none">
            <option value="">All Websites</option>
            {(websites || []).map((w) => (
              <option key={w._id || w.id} value={w._id || w.id}>{w.name || w.businessName}</option>
            ))}
          </select>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {RANGES.map((r) => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={twMerge('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  range === r.value ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
                {r.label}
              </button>
            ))}
          </div>
          <button className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <HiDownload className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${m.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={twMerge('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                  m.up ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20')}>
                  {m.up ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{m.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Page Views & Visitors</h3>
            <select className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-500 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pageViewData}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#viewsGradient)" strokeWidth={2} name="Page Views" />
                <Area type="monotone" dataKey="visitors" stroke="#14b8a6" fill="url(#visitorsGradient)" strokeWidth={2} name="Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h3>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {sourceData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-500">{s.name}</span>
                  <span className="text-gray-900 dark:text-white font-medium ml-auto">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Devices</h3>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {deviceData.map((_, i) => (
                      <Cell key={i} fill={['#6366f1', '#14b8a6', '#f97316'][i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {deviceData.map((d, i) => (
                <div key={d.name} className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{d.value}%</div>
                  <p className="text-xs text-gray-500">{d.name}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Page</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Avg. Time</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Exits</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Exit Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {topPages.map((page, i) => (
                <tr key={page.path} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{page.path}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right font-medium">{page.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">{page.avgTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">{page.exits.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={twMerge('px-2 py-0.5 rounded-full text-xs font-medium',
                      (page.exits / page.views) > 0.5 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
                      {((page.exits / page.views) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Views by Day of Week</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageViewData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} name="Page Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Growth Trend</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { week: 'W1', views: 8200, visitors: 5100 },
                { week: 'W2', views: 9400, visitors: 5800 },
                { week: 'W3', views: 10100, visitors: 6300 },
                { week: 'W4', views: 11800, visitors: 7200 },
                { week: 'W5', views: 12400, visitors: 7500 },
                { week: 'W6', views: 13800, visitors: 8100 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Views" />
                <Line type="monotone" dataKey="visitors" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} name="Visitors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
