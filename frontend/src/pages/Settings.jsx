import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiUser, HiMail, HiLockClosed, HiKey, HiBell, HiCreditCard, HiGlobe, HiColorSwatch, HiEye, HiEyeOff } from 'react-icons/hi';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const tabs = [
  { id: 'profile', label: 'Profile', icon: HiUser },
  { id: 'security', label: 'Security', icon: HiLockClosed },
  { id: 'notifications', label: 'Notifications', icon: HiBell },
  { id: 'billing', label: 'Billing', icon: HiCreditCard },
  { id: 'appearance', label: 'Appearance', icon: HiColorSwatch },
];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', company: user.company || '' });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileForm);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/user/password', passwordForm);
      toast.success('Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const tabsList = (
    <div className="flex overflow-x-auto gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={twMerge('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.id ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
            <Icon className="w-4 h-4" /> {tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account, security, and preferences</p>
      </div>

      {tabsList}

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white">
                {profileForm.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profileForm.name || 'User'}</h2>
                <p className="text-gray-500">{profileForm.email}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input type="text" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                <input type="text" value={profileForm.company} onChange={(e) => setProfileForm((p) => ({ ...p, company: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors" />
              </div>
            </div>
            <div className="mt-6">
              <Button type="submit" variant="primary" className="rounded-xl" loading={saving}>Save Changes</Button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handlePasswordChange} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type={showPasswords.current ? 'text' : 'password'} value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors" />
                  <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPasswords.current ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors" />
              </div>
            </div>
            <div className="mt-6">
              <Button type="submit" variant="primary" className="rounded-xl" loading={saving}>Update Password</Button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'Email notifications', desc: 'Receive emails about account activity' },
              { label: 'Website updates', desc: 'Get notified when websites are published or updated' },
              { label: 'New leads', desc: 'Alert when someone submits a contact form' },
              { label: 'Marketing emails', desc: 'Tips, product updates, and promotional offers' },
              { label: 'Deployment status', desc: 'Get notified when your website is deployed' },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'billing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Billing & Subscription</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your subscription and payment methods.</p>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Current Plan</p>
                <p className="text-sm text-gray-500">Professional • $49/month</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Next billing date</span>
              <span className="text-gray-900 dark:text-white font-medium">June 15, 2026</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full" style={{ width: '65%' }} />
            </div>
            <div className="flex gap-3">
              <Button variant="primary" size="sm" className="rounded-lg" onClick={() => window.location.href = '/pricing'}>Change Plan</Button>
              <Button variant="outline" size="sm" className="rounded-lg">View Invoices</Button>
            </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Payment Method</h3>
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">VISA</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Visa ending in 4242</p>
                <p className="text-sm text-gray-500">Expires 12/2027</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Appearance</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle between light and dark theme</p>
              </div>
              <button onClick={toggleTheme}
                className={twMerge('relative w-14 h-7 rounded-full transition-colors', isDark ? 'bg-violet-600' : 'bg-gray-300')}>
                <div className={twMerge('absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform', isDark ? 'translate-x-7.5 left-0.5' : 'left-0.5')} />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white mb-3">Theme Preview</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { color: 'bg-violet-600', label: 'Violet' },
                  { color: 'bg-indigo-600', label: 'Indigo' },
                  { color: 'bg-emerald-600', label: 'Emerald' },
                  { color: 'bg-blue-600', label: 'Blue' },
                  { color: 'bg-rose-600', label: 'Rose' },
                ].map(({ color, label }) => (
                  <button key={label} className="text-center">
                    <div className={`w-full aspect-square rounded-xl ${color} mb-1`} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
