import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { HiCreditCard, HiDocumentText, HiCheck, HiExclamation, HiClock, HiArrowRight, HiDownload, HiPlus, HiShieldCheck } from 'react-icons/hi';
import { FiDollarSign, FiFileText, FiCreditCard, FiShield } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { paymentService } from '@/services/paymentService';
import { SUBSCRIPTION_PLANS } from '@/utils/constants';
import toast from 'react-hot-toast';

const invoices = [
  { id: 'INV-001', date: 'Jun 1, 2026', amount: 49, status: 'paid', plan: 'Professional' },
  { id: 'INV-002', date: 'May 1, 2026', amount: 49, status: 'paid', plan: 'Professional' },
  { id: 'INV-003', date: 'Apr 1, 2026', amount: 49, status: 'paid', plan: 'Professional' },
  { id: 'INV-004', date: 'Mar 1, 2026', amount: 19, status: 'paid', plan: 'Starter' },
  { id: 'INV-005', date: 'Feb 1, 2026', amount: 19, status: 'paid', plan: 'Starter' },
];

const usageMetrics = [
  { label: 'Websites', used: 3, limit: 10, color: 'from-violet-500 to-indigo-600' },
  { label: 'Storage', used: 45, limit: 250, unit: 'GB', color: 'from-emerald-500 to-teal-600' },
  { label: 'AI Credits', used: 850, limit: 1000, color: 'from-amber-500 to-orange-600' },
  { label: 'Team Members', used: 2, limit: 5, color: 'from-blue-500 to-cyan-600' },
];

export default function Billing() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getPlans()
      .then(() => setSubscription({
        plan: 'professional',
        status: 'active',
        interval: 'monthly',
        currentPeriodEnd: '2026-07-15T00:00:00Z',
        cancelAtPeriodEnd: false,
        price: 49,
        currency: 'USD',
      }))
      .catch(() => setSubscription({
        plan: 'free',
        status: 'active',
        interval: 'monthly',
        price: 0,
        currency: 'USD',
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? Your website will remain active until the end of the billing period.')) return;
    try {
      await paymentService.cancelSubscription(subscription.id);
      toast.success('Subscription canceled');
      setSubscription((prev) => ({ ...prev, cancelAtPeriodEnd: true }));
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription?.plan);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <FiDollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscription, invoices, and payment methods</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <FiDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentPlan?.name || 'Free'} Plan
                    </h2>
                    <p className="text-sm text-gray-500">
                      {subscription?.price > 0 ? `$${subscription.price}/${subscription.interval === 'yearly' ? 'yr' : 'mo'}` : 'Free'}
                      {subscription?.cancelAtPeriodEnd && ' • Cancels at period end'}
                    </p>
                  </div>
                </div>
                <span className={twMerge('px-3 py-1 rounded-full text-xs font-medium',
                  subscription?.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400')}>
                  {subscription?.status || 'Active'}
                </span>
              </div>
            </div>
            <div className="p-6">
              {subscription?.currentPeriodEnd && (
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-500">Current period ends</span>
                  <span className="text-gray-900 dark:text-white font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full" />
              </div>
              {subscription?.price > 0 && (
                <div className="flex gap-3">
                  <Button variant="primary" size="sm" className="rounded-lg" onClick={() => navigate('/pricing')}>
                    <HiArrowRight className="w-4 h-4 mr-1" /> Change Plan
                  </Button>
                  {!subscription?.cancelAtPeriodEnd && (
                    <Button variant="outline" size="sm" className="rounded-lg text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 dark:border-red-800" onClick={handleCancel}>
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiFileText className="w-5 h-5" /> Invoices
              </h2>
              <Button variant="ghost" size="sm">
                <HiDownload className="w-4 h-4 mr-1" /> Export All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {invoices.map((inv, i) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{inv.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{inv.plan}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right font-medium">${inv.amount}</td>
                      <td className="px-6 py-4">
                        <span className={twMerge('px-2.5 py-1 rounded-full text-xs font-medium',
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <HiDownload className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FiCreditCard className="w-5 h-5" /> Payment Methods
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Visa ending in 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/2027</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">Default</span>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                <HiPlus className="w-4 h-4 mr-1" /> Add Payment Method
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage</h2>
            <div className="space-y-4">
              {usageMetrics.map((m) => {
                const pct = Math.min((m.used / m.limit) * 100, 100);
                return (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{m.label}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{m.used}{m.unit ? ` ${m.unit}` : ''} / {m.limit}{m.unit ? ` ${m.unit}` : ''}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }}
                        className={twMerge('h-full rounded-full bg-gradient-to-r', m.color, pct >= 90 ? 'bg-red-500' : '')} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FiShield className="w-5 h-5" /> Plan Features
            </h2>
            <div className="space-y-3">
              {(currentPlan?.features || SUBSCRIPTION_PLANS[0].features).map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <HiCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{feat}</span>
                </div>
              ))}
            </div>
            {subscription?.price === 0 && (
              <Link to="/pricing" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline">
                Upgrade plan <HiArrowRight className="w-4 h-4" />
              </Link>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
            <HiShieldCheck className="w-8 h-8 mb-3 text-violet-200" />
            <h3 className="font-semibold mb-1">Secure Billing</h3>
            <p className="text-sm text-violet-100">All payments are processed securely via Stripe. Your card details are never stored on our servers.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
