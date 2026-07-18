import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { HiGlobe, HiPencil, HiTrash, HiExternalLink, HiRefresh, HiChevronLeft, HiEye, HiChartBar } from 'react-icons/hi';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const statusColors = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  draft: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-400 border-surface-200 dark:border-surface-700',
  generating: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 animate-pulse',
  generated: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
};

const sections = [
  { key: 'hero', label: 'Hero Section' },
  { key: 'about', label: 'About Us' },
  { key: 'services', label: 'Services' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'faq', label: 'FAQ' },
  { key: 'contact', label: 'Contact' },
];

export default function WebsiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const { data } = await api.get(`/websites/${id}`);
        setWebsite(data.website || data.data);
      } catch (err) {
        toast.error('Failed to load project');
        navigate('/websites');
      } finally {
        setLoading(false);
      }
    };
    fetchWebsite();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      await api.delete(`/websites/${id}`);
      toast.success('Project deleted');
      navigate('/websites');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
         <div className="flex justify-between">
             <Skeleton className="w-1/3 h-10" />
             <Skeleton className="w-48 h-10" />
         </div>
         <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
                <Skeleton className="w-full aspect-video rounded-2xl" />
                <Skeleton className="w-full h-[400px] rounded-2xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="w-full h-48 rounded-2xl" />
                <Skeleton className="w-full h-64 rounded-2xl" />
            </div>
         </div>
      </div>
    );
  }

  if (!website) return null;

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/websites')}
            className="border-surface-200 dark:border-surface-800"
          >
            <HiChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-semibold text-surface-950 dark:text-white">
                {website.name || website.businessName || 'Untitled Project'}
              </h1>
              <span className={cn('badge border', statusColors[website.status] || statusColors.draft)}>
                {website.status || 'draft'}
              </span>
            </div>
            <p className="text-surface-500 mt-1">
              {website.category}{website.location ? ` \u2022 ${website.location}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/websites/${id}/edit`)}
          >
            <HiPencil className="w-4 h-4 mr-2" /> Editor
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            <HiTrash className="w-4 h-4" />
          </Button>
          {website.liveUrl && (
            <Button
              variant="primary"
              onClick={() => window.open(website.liveUrl, '_blank')}
            >
              <HiExternalLink className="w-4 h-4 mr-2" /> Live Site
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-0 overflow-hidden shadow-sm border-surface-200 dark:border-surface-800">
            <div className="aspect-video bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-900 relative flex items-center justify-center">
              <HiGlobe className="w-24 h-24 text-surface-300 dark:text-surface-700" />
              {website.liveUrl && (
                <a
                  href={website.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-6 right-6 px-4 py-2 bg-surface-950/80 backdrop-blur-xl border border-surface-800 rounded-xl text-white text-sm hover:bg-surface-950 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <HiExternalLink className="w-4 h-4" /> Preview Active
                </a>
              )}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-surface-200 dark:border-surface-800 no-scrollbar">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={cn(
                    'px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                    activeSection === section.key
                      ? 'border-primary-500 text-primary-600 dark:text-white'
                      : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-300'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>
            <div className="p-8 min-h-[300px] bg-surface-50/50 dark:bg-surface-950/50">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={activeSection}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                 >
                    {website.content?.[activeSection] ? (
                      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-display">
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(website.content[activeSection]) }} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                         <div className="w-16 h-16 bg-surface-100 dark:bg-surface-900 rounded-2xl flex items-center justify-center mb-4 border border-surface-200 dark:border-surface-800">
                             <HiPencil className="w-6 h-6 text-surface-400" />
                         </div>
                         <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-1">No content found</h3>
                         <p className="text-surface-500">This section has not been generated yet.</p>
                      </div>
                    )}
                 </motion.div>
              </AnimatePresence>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-5">SEO Metadata</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-surface-500 mb-1">Meta Title</dt>
                <dd className="text-surface-900 dark:text-white font-medium bg-surface-50 dark:bg-surface-900 p-2.5 rounded-lg border border-surface-200 dark:border-surface-800">
                  {website.seo?.metaTitle || 'Not optimized'}
                </dd>
              </div>
              <div>
                <dt className="text-surface-500 mb-1">Meta Description</dt>
                <dd className="text-surface-900 dark:text-white bg-surface-50 dark:bg-surface-900 p-2.5 rounded-lg border border-surface-200 dark:border-surface-800 line-clamp-3">
                  {website.seo?.metaDescription || 'Not optimized'}
                </dd>
              </div>
              <div>
                <dt className="text-surface-500 mb-1">Keywords</dt>
                <dd className="flex flex-wrap gap-1.5 mt-2">
                  {website.seo?.keywords?.length > 0 ? website.seo.keywords.map((kw, idx) => (
                    <span key={idx} className="px-2 py-1 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md text-xs text-surface-600 dark:text-surface-300">
                       {kw}
                    </span>
                  )) : (
                     <span className="text-surface-400">None provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
               <h3 className="font-display font-semibold text-surface-900 dark:text-white">Quick Actions</h3>
            </div>
            <div className="p-3 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-surface-700 dark:text-surface-300"
                onClick={() => navigate(`/websites/${id}/edit`)}
              >
                <HiPencil className="w-4 h-4 mr-3 text-surface-400" /> Visual Editor
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-surface-700 dark:text-surface-300"
                onClick={() => toast.success('Content regeneration started...')}
              >
                <HiRefresh className="w-4 h-4 mr-3 text-surface-400" /> AI Regeneration
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-surface-700 dark:text-surface-300"
                onClick={() => navigate('/analytics')}
              >
                <HiChartBar className="w-4 h-4 mr-3 text-surface-400" /> View Analytics
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
