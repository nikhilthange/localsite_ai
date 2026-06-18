import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  HiSparkles, HiTemplate, HiSearch, HiGlobe, HiChartBar, HiShieldCheck,
  HiChevronDown, HiArrowRight, HiViewGrid, HiStar, HiCode, HiPhotograph,
  HiMail, HiPhone, HiLocationMarker, HiClock, HiCheck, HiX
} from 'react-icons/hi';
import { FiArrowRight, FiCheck, FiPlay, FiLayers, FiZap, FiSmartphone, FiTrendingUp, FiUsers } from 'react-icons/fi';
import Button from '../components/common/Button';

const features = [
  {
    icon: HiSparkles,
    title: 'AI-Powered Generation',
    description: 'Describe your business and watch as AI creates a complete, professional website tailored to your brand.'
  },
  {
    icon: HiTemplate,
    title: 'Beautiful Templates',
    description: 'Choose from hundreds of stunning, professionally designed templates across every industry.'
  },
  {
    icon: HiSearch,
    title: 'SEO Optimized',
    description: 'Built-in SEO tools ensure your website ranks high on Google and other search engines.'
  },
  {
    icon: HiGlobe,
    title: 'Custom Domain',
    description: 'Connect your own domain or get a free subdomain. Launch in minutes with one click.'
  },
  {
    icon: HiChartBar,
    title: 'Analytics Dashboard',
    description: 'Track visitors, leads, and conversions with powerful built-in analytics.'
  },
  {
    icon: HiShieldCheck,
    title: 'Enterprise Security',
    description: 'SSL certificates, DDoS protection, and 99.9% uptime guarantee included with every plan.'
  }
];

const steps = [
  { step: '01', title: 'Enter Business Info', description: 'Tell us about your business — name, category, and what makes you unique.' },
  { step: '02', title: 'AI Generates', description: 'Our AI analyzes your input and generates a complete website in seconds.' },
  { step: '03', title: 'Customize', description: 'Tweak colors, fonts, content, and layout with our intuitive editor.' },
  { step: '04', title: 'Launch', description: 'Publish to the web with a custom domain and start growing your business.' }
];

const templates = [
  { name: 'Restaurant Pro', category: 'Restaurant', color: 'from-rose-500 to-pink-600' },
  { name: 'Portfolio Plus', category: 'Portfolio', color: 'from-violet-500 to-purple-600' },
  { name: 'Storefront', category: 'E-Commerce', color: 'from-emerald-500 to-teal-600' },
  { name: 'SaaS Landing', category: 'Tech', color: 'from-blue-500 to-indigo-600' },
  { name: 'Local Business', category: 'Services', color: 'from-amber-500 to-orange-600' },
  { name: 'Creative Agency', category: 'Agency', color: 'from-cyan-500 to-sky-600' }
];

const pricingPlans = [
  { name: 'Free', price: '$0', features: ['1 Website', 'Free subdomain', 'Basic templates', 'Community support'] },
  { name: 'Starter', price: '$19', features: ['3 Websites', 'Custom domain', 'All templates', 'Email support', 'Basic analytics'] },
  { name: 'Professional', price: '$49', features: ['10 Websites', 'Custom domains', 'All templates', 'Priority support', 'Advanced analytics', 'AI content writing'] }
];

const faqs = [
  { q: 'How does the AI website generation work?', a: 'Simply enter your business details, and our AI creates a complete website with relevant content, images, and design in under 30 seconds.' },
  { q: 'Can I customize the generated website?', a: 'Absolutely! You have full control over every aspect. Change colors, fonts, layouts, content, and images with our drag-and-drop editor.' },
  { q: 'Do I need technical skills?', a: 'Not at all. Our platform is designed for everyone. The AI handles the heavy lifting, and the editor is intuitive and user-friendly.' },
  { q: 'Can I use my own domain?', a: 'Yes! You can connect any custom domain you own, or purchase one through us. All paid plans include custom domain support.' },
  { q: 'What kind of support do you offer?', a: 'Free users get community support. Starter plans include email support, and Professional plans include priority support with dedicated account managers.' }
];

