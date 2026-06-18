import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

const strengthConfig = [
  { label: 'Weak', color: 'bg-red-500', width: '25%' },
  { label: 'Fair', color: 'bg-orange-500', width: '50%' },
  { label: 'Good', color: 'bg-yellow-500', width: '75%' },
  { label: 'Strong', color: 'bg-green-500', width: '100%' },
];

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score < 2) return 0;
  if (score < 3) return 1;
  if (score < 5) return 2;
  return 3;
}

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password) { setError('Password is required'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          {!success ? (
            <>
              <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mb-6">
                <HiLockClosed className="w-7 h-7 text-violet-600 dark:text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your new password below.</p>

              {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors"
                      placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthConfig[strength].color : 'bg-gray-200 dark:bg-gray-700'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">{strengthConfig[strength]?.label}</p>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors"
                    placeholder="Repeat your password" />
                </div>
                <Button type="submit" variant="primary" className="w-full rounded-xl py-3.5" loading={loading}>
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
              <p className="text-gray-500 dark:text-gray-400">Your password has been reset successfully. Redirecting to login...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
