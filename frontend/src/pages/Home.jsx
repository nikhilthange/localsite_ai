import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  HiSparkles, HiTemplate, HiSearch, HiGlobe, HiChartBar, HiShieldCheck,
  HiChevronDown, HiArrowRight, HiStar, HiCheck, HiLightningBolt,
  HiPhotograph, HiChip, HiCube,
} from 'react-icons/hi';
import { FiArrowRight, FiCheck, FiPlay, FiZap, FiLayers, FiTrendingUp, FiUsers, FiShield, FiSmartphone, FiBarChart2 } from 'react-icons/fi';
import Button from '../components/common/Button';

const features = [
  { icon: HiSparkles, title: 'AI-Powered Generation', description: 'Describe your business and watch as AI creates a complete, professional website tailored to your brand in seconds.' },
  { icon: HiTemplate, title: '500+ Templates', description: 'Choose from hundreds of stunning, professionally designed templates across every industry.' },
  { icon: HiSearch, title: 'SEO Optimized', description: 'Built-in SEO tools ensure your website ranks high on Google and other search engines from day one.' },
  { icon: HiGlobe, title: 'Custom Domain', description: 'Connect your own domain or get a free subdomain. Launch in minutes with one click.' },
  { icon: HiChartBar, title: 'Analytics Dashboard', description: 'Track visitors, leads, and conversions with powerful built-in analytics and insights.' },
  { icon: HiShieldCheck, title: 'Enterprise Security', description: 'SSL certificates, DDoS protection, and 99.9% uptime guarantee included with every plan.' },
];

const steps = [
  { step: '01', title: 'Describe Your Business', description: 'Tell us about your business — name, category, style preferences, and what makes you unique.' },
  { step: '02', title: 'AI Generates Website', description: 'Our advanced AI analyzes your input and creates a complete, stunning website in under 30 seconds.' },
  { step: '03', title: 'Customize & Refine', description: 'Tweak colors, fonts, content, and layout with our intuitive drag-and-drop editor. No coding needed.' },
  { step: '04', title: 'Launch & Grow', description: 'Publish to the web with a custom domain, track performance, and start growing your business.' },
];

const templates = [
  { name: 'Restaurant Pro', category: 'Restaurant', color: 'from-rose-500 to-pink-600' },
  { name: 'Portfolio Plus', category: 'Portfolio', color: 'from-violet-500 to-purple-600' },
  { name: 'Storefront', category: 'E-Commerce', color: 'from-emerald-500 to-teal-600' },
  { name: 'SaaS Landing', category: 'Tech', color: 'from-blue-500 to-indigo-600' },
  { name: 'Local Business', category: 'Services', color: 'from-amber-500 to-orange-600' },
  { name: 'Creative Agency', category: 'Agency', color: 'from-cyan-500 to-sky-600' },
];

const faqs = [
  { q: 'How does the AI website generation work?', a: 'Simply enter your business details, and our AI creates a complete website with relevant content, images, and design in under 30 seconds.' },
  { q: 'Can I customize the generated website?', a: 'Absolutely! You have full control over every aspect. Change colors, fonts, layouts, content, and images with our intuitive editor.' },
  { q: 'Do I need technical skills?', a: 'Not at all. Our platform is designed for everyone. The AI handles the heavy lifting, and the editor is intuitive and user-friendly.' },
  { q: 'Can I use my own domain?', a: 'Yes! You can connect any custom domain you own, or purchase one through us. All paid plans include custom domain support.' },
  { q: 'What kind of support do you offer?', a: 'Free users get community support. Starter plans include email support, and Professional plans include priority support.' },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'Restaurant Owner', content: 'LocalSite AI created a beautiful website for my restaurant in minutes. The AI understood exactly what I needed.', rating: 5 },
  { name: 'Mike Chen', role: 'Freelance Designer', content: 'The portfolio templates are stunning. I had my site live with a custom domain in under an hour.', rating: 5 },
  { name: 'Emily Davis', role: 'Real Estate Agent', content: 'The lead capture features are incredible. I\'m getting more inquiries than ever before.', rating: 5 },
];

