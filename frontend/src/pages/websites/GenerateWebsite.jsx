import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  HiOfficeBuilding, HiCollection, HiSparkles, HiEye, HiGlobe,
  HiCheck, HiChevronLeft, HiChevronRight, HiLocationMarker,
  HiColorSwatch, HiDesktopComputer, HiLightningBolt,
} from 'react-icons/hi';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { useWebsites } from '@/hooks/useWebsite';
import { useSocket } from '@/hooks/useWebsocket';
import { THEMES } from '@/context/WebsiteThemeContext';

const categories = [
  'Restaurant & Cafe', 'Portfolio', 'E-Commerce', 'SaaS / Tech',
  'Local Business', 'Agency', 'Blog', 'Real Estate', 'Fitness',
  'Education', 'Healthcare', 'Creative',
];

const templates = [
  { id: 1, name: 'Restaurant Pro', category: 'Restaurant & Cafe', color: 'from-rose-500 to-pink-600', popular: true },
  { id: 2, name: 'Portfolio Plus', category: 'Portfolio', color: 'from-violet-500 to-purple-600' },
  { id: 3, name: 'Storefront', category: 'E-Commerce', color: 'from-emerald-500 to-teal-600' },
  { id: 4, name: 'SaaS Landing', category: 'SaaS / Tech', color: 'from-blue-500 to-indigo-600' },
  { id: 5, name: 'Local Business', category: 'Local Business', color: 'from-amber-500 to-orange-600' },
  { id: 6, name: 'Creative Agency', category: 'Agency', color: 'from-cyan-500 to-sky-600' },
  { id: 7, name: 'Blog Master', category: 'Blog', color: 'from-fuchsia-500 to-pink-600' },
  { id: 8, name: 'Health & Wellness', category: 'Healthcare', color: 'from-lime-500 to-emerald-600' },
];

const themeOptions = [
  { id: 'modern', name: 'Modern', colors: ['#6366f1', '#14b8a6'], popular: true },
  { id: 'luxury', name: 'Luxury', colors: ['#b8860b', '#d4af37'] },
  { id: 'minimal', name: 'Minimal', colors: ['#18181b', '#a1a1aa'] },
  { id: 'dark', name: 'Dark', colors: ['#8b5cf6', '#06b6d4'] },
  { id: 'corporate', name: 'Corporate', colors: ['#2563eb', '#059669'] },
  { id: 'creative', name: 'Creative', colors: ['#ec4899', '#8b5cf6'] },
  { id: 'elegant', name: 'Elegant', colors: ['#1e293b', '#cbd5e1'] },
  { id: 'glassmorphism', name: 'Glass', colors: ['#6366f1', '#34d399'] },
  { id: 'gradient', name: 'Gradient', colors: ['#f43f5e', '#3b82f6'] },
  { id: 'premium', name: 'Premium', colors: ['#fbbf24', '#f59e0b'] },
];

const generationStatuses = [
  { message: 'Analyzing your business information...', icon: HiOfficeBuilding },
  { message: 'Generating website structure...', icon: HiCollection },
  { message: 'Creating compelling content...', icon: HiSparkles },
  { message: 'Applying design and styling...', icon: HiColorSwatch },
  { message: 'Optimizing for performance...', icon: HiDesktopComputer },
  { message: 'Finalizing your website!', icon: HiCheck },
];

const steps = [
  { id: 1, label: 'Business Info', icon: HiOfficeBuilding },
  { id: 2, label: 'Choose Theme', icon: HiColorSwatch },
  { id: 3, label: 'AI Generation', icon: HiSparkles },
  { id: 4, label: 'Preview', icon: HiEye },
  { id: 5, label: 'Deploy', icon: HiGlobe },
];

const stepVariants = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
};

