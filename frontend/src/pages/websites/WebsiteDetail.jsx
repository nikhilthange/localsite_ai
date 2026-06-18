import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiGlobe, HiPencil, HiTrash, HiExternalLink, HiRefresh, HiChevronLeft, HiEye, HiChartBar } from 'react-icons/hi';
import { FiArrowRight } from 'react-icons/fi';
import DOMPurify from 'dompurify';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const statusColors = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  generating: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  generated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const sections = [
  { key: 'hero', label: 'Hero' },
  { key: 'about', label: 'About' },
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
        toast.error('Failed to load website');
        navigate('/websites');
      } finally {
        setLoading(false);
      }
    };
    fetchWebsite();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this website?')) return;
    try {
      await api.delete(`/websites/${id}`);
      toast.success('Website deleted');
      navigate('/websites');
    } catch {
      toast.error('Failed to delete website');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!website) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/websites')} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{website.name || website.businessName}</h1>
              <span className={twMerge('px-2.5 py-0.5 rounded-full text-xs font-medium', statusColors[website.status] || statusColors.draft)}>
                {website.status || 'draft'}
              </span>
            </div>
            <p className="text-sm text-gray-500">{website.category} • {website.location || 'Location not set'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => navigate(`/websites/${id}/edit`)}>
            <HiPencil className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 dark:border-red-800" onClick={handleDelete}>
            <HiTrash className="w-4 h-4" />
          </Button>
          {website.liveUrl && (
            <Button variant="primary" size="sm" className="rounded-lg" onClick={() => window.open(website.liveUrl, '_blank')}>
              <HiExternalLink className="w-4 h-4 mr-1" /> Visit
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-violet-500 to-indigo-600 relative flex items-center justify-center">
              <HiGlobe className="w-24 h-24 text-white/20" />
              {website.liveUrl && (
                <a href={website.liveUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30 transition-colors flex items-center gap-2">
                  <HiExternalLink className="w-4 h-4" /> Live Preview
                </a>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800">
              {sections.map((section) => (
                <button key={section.key} onClick={() => setActiveSection(section.key)}
                  className={twMerge('px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                    activeSection === section.key
                      ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
                  {section.label}
                </button>
              ))}
            </div>
            <div className="p-6">
              {website.content?.[activeSection] ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(website.content[activeSection]) }} />
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No content generated for this section yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">SEO Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Meta Title</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{website.seo?.metaTitle || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Meta Description</dt>
                <dd className="text-gray-900 dark:text-white">{website.seo?.metaDescription || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Keywords</dt>
                <dd className="text-gray-900 dark:text-white">{website.seo?.keywords?.join(', ') || '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <Button variant="outline" className="w-full rounded-xl justify-start" onClick={() => navigate(`/websites/${id}/edit`)}>
              <HiPencil className="w-4 h-4 mr-2" /> Edit Website
            </Button>
            <Button variant="outline" className="w-full rounded-xl justify-start" onClick={() => toast.success('Regenerating...')}>
              <HiRefresh className="w-4 h-4 mr-2" /> Regenerate Content
            </Button>
            <Button variant="outline" className="w-full rounded-xl justify-start" onClick={() => window.open(website.liveUrl || '#', '_blank')}>
              <HiEye className="w-4 h-4 mr-2" /> Preview Live
            </Button>
            <Button variant="outline" className="w-full rounded-xl justify-start" onClick={() => navigate('/settings')}>
              <HiChartBar className="w-4 h-4 mr-2" /> View Analytics
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Domain</h3>
            <p className="text-sm text-gray-500 mb-2">Current domain:</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{website.domain || 'Not deployed'}</p>
            {website.domain && (
              <Button variant="ghost" size="sm" className="mt-2 text-violet-600" onClick={() => window.open(`https://${website.domain}`, '_blank')}>
                <HiExternalLink className="w-4 h-4 mr-1" /> Open
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
