import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiUser, HiMail, HiLockClosed, HiKey, HiBell, HiCreditCard, HiGlobe, HiColorSwatch, HiEye, HiEyeOff } from 'react-icons/hi';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
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
    <div className="flex overflow-x-auto gap-1 p-1 bg-[rgb(var(--color-surface))] rounded-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={twMerge('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.id ? 'bg-white dark:bg-surface-800 shadow-sm text-[rgb(var(--color-text))]' : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))]')}>
            <Icon className="w-4 h-4" /> {tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">Settings</h1>
        <p className="text-sm text-[rgb(var(--color-text-muted))]">Manage your account, security, and preferences</p>
      </div>

      {tabsList}

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleProfileUpdate} className="card space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary-500/25">
                {profileForm.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">{profileForm.name || 'User'}</h2>
                <p className="text-[rgb(var(--color-text-muted))]">{profileForm.email}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Full Name</label>
                <input type="text" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Email</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  className="input-field bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] cursor-not-allowed" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Phone</label>
                <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Company</label>
                <input type="text" value={profileForm.company} onChange={(e) => setProfileForm((p) => ({ ...p, company: e.target.value }))}
                  className="input-field" />
              </div>
            </div>
            <div>
              <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handlePasswordChange} className="card space-y-6">
            <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Current Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                  <input type={showPasswords.current ? 'text' : 'password'} value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="input-field pl-11 pr-12" />
                  <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]">
                    {showPasswords.current ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">New Password</label>
                <div className="relative">
                  <HiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                  <input type={showPasswords.new ? 'text' : 'password'} value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="input-field pl-11 pr-12" />
                  <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]">
                    {showPasswords.new ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Confirm New Password</label>
                <div className="relative">
                  <HiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                  <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="input-field pl-11 pr-12" />
                  <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]">
                    {showPasswords.confirm ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <Button type="submit" variant="primary" loading={saving}>Update Password</Button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="text-xl font-bold text-[rgb(var(--color-text))] mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email notifications', desc: 'Receive emails about account activity' },
              { key: 'website', label: 'Website updates', desc: 'Get notified when websites are published or updated' },
              { key: 'leads', label: 'New leads', desc: 'Alert when someone submits a contact form' },
              { key: 'marketing', label: 'Marketing emails', desc: 'Tips, product updates, and promotional offers' },
              { key: 'deployment', label: 'Deployment status', desc: 'Get notified when your website is deployed' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-[rgb(var(--color-surface))] transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-[rgb(var(--color-text))] text-sm">{item.label}</p>
                  <p className="text-xs text-[rgb(var(--color-text-muted))]">{item.desc}</p>
                </div>
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[rgb(var(--color-border))] rounded-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'billing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card space-y-6">
            <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">Billing & Subscription</h2>
            <p className="text-[rgb(var(--color-text-muted))] -mt-4">Manage your subscription and payment methods.</p>
            <div className="p-6 bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[rgb(var(--color-text))]">Current Plan</p>
                  <p className="text-sm text-[rgb(var(--color-text-muted))]">Professional &bull; $49/month</p>
                </div>
                <span className="badge-success">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[rgb(var(--color-text-muted))]">Next billing date</span>
                <span className="text-[rgb(var(--color-text))] font-medium">June 15, 2026</span>
              </div>
              <div className="w-full h-2 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="flex gap-3">
                <Button variant="primary" size="sm" onClick={() => window.location.href = '/pricing'}>Change Plan</Button>
                <Button variant="outline" size="sm">View Invoices</Button>
              </div>
            </div>
            <div className="p-6 bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))]">
              <h3 className="font-medium text-[rgb(var(--color-text))] mb-4">Payment Method</h3>
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-surface-900 rounded-xl border border-[rgb(var(--color-border))]">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">VISA</div>
                <div>
                  <p className="font-medium text-[rgb(var(--color-text))]">Visa ending in 4242</p>
                  <p className="text-sm text-[rgb(var(--color-text-muted))]">Expires 12/2027</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card space-y-6">
          <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">Appearance</h2>
          <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]">
            <div>
              <p className="font-medium text-[rgb(var(--color-text))]">Dark Mode</p>
              <p className="text-sm text-[rgb(var(--color-text-muted))]">Toggle between light and dark theme</p>
            </div>
            <button onClick={toggleTheme}
              className={twMerge('relative w-14 h-7 rounded-full transition-colors', isDark ? 'bg-primary-500' : 'bg-[rgb(var(--color-border))]')}>
              <div className={twMerge('absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform', isDark ? 'translate-x-7.5 left-0.5' : 'left-0.5')} />
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]">
            <p className="font-medium text-[rgb(var(--color-text))] mb-3">Theme Preview</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { color: 'bg-violet-600', label: 'Violet' },
                { color: 'bg-indigo-600', label: 'Indigo' },
                { color: 'bg-emerald-600', label: 'Emerald' },
                { color: 'bg-blue-600', label: 'Blue' },
                { color: 'bg-rose-600', label: 'Rose' },
              ].map(({ color, label }) => (
                <button key={label} className="text-center">
                  <div className={`w-full aspect-square rounded-xl ${color} mb-1 ring-1 ring-[rgb(var(--color-border))]`} />
                  <span className="text-xs text-[rgb(var(--color-text-muted))]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