const stats = [
  { value: '50,000+', label: 'Websites Generated' },
  { value: '15,000+', label: 'Active Users' },
  { value: '500+', label: 'Templates' },
  { value: '99.9%', label: 'Uptime' }
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' } })
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent dark:from-violet-900/30 dark:via-indigo-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-400/20 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
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
                className="inline-flex items-center px-4 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full text-sm font-medium text-violet-700 dark:text-violet-300 mb-8"
              >
                <HiSparkles className="w-4 h-4 mr-2" />
                AI-Powered Website Builder
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                Turn Your Business Into a{' '}
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Website
                </span>{' '}
                With AI
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl leading-relaxed">
                Describe your business once. Our AI creates a stunning, professional website instantly. No coding, no designers, no hassle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="group text-base px-8 py-4 rounded-xl shadow-lg shadow-violet-500/25"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started Free
                    <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="group text-base px-8 py-4 rounded-xl"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <FiPlay className="mr-2 w-5 h-5" />
                    See How It Works
                  </Button>
                </motion.div>
              </div>

              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border-2 border-white dark:border-gray-950 flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <HiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trusted by 15,000+ businesses</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="ml-4 flex-1 max-w-md h-6 bg-gray-700 rounded-md flex items-center px-3">
                      <span className="text-xs text-gray-400">mybusiness.com</span>
                    </div>
                  </div>
                  <div className="pt-16 px-8 pb-8">
                    <div className="w-24 h-3 bg-violet-500 rounded mb-6" />
                    <div className="w-3/4 h-4 bg-gray-700 rounded mb-3" />
                    <div className="w-1/2 h-4 bg-gray-700 rounded mb-6" />
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-700 rounded-xl" />
                      ))}
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded mb-2" />
                    <div className="w-5/6 h-2 bg-gray-700 rounded mb-2" />
                    <div className="w-2/3 h-2 bg-gray-700 rounded" />
                  </div>
                  <div className="absolute bottom-4 right-4 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg">
                    <span className="text-xs text-violet-300">✨ AI Generating...</span>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl"
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
          <HiChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features to help you create, manage, and grow your online presence.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
                className="relative"
              >
                <div className="text-6xl font-black bg-gradient-to-b from-violet-200 to-violet-100 dark:from-violet-900 dark:to-violet-800 bg-clip-text text-transparent mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-violet-400 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Stunning Templates
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from 500+ professionally designed templates across every industry.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {templates.map((template, i) => (
              <motion.div
                key={template.name}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className={`aspect-[4/3] bg-gradient-to-br ${template.color} rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                  <div className="relative z-10">
                    <div className="w-12 h-3 bg-white/30 rounded-full mb-2" />
                    <div className="w-24 h-2 bg-white/20 rounded-full" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-full h-3 bg-white/20 rounded-full mb-2" />
                    <div className="w-3/4 h-3 bg-white/20 rounded-full mb-4" />
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="aspect-square bg-white/10 rounded-lg" />
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-xs text-white font-medium">{template.category}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">{template.name}</h3>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg" className="rounded-xl" onClick={() => navigate('/signup')}>
              <HiViewGrid className="mr-2 w-5 h-5" />
              View All Templates
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start free. Upgrade when you need more.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -5 }}
                className={twMerge(
                  'bg-white dark:bg-gray-900 rounded-2xl p-8 border transition-all duration-300',
                  i === 1
                    ? 'border-violet-500 shadow-xl shadow-violet-500/10 relative'
                    : 'border-gray-200 dark:border-gray-800 shadow-lg'
                )}
              >
                {i === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                      <FiCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={i === 1 ? 'primary' : 'outline'}
                  className="w-full rounded-xl"
                  onClick={() => navigate('/signup')}
                >
                  {i === 0 ? 'Get Started Free' : `Start ${plan.name}`}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 text-gray-500 dark:text-gray-400"
          >
            All plans include a 14-day free trial. No credit card required.{' '}
            <Link to="/pricing" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
              View full pricing →
            </Link>
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-300">
              Got questions? We've got answers.
            </motion.p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
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
                      <p className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
              Join 15,000+ businesses already using LocalSite AI. Create your website in minutes, not weeks.
            </motion.p>
            <motion.div variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-violet-700 hover:bg-violet-50 px-10 py-4 rounded-xl text-base shadow-xl"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
