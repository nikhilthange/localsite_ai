import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiChevronLeft, HiGlobe, HiPhotograph, HiColorSwatch, HiCode, HiEye } from 'react-icons/hi';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const categories = [
  'Restaurant & Cafe', 'Portfolio', 'E-Commerce', 'SaaS / Tech',
  'Local Business', 'Agency', 'Blog', 'Real Estate', 'Fitness',
  'Education', 'Healthcare', 'Creative',
];

const editorTabs = [
  { id: 'content', label: 'Content', icon: HiCode },
  { id: 'design', label: 'Design', icon: HiColorSwatch },
  { id: 'media', label: 'Media', icon: HiPhotograph },
  { id: 'preview', label: 'Preview', icon: HiEye },
];

export default function EditWebsite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    category: '',
    location: '',
    description: '',
    colors: { primary: '#6366f1', secondary: '#14b8a6', accent: '#f97316' },
    fonts: { heading: 'Inter', body: 'Inter' },
    content: {},
  });

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const { data } = await api.get(`/websites/${id}`);
        const site = data.website || data.data;
        setForm({
          name: site.name || '',
          businessName: site.businessName || '',
          category: site.category || '',
          location: site.location || '',
          description: site.description || '',
          colors: site.colors || { primary: '#6366f1', secondary: '#14b8a6', accent: '#f97316' },
          fonts: site.fonts || { heading: 'Inter', body: 'Inter' },
          content: site.content || {},
        });
      } catch {
        toast.error('Failed to load website');
        navigate('/websites');
      } finally {
        setLoading(false);
      }
    };
    fetchWebsite();
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/websites/${id}`, form);
      toast.success('Website updated successfully!');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[rgb(var(--color-text-muted))]">Loading website editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/websites/${id}`)}
            className="p-2 rounded-lg text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))] transition-colors"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">Edit Website</h1>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {form.businessName || form.name || 'Untitled'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(`/websites/${id}`)}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-[rgb(var(--color-surface))] rounded-xl w-fit">
        {editorTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={twMerge(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-[rgb(var(--color-bg))] shadow-sm text-[rgb(var(--color-text))]'
                  : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))]'
              )}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'content' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Business Name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                className="input-field"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={twMerge(
                      'px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                      form.category === cat
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-text-muted))]'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="input-field resize-none"
                placeholder="Business description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="input-field"
                placeholder="New York, NY"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Hero Section</label>
              <textarea
                rows={6}
                value={form.content.hero || ''}
                onChange={(e) => setForm((p) => ({ ...p, content: { ...p.content, hero: e.target.value } }))}
                className="input-field resize-none font-mono text-sm"
                placeholder="<h1>Welcome to our business</h1>"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">About Section</label>
              <textarea
                rows={6}
                value={form.content.about || ''}
                onChange={(e) => setForm((p) => ({ ...p, content: { ...p.content, about: e.target.value } }))}
                className="input-field resize-none font-mono text-sm"
                placeholder="<p>About your business...</p>"
              />
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'design' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <div className="card">
            <h3 className="font-semibold text-[rgb(var(--color-text))] mb-4">Colors</h3>
            <div className="space-y-4">
              {[
                { key: 'primary', label: 'Primary' },
                { key: 'secondary', label: 'Secondary' },
                { key: 'accent', label: 'Accent' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg border border-[rgb(var(--color-border))] shrink-0"
                    style={{ backgroundColor: form.colors[key] }}
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-1">{label}</label>
                    <input
                      type="color"
                      value={form.colors[key]}
                      onChange={(e) => setForm((p) => ({ ...p, colors: { ...p.colors, [key]: e.target.value } }))}
                      className="w-full h-10 rounded-lg border border-[rgb(var(--color-border))] cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-[rgb(var(--color-text))] mb-4">Typography</h3>
            <div className="space-y-4">
              {[
                { key: 'heading', label: 'Heading Font' },
                { key: 'body', label: 'Body Font' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">{label}</label>
                  <select
                    value={form.fonts[key]}
                    onChange={(e) => setForm((p) => ({ ...p, fonts: { ...p.fonts, [key]: e.target.value } }))}
                    className="input-field"
                  >
                    {['Inter', 'Poppins', 'Roboto', 'Playfair Display', 'Montserrat', 'Lato', 'Open Sans'].map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'media' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <div className="w-16 h-16 bg-[rgb(var(--color-surface))] rounded-full flex items-center justify-center mx-auto mb-4">
            <HiPhotograph className="w-8 h-8 text-[rgb(var(--color-text-muted))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">Media Library</h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            Upload and manage images for your website.
          </p>
          <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
            <HiPhotograph className="w-5 h-5" /> Upload Media
            <input type="file" className="hidden" accept="image/*" multiple />
          </label>
        </motion.div>
      )}

      {activeTab === 'preview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card overflow-hidden p-0"
        >
          <div className="p-3 bg-[rgb(var(--color-surface))] flex items-center gap-3 border-b border-[rgb(var(--color-border))]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 max-w-lg mx-auto h-7 bg-[rgb(var(--color-bg))] rounded-lg flex items-center justify-center text-xs text-[rgb(var(--color-text-muted))]">
              {form.name?.toLowerCase().replace(/\s+/g, '-') || 'website'}.localsite.app
            </div>
          </div>
          <div className="aspect-video bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center p-8">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-2">{form.businessName || 'Your Business'}</h2>
              <p className="text-white/80 max-w-md mx-auto">
                {form.description?.slice(0, 120) || 'Your website content will appear here.'}
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <div className="w-28 h-9 bg-white/20 rounded-lg" />
                <div className="w-28 h-9 bg-white/30 rounded-lg" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
