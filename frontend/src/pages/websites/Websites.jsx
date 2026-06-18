import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { HiSearch, HiFilter, HiViewGrid, HiViewList, HiGlobe } from 'react-icons/hi';
import { FiPlus } from 'react-icons/fi';
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

export default function Websites() {
  const navigate = useNavigate();
  const { websites, fetchWebsites, loading } = useWebsites();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  const filtered = (websites || []).filter((site) => {
    const name = (site.name || site.businessName || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || site.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Websites</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all your generated websites</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/websites/generate')} className="rounded-xl">
          <FiPlus className="w-5 h-5 mr-1.5" /> Generate Website
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search websites..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'published', 'draft', 'generating'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={twMerge('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                  filter === s ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button onClick={() => setViewMode('grid')} className={twMerge('p-2 rounded-md transition-colors', viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : '')}>
            <HiViewGrid className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button onClick={() => setViewMode('list')} className={twMerge('p-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : '')}>
            <HiViewList className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading websites...</p>
        </div>
      ) : filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((site, i) => (
              <motion.div key={site._id || site.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/websites/${site._id || site.id}`)}>
                <div className="aspect-video bg-gradient-to-br from-violet-500 to-indigo-600 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HiGlobe className="w-16 h-16 text-white/20" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={twMerge('px-2.5 py-1 rounded-full text-xs font-medium', statusColors[site.status] || statusColors.draft)}>
                      {site.status || 'draft'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{site.name || site.businessName || 'Untitled'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{site.domain || site.category || 'No domain set'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((site, i) => (
                <motion.div key={site._id || site.id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/websites/${site._id || site.id}`)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <HiGlobe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{site.name || site.businessName || 'Untitled'}</p>
                      <p className="text-sm text-gray-500">{site.category || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{site.views || 0} views</span>
                    <span className={twMerge('px-2.5 py-1 rounded-full text-xs font-medium', statusColors[site.status] || statusColors.draft)}>
                      {site.status || 'draft'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiGlobe className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {search || filter !== 'all' ? 'No websites found' : 'No websites yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Generate your first AI-powered website.'}
          </p>
          {!search && filter === 'all' && (
            <Button variant="primary" className="rounded-xl" onClick={() => navigate('/websites/generate')}>
              <FiPlus className="w-5 h-5 mr-1.5" /> Generate Website
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
