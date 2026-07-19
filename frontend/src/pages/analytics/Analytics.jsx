import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import {
  HiDownload, HiRefresh, HiEye, HiClock,
  HiTrendingUp, HiArrowUp, HiArrowDown, HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { FiUsers, FiBarChart2, FiChevronDown, FiExternalLink } from 'react-icons/fi';
import { useWebsites } from '@/hooks/useWebsite';
import { analyticsService } from '@/services/analyticsService';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
    bgGradient: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/10 dark:to-violet-500/10 text-indigo-600 dark:text-indigo-400',
  },
  {
    label: 'Unique Visitors', value: '8,342', change: '+12.5%', up: true, icon: FiUsers,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/10 dark:to-teal-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Avg. Session', value: '3m 42s', change: '+8.1%', up: true, icon: HiClock,
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/10 dark:to-cyan-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Bounce Rate', value: '32.4%', change: '-4.2%', up: false, icon: HiTrendingUp,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/10 dark:to-orange-500/10 text-amber-600 dark:text-amber-400',
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

function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-2xl bg-surface-200 dark:bg-surface-800', className)} />;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white/95 dark:bg-surface-950/95
                 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/5 dark:shadow-black/20 min-w-[150px] z-50"
    >
      <p className="text-xs font-bold text-surface-900 dark:text-white mb-3 pb-2 border-b border-surface-100 dark:border-surface-800 uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-2.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-surface-600 dark:text-surface-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="font-bold text-surface-900 dark:text-white tabular-nums">
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
      <tspan x="50%" dy="-0.35em" className="text-3xl font-display font-bold fill-surface-900 dark:fill-white tabular-nums">
        {value}
      </tspan>
      <tspan x="50%" dy="1.6em" className="text-xs font-bold uppercase tracking-wider fill-surface-500">
        {sublabel || label}
      </tspan>
    </text>
  );
}

