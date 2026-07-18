import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { HiUser, HiLockClosed, HiBell, HiColorSwatch, HiEye, HiEyeOff } from 'react-icons/hi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const tabs = [
  { id: 'profile', label: 'Profile', icon: HiUser, desc: 'Manage your personal details' },
  { id: 'security', label: 'Security', icon: HiLockClosed, desc: 'Update your password and security' },
  { id: 'notifications', label: 'Notifications', icon: HiBell, desc: 'Control your email alerts' },
  { id: 'appearance', label: 'Appearance', icon: HiColorSwatch, desc: 'Customize your dashboard' },
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
      toast.success('Profile updated successfully');
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
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-950 dark:text-white">Settings</h1>
          <p className="text-surface-500 mt-1">Manage your account preferences and security</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl transition-all text-left',
                    isActive 
                      ? 'bg-white dark:bg-surface-900 shadow-sm border border-surface-200 dark:border-surface-800' 
                      : 'hover:bg-surface-100 dark:hover:bg-surface-900 border border-transparent opacity-80 hover:opacity-100'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg', 
                    isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-surface-500'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', isActive ? 'text-surface-900 dark:text-white' : 'text-surface-600 dark:text-surface-300')}>{tab.label}</p>
                    <p className="text-xs text-surface-500 line-clamp-1">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
           <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Card className="p-8">
                    <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white mb-6">Profile Details</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary-500/25">
                          {profileForm.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                           <Button variant="outline" size="sm" type="button">Upload New Avatar</Button>
                           <p className="text-xs text-surface-500 mt-2">JPG, PNG or WEBP. Max 2MB.</p>
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-surface-200 dark:border-surface-800">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Full Name</label>
                          <Input type="text" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Email Address</label>
                          <Input type="email" value={profileForm.email} disabled className="opacity-70 cursor-not-allowed" />
                          <p className="text-xs text-surface-500 mt-1">Contact support to change your email.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Phone Number</label>
                          <Input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Company / Organization</label>
                          <Input type="text" value={profileForm.company} onChange={(e) => setProfileForm((p) => ({ ...p, company: e.target.value }))} />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button type="submit" variant="primary" loading={saving} className="shadow-glow px-8">Save Profile</Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Card className="p-8">
                    <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white mb-6">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Current Password</label>
                        <Input 
                           type={showPasswords.current ? 'text' : 'password'} 
                           value={passwordForm.currentPassword}
                           onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                           rightIcon={
                              <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))} className="text-surface-400 hover:text-surface-600 focus:outline-none">
                                 {showPasswords.current ? <HiEyeOff /> : <HiEye />}
                              </button>
                           }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">New Password</label>
                        <Input 
                           type={showPasswords.new ? 'text' : 'password'} 
                           value={passwordForm.newPassword}
                           onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                           rightIcon={
                              <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="text-surface-400 hover:text-surface-600 focus:outline-none">
                                 {showPasswords.new ? <HiEyeOff /> : <HiEye />}
                              </button>
                           }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Confirm New Password</label>
                        <Input 
                           type={showPasswords.confirm ? 'text' : 'password'} 
                           value={passwordForm.confirmPassword}
                           onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                           rightIcon={
                              <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} className="text-surface-400 hover:text-surface-600 focus:outline-none">
                                 {showPasswords.confirm ? <HiEyeOff /> : <HiEye />}
                              </button>
                           }
                        />
                      </div>
                      <div className="pt-2">
                        <Button type="submit" variant="primary" loading={saving} className="shadow-glow">Update Password</Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Card className="p-8">
                    <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                      {[
                        { key: 'email', label: 'Email Notifications', desc: 'Receive emails about account activity and security.' },
                        { key: 'website', label: 'Website Updates', desc: 'Get notified when your AI websites are deployed.' },
                        { key: 'leads', label: 'New Leads', desc: 'Instant alerts when someone submits a contact form on your site.' },
                        { key: 'marketing', label: 'Marketing Emails', desc: 'Tips, product updates, and promotional offers.' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-start sm:items-center justify-between p-5 rounded-xl border border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors cursor-pointer group">
                          <div className="pr-4">
                            <p className="font-medium text-surface-900 dark:text-white">{item.label}</p>
                            <p className="text-sm text-surface-500 mt-1">{item.desc}</p>
                          </div>
                          <div className="relative mt-1 sm:mt-0 shrink-0">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-surface-200 dark:bg-surface-800 rounded-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border after:border-gray-300 peer-checked:after:border-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full shadow-inner" />
                          </div>
                        </label>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Card className="p-8">
                    <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white mb-6">Appearance</h2>
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800">
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white text-lg">Dark Mode</p>
                        <p className="text-surface-500 mt-1">Toggle the dashboard theme to reduce eye strain in low-light environments.</p>
                      </div>
                      <button onClick={toggleTheme} className={cn('relative w-14 h-8 rounded-full transition-colors shrink-0 shadow-inner', isDark ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-700')}>
                        <div className={cn('absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform', isDark ? 'translate-x-7 left-1' : 'left-1')} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
