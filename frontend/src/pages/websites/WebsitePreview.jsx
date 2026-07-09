import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import {
  HiDesktopComputer, HiDeviceTablet, HiDeviceMobile,
  HiExternalLink, HiShare, HiChevronLeft,
  HiGlobe, HiX,
} from 'react-icons/hi';
import PreviewSkeleton from '@/components/website/PreviewSkeleton';
import SectionRenderer from '@/components/website/SectionRenderer';
import api from '@/lib/axios';

const viewportWidths = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const frameStyles = {
  desktop: '',
  tablet: 'shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700',
  mobile: 'shadow-2xl rounded-[2.5rem] overflow-hidden border-4 border-slate-800 dark:border-slate-600',
};

function PreviewToolbar({ viewMode, onChange, website, onShare }) {
  const navigate = useNavigate();
  const name = website?.businessName || 'Website Preview';

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-2.5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Go back"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <HiGlobe className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
              {name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
            {[
              { mode: 'desktop', Icon: HiDesktopComputer, label: 'Desktop' },
              { mode: 'tablet', Icon: HiDeviceTablet, label: 'Tablet' },
              { mode: 'mobile', Icon: HiDeviceMobile, label: 'Mobile' },
            ].map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => onChange(mode)}
                className={twMerge(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {(website?.domain || website?.subdomain) && (
            <a
              href={`https://${website.domain || website.subdomain + '.localsiteai.com'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <HiExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Live Site</span>
            </a>
          )}

          <button
            onClick={onShare}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Share"
          >
            <HiShare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <HiX className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Failed to load preview</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
        >
          <HiGlobe className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-6">
          <HiGlobe className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Website not found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">The website you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
          <HiChevronLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );
}

export default function WebsitePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('desktop');
  const [error, setError] = useState(null);

  const fetchWebsite = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/websites/${id}`);
      setWebsite(data.website || data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchWebsite();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: website?.businessName || 'Website Preview', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) return <PreviewSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchWebsite} />;
  if (!website) return <NotFoundState />;

  const colors = website.branding?.colors || {};
  const fonts = website.branding?.fonts || {};

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800">
      <PreviewToolbar viewMode={viewMode} onChange={setViewMode} website={website} onShare={handleShare} />
      <div className="flex justify-center py-6 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ width: viewportWidths[viewMode], maxWidth: '100%' }}
            className={frameStyles[viewMode]}
          >
            {viewMode === 'mobile' && (
              <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-white text-xs">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="w-3.5 h-2 rounded-sm border border-white/60" />
                  <div className="w-3.5 h-2 rounded-sm border border-white/60" />
                  <div className="w-3.5 h-2 rounded-sm border border-white/60" />
                </div>
              </div>
            )}
            <div
              className="website-content"
              style={{
                fontFamily: `'${fonts.body || 'Inter'}', sans-serif`,
                '--heading-font': `'${fonts.heading || 'Inter'}', serif`,
                backgroundColor: colors.background || '#FAFAFA',
                color: colors.text || '#18181B',
              }}
            >
              <SectionRenderer website={website} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
