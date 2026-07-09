import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { HiSearch, HiViewGrid, HiViewList, HiGlobe } from 'react-icons/hi';
import { FiPlus } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { useWebsites } from '@/hooks/useWebsite';

const statusColors = {
  published: 'badge-success',
  draft: 'badge-neutral',
  generating: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  generated: 'badge-primary',
  failed: 'badge-error',
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">My Websites</h1>
          <p className="text-[rgb(var(--color-text-secondary))] text-sm">Manage all your generated websites</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/websites/generate')}>
          <FiPlus className="w-5 h-5" /> Generate Website
        </Button>
      </div>

      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search websites..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-[rgb(var(--color-surface))] rounded-lg">
            {['all', 'published', 'draft', 'generating'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={twMerge(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                  filter === s
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))]'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-[rgb(var(--color-surface))] rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={twMerge(
              'p-2 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-[rgb(var(--color-bg))] shadow-sm' : ''
            )}
          >
            <HiViewGrid className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={twMerge(
              'p-2 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-[rgb(var(--color-bg))] shadow-sm' : ''
            )}
          >
            <HiViewList className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Loading websites...</p>
          </div>
        </div>
      ) : filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((site, i) => (
              <motion.div
                key={site._id || site.id || i}
                variants={itemVariants}
                className="card-hover overflow-hidden group cursor-pointer p-0"
                onClick={() => navigate(`/websites/${site._id || site.id}`)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-indigo-600 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HiGlobe className="w-16 h-16 text-white/20" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={twMerge('badge', statusColors[site.status] || 'badge-neutral')}>
                      {site.status || 'draft'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-[rgb(var(--color-text))] mb-1 truncate">
                    {site.name || site.businessName || 'Untitled'}
                  </h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))] truncate">
                    {site.category || site.domain || 'No domain set'}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="divide-y divide-[rgb(var(--color-border))]">
              {filtered.map((site, i) => (
                <motion.div
                  key={site._id || site.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-[rgb(var(--color-surface))] transition-colors cursor-pointer"
                  onClick={() => navigate(`/websites/${site._id || site.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <HiGlobe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[rgb(var(--color-text))]">
                        {site.name || site.businessName || 'Untitled'}
                      </p>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {site.category || site.domain || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={twMerge('badge', statusColors[site.status] || 'badge-neutral')}>
                      {site.status || 'draft'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-[rgb(var(--color-surface))] rounded-full flex items-center justify-center mx-auto mb-4">
            <HiGlobe className="w-8 h-8 text-[rgb(var(--color-text-muted))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">
            {search || filter !== 'all' ? 'No websites found' : 'No websites yet'}
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Generate your first AI-powered website.'}
          </p>
          {!search && filter === 'all' && (
            <Button variant="primary" onClick={() => navigate('/websites/generate')}>
              <FiPlus className="w-5 h-5" /> Generate Website
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