const stats = [
  { value: '50K+', label: 'Websites Generated' },
  { value: '15K+', label: 'Active Users' },
  { value: '500+', label: 'Templates' },
  { value: '99.9%', label: 'Uptime' },
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
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.98]);

  return (
    <div className="min-h-screen">
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-surface-50 to-white dark:from-surface-950 dark:to-surface-900">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10 dark:from-primary-900/20 dark:via-transparent dark:to-secondary-900/20" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-secondary-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-sm font-medium text-primary-700 dark:text-primary-300 mb-8 border border-primary-200/50 dark:border-primary-800/50"
              >
                <HiSparkles className="w-4 h-4" />
                AI-Powered Website Builder
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-[rgb(var(--color-text))] leading-[0.95] mb-6 text-balance">
                Turn Your Business
                <br />
                <span className="gradient-text">Into a Website</span>
                <br />
                With AI
              </h1>

              <p className="text-lg sm:text-xl text-[rgb(var(--color-text-secondary))] mb-10 max-w-xl leading-relaxed">
                Describe your business once. Our AI creates a stunning, professional website instantly. No coding, no designers, no hassle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="primary"
                    size="xl"
                    className="group shadow-lg shadow-primary-500/25"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started Free
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="xl"
                    className="group"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <FiPlay className="w-5 h-5" />
                    See How It Works
                  </Button>
                </motion.div>
              </div>

              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-[rgb(var(--color-border))]">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white dark:border-surface-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary-500/20">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <HiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[rgb(var(--color-text-muted))]">Trusted by 15,000+ businesses</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20 border border-[rgb(var(--color-border))]">
                <div className="absolute inset-0 bg-gradient-to-br from-surface-900 to-surface-950">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-surface-800 flex items-center px-4 gap-2 border-b border-surface-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="ml-4 flex-1 max-w-md h-6 bg-surface-700 rounded-lg flex items-center px-3">
                      <span className="text-xs text-surface-400">mybusiness.com</span>
                    </div>
                  </div>
                  <div className="pt-16 px-8 pb-8">
                    <div className="w-24 h-2.5 bg-primary-500 rounded-full mb-6" />
                    <div className="w-3/4 h-3.5 bg-surface-700 rounded-lg mb-3" />
                    <div className="w-1/2 h-3.5 bg-surface-700 rounded-lg mb-6" />
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="aspect-square bg-surface-700 rounded-2xl" />
                      ))}
                    </div>
                    <div className="w-full h-2 bg-surface-700 rounded-full mb-2" />
                    <div className="w-5/6 h-2 bg-surface-700 rounded-full mb-2" />
                    <div className="w-2/3 h-2 bg-surface-700 rounded-full" />
                  </div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-xl"
                  >
                    <span className="text-xs text-primary-300">✨ AI Generating...</span>
                  </motion.div>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/25"
              >
                <HiSparkles className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <HiChevronDown className="w-6 h-6 text-[rgb(var(--color-text-muted))]" />
        </motion.div>
      </section>

      <section className="py-16 bg-[rgb(var(--color-surface))] border-y border-[rgb(var(--color-border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="text-center">
                <div className="text-4xl font-black gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-[rgb(var(--color-text-muted))] font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-sm font-medium text-primary-700 dark:text-primary-300 mb-6 border border-primary-200/50 dark:border-primary-800/50">
              <HiLightningBolt className="w-4 h-4" />
              Powerful Features
            </motion.div>
            <motion.h2 variants={itemVariants} className="section-heading mb-4">
              Everything You Need
            </motion.h2>
            <motion.p variants={itemVariants} className="section-subheading mx-auto">
              Powerful features to help you create, manage, and grow your online presence.
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
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  custom={i}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative card-hover overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-transparent to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/5 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-500/20">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">{feature.title}</h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-[rgb(var(--color-surface))] relative overflow-hidden">
        <div className="absolute inset-0 bg-dot opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 dark:bg-secondary-900/30 rounded-full text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-6 border border-secondary-200/50 dark:border-secondary-800/50">
              <FiLayers className="w-4 h-4" />
              Simple Process
            </motion.div>
            <motion.h2 variants={itemVariants} className="section-heading mb-4">
              How It Works
            </motion.h2>
            <motion.p variants={itemVariants} className="section-subheading mx-auto">
              Four simple steps to your professional website.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center md:text-left"
              >
                <div className="text-7xl font-black bg-gradient-to-b from-primary-100 to-primary-50 dark:from-primary-900 dark:to-primary-800 bg-clip-text text-transparent mb-4 leading-none">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--color-text))] mb-3">{step.title}</h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-400 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/30 rounded-full text-sm font-medium text-accent-700 dark:text-accent-300 mb-6 border border-accent-200/50 dark:border-accent-800/50">
              <HiTemplate className="w-4 h-4" />
              Stunning Templates
            </motion.div>
            <motion.h2 variants={itemVariants} className="section-heading mb-4">
              500+ Templates
            </motion.h2>
            <motion.p variants={itemVariants} className="section-subheading mx-auto">
              Choose from hundreds of professionally designed templates across every industry.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {templates.map((template, i) => (
              <motion.div
                key={template.name}
                variants={itemVariants}
                custom={i}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group cursor-pointer"
              >
                <div className={`aspect-[4/3] bg-gradient-to-br ${template.color} rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="relative z-10">
                    <div className="w-12 h-2 bg-white/30 rounded-full mb-2" />
                    <div className="w-24 h-1.5 bg-white/20 rounded-full" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-full h-2 bg-white/20 rounded-full mb-2" />
                    <div className="w-3/4 h-2 bg-white/20 rounded-full mb-4" />
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="aspect-square bg-white/10 rounded-xl" />
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md rounded-lg px-3 py-1">
                    <span className="text-xs text-white font-medium">{template.category}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mt-4">{template.name}</h3>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg" className="rounded-2xl" onClick={() => navigate('/signup')}>
              <HiTemplate className="w-5 h-5" />
              View All Templates
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-[rgb(var(--color-surface))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-sm font-medium text-primary-700 dark:text-primary-300 mb-6 border border-primary-200/50 dark:border-primary-800/50">
              <FiUsers className="w-4 h-4" />
              Testimonials
            </motion.div>
            <motion.h2 variants={itemVariants} className="section-heading mb-4">
              Loved by Thousands
            </motion.h2>
            <motion.p variants={itemVariants} className="section-subheading mx-auto">
              See what our users are saying about LocalSite AI.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={itemVariants} custom={i} className="card">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <HiStar key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[rgb(var(--color-border))]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--color-text))]">{t.name}</p>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-sm font-medium text-primary-700 dark:text-primary-300 mb-6 border border-primary-200/50 dark:border-primary-800/50">
              <HiSparkles className="w-4 h-4" />
              FAQ
            </motion.div>
            <motion.h2 variants={itemVariants} className="section-heading mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={itemVariants} className="section-subheading mx-auto">
              Got questions? We've got answers.
            </motion.p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[rgb(var(--color-surface))] rounded-2xl overflow-hidden border border-[rgb(var(--color-border))]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-base font-semibold text-[rgb(var(--color-text))] pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiChevronDown className="w-5 h-5 text-[rgb(var(--color-text-muted))] shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance">
              Ready to Transform Your Online Presence?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 15,000+ businesses already using LocalSite AI. Create your website in minutes, not weeks. Start free, no credit card required.
            </motion.p>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="secondary"
                size="xl"
                className="bg-white text-primary-700 hover:bg-primary-50 shadow-xl shadow-black/20"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
                <FiArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
