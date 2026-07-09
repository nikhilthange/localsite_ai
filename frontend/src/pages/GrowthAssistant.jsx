import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import {
  HiSparkles, HiTrendingUp, HiChartBar, HiSearch, HiStar,
  HiUserGroup, HiLightBulb, HiRefresh, HiChevronRight,
  HiCalendar, HiCheck, HiExclamation, HiArrowUp, HiArrowDown,
} from 'react-icons/hi';
import { FiZap, FiTarget, FiTrendingUp, FiBarChart2, FiActivity } from 'react-icons/fi';
import ScoreCard from '@/components/growth/ScoreCard';
import InsightCard from '@/components/growth/InsightCard';
import TrendChart from '@/components/growth/TrendChart';
import Button from '@/components/common/Button';
import { useGrowth } from '@/hooks/useGrowth';
import { useWebsites } from '@/hooks/useWebsite';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const priorityConfig = {
  critical: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: HiExclamation },
  high: { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icon: HiArrowUp },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: HiCheck },
  low: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: HiArrowDown },
};

const COLORS = ['#6366f1', '#14b8a6', '#f97316', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6'];

function StatusBadge({ status }) {
  const config = {
    completed: { bg: 'badge-success', label: 'Completed' },
    generating: { bg: 'badge-primary', label: 'Generating' },
    failed: { bg: 'badge-error', label: 'Failed' },
  };
  const c = config[status] || config.generating;
  return <span className={c.bg}>{c.label}</span>;
}

function MetricCard({ label, value, change, icon: Icon, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-50 dark:bg-${color}-900/20`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change != null && (
          <span className={twMerge('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            change > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20')}>
            {change > 0 ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[rgb(var(--color-text))]">{value}</p>
      <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">{label}</p>
    </motion.div>
  );
}

function AnalysisTab({ icon: Icon, label, analysis, trend }) {
  if (!analysis) return null;

  const items = [
    { label: 'Total', value: analysis.total ?? analysis.totalVisitors ?? 0 },
    { label: 'Rate', value: analysis.rate ? `${analysis.rate}%` : analysis.conversionRate ? `${analysis.conversionRate}%` : '-' },
    { label: 'Trend', value: trend === 'up' ? '\u2191 Growing' : trend === 'down' ? '\u2193 Declining' : '\u2192 Stable' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-[rgb(var(--color-text))]">{label}</h3>
          <p className="text-xs text-[rgb(var(--color-text-muted))]">{analysis.summary}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {items.map((item) => (
          <div key={item.label} className="text-center p-3 bg-[rgb(var(--color-surface))] rounded-xl">
            <p className="text-lg font-bold text-[rgb(var(--color-text))]">{item.value}</p>
            <p className="text-xs text-[rgb(var(--color-text-muted))]">{item.label}</p>
          </div>
        ))}
      </div>
      {analysis.topPages && analysis.topPages.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[rgb(var(--color-text-muted))] mb-2 uppercase tracking-wider">Top Pages</p>
          <div className="space-y-1.5">
            {analysis.topPages.slice(0, 5).map((page, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-[rgb(var(--color-text-secondary))] truncate max-w-[200px]">{page.url}</span>
                <span className="text-[rgb(var(--color-text))] font-medium">{page.views}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function GrowthAssistant() {
  const { dashboard, insights, loading, fetchDashboard, fetchInsights, markInsightRead, dismissInsight, generateReport, reports } = useGrowth();
  const { websites, fetchWebsites } = useWebsites();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchInsights();
    fetchWebsites();
  }, [fetchDashboard, fetchInsights, fetchWebsites]);

  const handleGenerateReport = useCallback(async () => {
    if (!selectedWebsite) return;
    setGenerating(true);
    await generateReport(selectedWebsite);
    setGenerating(false);
    fetchDashboard();
  }, [selectedWebsite, generateReport, fetchDashboard]);

  const latestReport = dashboard?.latestReport;
  const trends = dashboard?.trends;
  const insightList = insights || dashboard?.insights || [];
  const unreadCount = insightList.filter((i) => !i.read).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiActivity },
    { id: 'analysis', label: 'Analysis', icon: FiBarChart2 },
    { id: 'actions', label: 'Recommendations', icon: FiTarget },
    { id: 'insights', label: `Insights${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: FiZap },
    { id: 'reports', label: 'Reports', icon: HiCalendar },
  ];

  const trendMetrics = [
    { key: 'businessHealth', label: 'Health' },
    { key: 'seo', label: 'SEO' },
    { key: 'leads', label: 'Leads' },
    { key: 'conversions', label: 'Conversions' },
    { key: 'satisfaction', label: 'Satisfaction' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
            <HiSparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">AI Business Growth Assistant</h1>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">AI-powered insights and recommendations to grow your business</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedWebsite} onChange={(e) => setSelectedWebsite(e.target.value)}
            className="input-field w-auto min-w-[160px]">
            <option value="">Select website</option>
            {(websites || []).map((w) => (
              <option key={w._id || w.id} value={w._id || w.id}>{w.name || w.businessName}</option>
            ))}
          </select>
          <Button variant="primary" className="whitespace-nowrap" loading={generating}
            disabled={!selectedWebsite} onClick={handleGenerateReport}>
            <HiRefresh className="w-4 h-4 mr-1.5" /> Generate Report
          </Button>
        </div>
      </motion.div>

      {/* Score Cards */}
      {latestReport && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <ScoreCard label="Business Health" score={latestReport.scores.businessHealth} icon={HiTrendingUp} size="sm" />
          <ScoreCard label="SEO Score" score={latestReport.scores.seo} icon={HiSearch} size="sm" />
          <ScoreCard label="Lead Generation" score={latestReport.scores.leadGeneration} icon={HiUserGroup} size="sm" />
          <ScoreCard label="Conversion" score={latestReport.scores.conversion} icon={HiChartBar} size="sm" />
          <ScoreCard label="Satisfaction" score={latestReport.scores.customerSatisfaction} icon={HiStar} size="sm" />
        </motion.div>
      )}

      {!latestReport && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiSparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">No Reports Yet</h3>
          <p className="text-[rgb(var(--color-text-muted))] mb-6">Select a website and generate your first AI-powered business report.</p>
          <Button variant="primary" disabled={!selectedWebsite} onClick={handleGenerateReport}>
            <HiRefresh className="w-4 h-4 mr-1.5" /> Generate First Report
          </Button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-[rgb(var(--color-surface))] rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={twMerge('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.id ? 'bg-white dark:bg-surface-800 shadow-sm text-[rgb(var(--color-text))]' : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))]')}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {trends && (
              <div className="card">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-6">Score Trends (Last {trends.labels?.length || 0} Weeks)</h3>
                <div className="h-80">
                  <TrendChart data={trends} metrics={trendMetrics} height={300} />
                </div>
              </div>
            )}

            {latestReport?.analysis && (
              <div className="grid lg:grid-cols-2 gap-6">
                <AnalysisTab icon={HiTrendingUp} label="Traffic Overview" analysis={latestReport.analysis.traffic} trend={latestReport.analysis.traffic.trend} />
                <AnalysisTab icon={HiUserGroup} label="Lead Generation" analysis={latestReport.analysis.leads} trend={latestReport.analysis.leads.trend} />
              </div>
            )}

            {latestReport?.aiSummary && (
              <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <HiSparkles className="w-6 h-6 text-primary-200" />
                  <h3 className="text-lg font-semibold">AI Executive Summary</h3>
                </div>
                <p className="text-primary-100 leading-relaxed text-lg">{latestReport.aiSummary}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {latestReport?.analysis ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <AnalysisTab icon={HiTrendingUp} label="Traffic Analysis" analysis={latestReport.analysis.traffic} trend={latestReport.analysis.traffic.trend} />
                <AnalysisTab icon={HiUserGroup} label="Lead Analysis" analysis={latestReport.analysis.leads} trend={latestReport.analysis.leads.trend} />
                <AnalysisTab icon={HiChartBar} label="Conversion Analysis" analysis={latestReport.analysis.conversions} trend={latestReport.analysis.conversions.trend} />
                <AnalysisTab icon={HiSearch} label="SEO Analysis" analysis={latestReport.analysis.seo} trend="" />
              </div>
            ) : (
              <div className="text-center py-12 text-[rgb(var(--color-text-muted))] card">Generate a report to see detailed analysis</div>
            )}

            {latestReport?.growthOpportunities && latestReport.growthOpportunities.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4 flex items-center gap-2">
                  <HiLightBulb className="w-5 h-5 text-amber-500" /> Growth Opportunities
                </h3>
                <div className="space-y-3">
                  {latestReport.growthOpportunities.map((opp, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]">
                      <div className={twMerge('px-2.5 py-1 rounded text-xs font-bold uppercase',
                        opp.impact === 'high' ? 'badge-error' :
                        opp.impact === 'medium' ? 'badge-warning' :
                        'badge-success')}>
                        {opp.impact}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-[rgb(var(--color-text))]">{opp.title}</h4>
                        <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">{opp.description}</p>
                        {opp.potentialRevenue > 0 && (
                          <p className="text-xs text-emerald-600 mt-2">Potential Revenue: ${opp.potentialRevenue.toLocaleString()}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'actions' && (
          <motion.div key="actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {latestReport?.recommendedActions && latestReport.recommendedActions.length > 0 ? (
              latestReport.recommendedActions.map((action, i) => {
                const config = priorityConfig[action.priority] || priorityConfig.medium;
                const Icon = config.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className={twMerge('card border-l-4', config.border.replace('border-', 'border-l-'))}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={twMerge('w-10 h-10 rounded-xl flex items-center justify-center', config.bg)}>
                          <Icon className={twMerge('w-5 h-5', config.color)} />
                        </div>
                        <div>
                          <span className={twMerge('text-xs font-bold uppercase', config.color)}>{action.priority}</span>
                          <h3 className="font-semibold text-[rgb(var(--color-text))]">{action.title}</h3>
                        </div>
                      </div>
                      {action.deadline && (
                        <span className="text-xs text-[rgb(var(--color-text-muted))] whitespace-nowrap">Due: {action.deadline}</span>
                      )}
                    </div>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">{action.description}</p>
                    {action.steps && action.steps.length > 0 && (
                      <div className="bg-[rgb(var(--color-surface))] rounded-xl p-4">
                        <p className="text-xs font-medium text-[rgb(var(--color-text-muted))] mb-2 uppercase tracking-wider">Steps</p>
                        <ol className="space-y-2">
                          {action.steps.map((step, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                              <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                                {j + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {action.expectedOutcome && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <HiTrendingUp className="w-4 h-4" />
                        <span className="font-medium">Expected: {action.expectedOutcome}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 text-[rgb(var(--color-text-muted))] card">
                <FiTarget className="w-12 h-12 mx-auto mb-4 text-[rgb(var(--color-text-muted))]" />
                <p>No recommendations yet. Generate a report to get AI-powered recommendations.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {insightList.length > 0 ? (
              insightList.map((insight, i) => (
                <InsightCard key={insight._id} insight={insight} onDismiss={dismissInsight} onMarkRead={markInsightRead} index={i} />
              ))
            ) : (
              <div className="text-center py-12 text-[rgb(var(--color-text-muted))] card">
                <FiZap className="w-12 h-12 mx-auto mb-4 text-[rgb(var(--color-text-muted))]" />
                <p>No insights yet. Insights will appear as your website generates data.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {reports.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report, i) => (
                  <motion.div key={report._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="card-hover cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <HiCalendar className="w-5 h-5 text-white" />
                      </div>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="text-lg font-bold text-[rgb(var(--color-text))] mb-1">
                      {report.scores?.businessHealth || '\u2014'}/100
                    </p>
                    <p className="text-sm text-[rgb(var(--color-text-muted))]">
                      {report.weekStart ? new Date(report.weekStart).toLocaleDateString() : '\u2014'} - {report.weekEnd ? new Date(report.weekEnd).toLocaleDateString() : '\u2014'}
                    </p>
                    <div className="flex gap-2 mt-4">
                      {['seo', 'leadGeneration', 'conversion'].map((key) => (
                        <span key={key} className="text-xs text-[rgb(var(--color-text-muted))] bg-[rgb(var(--color-surface))] px-2 py-1 rounded">
                          {key.slice(0, 3)}: {report.scores?.[key] || 0}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[rgb(var(--color-text-muted))] card">
                <HiCalendar className="w-12 h-12 mx-auto mb-4 text-[rgb(var(--color-text-muted))]" />
                <p>No reports generated yet. Weekly reports are generated automatically every Monday.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
