import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { HiCreditCard, HiDocumentText, HiCheck, HiDownload, HiPlus, HiShieldCheck } from 'react-icons/hi';
import { FiDollarSign, FiFileText, FiCreditCard, FiShield, FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
  { label: 'Websites Managed', used: 3, limit: 10, color: 'from-primary-500 to-indigo-600' },
  { label: 'Bandwidth', used: 45, limit: 250, unit: 'GB', color: 'from-emerald-500 to-teal-600' },
  { label: 'AI Generations', used: 850, limit: 1000, color: 'from-amber-500 to-orange-600' },
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

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="h-8 w-48 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <Card className="h-48 animate-pulse" />
             <Card className="h-64 animate-pulse" />
          </div>
          <div className="space-y-6">
             <Card className="h-64 animate-pulse" />
             <Card className="h-48 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <FiDollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-950 dark:text-white">Billing</h1>
            <p className="text-surface-500 mt-1">Manage your subscription, invoices, and payment methods.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <Card className="p-0 overflow-hidden">
               <div className="p-8 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                       <FiDollarSign className="w-7 h-7 text-white" />
                     </div>
                     <div>
                       <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                         {currentPlan?.name || 'Free'} Plan
                       </h2>
                       <p className="text-surface-500 mt-0.5 font-medium">
                         {subscription?.price > 0 ? `$${subscription.price} / ${subscription.interval === 'yearly' ? 'yr' : 'mo'}` : 'Free'}
                         {subscription?.cancelAtPeriodEnd && ' \u2022 Cancels at period end'}
                       </p>
                     </div>
                   </div>
                   <span className={cn(
                     "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                     subscription?.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                   )}>
                     {subscription?.status || 'Active'}
                   </span>
                 </div>
               </div>
               <div className="p-8 space-y-6">
                 {subscription?.currentPeriodEnd && (
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-surface-500 font-medium">Current billing period ends</span>
                     <span className="text-surface-900 dark:text-white font-bold">{new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                   </div>
                 )}
                 
                 <div className="w-full h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden shadow-inner">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: '65%' }} 
                     transition={{ duration: 1, delay: 0.3 }}
                     className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full" 
                   />
                 </div>
                 
                 <div className="flex flex-wrap gap-4 pt-2">
                   <Button variant="primary" size="lg" className="shadow-glow" onClick={() => navigate('/pricing')}>
                     Change Plan <FiArrowRight className="ml-2 w-5 h-5" />
                   </Button>
                   {!subscription?.cancelAtPeriodEnd && (
                     <Button variant="outline" size="lg" className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleCancel}>
                       Cancel Subscription
                     </Button>
                   )}
                 </div>
               </div>
             </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
             <Card className="p-0 overflow-hidden">
               <div className="p-6 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-surface-50/50 dark:bg-surface-950/50">
                 <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white flex items-center gap-3">
                   <FiFileText className="w-6 h-6 text-primary-500" /> Invoice History
                 </h2>
                 <Button variant="ghost" size="sm">
                   <HiDownload className="w-4 h-4 mr-2" /> Export All
                 </Button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="border-b border-surface-200 dark:border-surface-800">
                       <th className="text-left px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Invoice</th>
                       <th className="text-left px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Date</th>
                       <th className="text-left px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Plan</th>
                       <th className="text-right px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Amount</th>
                       <th className="text-left px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Status</th>
                       <th className="text-right px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                     {invoices.map((inv) => (
                       <tr key={inv.id} className="hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors">
                         <td className="px-6 py-4 text-sm font-medium text-surface-900 dark:text-white">{inv.id}</td>
                         <td className="px-6 py-4 text-sm text-surface-500">{inv.date}</td>
                         <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{inv.plan}</td>
                         <td className="px-6 py-4 text-sm text-surface-900 dark:text-white text-right font-bold">${inv.amount}</td>
                         <td className="px-6 py-4">
                           <span className={cn(
                             "px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide",
                             inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                           )}>{inv.status}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <button className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 transition-colors">
                             <HiDownload className="w-5 h-5" />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
             <Card className="p-8">
               <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white flex items-center gap-3 mb-6">
                 <FiCreditCard className="w-6 h-6 text-primary-500" /> Payment Methods
               </h2>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-5 bg-white dark:bg-surface-900 rounded-2xl border-2 border-primary-500 shadow-sm shadow-primary-500/10">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-blue-900 rounded-xl flex items-center justify-center text-white text-sm font-black italic shadow-inner">VISA</div>
                     <div>
                       <p className="font-bold text-surface-900 dark:text-white text-lg">•••• 4242</p>
                       <p className="text-sm text-surface-500 font-medium">Expires 12/2027</p>
                     </div>
                   </div>
                   <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Default</span>
                 </div>
                 <Button variant="outline" size="lg" className="w-full border-dashed border-2 hover:border-solid">
                   <HiPlus className="w-5 h-5 mr-2" /> Add New Payment Method
                 </Button>
               </div>
             </Card>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
             <Card className="p-8">
               <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white mb-6">Plan Usage</h2>
               <div className="space-y-6">
                 {usageMetrics.map((m) => {
                   const pct = Math.min((m.used / m.limit) * 100, 100);
                   return (
                     <div key={m.label}>
                       <div className="flex justify-between text-sm mb-2">
                         <span className="text-surface-600 dark:text-surface-300 font-medium">{m.label}</span>
                         <span className="text-surface-900 dark:text-white font-bold">{m.used}{m.unit ? ` ${m.unit}` : ''} / {m.limit}{m.unit ? ` ${m.unit}` : ''}</span>
                       </div>
                       <div className="w-full h-2.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden shadow-inner">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${pct}%` }} 
                           transition={{ duration: 1, delay: 0.3 }}
                           className={cn('h-full rounded-full bg-gradient-to-r', m.color, pct >= 90 ? 'from-red-500 to-rose-600' : '')} 
                         />
                       </div>
                     </div>
                   );
                 })}
               </div>
             </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
             <Card className="p-8">
               <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white flex items-center gap-3 mb-6">
                 <FiShield className="w-6 h-6 text-primary-500" /> Plan Features
               </h2>
               <div className="space-y-4">
                 {(currentPlan?.features || SUBSCRIPTION_PLANS[0].features).map((feat, i) => (
                   <div key={i} className="flex items-start gap-3 text-sm">
                     <HiCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                     <span className="text-surface-600 dark:text-surface-300 font-medium">{feat}</span>
                   </div>
                 ))}
               </div>
             </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-primary-500/20">
            <HiShieldCheck className="w-10 h-10 mb-4 text-primary-200" />
            <h3 className="font-display font-bold text-xl mb-2">Enterprise-Grade Security</h3>
            <p className="text-sm text-primary-100/90 leading-relaxed">
               All transactions are processed securely via Stripe. We utilize bank-level encryption and never store your raw credit card details on our servers.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
