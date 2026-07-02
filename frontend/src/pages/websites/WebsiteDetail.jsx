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
  published: 'badge-success',
  draft: 'badge-neutral',
  generating: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  generated: 'badge-primary',
  failed: 'badge-error',
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
    if (!window.confirm('Are you sure you want to delete this website? This action cannot be undone.')) return;
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[rgb(var(--color-text-muted))]">Loading website...</p>
        </div>
      </div>
    );
  }

  if (!website) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/websites')}
            className="p-2 rounded-lg text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))] transition-colors"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">
                {website.name || website.businessName}
              </h1>
              <span className={twMerge('badge', statusColors[website.status] || 'badge-neutral')}>
                {website.status || 'draft'}
              </span>
            </div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {website.category}{website.location ? ` \u2022 ${website.location}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => navigate(`/websites/${id}/edit`)}
          >
            <HiPencil className="w-4 h-4" /> Edit
          </Button>
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <HiTrash className="w-4 h-4" />
          </button>
          {website.liveUrl && (
            <Button
              variant="primary"
              size="sm"
              className="rounded-lg"
              onClick={() => window.open(website.liveUrl, '_blank')}
            >
              <HiExternalLink className="w-4 h-4" /> Visit Live
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card overflow-hidden p-0">
            <div className="aspect-video bg-gradient-to-br from-primary-500 to-indigo-600 relative flex items-center justify-center">
              <HiGlobe className="w-24 h-24 text-white/20" />
              {website.liveUrl && (
                <a
                  href={website.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <HiExternalLink className="w-4 h-4" /> Live Preview
                </a>
              )}
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-[rgb(var(--color-border))]">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={twMerge(
                    'px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                    activeSection === section.key
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))]'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>
            <div className="p-6">
              {website.content?.[activeSection] ? (
                <div className="prose dark:prose-invert max-w-none text-[rgb(var(--color-text))]">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(website.content[activeSection]) }} />
                </div>
              ) : (
                <p className="text-[rgb(var(--color-text-muted))] text-center py-8">
                  No content generated for this section yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-[rgb(var(--color-text))] mb-4">SEO Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[rgb(var(--color-text-muted))]">Meta Title</dt>
                <dd className="text-[rgb(var(--color-text))] font-medium">
                  {website.seo?.metaTitle || '\u2014'}
                </dd>
              </div>
              <div>
                <dt className="text-[rgb(var(--color-text-muted))]">Meta Description</dt>
                <dd className="text-[rgb(var(--color-text))]">
                  {website.seo?.metaDescription || '\u2014'}
                </dd>
              </div>
              <div>
                <dt className="text-[rgb(var(--color-text-muted))]">Keywords</dt>
                <dd className="text-[rgb(var(--color-text))]">
                  {website.seo?.keywords?.join(', ') || '\u2014'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-[rgb(var(--color-text))]">Quick Actions</h3>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate(`/websites/${id}/edit`)}
            >
              <HiPencil className="w-4 h-4 mr-2" /> Edit Website
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.success('Content regeneration started...')}
            >
              <HiRefresh className="w-4 h-4 mr-2" /> Regenerate Content
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.open(website.liveUrl || '#', '_blank')}
            >
              <HiEye className="w-4 h-4 mr-2" /> Preview Live
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/settings')}
            >
              <HiChartBar className="w-4 h-4 mr-2" /> View Analytics
            </Button>
          </div>

          <div className="card">
            <h3 className="font-semibold text-[rgb(var(--color-text))] mb-4">Domain</h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-2">Current domain:</p>
            <p className="text-sm font-medium text-[rgb(var(--color-text))] truncate">
              {website.domain || 'Not deployed'}
            </p>
            {website.domain && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary-600"
                onClick={() => window.open(`https://${website.domain}`, '_blank')}
              >
                <HiExternalLink className="w-4 h-4 mr-1" /> Open
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
