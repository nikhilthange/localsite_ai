import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import {
  HiOfficeBuilding, HiCollection, HiSparkles, HiEye, HiGlobe,
  HiCheck, HiChevronLeft, HiChevronRight, HiLocationMarker,
  HiColorSwatch, HiDesktopComputer, HiPhone,
  HiMail, HiUserGroup, HiMap,
} from 'react-icons/hi';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useWebsites } from '@/hooks/useWebsite';
import { useSocket } from '@/hooks/useWebsocket';

const categories = [
  'Restaurant', 'Gym/Fitness', 'Law Firm', 'Real Estate',
  'E-Commerce', 'SaaS/Tech', 'Plumber/HVAC', 'Medical/Dental',
  'Salon/Spa', 'Photography', 'Consulting', 'Construction',
  'Auto Repair', 'Cleaning Service', 'Education/Tutor',
  'Event Planning', 'Marketing Agency', 'Non-Profit', 'Financial/Accounting'
];

const templates = [
  { id: 1, name: 'Minimalist Premium', category: 'Universal', color: 'from-surface-700 to-surface-900', popular: true },
  { id: 2, name: 'Bold & Creative', category: 'Universal', color: 'from-primary-500 to-indigo-600' },
  { id: 3, name: 'Corporate Elegance', category: 'Universal', color: 'from-slate-700 to-slate-900' },
  { id: 4, name: 'Modern Glass', category: 'Universal', color: 'from-emerald-500 to-teal-600' },
];

const themeOptions = [
  { id: 'modern', name: 'Modern', colors: ['#6366f1', '#14b8a6'], popular: true },
  { id: 'luxury', name: 'Luxury', colors: ['#b8860b', '#d4af37'] },
  { id: 'minimal', name: 'Minimal', colors: ['#18181b', '#a1a1aa'] },
  { id: 'dark', name: 'Dark Mode', colors: ['#8b5cf6', '#06b6d4'] },
  { id: 'corporate', name: 'Corporate', colors: ['#2563eb', '#059669'] },
  { id: 'creative', name: 'Creative', colors: ['#ec4899', '#8b5cf6'] },
];

const generationStatuses = [
  { message: 'Analyzing industry requirements...', icon: HiOfficeBuilding },
  { message: 'Architecting bespoke structure...', icon: HiCollection },
  { message: 'Generating premium copy...', icon: HiSparkles },
  { message: 'Applying design tokens...', icon: HiColorSwatch },
  { message: 'Optimizing components...', icon: HiDesktopComputer },
  { message: 'Finalizing deployment...', icon: HiCheck },
];

const steps = [
  { id: 1, label: 'Business Profile', icon: HiOfficeBuilding },
  { id: 2, label: 'Aesthetics', icon: HiColorSwatch },
  { id: 3, label: 'AI Generation', icon: HiSparkles },
  { id: 4, label: 'Preview', icon: HiEye },
  { id: 5, label: 'Launch', icon: HiGlobe },
];

