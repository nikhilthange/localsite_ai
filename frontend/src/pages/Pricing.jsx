import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { FiCheck, FiArrowRight, FiZap, FiShield, FiGlobe, FiStar, FiUsers, FiBarChart } from 'react-icons/fi';
import { SUBSCRIPTION_PLANS } from '@/utils/constants';
import Button from '@/components/common/Button';

const billingOptions = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'annual', label: 'Annual', discount: 'Save 20%' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your business. Start free and upgrade as you grow.
          </p>

          <div className="inline-flex items-center p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            {billingOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setBilling(opt.id)}
                className={twMerge(
                  'relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all',
                  billing === opt.id
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                )}
              >
                {opt.label}
                {opt.discount && (
                  <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{opt.discount}</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, i) => {
            const price = billing === 'annual' ? plan.price * 10 : plan.price;
            const isPopular = plan.id === 'professional';
            const isHovered = hoveredPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={twMerge(
                  'relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl p-8 border transition-all duration-300',
                  isPopular
                    ? 'border-violet-500 shadow-xl shadow-violet-500/10 scale-105 lg:scale-110'
                    : 'border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md',
                  isHovered && !isPopular && 'border-violet-300 dark:border-violet-700'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {plan.price === 0 ? 'Free' : `$${price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                    )}
                  </div>
                  {billing === 'annual' && plan.price > 0 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">${plan.price * 12}/yr value</p>
                  )}
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <FiCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? 'primary' : 'outline'}
                  className={twMerge('w-full rounded-xl', isPopular && 'shadow-lg shadow-violet-500/25')}
                  onClick={() => navigate('/signup')}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Start ${plan.name}`}
                  <FiArrowRight className="ml-2 w-4 h-4" />
                </Button>

                {plan.price > 0 && (
                  <p className="text-xs text-gray-400 text-center mt-3">14-day free trial • Cancel anytime</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feature Comparison */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Compare Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Feature</th>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <th key={plan.id} className="py-4 px-4 text-center font-semibold text-gray-900 dark:text-white">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
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
                    <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className="py-3.5 px-4 text-center text-gray-600 dark:text-gray-400">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
              { q: 'Is there a free trial?', a: 'All paid plans come with a 14-day free trial. No credit card required to start.' },
              { q: 'What happens when I exceed limits?', a: "We'll notify you and you can upgrade your plan or purchase additional credits." },
              { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime. Your website stays active until the end of your billing period.' },
            ].map((faq) => (
              <div key={faq.q} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-24 text-center bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-violet-100 mb-8 max-w-xl mx-auto">Join thousands of businesses using LocalSite AI to create stunning websites.</p>
          <Button variant="secondary" size="lg" className="bg-white text-violet-700 hover:bg-violet-50 px-10 rounded-xl shadow-xl" onClick={() => navigate('/signup')}>
            Start Free Trial <FiArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