export default function GenerateWebsite() {
  const navigate = useNavigate();
  const { generateWebsite } = useWebsites();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({ name: '', category: '', location: '', description: '' });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [genStatusIndex, setGenStatusIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState(null);
  const [deployOption, setDeployOption] = useState('subdomain');
  const [customDomain, setCustomDomain] = useState('');
  const [errors, setErrors] = useState({});
  const [generationError, setGenerationError] = useState(null);
  const { on: socketOn } = useSocket();

  useEffect(() => {
    if (!isGenerating) return;
    const unsubProgress = socketOn('ai:progress', (data) => {
      if (data.progress != null) setGenerationProgress(data.progress);
      if (data.step) {
        const msg = data.step.toLowerCase();
        const idx = generationStatuses.findIndex(s => msg.includes(s.message.toLowerCase().slice(0, 10)));
        if (idx >= 0) setGenStatusIndex(idx);
      }
    });
    const unsubError = socketOn('ai:error', (data) => {
      if (data.error) {
        setGenerationError(data.error);
        setIsGenerating(false);
      }
    });
    return () => { unsubProgress(); unsubError(); };
  }, [isGenerating, socketOn, generationStatuses]);

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Business name is required';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.description.trim()) errs.description = 'Brief description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const startGeneration = useCallback(async () => {
    setIsGenerating(true);
    setCurrentStep(3);
    setGenerationProgress(5);
    setGenStatusIndex(0);

    try {
      const result = await generateWebsite({
        ...form,
        theme: selectedTheme,
      });

      if (result?._id || result?.id) {
        setGeneratedWebsite(result);
        setGenerationProgress(100);
        setGenStatusIndex(generationStatuses.length - 1);
        setTimeout(() => {
          setIsGenerating(false);
          setCurrentStep(4);
        }, 500);
      } else {
        throw new Error('No website returned from generation');
      }
    } catch (err) {
      setIsGenerating(false);
      const errorMsg = err.response?.data?.message || err.message || 'Generation failed. Please try again.';
      setGenerationError(errorMsg);
    }
  }, [form, selectedTheme, generateWebsite, generationStatuses.length]);

  const handleDeploy = async () => {
    try {
      const websiteId = generatedWebsite?._id || generatedWebsite?.id;
      if (websiteId) {
        navigate(`/websites/${websiteId}/preview`);
      } else {
        navigate('/websites');
      }
    } catch {
      navigate('/websites');
    }
  };

  const handlePreview = () => {
    const websiteId = generatedWebsite?._id || generatedWebsite?.id;
    if (websiteId) {
      navigate(`/websites/${websiteId}/preview`);
    } else {
      navigate('/websites');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((step, i) => {
        const StepIcon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={twMerge(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                isActive && 'badge-primary',
                isCompleted && 'badge-success',
                !isActive && !isCompleted && 'text-[rgb(var(--color-text-muted))]'
              )}
            >
              <StepIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={twMerge(
                  'w-8 h-0.5 mx-1 rounded-full',
                  isCompleted ? 'bg-emerald-400' : 'bg-[rgb(var(--color-border))]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="card"
          >
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Tell us about your business</h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-8">
              We'll use this information to generate the perfect website.
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Business Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={twMerge('input-field', errors.name && 'border-red-500 focus:ring-red-500/20')}
                  placeholder="e.g., The Coffee House"
                />
                {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: cat }))}
                      className={twMerge(
                        'px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                        form.category === cat
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-text-muted))]'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.category && <p className="mt-1.5 text-sm text-red-500">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Location (optional)</label>
                <div className="relative">
                  <HiLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    className="input-field pl-12"
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className={twMerge('input-field resize-none', errors.description && 'border-red-500 focus:ring-red-500/20')}
                  placeholder="Describe your business, what makes it unique, and what you want visitors to know..."
                />
                {errors.description && <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button
              variant="primary"
              size="lg"
              onClick={() => { if (validateStep1()) setCurrentStep(2); }}
            >
              Choose Theme <FiArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Choose your style</h2>
              <p className="text-[rgb(var(--color-text-secondary))]">Pick a template design and color theme.</p>
            </div>

            <div className="card mb-6">
              <h3 className="font-semibold text-[rgb(var(--color-text))] mb-4">Color Theme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={twMerge(
                      'relative p-4 rounded-xl border-2 transition-all text-center',
                      selectedTheme === theme.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                        : 'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-text-muted))]'
                    )}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      {theme.colors.slice(0, 3).map((color, ci) => (
                        <div
                          key={ci}
                          className="w-6 h-6 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-[rgb(var(--color-text))]">{theme.name}</p>
                    {theme.popular && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-semibold bg-primary-500 text-white rounded-full">
                        Popular
                      </span>
                    )}
                    {selectedTheme === theme.id && (
                      <div className="absolute top-2 left-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <HiCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-[rgb(var(--color-text))] mb-4">Template</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template, i) => (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedTemplate(template)}
                    className={twMerge(
                      'relative text-left rounded-2xl overflow-hidden border-2 transition-all',
                      selectedTemplate?.id === template.id
                        ? 'border-primary-500 shadow-lg shadow-primary-500/10'
                        : 'border-transparent hover:border-[rgb(var(--color-border))]'
                    )}
                  >
                    <div className={`aspect-[3/4] bg-gradient-to-br ${template.color} p-4 flex flex-col justify-between`}>
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-2 bg-white/30 rounded-full" />
                        {template.popular && (
                          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] text-white font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="w-full h-2 bg-white/20 rounded-full mb-2" />
                        <div className="w-3/4 h-2 bg-white/20 rounded-full mb-4" />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="aspect-square bg-white/10 rounded-lg" />
                          <div className="aspect-square bg-white/10 rounded-lg" />
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <HiCheck className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-[rgb(var(--color-bg))]">
                      <p className="font-medium text-sm text-[rgb(var(--color-text))]">{template.name}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">{template.category}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                <HiChevronLeft className="mr-2 w-5 h-5" /> Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!selectedTemplate}
                onClick={startGeneration}
              >
                Generate Website <HiSparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-12"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="45"
                  fill="none" stroke="currentColor" strokeWidth="6"
                  className="text-[rgb(var(--color-border))]"
                />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none" stroke="currentColor" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - generationProgress / 100)}`}
                  className="text-primary-500 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-[rgb(var(--color-text))]">
                  {generationProgress}%
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={genStatusIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-3"
              >
                {(() => {
                  const Icon = generationStatuses[genStatusIndex]?.icon || HiSparkles;
                  return <Icon className="w-5 h-5 text-primary-500 animate-pulse" />;
                })()}
                <span className="text-lg text-[rgb(var(--color-text-secondary))]">
                  {generationStatuses[genStatusIndex]?.message}
                </span>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 w-full max-w-md mx-auto bg-[rgb(var(--color-border))] rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full"
                animate={{ width: `${generationProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {generationError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{generationError}</p>
                <button
                  onClick={() => { setGenerationError(null); setCurrentStep(1); }}
                  className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                >
                  Go back and try again
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === 4 && generatedWebsite && (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="card overflow-hidden p-0">
              <div className="p-3 bg-[rgb(var(--color-surface))] flex items-center gap-3 border-b border-[rgb(var(--color-border))]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 max-w-md mx-auto h-7 bg-[rgb(var(--color-bg))] rounded-lg flex items-center justify-center text-xs text-[rgb(var(--color-text-muted))]">
                  {form.name.toLowerCase().replace(/\s+/g, '-')}.localsite.app
                </div>
              </div>
              <div className={`aspect-video bg-gradient-to-br ${selectedTemplate?.color} p-8 flex items-center justify-center`}>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    AI Generated
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-4">{form.name}</h3>
                  <p className="text-xl text-white/80 max-w-lg mx-auto">{form.description.slice(0, 100)}</p>
                  <div className="mt-8 flex justify-center gap-4">
                    <div className="w-32 h-8 bg-white/20 rounded-lg" />
                    <div className="w-32 h-8 bg-white/30 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                <HiChevronLeft className="mr-2 w-5 h-5" /> Change Theme
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePreview}
                >
                  <HiEye className="mr-1.5 w-5 h-5" /> Full Preview
                </Button>
                <Button variant="primary" size="lg" onClick={() => setCurrentStep(5)}>
                  Continue <FiArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div
            key="step5"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="card"
          >
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Launch your website</h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-8">
              Choose how you want to deploy your site.
            </p>

            <div className="space-y-4 mb-8">
              <label
                className={twMerge(
                  'flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all',
                  deployOption === 'subdomain'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-text-muted))]'
                )}
              >
                <input
                  type="radio"
                  name="deploy"
                  value="subdomain"
                  checked={deployOption === 'subdomain'}
                  onChange={() => setDeployOption('subdomain')}
                  className="w-4 h-4 text-primary-600"
                />
                <div>
                  <p className="font-medium text-[rgb(var(--color-text))]">Free Subdomain</p>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    yourbusiness.localsite.app — included free
                  </p>
                </div>
              </label>

              <label
                className={twMerge(
                  'flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all',
                  deployOption === 'custom'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-text-muted))]'
                )}
              >
                <input
                  type="radio"
                  name="deploy"
                  value="custom"
                  checked={deployOption === 'custom'}
                  onChange={() => setDeployOption('custom')}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-[rgb(var(--color-text))]">Custom Domain</p>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Use your own domain (requires paid plan)
                  </p>
                  {deployOption === 'custom' && (
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="mt-3 input-field"
                      placeholder="mybusiness.com"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Tip:</strong> You can always connect a custom domain later from the website settings.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(4)}>
                <HiChevronLeft className="mr-2 w-5 h-5" /> Back to Preview
              </Button>
              <Button variant="primary" size="lg" onClick={handleDeploy}>
                <HiGlobe className="mr-2 w-5 h-5" /> Deploy Website
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}