export default function GenerateWebsite() {
  const navigate = useNavigate();
  const { generateWebsite } = useWebsites();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({ name: '', category: '', location: '', phone: '', email: '', address: '', targetAudience: '', description: '' });
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
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
  }, [isGenerating, socketOn]);

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Business name is required';
    if (!form.category) errs.category = 'Industry is required';
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
        businessName: form.name,
        category: form.category,
        location: form.location,
        description: form.description,
        phone: form.phone,
        email: form.email,
        address: form.address,
        targetAudience: form.targetAudience || undefined,
        theme: selectedTheme,
      });

      if (result?._id || result?.id) {
        setGeneratedWebsite(result);
        setGenerationProgress(100);
        setGenStatusIndex(generationStatuses.length - 1);
        setTimeout(() => {
          setIsGenerating(false);
          setCurrentStep(4);
        }, 800);
      } else {
        throw new Error('No website returned from generation');
      }
    } catch (err) {
      setIsGenerating(false);
      const errorMsg = err.response?.data?.message || err.message || 'Generation failed. Please try again.';
      setGenerationError(errorMsg);
    }
  }, [form, selectedTheme, generateWebsite]);

  const handleDeploy = async () => {
    const websiteId = generatedWebsite?._id || generatedWebsite?.id;
    navigate(`/websites/${websiteId}`);
  };

  const handlePreview = () => {
    const websiteId = generatedWebsite?._id || generatedWebsite?.id;
    navigate(`/websites/${websiteId}/preview`);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-12 overflow-x-auto px-2 py-4">
      {steps.map((step, i) => {
        const StepIcon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center shrink-0">
             <div
               className={cn(
                 'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                 isActive ? 'bg-primary-500 text-white shadow-glow' :
                 isCompleted ? 'bg-surface-900 text-white dark:bg-white dark:text-surface-900 shadow-sm' :
                 'text-surface-400 bg-surface-100 dark:bg-surface-900'
               )}
             >
               {isCompleted ? <FiCheck className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
               <span className="hidden sm:inline font-display">{step.label}</span>
             </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-6 sm:w-12 h-1 mx-2 rounded-full shrink-0 transition-all duration-500',
                  isCompleted ? 'bg-surface-900 dark:bg-white' : 'bg-surface-200 dark:bg-surface-800'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8 animate-in max-w-5xl mx-auto">
      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl font-display font-bold text-surface-950 dark:text-white mb-3">Define your business</h2>
              <p className="text-lg text-surface-500 max-w-xl mx-auto">
                Provide details to help our AI craft a bespoke website tailored to your exact industry.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-8">
                <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-primary-500">
                     <HiOfficeBuilding className="w-5 h-5" />
                   </div>
                   Core Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Business Name <span className="text-red-500">*</span></label>
                    <Input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      error={errors.name}
                      placeholder="e.g. Acme Corp"
                      className="text-lg py-3"
                    />
                    {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Industry <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, category: cat }))}
                          className={cn(
                            'px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-center',
                            form.category === cat
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                              : 'border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:border-primary-200 hover:bg-surface-50 dark:hover:bg-surface-900'
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {errors.category && <p className="mt-2 text-sm text-red-500">{errors.category}</p>}
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                 <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-primary-500">
                     <HiLocationMarker className="w-5 h-5" />
                   </div>
                   Contact Information
                </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Location (City, State)</label>
                      <Input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                        leftIcon={<HiLocationMarker className="w-5 h-5" />}
                        placeholder="New York, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Street Address</label>
                      <Input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                        leftIcon={<HiMap className="w-5 h-5" />}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Phone</label>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        leftIcon={<HiPhone className="w-5 h-5" />}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Email</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        leftIcon={<HiMail className="w-5 h-5" />}
                        placeholder="hello@example.com"
                      />
                    </div>
                 </div>
              </Card>

              <Card className="p-8">
                 <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-primary-500">
                     <HiUserGroup className="w-5 h-5" />
                   </div>
                   Audience & Tone
                </h3>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Target Audience</label>
                      <Input
                        type="text"
                        value={form.targetAudience}
                        onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                        leftIcon={<HiUserGroup className="w-5 h-5" />}
                        placeholder="e.g. Local homeowners, tech startups, families"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Business Description <span className="text-red-500">*</span></label>
                      <textarea
                        rows={5}
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        className={cn(
                          'w-full p-4 rounded-xl border bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 outline-none transition-all resize-none',
                          errors.description ? 'border-red-500' : 'border-surface-200 dark:border-surface-800 focus:border-primary-500'
                        )}
                        placeholder="Describe your business, services offered, and what makes you unique..."
                      />
                      {errors.description && <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>}
                    </div>
                 </div>
              </Card>
            </div>

            <div className="flex justify-end mt-8">
              <Button
                variant="primary"
                size="lg"
                className="px-8 shadow-glow"
                onClick={() => { if (validateStep1()) setCurrentStep(2); }}
              >
                Continue to Aesthetics <FiArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl font-display font-bold text-surface-950 dark:text-white mb-3">Choose Aesthetics</h2>
              <p className="text-lg text-surface-500 max-w-xl mx-auto">
                Select a visual foundation. The AI will perfectly adapt it to your industry.
              </p>
            </div>

            <Card className="p-8 mb-8">
              <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-6">Color Palette</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      'relative p-4 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col items-center',
                      selectedTheme === theme.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 shadow-lg shadow-primary-500/10 scale-[1.02]'
                        : 'border-surface-200 dark:border-surface-800 hover:border-primary-300 hover:bg-surface-50 dark:hover:bg-surface-900/50'
                    )}
                  >
                    <div className="flex -space-x-2 mb-4">
                      {theme.colors.map((color, ci) => (
                        <div
                          key={ci}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900 shadow-sm z-10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{theme.name}</p>
                    {selectedTheme === theme.id && (
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                        <HiCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-6">Layout Structure</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      'relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 group',
                      selectedTemplate.id === template.id
                        ? 'border-primary-500 shadow-xl shadow-primary-500/10 scale-[1.01]'
                        : 'border-surface-200 dark:border-surface-800 hover:border-primary-300'
                    )}
                  >
                    <div className={`h-40 bg-gradient-to-br ${template.color} p-6 flex flex-col relative overflow-hidden`}>
                       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="w-12 h-3 bg-white/30 rounded-full mb-6" />
                       <div className="w-3/4 h-6 bg-white/20 rounded-lg mb-3" />
                       <div className="w-1/2 h-3 bg-white/20 rounded-full" />
                       {selectedTemplate.id === template.id && (
                        <div className="absolute top-4 right-4 w-7 h-7 bg-white text-primary-600 rounded-full flex items-center justify-center shadow-lg">
                          <HiCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white dark:bg-surface-950">
                      <p className="font-semibold text-surface-900 dark:text-white">{template.name}</p>
                      <p className="text-sm text-surface-500">Industry adaptive structure</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex justify-between mt-10">
              <Button variant="outline" size="lg" onClick={() => setCurrentStep(1)}>
                <HiChevronLeft className="mr-2 w-5 h-5" /> Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="px-8 shadow-glow"
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
            className="card text-center py-20 border-dashed max-w-2xl mx-auto"
          >
            <div className="relative w-32 h-32 mx-auto mb-10">
              <svg className="w-32 h-32 -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="45"
                  fill="none" stroke="currentColor" strokeWidth="4"
                  className="text-surface-100 dark:text-surface-800"
                />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none" stroke="currentColor" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - generationProgress / 100)}`}
                  className="text-primary-500 transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-display font-bold text-surface-900 dark:text-white">
                  {Math.round(generationProgress)}%
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={genStatusIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center gap-3"
              >
                {(() => {
                  const Icon = generationStatuses[genStatusIndex]?.icon || HiSparkles;
                  return (
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6 text-primary-500 animate-pulse" />
                    </div>
                  );
                })()}
                <span className="text-xl font-medium text-surface-900 dark:text-white">
                  {generationStatuses[genStatusIndex]?.message}
                </span>
                <p className="text-sm text-surface-500 max-w-xs">Our AI is analyzing {form.category} trends to create the perfect structure.</p>
              </motion.div>
            </AnimatePresence>

            {generationError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{generationError}</p>
                <button
                  onClick={() => { setGenerationError(null); setCurrentStep(1); }}
                  className="mt-3 text-sm font-semibold text-red-700 dark:text-red-300 hover:underline"
                >
                  Return to setup and try again
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === 4 && generatedWebsite && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
             <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-4">
                 <FiCheck className="w-4 h-4" /> Generation Complete
              </div>
              <h2 className="text-4xl font-display font-bold text-surface-950 dark:text-white mb-3">Your website is ready</h2>
              <p className="text-lg text-surface-500 max-w-xl mx-auto">
                Review your AI-generated {form.category} website.
              </p>
            </div>

            <Card className="p-0 overflow-hidden shadow-xl border-surface-200 dark:border-surface-800 max-w-4xl mx-auto">
              <div className="bg-surface-100 dark:bg-surface-900 p-3 flex items-center justify-between border-b border-surface-200 dark:border-surface-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs font-mono text-surface-500 bg-white dark:bg-surface-950 px-4 py-1.5 rounded-full shadow-sm">
                  {form.name.toLowerCase().replace(/\s+/g, '-')}.localsite.app
                </div>
                <div className="w-16" /> {/* Spacer */}
              </div>
              <div className={`aspect-video bg-gradient-to-br ${selectedTemplate.color} flex items-center justify-center p-8 relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                   <Button variant="primary" size="lg" className="shadow-2xl scale-110" onClick={handlePreview}>
                      <HiEye className="mr-2 w-5 h-5" /> View Interactive Preview
                   </Button>
                </div>
                <div className="text-center text-white relative z-10">
                  <h3 className="text-5xl font-display font-bold mb-4 drop-shadow-md">{form.name}</h3>
                  <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-sm leading-relaxed">{form.description.slice(0, 150)}{form.description.length > 150 ? '...' : ''}</p>
                </div>
              </div>
            </Card>

            <div className="flex justify-between items-center max-w-4xl mx-auto mt-8">
              <Button variant="outline" size="lg" onClick={() => setCurrentStep(2)}>
                <HiChevronLeft className="mr-2 w-5 h-5" /> Adjust Aesthetics
              </Button>
              <div className="flex gap-4">
                <Button variant="ghost" size="lg" onClick={() => navigate(`/websites/${generatedWebsite._id || generatedWebsite.id}/edit`)}>
                  Open Editor
                </Button>
                <Button variant="primary" size="lg" className="shadow-glow" onClick={() => setCurrentStep(5)}>
                  Proceed to Launch <FiArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-display font-bold text-surface-950 dark:text-white mb-3">Launch Configuration</h2>
              <p className="text-lg text-surface-500">
                Choose how you want to deploy your {form.name} website to the world.
              </p>
            </div>

            <Card className="p-8">
               <div className="space-y-4">
                <label
                  className={cn(
                    'flex items-center gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-all',
                    deployOption === 'subdomain'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-surface-200 dark:border-surface-800 hover:border-primary-200'
                  )}
                >
                  <input
                    type="radio"
                    name="deploy"
                    value="subdomain"
                    checked={deployOption === 'subdomain'}
                    onChange={() => setDeployOption('subdomain')}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">Free Subdomain</p>
                    <p className="text-sm text-surface-500 mt-1">
                      {form.name.toLowerCase().replace(/\s+/g, '-')}.localsite.app
                    </p>
                  </div>
                  <span className="ml-auto bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 text-xs font-bold px-3 py-1 rounded-full">INCLUDED</span>
                </label>

                <label
                  className={cn(
                    'flex items-center gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-all',
                    deployOption === 'custom'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                      : 'border-surface-200 dark:border-surface-800 hover:border-primary-200'
                  )}
                >
                  <input
                    type="radio"
                    name="deploy"
                    value="custom"
                    checked={deployOption === 'custom'}
                    onChange={() => setDeployOption('custom')}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">Custom Domain</p>
                    <p className="text-sm text-surface-500 mt-1">
                      Connect your own domain (e.g. {form.name.toLowerCase().replace(/\s+/g, '')}.com)
                    </p>
                    {deployOption === 'custom' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                        <Input
                          type="text"
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                          placeholder="www.yourdomain.com"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white dark:bg-surface-950"
                        />
                      </motion.div>
                    )}
                  </div>
                </label>
              </div>
            </Card>

            <div className="flex justify-between items-center mt-10">
              <Button variant="ghost" size="lg" onClick={() => setCurrentStep(4)}>
                <HiChevronLeft className="mr-2 w-5 h-5" /> Back
              </Button>
              <Button variant="primary" size="lg" className="px-10 shadow-glow text-lg" onClick={handleDeploy}>
                <HiGlobe className="mr-2 w-5 h-5" /> Deploy Website
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}