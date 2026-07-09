import { useState, useEffect, useCallback, useRef } from 'react';
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

const categories = [
  'Restaurant & Cafe', 'Portfolio', 'E-Commerce', 'SaaS / Tech',
  'Local Business', 'Agency', 'Blog', 'Real Estate', 'Fitness',
  'Education', 'Healthcare', 'Creative',
];

const templates = [
  { id: 1, name: 'Restaurant Pro', category: 'Restaurant', color: 'from-rose-500 to-pink-600', popular: true },
  { id: 2, name: 'Portfolio Plus', category: 'Portfolio', color: 'from-violet-500 to-purple-600' },
  { id: 3, name: 'Storefront', category: 'E-Commerce', color: 'from-emerald-500 to-teal-600' },
  { id: 4, name: 'SaaS Landing', category: 'Tech', color: 'from-blue-500 to-indigo-600' },
  { id: 5, name: 'Local Business', category: 'Services', color: 'from-amber-500 to-orange-600' },
  { id: 6, name: 'Creative Agency', category: 'Agency', color: 'from-cyan-500 to-sky-600' },
  { id: 7, name: 'Blog Master', category: 'Blog', color: 'from-fuchsia-500 to-pink-600' },
  { id: 8, name: 'Health & Wellness', category: 'Healthcare', color: 'from-lime-500 to-emerald-600' },
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
  { id: 2, label: 'Choose Template', icon: HiCollection },
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
  const { createWebsite } = useWebsites();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({ name: '', category: '', location: '', description: '' });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [genStatusIndex, setGenStatusIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef(null);
  const [generatedWebsite, setGeneratedWebsite] = useState(null);
  const [deployOption, setDeployOption] = useState('subdomain');
  const [customDomain, setCustomDomain] = useState('');
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Business name is required';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.description.trim()) errs.description = 'Brief description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const startGeneration = useCallback(() => {
    setIsGenerating(true);
    setCurrentStep(3);
    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 2;
      setGenerationProgress(Math.min(progress, 100));
      setGenStatusIndex(Math.min(Math.floor(progress / 17), generationStatuses.length - 1));
      if (progress >= 100) {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          setIsGenerating(false);
          setGeneratedWebsite({ id: Date.now(), name: form.name, category: form.category, template: selectedTemplate });
          setCurrentStep(4);
        }, 500);
      }
    }, 200);
  }, [form, selectedTemplate]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleDeploy = async () => {
    await createWebsite({
      ...form,
      template: selectedTemplate,
      domain: deployOption === 'custom'
        ? customDomain
        : `${form.name.toLowerCase().replace(/\s+/g, '-')}.localsite.app`,
      status: 'published',
    });
    navigate('/websites');
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
                Choose Template <FiArrowRight className="ml-2 w-5 h-5" />
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
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Choose a template</h2>
              <p className="text-[rgb(var(--color-text-secondary))]">Pick a starting point that matches your style.</p>
            </div>

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
                <HiChevronLeft className="mr-2 w-5 h-5" /> Change Template
              </Button>
              <Button variant="primary" size="lg" onClick={() => setCurrentStep(5)}>
                Continue <FiArrowRight className="ml-2 w-5 h-5" />
              </Button>
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
