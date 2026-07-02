import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { FiCheck, FiArrowRight, FiZap } from 'react-icons/fi';
import { SUBSCRIPTION_PLANS } from '@/utils/constants';
import Button from '@/components/common/Button';

const billingOptions = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'annual', label: 'Annual', discount: 'Save 20%' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Pricing() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-sm font-medium text-primary-700 dark:text-primary-300 mb-6 border border-primary-200/50 dark:border-primary-800/50">
            <FiZap className="w-4 h-4" />
            Simple Pricing
          </motion.div>
          <motion.h1 variants={itemVariants} className="section-heading mb-4">
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p variants={itemVariants} className="section-subheading mx-auto mb-8">
            Choose the perfect plan for your business. Start free and upgrade as you grow.
          </motion.p>

          <motion.div variants={itemVariants} className="inline-flex items-center p-1.5 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-2xl">
            {billingOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setBilling(opt.id)}
                className={twMerge(
                  'relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  billing === opt.id
                    ? 'bg-white dark:bg-surface-800 text-[rgb(var(--color-text))] shadow-sm'
                    : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]'
                )}
              >
                {opt.label}
                {opt.discount && (
                  <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{opt.discount}</span>
                )}
              </button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {SUBSCRIPTION_PLANS.map((plan, i) => {
            const price = billing === 'annual' ? plan.price * 10 : plan.price;
            const isPopular = plan.id === 'professional';
            const isHovered = hoveredPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                custom={i}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={twMerge(
                  'relative flex flex-col rounded-2xl p-8 border transition-all duration-300',
                  isPopular
                    ? 'border-primary-500 shadow-xl shadow-primary-500/10 scale-105 lg:scale-110 bg-white dark:bg-surface-800'
                    : 'card hover:shadow-md',
                  isHovered && !isPopular && 'border-primary-300 dark:border-primary-700'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[rgb(var(--color-text))] mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[rgb(var(--color-text))]">
                      {plan.price === 0 ? 'Free' : `$${price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-[rgb(var(--color-text-muted))] text-sm">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                    )}
                  </div>
                  {billing === 'annual' && plan.price > 0 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">${plan.price * 12}/yr value</p>
                  )}
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-[rgb(var(--color-text-secondary))]">
                      <FiCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? 'primary' : 'outline'}
                  className={twMerge('w-full rounded-2xl', isPopular && 'shadow-lg shadow-primary-500/25')}
                  onClick={() => navigate('/signup')}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Start ${plan.name}`}
                  <FiArrowRight className="w-4 h-4" />
                </Button>

                {plan.price > 0 && (
                  <p className="text-xs text-[rgb(var(--color-text-muted))] text-center mt-3">14-day free trial • Cancel anytime</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <h2 className="section-heading text-center mb-12">Compare Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--color-border))]">
                  <th className="text-left py-4 px-4 font-medium text-[rgb(var(--color-text-muted))]">Feature</th>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <th key={plan.id} className="py-4 px-4 text-center font-semibold text-[rgb(var(--color-text))]">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {[
                  { label: 'Websites', values: ['1', '5', 'Unlimited', 'Unlimited'] },
                  { label: 'Storage', values: ['5 GB', '50 GB', '250 GB', '1 TB'] },
                  { label: 'Custom Domain', values: ['✓', '✓', '✓', '✓'] },
                  { label: 'SSL Certificate', values: ['✓', '✓', '✓', '✓'] },
                  { label: 'AI Credits', values: ['10/mo', '100/mo', '500/mo', 'Unlimited'] },
                  { label: 'Analytics', values: ['Basic', 'Advanced', 'Advanced', 'Custom'] },
                  { label: 'Team Members', values: ['-', '2', '5', 'Unlimited'] },
                  { label: 'Priority Support', values: ['-', 'Email', 'Priority', '24/7 Phone'] },
                  { label: 'White Label', values: ['-', '-', '-', '✓'] },
                  { label: 'API Access', values: ['-', '-', '-', '✓'] },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-3.5 px-4 font-medium text-[rgb(var(--color-text))]">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className="py-3.5 px-4 text-center text-[rgb(var(--color-text-secondary))]">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <h2 className="section-heading text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
              { q: 'Is there a free trial?', a: 'All paid plans come with a 14-day free trial. No credit card required to start.' },
              { q: 'What happens when I exceed limits?', a: "We'll notify you and you can upgrade your plan or purchase additional credits." },
              { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime. Your website stays active until the end of your billing period.' },
            ].map((faq) => (
              <div key={faq.q} className="bg-[rgb(var(--color-surface))] rounded-2xl p-6 border border-[rgb(var(--color-border))]">
                <h3 className="font-semibold text-[rgb(var(--color-text))] mb-2">{faq.q}</h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-12 lg:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">Join thousands of businesses using LocalSite AI to create stunning websites.</p>
            <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-primary-50 px-10 rounded-2xl shadow-xl" onClick={() => navigate('/signup')}>
              Start Free Trial <FiArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