export default function Analytics() {
  const { websites, fetchWebsites } = useWebsites();
  const websiteList = Array.isArray(websites) ? websites : [];
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  useEffect(() => {
    const abortController = new AbortController();
    const mounted = { current: true };

    setLoading(true);
    setError(null);

    analyticsService.getOverview({ websiteId: selectedWebsite || undefined, range, signal: abortController.signal })
      .then(({ data: res }) => {
        if (mounted.current) setData(res.data || res);
      })
      .catch((err) => {
        if (!mounted.current || abortController.signal.aborted) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load analytics');
        setData(null);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });

    return () => {
      mounted.current = false;
      abortController.abort();
    };
  }, [selectedWebsite, range]);

  const totalSources = useMemo(() => sourceData.reduce((s, d) => s + d.value, 0), []);
  const maxViews = useMemo(() => Math.max(...topPages.map((p) => p.views)), []);

  if (loading) {
    return (
      <div className="space-y-6 animate-in max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="w-40 h-8" />
              <Skeleton className="w-56 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-44 h-10 rounded-xl" />
            <Skeleton className="w-64 h-10 rounded-xl" />
            <Skeleton className="w-24 h-10 rounded-xl" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="w-32 h-8" />
              <Skeleton className="w-24 h-4" />
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 h-[420px]" />
          <div className="space-y-6">
            <Card className="h-[280px]" />
            <Card className="h-[280px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <HiOutlineExclamationCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center">
           <h3 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Failed to load analytics</h3>
           <p className="text-surface-500 mt-2 max-w-md">{error}</p>
        </div>
        <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
          <HiRefresh className="w-5 h-5 mr-2" /> Retry Connection
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 animate-in max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <FiBarChart2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-950 dark:text-white tracking-tight">Analytics</h1>
            <p className="text-surface-500 mt-1 font-medium">Track your website performance and visitor behavior</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select value={selectedWebsite} onChange={(e) => setSelectedWebsite(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-surface-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm cursor-pointer min-w-[180px]">
              <option value="">All Websites</option>
              {websiteList.map((w) => (
                <option key={w._id || w.id} value={w._id || w.id}>{w.name || w.businessName}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
          </div>
          
          <div className="flex gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-inner">
            {RANGES.map((r) => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={cn('relative px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors z-10',
                  range === r.value ? 'text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-300')}>
                {range === r.value && (
                  <motion.div layoutId="activeRange" className="absolute inset-0 bg-white dark:bg-surface-800 rounded-lg -z-10 shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                {r.label}
              </button>
            ))}
          </div>
          
          <Button variant="primary" size="sm" className="shadow-glow h-[42px] px-5">
            <HiDownload className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
               <Card className="relative overflow-hidden p-6 group hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300">
                 <div className={cn('absolute top-0 right-0 w-32 h-32 -translate-y-1/4 translate-x-1/4 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150', 'bg-gradient-to-br', m.gradient)} />
                 <div className="flex items-start justify-between mb-4">
                   <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br', m.bgGradient)}>
                     <Icon className="w-6 h-6" />
                   </div>
                   <div className={cn('flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm', m.up ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400' : 'text-red-700 bg-red-100 dark:bg-red-500/20 dark:text-red-400')}>
                     {m.up ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
                     {m.change}
                   </div>
                 </div>
                 <p className="text-3xl font-display font-bold text-surface-900 dark:text-white tabular-nums tracking-tight">
                   {m.value}
                 </p>
                 <p className="text-sm font-medium text-surface-500 mt-1">{m.label}</p>
               </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
           <Card className="p-8 h-full">
             <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-xl font-display font-bold text-surface-900 dark:text-white">Page Views & Visitors</h3>
                 <p className="text-sm text-surface-500 font-medium mt-1">Daily page views and unique visitors over time</p>
               </div>
             </div>
             <div className="h-[360px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={pageViewData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                   <defs>
                     <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                       <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                     </linearGradient>
                     <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                       <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                   <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                   <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                   <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }} />
                   <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#viewsGradient)" strokeWidth={3} name="Page Views" activeDot={{ r: 6, strokeWidth: 0 }} />
                   <Area type="monotone" dataKey="visitors" stroke="#14b8a6" fill="url(#visitorsGradient)" strokeWidth={3} name="Visitors" activeDot={{ r: 6, strokeWidth: 0 }} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
             <Card className="p-8">
               <h3 className="text-lg font-display font-bold text-surface-900 dark:text-white mb-6">Traffic Sources</h3>
               <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                       {sourceData.map((_, i) => (
                         <Cell key={i} fill={COLORS[i % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip content={<CustomTooltip />} />
                     <DonutCenter label="Sources" value={totalSources} sublabel="Total Traffic" />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6">
                 {sourceData.map((s, i) => (
                   <div key={s.name} className="flex items-center gap-3">
                     <span className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-sm font-medium text-surface-600 dark:text-surface-300">{s.name}</span>
                     <span className="text-sm font-bold text-surface-900 dark:text-white ml-auto tabular-nums">{s.value}%</span>
                   </div>
                 ))}
               </div>
             </Card>
          </motion.div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
            <Card className="p-0 overflow-hidden h-full">
              <div className="p-8 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-surface-50 dark:bg-surface-950/50">
                <h3 className="text-xl font-display font-bold text-surface-900 dark:text-white">Top Performing Pages</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-800">
                      <th className="text-left px-8 py-5 text-xs font-bold text-surface-500 uppercase tracking-wider">Page Path</th>
                      <th className="text-right px-8 py-5 text-xs font-bold text-surface-500 uppercase tracking-wider">Page Views</th>
                      <th className="text-right px-8 py-5 text-xs font-bold text-surface-500 uppercase tracking-wider">Avg. Time</th>
                      <th className="text-right px-8 py-5 text-xs font-bold text-surface-500 uppercase tracking-wider">Exit Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {topPages.map((page, i) => {
                      const exitRate = (page.exits / page.views) * 100;
                      return (
                        <tr key={page.path} className="group hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-surface-900 dark:text-white font-mono bg-surface-100 dark:bg-surface-800 px-3 py-1 rounded-lg">
                                {page.path}
                              </span>
                              <FiExternalLink className="w-4 h-4 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary-500" />
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-end gap-4">
                              <div className="w-24 h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden shadow-inner">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(page.views / maxViews) * 100}%` }} transition={{ delay: 0.5, duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                              </div>
                              <span className="text-sm font-bold text-surface-900 dark:text-white tabular-nums w-16 text-right">
                                {page.views.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-surface-600 dark:text-surface-300 text-right tabular-nums">
                            {page.avgTime}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className={cn('inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tabular-nums', exitRate > 50 ? 'text-red-700 bg-red-100 dark:bg-red-500/20 dark:text-red-400' : 'text-surface-700 bg-surface-100 dark:bg-surface-800 dark:text-surface-300')}>
                              {exitRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="p-8">
              <h3 className="text-lg font-display font-bold text-surface-900 dark:text-white mb-6">Device Breakdown</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {deviceData.map((_, i) => (
                        <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <DonutCenter label="Devices" value="100%" sublabel="Usage" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-surface-200 dark:border-surface-800">
                {deviceData.map((d, i) => (
                  <div key={d.name} className="text-center">
                    <p className="text-2xl font-display font-bold text-surface-900 dark:text-white tabular-nums">{d.value}%</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
                      <span className="text-xs font-bold uppercase tracking-wider text-surface-500">{d.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
         </motion.div>
      </div>
    </div>
  );
}
