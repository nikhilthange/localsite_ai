import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiSparkles, HiTemplate, HiSearch, HiGlobe, HiChartBar, HiShieldCheck,
  HiChevronDown, HiStar, HiLightningBolt,
} from 'react-icons/hi';
import { FiArrowRight, FiPlay, FiLayers, FiUsers, FiCheck } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const features = [
  { icon: HiSparkles, title: 'AI-Powered Generation', description: 'Describe your business and watch as AI creates a complete, professional website tailored to your brand in seconds.' },
  { icon: HiTemplate, title: 'Bespoke Templates', description: 'Choose from hundreds of stunning, professionally designed industry-specific templates.' },
  { icon: HiSearch, title: 'SEO Optimized', description: 'Built-in SEO tools ensure your website ranks high on Google and other search engines from day one.' },
  { icon: HiGlobe, title: 'Custom Domain', description: 'Connect your own domain or get a free subdomain. Launch in minutes with one click.' },
  { icon: HiChartBar, title: 'Analytics Dashboard', description: 'Track visitors, leads, and conversions with powerful built-in analytics and insights.' },
  { icon: HiShieldCheck, title: 'Enterprise Security', description: 'SSL certificates, DDoS protection, and 99.9% uptime guarantee included with every plan.' },
];

const steps = [
  { step: '01', title: 'Contextualize', description: 'Input your business details. Our models learn your brand voice.' },
  { step: '02', title: 'Generate', description: 'AI constructs the perfect layout and copy in under 30 seconds.' },
  { step: '03', title: 'Refine', description: 'Tweak styling seamlessly with our visual block editor.' },
  { step: '04', title: 'Deploy', description: 'Publish instantly to our global edge network.' },
];

const faqs = [
  { q: 'How does the AI generation work?', a: 'We use advanced LLMs (Llama 3) to understand your business context and generate optimized layout structures, compelling copy, and brand-aligned styling automatically.' },
  { q: 'Can I export the code?', a: 'Yes. You own your website. Enterprise users can export the full React/Next.js source code.' },
  { q: 'Do you provide hosting?', a: 'All generated sites are hosted on our global edge network for blazing fast performance.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 50]);

  return (
    <div className="min-h-screen bg-surface-950">
      
      {/* Premium Hero Section - Linear/Vercel Aesthetic */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-dark opacity-40 mask-fade-bottom" />
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px] animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="badge-primary mb-8 border-primary-500/30 shadow-glow"
            >
              <HiSparkles className="w-3.5 h-3.5 mr-1.5" />
              LocalSite AI 2.0 is now live
            </motion.div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold tracking-tight text-white leading-[1.05] mb-8 text-balance">
              Design the future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400">
                with AI-driven precision.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-surface-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Describe your vision and deploy a stunning, production-ready website in seconds. Built for speed, optimized for growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                size="xl"
                className="group w-full sm:w-auto"
                onClick={() => navigate('/signup')}
              >
                Start building free
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto bg-surface-900/50 backdrop-blur border-surface-800 text-white hover:bg-surface-800"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <FiPlay className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent blur-2xl -z-10" />
            <div className="rounded-t-2xl border border-surface-800 border-b-0 bg-surface-900/80 backdrop-blur-xl shadow-glass overflow-hidden">
              <div className="h-12 border-b border-surface-800 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-surface-700" />
                  <div className="w-3 h-3 rounded-full bg-surface-700" />
                  <div className="w-3 h-3 rounded-full bg-surface-700" />
                </div>
                <div className="mx-auto h-6 w-64 bg-surface-800/50 rounded flex items-center justify-center border border-surface-700/50">
                  <span className="text-[10px] text-surface-500 font-mono">editor.localsite.ai</span>
                </div>
              </div>
              <div className="h-[400px] bg-surface-950 p-6 flex gap-6 relative">
                 {/* Fake Editor UI */}
                 <div className="w-64 border-r border-surface-800 pr-6 flex flex-col gap-4 hidden sm:flex">
                    <div className="h-8 bg-surface-900 rounded border border-surface-800" />
                    <div className="h-24 bg-surface-900 rounded border border-surface-800" />
                    <div className="h-32 bg-primary-900/20 border border-primary-500/30 rounded flex items-center justify-center flex-col">
                       <HiSparkles className="text-primary-400 mb-2" />
                       <span className="text-xs text-primary-300">Generating sections...</span>
                    </div>
                 </div>
                 <div className="flex-1 bg-surface-900 rounded-xl border border-surface-800 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-500" />
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative bg-surface-950 border-t border-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-20"
          >
            <motion.h2 variants={itemVariants} className="section-heading mb-6">
              A complete toolkit.
            </motion.h2>
            <motion.p variants={itemVariants} className="section-subheading mx-auto">
              Everything you need to launch and scale your online business.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card variant="flat" hover className="h-full bg-surface-900/50 border-surface-800">
                    <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mb-6 border border-surface-700 shadow-sm">
                      <Icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-surface-900 border-t border-surface-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              Build your site today.
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-surface-400 mb-10 max-w-2xl mx-auto">
              Join leading businesses utilizing AI to stay ahead of the curve.
            </motion.p>
            <motion.div variants={itemVariants} className="flex justify-center">
              <Button
                variant="primary"
                size="xl"
                onClick={() => navigate('/signup')}
              >
                Get Started
                <FiArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
