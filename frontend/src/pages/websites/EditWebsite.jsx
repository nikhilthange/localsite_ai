import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { HiChevronLeft, HiGlobe, HiPhotograph, HiColorSwatch, HiCode, HiEye, HiDeviceMobile, HiDesktopComputer } from 'react-icons/hi';
import { FiSave, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const categories = [
  'Restaurant', 'Gym/Fitness', 'Law Firm', 'Real Estate',
  'E-Commerce', 'SaaS/Tech', 'Plumber/HVAC', 'Medical/Dental',
  'Salon/Spa', 'Photography', 'Consulting', 'Construction',
  'Auto Repair', 'Cleaning Service', 'Education/Tutor',
  'Event Planning', 'Marketing Agency', 'Non-Profit', 'Financial/Accounting'
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
  const [previewMode, setPreviewMode] = useState('desktop');
  
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
          fonts: site.fonts || { heading: 'Outfit', body: 'Inter' },
          content: site.content || {},
        });
      } catch {
        toast.error('Failed to load project');
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
      toast.success('Changes saved successfully');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-500 font-medium">Initializing visual editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-900/50 p-4 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/websites/${id}`)}
            className="border-surface-200 dark:border-surface-800"
          >
            <HiChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-semibold text-surface-950 dark:text-white">
              {form.businessName || form.name || 'Untitled Project'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-xs text-surface-500 font-medium tracking-wide uppercase">Draft Mode</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-950 p-1 rounded-xl border border-surface-200 dark:border-surface-800 mx-auto sm:mx-0">
           {editorTabs.map((tab) => {
             const Icon = tab.icon;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                   activeTab === tab.id
                     ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                     : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                 )}
               >
                 <Icon className="w-4 h-4" /> <span className="hidden md:inline">{tab.label}</span>
               </button>
             );
           })}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" loading={saving} onClick={handleSave} className="shadow-glow px-6">
             {saving ? 'Saving...' : <><FiSave className="w-4 h-4 mr-2" /> Save</>}
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-hidden relative">
         <AnimatePresence mode="wait">
            {activeTab === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full grid lg:grid-cols-2 gap-6 overflow-y-auto no-scrollbar pb-6"
              >
                <div className="space-y-6">
                  <Card className="p-6">
                     <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-5">Business Details</h3>
                     <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Business Name</label>
                          <Input
                            type="text"
                            value={form.businessName}
                            onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Industry</label>
                          <select
                            value={form.category}
                            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20"
                          >
                            <option value="">Select industry...</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
                          <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            className="w-full p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                          />
                        </div>
                     </div>
                  </Card>
                </div>

                <div className="space-y-6">
                   <Card className="p-6 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-5">
                         <h3 className="font-display font-semibold text-surface-900 dark:text-white">Structured Content</h3>
                         <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md font-medium">JSON Data</span>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Hero Section Data</label>
                           <textarea
                             rows={8}
                             value={typeof form.content.hero === 'string' ? form.content.hero : JSON.stringify(form.content.hero, null, 2)}
                             onChange={(e) => {
                                try {
                                   const parsed = JSON.parse(e.target.value);
                                   setForm((p) => ({ ...p, content: { ...p.content, hero: parsed } }));
                                } catch {
                                   setForm((p) => ({ ...p, content: { ...p.content, hero: e.target.value } }));
                                }
                             }}
                             className="w-full p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-800 dark:text-surface-300 font-mono text-sm outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                           />
                         </div>
                      </div>
                   </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full grid lg:grid-cols-2 gap-6 overflow-y-auto no-scrollbar pb-6"
              >
                <Card className="p-6">
                  <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-6">Color Tokens</h3>
                  <div className="space-y-6">
                    {[
                      { key: 'primary', label: 'Primary Brand Color', desc: 'Used for main buttons and active states' },
                      { key: 'secondary', label: 'Secondary Color', desc: 'Used for accents and secondary buttons' },
                      { key: 'accent', label: 'Accent Color', desc: 'Used for highlights and badges' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-sm shrink-0">
                           <input
                             type="color"
                             value={form.colors[key]}
                             onChange={(e) => setForm((p) => ({ ...p, colors: { ...p.colors, [key]: e.target.value } }))}
                             className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer"
                           />
                        </div>
                        <div className="flex-1">
                          <label className="block font-medium text-surface-900 dark:text-white mb-0.5">{label}</label>
                          <p className="text-sm text-surface-500 mb-2">{desc}</p>
                          <div className="font-mono text-xs px-2 py-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded w-fit">
                             {form.colors[key].toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-6">Typography System</h3>
                  <div className="space-y-6">
                    {[
                      { key: 'heading', label: 'Heading Font (Display)' },
                      { key: 'body', label: 'Body Font (Sans)' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">{label}</label>
                        <select
                          value={form.fonts[key]}
                          onChange={(e) => setForm((p) => ({ ...p, fonts: { ...p.fonts, [key]: e.target.value } }))}
                          className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-surface-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                          {['Inter', 'Outfit', 'Plus Jakarta Sans', 'Playfair Display', 'Merriweather', 'Space Grotesk'].map((font) => (
                            <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                          ))}
                        </select>
                        <div className="mt-3 p-4 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                           <p style={{ fontFamily: form.fonts[key] }} className={key === 'heading' ? 'text-2xl font-bold' : 'text-base'}>
                              The quick brown fox jumps over the lazy dog.
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div
                key="media"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col"
              >
                <Card className="flex-1 flex flex-col items-center justify-center border-dashed border-2 bg-surface-50/50 dark:bg-surface-950/50 text-center py-20">
                  <div className="w-20 h-20 bg-surface-100 dark:bg-surface-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-surface-200 dark:border-surface-800">
                    <HiPhotograph className="w-10 h-10 text-surface-400" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-surface-900 dark:text-white mb-2">Media Asset Library</h3>
                  <p className="text-surface-500 mb-8 max-w-md">
                    Upload high-quality images to be used across your website. Our AI will automatically optimize and assign them to the appropriate sections.
                  </p>
                  <label className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 cursor-pointer shadow-glow transition-all">
                    <HiPhotograph className="w-5 h-5" /> Browse Files
                    <input type="file" className="hidden" accept="image/*" multiple />
                  </label>
                  <p className="mt-4 text-xs text-surface-400">Supports JPG, PNG, WEBP up to 5MB</p>
                </Card>
              </motion.div>
            )}

            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col"
              >
                 <div className="flex justify-center mb-4">
                    <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-900 p-1 rounded-xl border border-surface-200 dark:border-surface-800">
                       <button 
                         onClick={() => setPreviewMode('desktop')}
                         className={cn('p-2 rounded-lg transition-all', previewMode === 'desktop' ? 'bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500')}
                       >
                         <HiDesktopComputer className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={() => setPreviewMode('mobile')}
                         className={cn('p-2 rounded-lg transition-all', previewMode === 'mobile' ? 'bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500')}
                       >
                         <HiDeviceMobile className="w-5 h-5" />
                       </button>
                    </div>
                 </div>

                <div className="flex-1 flex justify-center pb-6 overflow-hidden">
                   <div className={cn(
                      'w-full h-full bg-surface-200 dark:bg-surface-950 rounded-2xl overflow-hidden border border-surface-300 dark:border-surface-800 shadow-2xl transition-all duration-500 flex flex-col',
                      previewMode === 'mobile' ? 'max-w-sm rounded-[3rem] border-8' : 'max-w-6xl'
                   )}>
                      {/* Browser Chrome for Desktop */}
                      {previewMode === 'desktop' && (
                         <div className="h-12 bg-surface-100 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center px-4 gap-4 shrink-0">
                             <div className="flex gap-1.5">
                               <div className="w-3 h-3 rounded-full bg-red-400" />
                               <div className="w-3 h-3 rounded-full bg-amber-400" />
                               <div className="w-3 h-3 rounded-full bg-green-400" />
                             </div>
                             <div className="flex-1 max-w-xl mx-auto h-7 bg-white dark:bg-surface-950 rounded-md flex items-center justify-center text-xs font-mono text-surface-500 border border-surface-200 dark:border-surface-800">
                                {form.name?.toLowerCase().replace(/\s+/g, '-') || 'website'}.localsite.app
                             </div>
                             <div className="w-12" />
                         </div>
                      )}

                      {/* Mock Render */}
                      <div className="flex-1 bg-white relative overflow-y-auto no-scrollbar">
                         <div className="h-20 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
                            <div className="text-xl font-bold" style={{ color: form.colors.primary }}>{form.businessName}</div>
                            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                               <span>Home</span>
                               <span>Services</span>
                               <span>About</span>
                            </div>
                            <Button style={{ backgroundColor: form.colors.primary, color: 'white' }}>Contact Us</Button>
                         </div>
                         <div className="min-h-[500px] flex items-center justify-center p-12 text-center" style={{ backgroundColor: form.colors.primary }}>
                            <div className="max-w-2xl text-white">
                               <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: form.fonts.heading }}>
                                  {form.content?.hero?.title || 'Welcome to our business'}
                               </h1>
                               <p className="text-xl opacity-90 mb-8" style={{ fontFamily: form.fonts.body }}>
                                  {form.content?.hero?.subtitle || form.description || 'Discover our amazing services today.'}
                               </p>
                               <div className="flex justify-center gap-4">
                                  <button className="px-8 py-4 bg-white text-black font-bold rounded-lg shadow-lg">Get Started</button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
