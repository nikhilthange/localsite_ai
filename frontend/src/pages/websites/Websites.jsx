import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { HiSearch, HiViewGrid, HiViewList, HiGlobe, HiFilter } from 'react-icons/hi';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useWebsites } from '@/hooks/useWebsite';

const statusColors = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  draft: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-400 border-surface-200 dark:border-surface-700',
  generating: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 animate-pulse',
  generated: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Websites() {
  const navigate = useNavigate();
  const { websites, fetchWebsites, loading } = useWebsites();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const websiteList = Array.isArray(websites) ? websites : [];

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  const filtered = websiteList.filter((site) => {
    const name = (site.name || site.businessName || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || site.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-surface-950 dark:text-white">Websites</h1>
          <p className="text-surface-500 mt-1">Manage and deploy your AI-generated websites.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/websites/generate')} size="lg" className="shadow-glow">
          <FiPlus className="w-5 h-5 mr-1" /> New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-surface-900/50 p-4 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 border-none">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search websites..."
              leftIcon={<HiSearch className="w-4 h-4 text-surface-400" />}
              className="bg-surface-50 dark:bg-surface-950 border-surface-200 dark:border-surface-800 shadow-none focus:ring-primary-500/10"
            />
          </div>
          <div className="hidden md:flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800">
            {['all', 'published', 'draft', 'generating'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  filter === s
                    ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-300'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" className="md:hidden">
              <HiFilter className="w-4 h-4" />
           </Button>
          <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'grid' ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-900'
              )}
            >
              <HiViewGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'list' ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-900'
              )}
            >
              <HiViewList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-0 overflow-hidden shadow-sm">
                <div className="h-40 bg-surface-100 dark:bg-surface-950 animate-pulse" />
                <div className="p-5 space-y-3">
                   <div className="h-5 w-1/2 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                   <div className="h-4 w-1/3 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                </div>
             </div>
           ))}
        </div>
      ) : filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filtered.map((site) => (
                <motion.div
                  key={site._id || site.id}
                  variants={itemVariants}
                  layout
                  className="group"
                >
                  <Card hover className="p-0 overflow-hidden cursor-pointer" onClick={() => navigate(`/websites/${site._id || site.id}`)}>
                    <div className="aspect-video bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-900 relative overflow-hidden flex items-center justify-center">
                      <HiGlobe className="w-12 h-12 text-surface-300 dark:text-surface-700 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className={cn('badge border', statusColors[site.status] || statusColors.draft)}>
                          {site.status || 'draft'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white mb-1 truncate text-lg group-hover:text-primary-600 transition-colors">
                          {site.name || site.businessName || 'Untitled Project'}
                        </h3>
                        <p className="text-sm text-surface-500 truncate">
                          {site.domain ? site.domain : (site.category || 'No domain set')}
                        </p>
                      </div>
                      <button className="p-2 text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                         <FiMoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {filtered.map((site, i) => (
                <motion.div
                  key={site._id || site.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/websites/${site._id || site.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center border border-surface-200 dark:border-surface-700">
                      <HiGlobe className="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {site.name || site.businessName || 'Untitled Project'}
                      </p>
                      <p className="text-sm text-surface-500">
                        {site.domain ? site.domain : (site.category || 'No domain set')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn('badge border', statusColors[site.status] || statusColors.draft)}>
                      {site.status || 'draft'}
                    </span>
                    <button className="p-2 text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); }}>
                       <FiMoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )
      ) : (
        <Card className="text-center py-20 flex flex-col items-center justify-center border-dashed bg-surface-50/50 dark:bg-surface-950/50">
          <div className="w-16 h-16 bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 flex items-center justify-center mb-6 shadow-sm">
            <HiGlobe className="w-8 h-8 text-surface-400" />
          </div>
          <h3 className="text-xl font-display font-semibold text-surface-900 dark:text-white mb-2">
            {search || filter !== 'all' ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-surface-500 mb-8 max-w-sm">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Start your journey by generating your first AI-powered website.'}
          </p>
          {!search && filter === 'all' && (
            <Button variant="primary" size="lg" onClick={() => navigate('/websites/generate')} className="shadow-glow">
              <FiPlus className="w-5 h-5 mr-1" /> Generate Website
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
