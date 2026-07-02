import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import {
  HiCalendar, HiDownload, HiRefresh, HiGlobe, HiEye, HiUserGroup, HiClock,
  HiTrendingUp, HiArrowUp, HiArrowDown, HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { FiUsers, FiBarChart2, FiActivity, FiChevronDown, FiExternalLink } from 'react-icons/fi';
import { useWebsites } from '@/context/WebsiteContext';
import { analyticsService } from '@/services/analyticsService';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import Button from '@/components/common/Button';

const COLORS = ['#6366f1', '#14b8a6', '#f97316', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6'];
const DEVICE_COLORS = ['#6366f1', '#14b8a6', '#f97316'];

const RANGES = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
];

const METRICS = [
  {
    label: 'Page Views', value: '12,847', change: '+18.2%', up: true, icon: HiEye,
    gradient: 'from-indigo-500 to-violet-600',
    bgGradient: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/5 dark:to-violet-500/5',
  },
  {
    label: 'Unique Visitors', value: '8,342', change: '+12.5%', up: true, icon: FiUsers,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5',
  },
  {
    label: 'Avg. Session', value: '3m 42s', change: '+8.1%', up: true, icon: HiClock,
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5',
  },
  {
    label: 'Bounce Rate', value: '32.4%', change: '-4.2%', up: false, icon: HiTrendingUp,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5',
  },
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

const growthData = [
  { week: 'W1', views: 8200, visitors: 5100 },
  { week: 'W2', views: 9400, visitors: 5800 },
  { week: 'W3', views: 10100, visitors: 6300 },
  { week: 'W4', views: 11800, visitors: 7200 },
  { week: 'W5', views: 12400, visitors: 7500 },
  { week: 'W6', views: 13800, visitors: 8100 },
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

const pageHeaderVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.08 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Skeleton({ className }) {
  return (
    <div className={twMerge('animate-pulse rounded-xl bg-[rgb(var(--color-surface))]', className)} />
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]/95
                 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/5 dark:shadow-black/20 min-w-[140px]"
    >
      <p className="text-xs font-semibold text-[rgb(var(--color-text))] mb-2 border-b border-[rgb(var(--color-border))] pb-1.5">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[rgb(var(--color-text-secondary))]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="font-semibold text-[rgb(var(--color-text))] tabular-nums">
              {p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DonutCenter({ label, value, sublabel }) {
  return (
    <text textAnchor="middle" dominantBaseline="middle" x="50%" y="50%">
      <tspan x="50%" dy="-0.35em" className="text-2xl font-bold fill-[rgb(var(--color-text))] tabular-nums">
        {value}
      </tspan>
      <tspan x="50%" dy="1.4em" className="text-xs fill-[rgb(var(--color-text-muted))]">
        {sublabel || label}
      </tspan>
    </text>
  );
}

export default function Analytics() {
  const { websites, fetchWebsites } = useWebsites();
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    analyticsService.getOverview({ websiteId: selectedWebsite || undefined, range })
      .then(({ data: res }) => setData(res.data || res))
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || 'Failed to load analytics');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [selectedWebsite, range]);

  const totalSources = useMemo(() => sourceData.reduce((s, d) => s + d.value, 0), []);
  const maxViews = useMemo(() => Math.max(...topPages.map((p) => p.views)), []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="w-40 h-6" />
              <Skeleton className="w-56 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-44 h-10 rounded-xl" />
            <Skeleton className="w-64 h-9 rounded-xl" />
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <Skeleton className="w-24 h-7" />
              <Skeleton className="w-20 h-4" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-[260px] rounded-2xl" />
            <Skeleton className="h-[260px] rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-[320px] rounded-2xl" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 dark:bg-red-500/5 flex items-center justify-center">
          <HiOutlineExclamationCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Failed to load analytics</h3>
        <p className="text-sm text-[rgb(var(--color-text-muted))] max-w-md text-center">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <HiRefresh className="w-4 h-4" />
          Retry
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
    >
      <motion.div variants={pageHeaderVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl
                            opacity-20 blur-xl" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl
                            flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FiBarChart2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] tracking-tight">Analytics</h1>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">
              Track your website performance and visitor behavior
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedWebsite}
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className="input-field appearance-none pr-8 min-w-[160px] cursor-pointer"
            >
              <option value="">All Websites</option>
              {(websites || []).map((w) => (
                <option key={w._id || w.id} value={w._id || w.id}>
                  {w.name || w.businessName}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none
                                       text-[rgb(var(--color-text-muted))]" />
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={twMerge(
                  'relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  range === r.value
                    ? 'text-[rgb(var(--color-text))]'
                    : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))]'
                )}
              >
                {range === r.value && (
                  <motion.span
                    layoutId="rangePill"
                    className="absolute inset-0 rounded-lg bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{r.label}</span>
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <HiDownload className="w-4 h-4" />
            Export
          </Button>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              custom={i}
              variants={cardVariants}
              className="card relative overflow-hidden group p-5 hover:shadow-lg hover:shadow-black/5
                         dark:hover:shadow-black/10 transition-shadow duration-300"
            >
              <div className={twMerge(
                'absolute top-0 right-0 w-32 h-32 -translate-y-1/4 translate-x-1/4 rounded-full opacity-[0.04]',
                'bg-gradient-to-br', m.gradient,
              )} />
              <div className="flex items-start justify-between mb-3">
                <div className={twMerge(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  'bg-gradient-to-br', m.bgGradient,
                )}>
                  <Icon className={twMerge('w-5 h-5', m.up ? 'text-emerald-500' : 'text-red-500')} />
                </div>
                <div className={twMerge(
                  'flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full',
                  m.up
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10',
                )}>
                  {m.up ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
                  {m.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-[rgb(var(--color-text))] tabular-nums tracking-tight">
                {m.value}
              </p>
              <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">{m.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          custom={4}
          variants={cardVariants}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-[rgb(var(--color-text))]">
                Page Views & Visitors
              </h3>
              <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">
                Daily page views and unique visitors over time
              </p>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pageViewData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="date" stroke="rgb(var(--color-text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--color-text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgb(var(--color-border))', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#viewsGradient)" strokeWidth={2.5} name="Page Views" />
                <Area type="monotone" dataKey="visitors" stroke="#14b8a6" fill="url(#visitorsGradient)" strokeWidth={2.5} name="Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            custom={5}
            variants={cardVariants}
            className="card p-6"
          >
            <h3 className="text-base font-semibold text-[rgb(var(--color-text))] mb-4">
              Traffic Sources
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%" cy="50%"
                    innerRadius={48} outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <DonutCenter label="Sources" value={totalSources} sublabel="Total" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              {sourceData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-[rgb(var(--color-text-muted))]">{s.name}</span>
                  <span className="text-xs font-semibold text-[rgb(var(--color-text))] ml-auto tabular-nums">{s.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            custom={6}
            variants={cardVariants}
            className="card p-6"
          >
            <h3 className="text-base font-semibold text-[rgb(var(--color-text))] mb-4">
              Devices
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%" cy="50%"
                    innerRadius={48} outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {deviceData.map((_, i) => (
                      <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <DonutCenter label="Devices" value="100%" sublabel="Total" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {deviceData.map((d, i) => (
                <div key={d.name} className="text-center">
                  <p className="text-lg font-bold text-[rgb(var(--color-text))] tabular-nums">{d.value}%</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
                    <span className="text-[11px] text-[rgb(var(--color-text-muted))]">{d.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        custom={7}
        variants={cardVariants}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-[rgb(var(--color-border))]">
          <h3 className="text-base font-semibold text-[rgb(var(--color-text))]">Top Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--color-border))]">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Page
                </th>
                <th className="text-right px-6 py-3.5 text-[11px] font-semibold text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Views
                </th>
                <th className="text-right px-6 py-3.5 text-[11px] font-semibold text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Avg. Time
                </th>
                <th className="text-right px-6 py-3.5 text-[11px] font-semibold text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Exits
                </th>
                <th className="text-right px-6 py-3.5 text-[11px] font-semibold text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                  Exit Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {topPages.map((page, i) => {
                const exitRate = (page.exits / page.views) * 100;
                return (
                  <motion.tr
                    key={page.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="group hover:bg-[rgb(var(--color-surface))]/50 transition-colors relative"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[rgb(var(--color-text))] font-mono">
                          {page.path}
                        </span>
                        <FiExternalLink className="w-3 h-3 text-[rgb(var(--color-text-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-20 h-1.5 rounded-full bg-[rgb(var(--color-surface))] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(page.views / maxViews) * 100}%` }}
                            transition={{ delay: 0.4 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          />
                        </div>
                        <span className="text-sm font-semibold text-[rgb(var(--color-text))] tabular-nums w-14 text-right">
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-secondary))] text-right tabular-nums">
                      {page.avgTime}
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-secondary))] text-right tabular-nums">
                      {page.exits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={twMerge(
                        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums',
                        exitRate > 50
                          ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
                          : 'text-[rgb(var(--color-text-muted))] bg-[rgb(var(--color-surface))]',
                      )}>
                        {exitRate.toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          custom={8}
          variants={cardVariants}
          className="card p-6"
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-[rgb(var(--color-text))]">Views by Day of Week</h3>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">Total page views per day</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageViewData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="date" stroke="rgb(var(--color-text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--color-text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgb(var(--color-border))', strokeDasharray: '4 4' }} />
                <Bar dataKey="views" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} name="Page Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          custom={9}
          variants={cardVariants}
          className="card p-6"
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-[rgb(var(--color-text))]">Growth Trend</h3>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">Weekly views and visitors</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="lineViewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lineVisitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="week" stroke="rgb(var(--color-text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--color-text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgb(var(--color-border))', strokeDasharray: '4 4' }} />
                <Line
                  type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: 'rgb(var(--color-bg))' }}
                  name="Views"
                />
                <Line
                  type="monotone" dataKey="visitors" stroke="#14b8a6" strokeWidth={2.5}
                  dot={{ r: 3, fill: '#14b8a6', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#14b8a6', strokeWidth: 2, stroke: 'rgb(var(--color-bg))' }}
                  name="Visitors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
